import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

// Тапсырма + оған жиналған жалпы уақыт + таймер жүріп тұр ма
const SELECT_TASKS = `
  SELECT t.id, t.title, t.done, t.project_id, t.created_at, t.completed_at,
         p.name AS project_name,
         COALESCE((SELECT SUM(e.seconds) FROM time_entries e
                    WHERE e.task_id = t.id AND e.seconds IS NOT NULL), 0) AS tracked_seconds,
         EXISTS(SELECT 1 FROM time_entries e
                 WHERE e.task_id = t.id AND e.ended_at IS NULL) AS running
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
   WHERE t.user_id = ?
`

const listTasks = (userId) =>
  db
    .prepare(`${SELECT_TASKS} ORDER BY t.done, t.created_at DESC`)
    .all(userId)
    .map((task) => ({
      ...task,
      done: Boolean(task.done),
      running: Boolean(task.running),
    }))

export { listTasks }

router.get('/', (req, res) => {
  res.json({ tasks: listTasks(req.user.id) })
})

router.post('/', (req, res) => {
  const title = String(req.body?.title ?? '').trim()
  const projectId = req.body?.project_id ? Number(req.body.project_id) : null

  if (title.length < 1 || title.length > 200) {
    return res.status(400).json({ error: 'Тапсырма аты 1–200 таңба болуы керек.' })
  }

  // Жоба шынымен осы қолданушыныкі ме — тексереміз
  if (projectId !== null) {
    const owned = db
      .prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?')
      .get(projectId, req.user.id)

    if (!owned) return res.status(400).json({ error: 'Мұндай жоба жоқ.' })
  }

  const result = db
    .prepare('INSERT INTO tasks (user_id, project_id, title) VALUES (?, ?, ?)')
    .run(req.user.id, projectId, title)

  const task = db
    .prepare(`${SELECT_TASKS} AND t.id = ?`)
    .get(req.user.id, Number(result.lastInsertRowid))

  res.status(201).json({
    task: { ...task, done: Boolean(task.done), running: Boolean(task.running) },
  })
})

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(id, req.user.id)

  if (!existing) return res.status(404).json({ error: 'Тапсырма табылмады.' })

  const title =
    req.body?.title === undefined
      ? existing.title
      : String(req.body.title).trim()

  if (title.length < 1 || title.length > 200) {
    return res.status(400).json({ error: 'Тапсырма аты 1–200 таңба болуы керек.' })
  }

  const done =
    req.body?.done === undefined ? existing.done : req.body.done ? 1 : 0

  db.prepare(
    `UPDATE tasks
        SET title = ?, done = ?,
            completed_at = CASE WHEN ? = 1 AND done = 0 THEN datetime('now')
                                WHEN ? = 0 THEN NULL
                                ELSE completed_at END
      WHERE id = ? AND user_id = ?`,
  ).run(title, done, done, done, id, req.user.id)

  // Тапсырма аяқталса, жүріп тұрған таймерін де тоқтатамыз
  if (done === 1) {
    db.prepare(
      `UPDATE time_entries
          SET ended_at = datetime('now'),
              seconds  = CAST((julianday('now') - julianday(started_at)) * 86400 AS INTEGER)
        WHERE task_id = ? AND ended_at IS NULL`,
    ).run(id)
  }

  const task = db.prepare(`${SELECT_TASKS} AND t.id = ?`).get(req.user.id, id)

  res.json({
    task: { ...task, done: Boolean(task.done), running: Boolean(task.running) },
  })
})

router.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Тапсырма табылмады.' })
  }

  res.status(204).end()
})

export default router
