import { Router } from 'express'
import { one, pool, query } from '../db.js'
import { requireAuth } from '../auth.js'
import { toId } from '../lib/ids.js'
import { isDate, PRIORITIES } from '../lib/planner.js'

const router = Router()
router.use(requireAuth)

// Бір тапсырмаға 5 минуттан аз да, 24 сағаттан көп те баға берудің мәні жоқ:
// ондай іс бірнеше тапсырмаға бөлінуі керек.
const MIN_ESTIMATE = 5
const MAX_ESTIMATE = 1440

/**
 * Жоспарлау өрістері: қанша уақыт алады, қаншалық маңызды, қашанға дейін.
 * Үшеуі де міндетті емес — өріс мүлде жіберілмесе, ескі мәні қалады,
 * `null` жіберілсе — тазаланады.
 */
function readPlanningFields(body, current) {
  const source = body ?? {}
  const result = { ...current }

  if (Object.hasOwn(source, 'estimate_minutes')) {
    const raw = source.estimate_minutes

    if (raw === null || raw === '') {
      result.estimate_minutes = null
    } else {
      const minutes = Number(raw)

      if (!Number.isInteger(minutes) || minutes < MIN_ESTIMATE || minutes > MAX_ESTIMATE) {
        return { error: 'task.estimateRange', vars: { min: MIN_ESTIMATE, max: MAX_ESTIMATE } }
      }
      result.estimate_minutes = minutes
    }
  }

  if (Object.hasOwn(source, 'priority')) {
    const priority = Number(source.priority)
    if (!PRIORITIES.includes(priority)) return { error: 'task.priorityInvalid' }
    result.priority = priority
  }

  if (Object.hasOwn(source, 'due_date')) {
    const raw = source.due_date

    if (raw === null || raw === '') {
      result.due_date = null
    } else {
      if (!isDate(raw)) return { error: 'task.dueInvalid' }
      result.due_date = raw
    }
  }

  return { value: result }
}

// Тапсырма + оған жиналған жалпы уақыт + таймер жүріп тұр ма.
// COUNT/SUM bigint қайтарады, сондықтан ::int-ке келтіреміз — әйтпесе
// JSON-да сан емес, жол болып шығады.
const SELECT_TASKS = `
  SELECT t.id, t.title, t.done, t.project_id, t.created_at, t.completed_at,
         t.estimate_minutes, t.priority, t.due_date,
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
    const projectId = req.body?.project_id ? toId(req.body.project_id) : null

    if (title.length < 1 || title.length > 200) {
      return res
        .status(400)
        .json({ error: req.t('task.titleLength') })
    }

    // Жоба шынымен осы қолданушыныкі ме — тексереміз
    if (req.body?.project_id) {
      if (projectId === null) {
        return res.status(400).json({ error: req.t('project.unknown') })
      }

      const owned = await one(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
        [projectId, req.user.id],
      )

      if (!owned) return res.status(400).json({ error: req.t('project.unknown') })
    }

    const planning = readPlanningFields(req.body, {
      estimate_minutes: null,
      priority: 2,
      due_date: null,
    })

    if (planning.error) {
      return res.status(400).json({ error: req.t(planning.error, planning.vars) })
    }

    const created = await one(
      `INSERT INTO tasks (user_id, project_id, title, estimate_minutes, priority, due_date)
            VALUES ($1, $2, $3, $4, $5, $6::date)
         RETURNING id`,
      [
        req.user.id,
        projectId,
        title,
        planning.value.estimate_minutes,
        planning.value.priority,
        planning.value.due_date,
      ],
    )

    res.status(201).json({ task: await taskById(req.user.id, created.id) })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const id = toId(req.params.id)
    if (id === null) {
      return res.status(404).json({ error: req.t('task.notFound') })
    }

    const existing = await one(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id],
    )

    if (!existing) return res.status(404).json({ error: req.t('task.notFound') })

    const title =
      req.body?.title === undefined
        ? existing.title
        : String(req.body.title).trim()

    if (title.length < 1 || title.length > 200) {
      return res
        .status(400)
        .json({ error: req.t('task.titleLength') })
    }

    const done =
      req.body?.done === undefined ? existing.done : Boolean(req.body.done)

    const planning = readPlanningFields(req.body, existing)

    if (planning.error) {
      return res.status(400).json({ error: req.t(planning.error, planning.vars) })
    }

    await pool.query(
      `UPDATE tasks
          SET title = $1, done = $2,
              estimate_minutes = $5, priority = $6, due_date = $7::date,
              completed_at = CASE WHEN $2 AND NOT done THEN now()
                                  WHEN NOT $2 THEN NULL
                                  ELSE completed_at END
        WHERE id = $3 AND user_id = $4`,
      [
        title,
        done,
        id,
        req.user.id,
        planning.value.estimate_minutes,
        planning.value.priority,
        planning.value.due_date,
      ],
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
    const id = toId(req.params.id)
    if (id === null) {
      return res.status(404).json({ error: req.t('task.notFound') })
    }

    const { rowCount } = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id],
    )

    if (rowCount === 0) {
      return res.status(404).json({ error: req.t('task.notFound') })
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
