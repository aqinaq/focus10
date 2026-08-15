import { Router } from 'express'
import { APP_TZ, one, pool, query } from '../db.js'
import { requireAuth } from '../auth.js'
import {
  atRisk,
  candidatesFor,
  capacityPresets,
  outlookFor,
  planDay,
} from '../lib/planner.js'

const router = Router()
router.use(requireAuth)

/** Күніне 10 минуттан аз да, 12 сағаттан көп те жоспар құрудың мәні жоқ. */
const MIN_CAPACITY = 10
const MAX_CAPACITY = 720

/**
 * «Бүгін» серверде APP_TZ бойынша анықталады — есептердегідей. Сағатты да
 * сол жерден аламыз: ұсынылатын нұсқалар («толық күн» қанша сағат) содан
 * есептеледі.
 */
async function nowFor() {
  return one(
    `SELECT to_char(now() AT TIME ZONE $1, 'YYYY-MM-DD')     AS today,
            EXTRACT(HOUR   FROM now() AT TIME ZONE $1)::int  AS hour,
            EXTRACT(MINUTE FROM now() AT TIME ZONE $1)::int  AS minute`,
    [APP_TZ],
  )
}

/**
 * Аяқталмаған тапсырмалар + оларға жиналған уақыт. `today_seconds` —
 * жоспардың орындалуын көрсету үшін: бүгін дәл осы тапсырмаға қанша кетті.
 */
async function openTasks(userId) {
  const { rows } = await query(
    `SELECT t.id, t.title, t.done, t.priority, t.estimate_minutes, t.due_date,
            p.name AS project_name,
            COALESCE((SELECT SUM(e.seconds)::int FROM time_entries e
                       WHERE e.task_id = t.id AND e.seconds IS NOT NULL), 0)
              AS tracked_seconds,
            COALESCE((SELECT SUM(e.seconds)::int FROM time_entries e
                       WHERE e.task_id = t.id AND e.seconds IS NOT NULL
                         AND (e.started_at AT TIME ZONE $2)::date
                             = (now() AT TIME ZONE $2)::date), 0)
              AS today_seconds,
            EXISTS(SELECT 1 FROM time_entries e
                    WHERE e.task_id = t.id AND e.ended_at IS NULL) AS running
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
      WHERE t.user_id = $1 AND NOT t.done`,
    [userId, APP_TZ],
  )

  return rows
}

/** Жоспардағы тапсырмалар аяқталып та кетуі мүмкін — оларды бөлек аламыз. */
async function planRows(userId, day) {
  const { rows } = await query(
    `SELECT i.task_id, i.minutes, i.position, i.reason,
            t.title, t.done, t.priority, t.estimate_minutes, t.due_date,
            p.name AS project_name,
            COALESCE((SELECT SUM(e.seconds)::int FROM time_entries e
                       WHERE e.task_id = t.id AND e.seconds IS NOT NULL), 0)
              AS tracked_seconds,
            COALESCE((SELECT SUM(e.seconds)::int FROM time_entries e
                       WHERE e.task_id = t.id AND e.seconds IS NOT NULL
                         AND (e.started_at AT TIME ZONE $3)::date = $2::date), 0)
              AS today_seconds,
            EXISTS(SELECT 1 FROM time_entries e
                    WHERE e.task_id = t.id AND e.ended_at IS NULL) AS running
       FROM plan_items i
       JOIN day_plans d ON d.id = i.plan_id
       JOIN tasks t     ON t.id = i.task_id
       LEFT JOIN projects p ON p.id = t.project_id
      WHERE d.user_id = $1 AND d.day = $2
      ORDER BY i.position`,
    [userId, day, APP_TZ],
  )

  return rows
}

/**
 * Сақталған жоспарды толық күйге жинайды: не жоспарланды, оның қаншасы
 * бүгін істелді, тапсырманың өзі қанша қалды.
 */
function hydratePlan(plan, rows) {
  const items = rows.map((row) => {
    const estimate = row.estimate_minutes
    const tracked = Math.round(row.tracked_seconds / 60)
    const doneMinutes = Math.round(row.today_seconds / 60)

    return {
      task_id: row.task_id,
      title: row.title,
      project_name: row.project_name,
      minutes: row.minutes,
      reason: row.reason,
      priority: row.priority,
      estimate_minutes: estimate,
      due_date: row.due_date,
      done: row.done,
      running: row.running,
      done_minutes: doneMinutes,
      tracked_minutes: tracked,
      // Жоспарланған уақыттың қаншасы өтті. Тапсырма аяқталса — 100%,
      // таймерді қоспай бітірген болса да жоспар орындалды деп саналады.
      progress: row.done ? 100 : Math.min(100, Math.round((doneMinutes / row.minutes) * 100)),
    }
  })

  const planned = items.reduce((total, item) => total + item.minutes, 0)
  const done = items.reduce((total, item) => total + Math.min(item.minutes, item.done_minutes), 0)

  return {
    day: plan.day,
    capacity_minutes: plan.capacity_minutes,
    planned_minutes: planned,
    done_minutes: done,
    remaining_minutes: Math.max(0, planned - done),
    spare_minutes: Math.max(0, plan.capacity_minutes - planned),
    finished: items.filter((item) => item.done).length,
    checked_in_at: plan.created_at,
    items,
  }
}

/** Жоспарға кірмей қалған, бірақ мерзімі жақын істер. */
function deferredFrom(tasks, today, chosen) {
  return candidatesFor(tasks, today)
    .filter((candidate) => !chosen.has(candidate.task_id))
    .map((candidate) => ({ ...candidate, at_risk: atRisk(candidate) }))
}

/** GET-те де, POST-та да бір жауап қайтады — клиентте екі жол код болмауы үшін. */
async function planState(userId) {
  const now = await nowFor()
  const [tasks, plan] = await Promise.all([
    openTasks(userId),
    one(
      `SELECT id, to_char(day, 'YYYY-MM-DD') AS day, capacity_minutes, created_at
         FROM day_plans
        WHERE user_id = $1 AND day = (now() AT TIME ZONE $2)::date`,
      [userId, APP_TZ],
    ),
  ])

  const rows = plan ? await planRows(userId, now.today) : []
  const chosen = new Set(rows.map((row) => row.task_id))

  return {
    today: now.today,
    hour: now.hour,
    minute: now.minute,
    presets: capacityPresets(now.hour, now.minute),
    plan: plan ? hydratePlan(plan, rows) : null,
    // Жоспар құрылмаған күні де адам аптасының қалай тұрғанын көруі керек
    backlog: deferredFrom(tasks, now.today, chosen),
    outlook: outlookFor(tasks, now.today),
  }
}

router.get('/', async (req, res, next) => {
  try {
    res.json(await planState(req.user.id))
  } catch (error) {
    next(error)
  }
})

/**
 * Таңғы тіркелу: «бүгін қанша уақытым бар». Осы бір сұраққа берілген жауап
 * күндік жоспарға айналады. Қайта жіберілсе — жоспар қайта құрылады
 * (мысалы, күндіз жоспар өзгеріп, уақыт азайып кетсе).
 */
router.post('/', async (req, res, next) => {
  try {
    const capacity = Number(req.body?.capacity_minutes)

    if (!Number.isInteger(capacity) || capacity < MIN_CAPACITY || capacity > MAX_CAPACITY) {
      return res.status(400).json({
        error: req.t('plan.capacityRange', { min: MIN_CAPACITY, max: MAX_CAPACITY }),
      })
    }

    const now = await nowFor()
    const tasks = await openTasks(req.user.id)
    const result = planDay({ tasks, today: now.today, capacity })

    const plan = await one(
      `INSERT INTO day_plans (user_id, day, capacity_minutes)
            VALUES ($1, $2::date, $3)
       ON CONFLICT (user_id, day)
       DO UPDATE SET capacity_minutes = EXCLUDED.capacity_minutes, updated_at = now()
         RETURNING id`,
      [req.user.id, now.today, capacity],
    )

    await pool.query('DELETE FROM plan_items WHERE plan_id = $1', [plan.id])

    if (result.items.length > 0) {
      await pool.query(
        `INSERT INTO plan_items (plan_id, task_id, minutes, position, reason)
         SELECT $1, item.task_id, item.minutes, item.position, item.reason
           FROM unnest($2::int[], $3::int[], $4::int[], $5::text[])
                AS item(task_id, minutes, position, reason)`,
        [
          plan.id,
          result.items.map((item) => item.task_id),
          result.items.map((item) => item.minutes),
          result.items.map((_, index) => index),
          result.items.map((item) => item.reason),
        ],
      )
    }

    res.status(201).json(await planState(req.user.id))
  } catch (error) {
    next(error)
  }
})

/** Жоспардан бас тарту — қайта тіркелуге болады. */
router.delete('/', async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM day_plans
        WHERE user_id = $1 AND day = (now() AT TIME ZONE $2)::date`,
      [req.user.id, APP_TZ],
    )

    res.json(await planState(req.user.id))
  } catch (error) {
    next(error)
  }
})

export default router
