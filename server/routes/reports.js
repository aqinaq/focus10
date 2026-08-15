import { Router } from 'express'
import { APP_TZ, query } from '../db.js'
import { requireAuth } from '../auth.js'
import { toCsv } from '../lib/csv.js'

const router = Router()
router.use(requireAuth)

const RANGES = { week: 6, month: 29, all: 36500 }

/**
 * `RANGES[value]` деп тікелей алуға болмайды: прототип тізбегіндегі атаулар
 * («constructor», «toString») де мән қайтарады да, SQL-ге интервал орнына
 * функция кетіп, сұраныс 500-мен құлайды. Сондықтан тек өз кілттерін аламыз.
 */
const rangeDays = (value) =>
  typeof value === 'string' && Object.hasOwn(RANGES, value)
    ? RANGES[value]
    : RANGES.week

/**
 * Уақыт белдеуі әр сұранысқа параметр болып беріледі, сессияның `SET TIME ZONE`
 * күйіне сүйенбейміз: Supabase-тің transaction режиміндегі pooler-і сессия
 * параметрлерін сұраныстар арасында сақтамауы мүмкін — сонда «бүгін» деген
 * ұғым кездейсоқ жылжып кетер еді.
 *
 * Күндер `to_char` арқылы 'YYYY-MM-DD' жолы болып қайтады. Егер date типін
 * қалдырсақ, pg оны Date нысанына айналдырады да, JSON-да толық ISO уақыт
 * болып шығып, фронттағы күн белгісін есептеу бұзылады.
 */
router.get('/week', async (req, res, next) => {
  try {
    const { rows: days } = await query(
      `WITH span AS (
         SELECT generate_series(
           ((now() AT TIME ZONE $2)::date - interval '6 days'),
           (now() AT TIME ZONE $2)::date,
           interval '1 day'
         )::date AS day
       )
       SELECT to_char(span.day, 'YYYY-MM-DD') AS day,
              COALESCE(SUM(e.seconds), 0)::int AS seconds
         FROM span
         LEFT JOIN time_entries e
                ON (e.started_at AT TIME ZONE $2)::date = span.day
               AND e.user_id = $1
        GROUP BY span.day
        ORDER BY span.day`,
      [req.user.id, APP_TZ],
    )

    // Жобасы жоқ уақыт `project: null` болып қайтады — оның атауын клиент
    // өз тілінде қояды, сондықтан мұнда белгі жазып қатырып тастамаймыз.
    const { rows: byProject } = await query(
      `SELECT p.name                           AS project,
              COALESCE(SUM(e.seconds), 0)::int AS seconds
         FROM time_entries e
         JOIN tasks t ON t.id = e.task_id
         LEFT JOIN projects p ON p.id = t.project_id
        WHERE e.user_id = $1
          AND (e.started_at AT TIME ZONE $2)::date
              >= (now() AT TIME ZONE $2)::date - interval '6 days'
        GROUP BY p.name
       HAVING COALESCE(SUM(e.seconds), 0) > 0
        ORDER BY seconds DESC`,
      [req.user.id, APP_TZ],
    )

    res.json({
      days,
      by_project: byProject,
      today_seconds: days.at(-1).seconds,
      week_seconds: days.reduce((sum, day) => sum + day.seconds, 0),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Апталық диаграмма «қанша» дегенге жауап береді. Insights — «қашан және
 * қалай» дегенге: дерек бұрыннан жиналып жатыр, одан адам өзі көрмейтін
 * заңдылықты шығарып беруге болады.
 *
 * Барлық сан — нақты жазбалардан есептеледі, ешқандай болжам жоқ. Мәтіннің
 * өзін клиент құрайды (өз тілінде), сервер тек сандарды береді.
 */
const WINDOW_DAYS = 28
const WEEK = 7
// Осы шамадан қысқа сессия — «үзіліп кеткен» жұмыс деп саналады
const SHORT_SESSION = 600
// Дерек аз болса, «заңдылық» деп көрсететін ештеңе жоқ
const MIN_SESSIONS = 3
const MIN_DAYS = 2

const sum = (values) => values.reduce((total, value) => total + value, 0)

/** 'YYYY-MM-DD' → 0 (жексенбі) … 6. Уақыт белдеуінен тәуелсіз болу үшін UTC. */
const weekdayOf = (day) => {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, date)).getUTCDay()
}

/**
 * Тәулік ішіндегі ең «қауырт» үш сағаттық терезе. Бір ғана шыңды алсақ
 * (мысалы, «сағат 10»), сурет тым ұсақ болып шығады: адам блокпен жұмыс
 * істейді, сондықтан қатар тұрған үш сағатты қосып қараймыз.
 */
function peakWindow(hours, total) {
  if (total === 0) return null

  let best = { from: 0, seconds: -1 }

  for (let from = 0; from < 24; from += 1) {
    const seconds = hours[from] + hours[(from + 1) % 24] + hours[(from + 2) % 24]
    if (seconds > best.seconds) best = { from, seconds }
  }

  const share = Math.round((best.seconds / total) * 100)

  // 3 сағат — тәуліктің 12,5%-ы. Үлесі соған жақын болса, «шың» деген жоқ:
  // уақыт күн бойына біркелкі шашыраған, ондайда қорытынды жасамаймыз.
  if (share < 30) return null

  // Терезенің шеттеріндегі бос сағаттарды кесіп тастаймыз: жұмыс 9-да
  // басталса, «08:00-ден бастап» деген дұрыс болмас еді. Тең түскен
  // терезелердің бірі таңдалғанда осындай бос шет пайда болады.
  let from = best.from
  let length = 3

  while (length > 1 && hours[from % 24] === 0) {
    from += 1
    length -= 1
  }
  while (length > 1 && hours[(from + length - 1) % 24] === 0) {
    length -= 1
  }

  return {
    id: 'peakWindow',
    from: from % 24,
    to: (from + length) % 24,
    seconds: best.seconds,
    share,
  }
}

/** Бүгіннен (немесе кеше аяқталса — кештен) кері қарай үзілмеген күндер. */
function streakOf(days) {
  const tracked = days.map((day) => day.seconds > 0)

  // Бүгін әлі таймер қосылмаған болуы мүмкін — сериясы кеше үзілген деп
  // есептеу әділетсіз, сондықтан санауды кешеден бастаймыз
  let index = tracked.at(-1) ? tracked.length - 1 : tracked.length - 2
  let streak = 0

  while (index >= 0 && tracked[index]) {
    streak += 1
    index -= 1
  }

  return streak
}

/**
 * Апта күндері бойынша орташа: «сәрсенбі күндері әдетте ең өнімді».
 *
 * Орташа тек жұмыс істелген күндер бойынша есептеледі: демалып қалған
 * сәрсенбілерді қоссақ, «сәрсенбіде орташа 40 минут» деген жаңылыс сан
 * шығар еді. Оның есесіне бір күнді екі рет көрген болуымыз керек — әйтпесе
 * бір кездейсоқ ұзақ күн «заңдылық» болып шыға келеді.
 */
function bestWeekday(days) {
  const totals = new Map()

  for (const day of days) {
    if (day.seconds === 0) continue

    const key = weekdayOf(day.day)
    const bucket = totals.get(key) ?? { seconds: 0, count: 0 }
    totals.set(key, { seconds: bucket.seconds + day.seconds, count: bucket.count + 1 })
  }

  const ranked = [...totals]
    .filter(([, bucket]) => bucket.count >= 2)
    .map(([weekday, bucket]) => ({
      weekday,
      average: Math.round(bucket.seconds / bucket.count),
    }))
    .sort((a, b) => b.average - a.average)

  // Салыстыратын екінші күн болмаса, «ең өнімді» деген сөздің мәні жоқ
  if (ranked.length < 2) return null

  return { id: 'bestWeekday', weekday: ranked[0].weekday, seconds: ranked[0].average }
}

router.get('/insights', async (req, res, next) => {
  try {
    const [dayRows, hourRows, statsRow, projectRows] = await Promise.all([
      query(
        `WITH span AS (
           SELECT generate_series(
             ((now() AT TIME ZONE $2)::date - ($3 || ' days')::interval),
             (now() AT TIME ZONE $2)::date,
             interval '1 day'
           )::date AS day
         )
         SELECT to_char(span.day, 'YYYY-MM-DD') AS day,
                COALESCE(SUM(e.seconds), 0)::int AS seconds
           FROM span
           LEFT JOIN time_entries e
                  ON (e.started_at AT TIME ZONE $2)::date = span.day
                 AND e.user_id = $1
          GROUP BY span.day
          ORDER BY span.day`,
        [req.user.id, APP_TZ, String(WINDOW_DAYS - 1)],
      ),
      query(
        `SELECT EXTRACT(HOUR FROM e.started_at AT TIME ZONE $2)::int AS hour,
                COALESCE(SUM(e.seconds), 0)::int                     AS seconds
           FROM time_entries e
          WHERE e.user_id = $1
            AND e.seconds IS NOT NULL
            AND (e.started_at AT TIME ZONE $2)::date
                > (now() AT TIME ZONE $2)::date - ($3 || ' days')::interval
          GROUP BY 1`,
        [req.user.id, APP_TZ, String(WINDOW_DAYS)],
      ),
      query(
        `SELECT COUNT(*)::int                                        AS sessions,
                COUNT(DISTINCT e.task_id)::int                       AS tasks,
                COALESCE(MAX(e.seconds), 0)::int                     AS longest,
                COUNT(*) FILTER (WHERE e.seconds < $4)::int          AS short_sessions,
                COALESCE(
                  percentile_cont(0.5) WITHIN GROUP (ORDER BY e.seconds), 0
                )::int                                               AS median
           FROM time_entries e
          WHERE e.user_id = $1
            AND e.seconds IS NOT NULL
            AND (e.started_at AT TIME ZONE $2)::date
                > (now() AT TIME ZONE $2)::date - ($3 || ' days')::interval`,
        [req.user.id, APP_TZ, String(WINDOW_DAYS), SHORT_SESSION],
      ),
      query(
        `SELECT p.name                           AS project,
                COALESCE(SUM(e.seconds), 0)::int AS seconds
           FROM time_entries e
           JOIN tasks t ON t.id = e.task_id
           LEFT JOIN projects p ON p.id = t.project_id
          WHERE e.user_id = $1
            AND (e.started_at AT TIME ZONE $2)::date
                > (now() AT TIME ZONE $2)::date - ($3 || ' days')::interval
          GROUP BY p.name
         HAVING COALESCE(SUM(e.seconds), 0) > 0
          ORDER BY seconds DESC`,
        [req.user.id, APP_TZ, String(WEEK)],
      ),
    ])

    const days = dayRows.rows
    const stats = statsRow.rows[0]
    const trackedDays = days.filter((day) => day.seconds > 0).length

    const hours = Array.from({ length: 24 }, () => 0)
    for (const row of hourRows.rows) hours[row.hour] = row.seconds
    const total = sum(hours)

    // Дерек аз болса, сан құрастырғаннан гөрі шындықты айтқан дұрыс
    if (stats.sessions < MIN_SESSIONS || trackedDays < MIN_DAYS) {
      return res.json({
        ready: false,
        window_days: WINDOW_DAYS,
        sample: { sessions: stats.sessions, days: trackedDays },
        needed: {
          sessions: Math.max(0, MIN_SESSIONS - stats.sessions),
          days: Math.max(0, MIN_DAYS - trackedDays),
        },
        hours,
        insights: [],
      })
    }

    const thisWeek = sum(days.slice(-WEEK).map((day) => day.seconds))
    const prevWeek = sum(days.slice(-WEEK * 2, -WEEK).map((day) => day.seconds))
    const streak = streakOf(days)
    const projects = projectRows.rows
    const projectTotal = sum(projects.map((row) => row.seconds))

    const insights = [
      peakWindow(hours, total),

      prevWeek > 0 && {
        id: 'trend',
        direction: thisWeek >= prevWeek ? 'up' : 'down',
        percent: Math.abs(Math.round(((thisWeek - prevWeek) / prevWeek) * 100)),
        this_week: thisWeek,
        prev_week: prevWeek,
      },

      streak >= 2 && { id: 'streak', days: streak },

      bestWeekday(days),

      stats.sessions >= 5 && {
        id: 'sessionLength',
        median: stats.median,
        longest: stats.longest,
      },

      // Сессиялардың көбі 10 минуттан қысқа болса, жұмыс үзіліп жатыр деген сөз
      stats.sessions >= 5 &&
        stats.short_sessions / stats.sessions >= 0.3 && {
          id: 'fragmentation',
          percent: Math.round((stats.short_sessions / stats.sessions) * 100),
          sessions: stats.short_sessions,
        },

      projects.length >= 2 &&
        projects[0].seconds / projectTotal >= 0.5 && {
          id: 'topProject',
          project: projects[0].project,
          share: Math.round((projects[0].seconds / projectTotal) * 100),
        },
    ].filter(Boolean)

    res.json({
      ready: true,
      window_days: WINDOW_DAYS,
      sample: { sessions: stats.sessions, days: trackedDays, tasks: stats.tasks },
      hours,
      insights,
    })
  } catch (error) {
    next(error)
  }
})

/** Клиентке жіберуге дайын CSV: әр аяқталған уақыт жазбасы бір жол. */
router.get('/export.csv', async (req, res, next) => {
  try {
    const days = rangeDays(req.query.range)

    const { rows } = await query(
      `SELECT to_char(e.started_at AT TIME ZONE $2, 'YYYY-MM-DD') AS day,
              to_char(e.started_at AT TIME ZONE $2, 'HH24:MI:SS') AS start_time,
              to_char(e.ended_at   AT TIME ZONE $2, 'HH24:MI:SS') AS end_time,
              COALESCE(p.name, '')                                AS project,
              t.title                                             AS task,
              e.seconds                                           AS seconds
         FROM time_entries e
         JOIN tasks t ON t.id = e.task_id
         LEFT JOIN projects p ON p.id = t.project_id
        WHERE e.user_id = $1
          AND e.ended_at IS NOT NULL
          AND (e.started_at AT TIME ZONE $2)::date
              >= (now() AT TIME ZONE $2)::date - ($3 || ' days')::interval
        ORDER BY e.started_at`,
      [req.user.id, APP_TZ, String(days)],
    )

    const csv = toCsv(
      [
        req.t('csv.date'),
        req.t('csv.start'),
        req.t('csv.end'),
        req.t('csv.project'),
        req.t('csv.task'),
        req.t('csv.seconds'),
        req.t('csv.hours'),
      ],
      rows.map((row) => [
        row.day,
        row.start_time,
        row.end_time,
        row.project,
        row.task,
        row.seconds,
        (row.seconds / 3600).toFixed(2),
      ]),
    )

    const today = new Date().toISOString().slice(0, 10)

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="focus10-${today}.csv"`,
    )
    res.send(csv)
  } catch (error) {
    next(error)
  }
})

export default router
