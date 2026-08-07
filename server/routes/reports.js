import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { toCsv } from '../lib/csv.js'

const router = Router()
router.use(requireAuth)

const RANGES = { week: '-6 days', month: '-29 days', all: '-100 years' }

/** Соңғы 7 күндегі күнделікті жиынтық + бүгінгі фокус уақыты. */
router.get('/week', (req, res) => {
  const rows = db
    .prepare(
      `SELECT date(started_at, 'localtime') AS day,
              SUM(COALESCE(seconds, 0))     AS seconds
         FROM time_entries
        WHERE user_id = ?
          AND date(started_at, 'localtime') >= date('now', 'localtime', '-6 days')
        GROUP BY day`,
    )
    .all(req.user.id)

  const byDay = new Map(rows.map((row) => [row.day, row.seconds]))

  // Дерегі жоқ күндер де диаграммада 0 болып тұруы керек
  const days = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = db
      .prepare(`SELECT date('now', 'localtime', ?) AS d`)
      .get(`-${offset} days`).d

    days.push({ day, seconds: byDay.get(day) ?? 0 })
  }

  const byProject = db
    .prepare(
      `SELECT COALESCE(p.name, 'Жобасыз') AS project,
              SUM(COALESCE(e.seconds, 0)) AS seconds
         FROM time_entries e
         JOIN tasks t ON t.id = e.task_id
         LEFT JOIN projects p ON p.id = t.project_id
        WHERE e.user_id = ?
          AND date(e.started_at, 'localtime') >= date('now', 'localtime', '-6 days')
        GROUP BY project
        HAVING seconds > 0
        ORDER BY seconds DESC`,
    )
    .all(req.user.id)

  res.json({
    days,
    by_project: byProject,
    today_seconds: days.at(-1).seconds,
    week_seconds: days.reduce((sum, day) => sum + day.seconds, 0),
  })
})

/** Клиентке жіберуге дайын CSV: әр аяқталған уақыт жазбасы бір жол. */
router.get('/export.csv', (req, res) => {
  const range = RANGES[req.query.range] ?? RANGES.week

  const rows = db
    .prepare(
      `SELECT date(e.started_at, 'localtime')   AS day,
              time(e.started_at, 'localtime')   AS start_time,
              time(e.ended_at, 'localtime')     AS end_time,
              COALESCE(p.name, '')              AS project,
              t.title                           AS task,
              e.seconds                         AS seconds
         FROM time_entries e
         JOIN tasks t ON t.id = e.task_id
         LEFT JOIN projects p ON p.id = t.project_id
        WHERE e.user_id = ?
          AND e.ended_at IS NOT NULL
          AND date(e.started_at, 'localtime') >= date('now', 'localtime', ?)
        ORDER BY e.started_at`,
    )
    .all(req.user.id, range)

  const csv = toCsv(
    ['Күні', 'Басталды', 'Аяқталды', 'Жоба', 'Тапсырма', 'Секунд', 'Сағат'],
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
    `attachment; filename="focusflow-${today}.csv"`,
  )
  res.send(csv)
})

export default router
