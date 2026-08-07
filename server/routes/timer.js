import { Router } from 'express'
import { one, pool } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

const activeEntry = (userId) =>
  one(
    `SELECT e.id, e.task_id, e.started_at, t.title AS task_title,
            p.name AS project_name,
            EXTRACT(EPOCH FROM (now() - e.started_at))::int AS elapsed
       FROM time_entries e
       JOIN tasks t ON t.id = e.task_id
       LEFT JOIN projects p ON p.id = t.project_id
      WHERE e.user_id = $1 AND e.ended_at IS NULL`,
    [userId],
  )

async function stopRunning(userId) {
  const { rowCount } = await pool.query(
    `UPDATE time_entries
        SET ended_at = now(),
            seconds  = GREATEST(1, EXTRACT(EPOCH FROM (now() - started_at))::int)
      WHERE user_id = $1 AND ended_at IS NULL`,
    [userId],
  )

  return rowCount
}

router.get('/', async (req, res, next) => {
  try {
    res.json({ active: await activeEntry(req.user.id) })
  } catch (error) {
    next(error)
  }
})

router.post('/start', async (req, res, next) => {
  try {
    const taskId = Number(req.body?.task_id)

    if (!Number.isInteger(taskId)) {
      return res.status(404).json({ error: 'Тапсырма табылмады.' })
    }

    const task = await one(
      'SELECT id, done FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, req.user.id],
    )

    if (!task) return res.status(404).json({ error: 'Тапсырма табылмады.' })
    if (task.done) {
      return res
        .status(400)
        .json({ error: 'Аяқталған тапсырмаға таймер қосылмайды.' })
    }

    // Бір мезгілде бір таймер: бұрынғысын алдымен тоқтатамыз
    await stopRunning(req.user.id)

    await pool.query(
      'INSERT INTO time_entries (user_id, task_id) VALUES ($1, $2)',
      [req.user.id, taskId],
    )

    res.status(201).json({ active: await activeEntry(req.user.id) })
  } catch (error) {
    next(error)
  }
})

router.post('/stop', async (req, res, next) => {
  try {
    const stopped = await stopRunning(req.user.id)

    if (stopped === 0) {
      return res.status(400).json({ error: 'Жүріп тұрған таймер жоқ.' })
    }

    res.json({ active: null })
  } catch (error) {
    next(error)
  }
})

export default router
