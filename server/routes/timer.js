import { Router } from 'express'
import { one, pool } from '../db.js'
import { requireAuth } from '../auth.js'
import { toId } from '../lib/ids.js'

const router = Router()
router.use(requireAuth)

const MIN_ENTRY_MINUTES = 1
const MAX_ENTRY_MINUTES = 24 * 60

const completedEntries = (userId) =>
  pool.query(
    `SELECT e.id, e.task_id, t.title AS task_title, p.name AS project_name,
            e.started_at, e.ended_at, e.seconds
       FROM time_entries e
       JOIN tasks t ON t.id = e.task_id
       LEFT JOIN projects p ON p.id = t.project_id
      WHERE e.user_id = $1 AND e.ended_at IS NOT NULL
      ORDER BY e.started_at DESC
      LIMIT 30`,
    [userId],
  )

function entryFields(req) {
  const taskId = toId(req.body?.task_id)
  const minutes = Number(req.body?.duration_minutes)
  const startedAt = new Date(req.body?.started_at)

  if (taskId === null) return { error: req.t('task.notFound') }
  if (!Number.isInteger(minutes) || minutes < MIN_ENTRY_MINUTES || minutes > MAX_ENTRY_MINUTES) {
    return {
      error: req.t('timer.durationRange', {
        min: MIN_ENTRY_MINUTES,
        max: MAX_ENTRY_MINUTES,
      }),
    }
  }
  if (Number.isNaN(startedAt.getTime()) || startedAt.getTime() > Date.now() + 300_000) {
    return { error: req.t('timer.startInvalid') }
  }

  return { taskId, minutes, startedAt: startedAt.toISOString() }
}

async function ownedTask(userId, taskId) {
  return one('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId])
}

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

const STOP_RUNNING = `
  UPDATE time_entries
     SET ended_at = now(),
         seconds  = GREATEST(1, EXTRACT(EPOCH FROM (now() - started_at))::int)
   WHERE user_id = $1 AND ended_at IS NULL
`

async function stopRunning(userId) {
  const { rowCount } = await pool.query(STOP_RUNNING, [userId])

  return rowCount
}

/**
 * Бір мезгілде бір таймер: бұрынғысын тоқтатып, жаңасын қосамыз.
 *
 * Екі сұраныс (мысалы, екі бет немесе екі құрылғы) дәл қатар келсе, екеуі де
 * «жүріп тұрған таймер жоқ» деп шешіп, екеуі де жазба қосар еді — сонда
 * `idx_entries_one_running` шектеуі біреуін қабылдамай, қолданушыға 500
 * кетеді. Шектеу дерек тұтастығын дұрыс сақтап тұр, сондықтан оны алып
 * тастамаймыз, қақтығыстың өзін болдырмаймыз: тоқтату мен қосуды бір
 * транзакцияға салып, оны қолданушы бойынша advisory lock-пен кезекке
 * қоямыз. Қатар келген сұраныс біріншісі бітпейінше күтеді де, содан кейін
 * нақты күйді көреді — нәтижесінде «соңғы басқаны жеңеді».
 *
 * Қайталап көру (retry) әдісі де қақтығысты шешер еді, бірақ ол дәл жүктеме
 * көп кезде қорға түсетін сұраныс санын еселеп жібереді.
 */
async function startEntry(userId, taskId) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1)', [userId])
    await client.query(STOP_RUNNING, [userId])
    await client.query(
      'INSERT INTO time_entries (user_id, task_id) VALUES ($1, $2)',
      [userId, taskId],
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

router.get('/', async (req, res, next) => {
  try {
    res.json({ active: await activeEntry(req.user.id) })
  } catch (error) {
    next(error)
  }
})

router.get('/entries', async (req, res, next) => {
  try {
    const { rows } = await completedEntries(req.user.id)
    res.json({ entries: rows })
  } catch (error) {
    next(error)
  }
})

router.post('/entries', async (req, res, next) => {
  try {
    const fields = entryFields(req)
    if (fields.error) return res.status(400).json({ error: fields.error })
    if (!(await ownedTask(req.user.id, fields.taskId))) {
      return res.status(404).json({ error: req.t('task.notFound') })
    }

    const seconds = fields.minutes * 60
    const entry = await one(
      `INSERT INTO time_entries (user_id, task_id, started_at, ended_at, seconds)
       VALUES ($1, $2, $3::timestamptz,
               $3::timestamptz + make_interval(secs => $4), $4)
       RETURNING id`,
      [req.user.id, fields.taskId, fields.startedAt, seconds],
    )
    const { rows } = await completedEntries(req.user.id)
    res.status(201).json({ entry: rows.find((row) => row.id === entry.id) })
  } catch (error) {
    next(error)
  }
})

router.patch('/entries/:id', async (req, res, next) => {
  try {
    const entryId = toId(req.params.id)
    if (entryId === null) {
      return res.status(404).json({ error: req.t('timer.entryNotFound') })
    }

    const fields = entryFields(req)
    if (fields.error) return res.status(400).json({ error: fields.error })
    if (!(await ownedTask(req.user.id, fields.taskId))) {
      return res.status(404).json({ error: req.t('task.notFound') })
    }

    const seconds = fields.minutes * 60
    const updated = await one(
      `UPDATE time_entries
          SET task_id = $1,
              started_at = $2::timestamptz,
              ended_at = $2::timestamptz + make_interval(secs => $3),
              seconds = $3
        WHERE id = $4 AND user_id = $5 AND ended_at IS NOT NULL
        RETURNING id`,
      [fields.taskId, fields.startedAt, seconds, entryId, req.user.id],
    )
    if (!updated) {
      return res.status(404).json({ error: req.t('timer.entryNotFound') })
    }

    const { rows } = await completedEntries(req.user.id)
    res.json({ entry: rows.find((row) => row.id === entryId) })
  } catch (error) {
    next(error)
  }
})

router.delete('/entries/:id', async (req, res, next) => {
  try {
    const entryId = toId(req.params.id)
    if (entryId === null) {
      return res.status(404).json({ error: req.t('timer.entryNotFound') })
    }

    const { rowCount } = await pool.query(
      `DELETE FROM time_entries
        WHERE id = $1 AND user_id = $2 AND ended_at IS NOT NULL`,
      [entryId, req.user.id],
    )
    if (rowCount === 0) {
      return res.status(404).json({ error: req.t('timer.entryNotFound') })
    }
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.post('/start', async (req, res, next) => {
  try {
    const taskId = toId(req.body?.task_id)

    if (taskId === null) {
      return res.status(404).json({ error: req.t('task.notFound') })
    }

    const task = await one(
      'SELECT id, done FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, req.user.id],
    )

    if (!task) return res.status(404).json({ error: req.t('task.notFound') })
    if (task.done) {
      return res
        .status(400)
        .json({ error: req.t('timer.taskDone') })
    }

    await startEntry(req.user.id, taskId)

    res.status(201).json({ active: await activeEntry(req.user.id) })
  } catch (error) {
    next(error)
  }
})

router.post('/stop', async (req, res, next) => {
  try {
    const stopped = await stopRunning(req.user.id)

    if (stopped === 0) {
      return res.status(400).json({ error: req.t('timer.notRunning') })
    }

    res.json({ active: null })
  } catch (error) {
    next(error)
  }
})

export default router
