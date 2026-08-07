import { Router } from 'express'
import { one, pool, query } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.name, p.created_at,
              (SELECT COUNT(*)::int FROM tasks t
                WHERE t.project_id = p.id AND t.done = false) AS open_tasks
         FROM projects p
        WHERE p.user_id = $1
        ORDER BY p.created_at, p.id`,
      [req.user.id],
    )

    res.json({ projects: rows })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim()

    if (name.length < 1 || name.length > 60) {
      return res.status(400).json({ error: 'Жоба аты 1–60 таңба болуы керек.' })
    }

    const project = await one(
      'INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING id, name',
      [req.user.id, name],
    )

    res.status(201).json({ project: { ...project, open_tasks: 0 } })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    // Postgres сан күтеді — «abc» келсе, оны 500 емес, 404 деп қайтарамыз
    if (!Number.isInteger(id)) {
      return res.status(404).json({ error: 'Жоба табылмады.' })
    }

    const { rowCount } = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id],
    )

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Жоба табылмады.' })
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
