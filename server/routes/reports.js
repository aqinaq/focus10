import { Router } from 'express'
import { APP_TZ, query } from '../db.js'
import { requireAuth } from '../auth.js'
import { toCsv } from '../lib/csv.js'

const router = Router()
router.use(requireAuth)

const RANGES = { week: 6, month: 29, all: 36500 }

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

/** Клиентке жіберуге дайын CSV: әр аяқталған уақыт жазбасы бір жол. */
router.get('/export.csv', async (req, res, next) => {
  try {
    const days = RANGES[req.query.range] ?? RANGES.week

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
