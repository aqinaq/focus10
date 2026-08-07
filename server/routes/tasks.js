import { Router } from 'express'
import { one, pool, query } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

// Тапсырма + оған жиналған жалпы уақыт + таймер жүріп тұр ма.
// COUNT/SUM bigint қайтарады, сондықтан ::int-ке келтіреміз — әйтпесе
// JSON-да сан емес, жол болып шығады.
const SELECT_TASKS = `
  SELECT t.id, t.title, t.done, t.project_id, t.created_at, t.completed_at,
         p.name AS project_name,
         COALESCE((SELECT SUM(e.seconds)::int FROM time_entries e
                    WHERE e.task_id = t.id AND e.seconds IS NOT NULL), 0) AS tracked_seconds,
         EXISTS(SELECT 1 FROM time_entries e
                 WHERE e.task_id = t.id AND e.ended_at IS NULL) AS running
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
   WHERE t.user_id = $1
`

export async function listTasks(userId) {
  const { rows } = await query(
    `${SELECT_TASKS} ORDER BY t.done, t.created_at DESC, t.id DESC`,
    [userId],
  )
  return rows
}

const taskById = (userId, id) => one(`${SELECT_TASKS} AND t.id = $2`, [userId, id])

router.get('/', async (req, res, next) => {
  try {
    res.json({ tasks: await listTasks(req.user.id) })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const title = String(req.body?.title ?? '').trim()
    const projectId = req.body?.project_id ? Number(req.body.project_id) : null

    if (title.length < 1 || title.length > 200) {
      return res
        .status(400)
        .json({ error: 'Тапсырма аты 1–200 таңба болуы керек.' })
    }

    // Жоба шынымен осы қолданушыныкі ме — тексереміз
    if (projectId !== null) {
      if (!Number.isInteger(projectId)) {
        return res.status(400).json({ error: 'Мұндай жоба жоқ.' })
      }

      const owned = await one(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
        [projectId, req.user.id],
      )

      if (!owned) return res.status(400).json({ error: 'Мұндай жоба жоқ.' })
    }

    const created = await one(
      'INSERT INTO tasks (user_id, project_id, title) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, projectId, title],
    )

    res.status(201).json({ task: await taskById(req.user.id, created.id) })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(404).json({ error: 'Тапсырма табылмады.' })
    }

    const existing = await one(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id],
    )

    if (!existing) return res.status(404).json({ error: 'Тапсырма табылмады.' })

    const title =
      req.body?.title === undefined
        ? existing.title
        : String(req.body.title).trim()

    if (title.length < 1 || title.length > 200) {
      return res
        .status(400)
        .json({ error: 'Тапсырма аты 1–200 таңба болуы керек.' })
    }

    const done =
      req.body?.done === undefined ? existing.done : Boolean(req.body.done)

    await pool.query(
      `UPDATE tasks
          SET title = $1, done = $2,
              completed_at = CASE WHEN $2 AND NOT done THEN now()
                                  WHEN NOT $2 THEN NULL
                                  ELSE completed_at END
        WHERE id = $3 AND user_id = $4`,
      [title, done, id, req.user.id],
    )

    // Тапсырма аяқталса, жүріп тұрған таймерін де тоқтатамыз
    if (done) {
      await pool.query(
        `UPDATE time_entries
            SET ended_at = now(),
                seconds  = GREATEST(1, EXTRACT(EPOCH FROM (now() - started_at))::int)
          WHERE task_id = $1 AND ended_at IS NULL`,
        [id],
      )
    }

    res.json({ task: await taskById(req.user.id, id) })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(404).json({ error: 'Тапсырма табылмады.' })
    }

    const { rowCount } = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id],
    )

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Тапсырма табылмады.' })
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
