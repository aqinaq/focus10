import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

const activeEntry = (userId) =>
  db
    .prepare(
      `SELECT e.id, e.task_id, e.started_at, t.title AS task_title,
              p.name AS project_name,
              CAST((julianday('now') - julianday(e.started_at)) * 86400 AS INTEGER) AS elapsed
         FROM time_entries e
         JOIN tasks t ON t.id = e.task_id
         LEFT JOIN projects p ON p.id = t.project_id
        WHERE e.user_id = ? AND e.ended_at IS NULL`,
    )
    .get(userId) ?? null

router.get('/', (req, res) => {
  res.json({ active: activeEntry(req.user.id) })
})

router.post('/start', (req, res) => {
  const taskId = Number(req.body?.task_id)

  const task = db
    .prepare('SELECT id, done FROM tasks WHERE id = ? AND user_id = ?')
    .get(taskId, req.user.id)

  if (!task) return res.status(404).json({ error: 'Тапсырма табылмады.' })
  if (task.done) {
    return res.status(400).json({ error: 'Аяқталған тапсырмаға таймер қосылмайды.' })
  }

  // Бір мезгілде бір таймер: бұрынғысын алдымен тоқтатамыз
  stopRunning(req.user.id)

  db.prepare('INSERT INTO time_entries (user_id, task_id) VALUES (?, ?)').run(
    req.user.id,
    taskId,
  )

  res.status(201).json({ active: activeEntry(req.user.id) })
})

router.post('/stop', (req, res) => {
  const stopped = stopRunning(req.user.id)

  if (stopped === 0) {
    return res.status(400).json({ error: 'Жүріп тұрған таймер жоқ.' })
  }

  res.json({ active: null })
})

function stopRunning(userId) {
  const result = db
    .prepare(
      `UPDATE time_entries
          SET ended_at = datetime('now'),
              seconds  = MAX(1, CAST((julianday('now') - julianday(started_at)) * 86400 AS INTEGER))
        WHERE user_id = ? AND ended_at IS NULL`,
    )
    .run(userId)

  return result.changes
}

export default router
