import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', (req, res) => {
  const projects = db
    .prepare(
      `SELECT p.id, p.name, p.created_at,
              (SELECT COUNT(*) FROM tasks t
                WHERE t.project_id = p.id AND t.done = 0) AS open_tasks
         FROM projects p
        WHERE p.user_id = ?
        ORDER BY p.created_at`,
    )
    .all(req.user.id)

  res.json({ projects })
})

router.post('/', (req, res) => {
  const name = String(req.body?.name ?? '').trim()

  if (name.length < 1 || name.length > 60) {
    return res.status(400).json({ error: 'Жоба аты 1–60 таңба болуы керек.' })
  }

  const result = db
    .prepare('INSERT INTO projects (user_id, name) VALUES (?, ?)')
    .run(req.user.id, name)

  res.status(201).json({
    project: {
      id: Number(result.lastInsertRowid),
      name,
      open_tasks: 0,
    },
  })
})

router.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM projects WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Жоба табылмады.' })
  }

  res.status(204).end()
})

export default router
