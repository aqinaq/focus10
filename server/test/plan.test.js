import test, { before, after, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createClient, registerUser, startTestServer } from './helpers.js'
import {
  addDays,
  capacityPresets,
  endOfMonth,
  endOfWeek,
  outlookFor,
  planDay,
} from '../lib/planner.js'

let server

before(async () => {
  server = await startTestServer()
})

after(async () => {
  await server.close()
})

const TODAY = '2026-08-12' // сәрсенбі

/** Тесттегі тапсырма: тек жоспарлағышқа керек өрістер. */
const task = (id, fields = {}) => ({
  id,
  title: `Тапсырма ${id}`,
  done: false,
  priority: 2,
  estimate_minutes: 60,
  due_date: null,
  tracked_seconds: 0,
  ...fields,
})

const minutesOf = (plan) => plan.items.map((item) => item.minutes)
const idsOf = (plan) => plan.items.map((item) => item.task_id)

describe('Жоспарлағыш', () => {
  test('күндер: аптаның және айдың соңы', () => {
    assert.equal(endOfWeek('2026-08-12'), '2026-08-16') // сәрсенбі → жексенбі
    assert.equal(endOfWeek('2026-08-16'), '2026-08-16') // жексенбінің өзі
    assert.equal(endOfWeek('2026-08-17'), '2026-08-23') // дүйсенбі → келесі жексенбі
    assert.equal(endOfMonth('2026-08-12'), '2026-08-31')
    assert.equal(endOfMonth('2026-02-03'), '2026-02-28')
    assert.equal(addDays('2026-12-31', 1), '2027-01-01')
  })

  test('жоспар берілген уақыттан аспайды', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 120,
      tasks: [
        task(1, { estimate_minutes: 600, due_date: TODAY }),
        task(2, { estimate_minutes: 600, due_date: TODAY }),
        task(3, { estimate_minutes: 600, due_date: TODAY }),
      ],
    })

    assert.equal(plan.planned_minutes, 120)
    assert.ok(plan.planned_minutes <= plan.capacity_minutes)
  })

  test('уақыт аз болса, тізім де қысқа: 25 минутқа бір ғана іс', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 25,
      tasks: [task(1), task(2), task(3), task(4)],
    })

    assert.equal(plan.items.length, 1)
    assert.equal(plan.planned_minutes, 25)
    // Қалғаны жоғалып кетпейді — кейінге қалғаны болып көрінеді
    assert.equal(plan.deferred.length, 3)
  })

  test('бір күнде бәрін талап етпейді: жүк қалған күндерге бөлінеді', () => {
    // 10 сағаттық іс, мерзімі 5 күн: бүгінге 2 сағат
    const plan = planDay({
      today: TODAY,
      capacity: 480,
      tasks: [
        task(1, { estimate_minutes: 600, due_date: addDays(TODAY, 4) }),
        task(2, { estimate_minutes: 600, due_date: addDays(TODAY, 4) }),
        task(3, { estimate_minutes: 600, due_date: addDays(TODAY, 4) }),
      ],
    })

    // Әрқайсысына күндік үлесі — 120 минут. Артылған уақыт ең шұғылына
    // қосылады: тәуекелі ең үлкен істі алдыға жылжытқан дұрыс.
    assert.deepEqual(minutesOf(plan), [240, 120, 120])
    assert.equal(plan.planned_minutes, 480)
    assert.equal(plan.spare_minutes, 0)
  })

  test('жүк қалған күндерге бөлінеді: уақыт аз болса, үлесі де азаяды', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 240,
      tasks: [
        task(1, { estimate_minutes: 600, due_date: addDays(TODAY, 4) }),
        task(2, { estimate_minutes: 600, due_date: addDays(TODAY, 4) }),
        task(3, { estimate_minutes: 600, due_date: addDays(TODAY, 4) }),
      ],
    })

    // 8 сағаттың орнына 4 сағат болса, бір күнде бәрін бітіру талап
    // етілмейді — екеуі кіреді, үшіншісі келесі күнге қалады
    assert.deepEqual(minutesOf(plan), [120, 120])
    assert.equal(plan.deferred.length, 1)
    assert.equal(plan.deferred[0].at_risk, false)
  })

  test('уақыт артып қалса, алдағы күндердің жүгін бүгінге тартады', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 300,
      tasks: [task(1, { estimate_minutes: 600, due_date: addDays(TODAY, 4) })],
    })

    // Күндік үлесі — 120 минут, бірақ бос уақыт бар: ертең жеңіл болады
    assert.equal(plan.planned_minutes, 300)
    assert.equal(plan.items[0].pulled_forward, 180)
    assert.equal(plan.spare_minutes, 0)
  })

  test('мерзімі өткен іс бірінші тұрады', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 300,
      tasks: [
        task(1, { priority: 1, due_date: addDays(TODAY, 3) }),
        task(2, { priority: 3, due_date: addDays(TODAY, -2) }),
      ],
    })

    assert.equal(idsOf(plan)[0], 2)
    assert.equal(plan.items[0].reason, 'overdue')
    assert.equal(plan.items[0].overdue, true)
  })

  test('мерзімі маңыздылықтан бұрын: бүгінгі ұсақ іс жұмадағы үлкеннен озады', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 300,
      tasks: [
        task(1, { priority: 1, due_date: addDays(TODAY, 3) }),
        task(2, { priority: 3, due_date: TODAY }),
      ],
    })

    assert.equal(idsOf(plan)[0], 2)
    assert.equal(plan.items[0].reason, 'dueToday')
  })

  test('мерзімі тең болса, маңыздысы алда', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 300,
      tasks: [
        task(1, { priority: 3, due_date: addDays(TODAY, 2) }),
        task(2, { priority: 1, due_date: addDays(TODAY, 2) }),
      ],
    })

    assert.deepEqual(idsOf(plan), [2, 1])
  })

  test('жазылған уақыт есептен шығарылады', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 300,
      // 120 минуттық істің 90-ы бітті → 30 минут қалды
      tasks: [task(1, { estimate_minutes: 120, tracked_seconds: 90 * 60, due_date: TODAY })],
    })

    assert.equal(plan.items[0].remaining_minutes, 30)
    assert.equal(plan.planned_minutes, 30)
  })

  test('біткен іс жоспарға кірмейді', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 300,
      tasks: [
        task(1, { done: true }),
        task(2, { estimate_minutes: 60, tracked_seconds: 60 * 60 }),
      ],
    })

    assert.equal(plan.items.length, 0)
    assert.equal(plan.deferred.length, 0)
    assert.equal(plan.spare_minutes, 300)
  })

  test('күндік үлесі ұсақ болса да, нақты блок беріледі', () => {
    // 60 минут / 30 күн = күніне 2 минут — ондай «жұмысты» ешкім бастамайды
    const plan = planDay({
      today: TODAY,
      capacity: 300,
      tasks: [task(1, { estimate_minutes: 60, due_date: addDays(TODAY, 29) })],
    })

    assert.ok(plan.items[0].minutes >= 20)
  })

  test('кейінге қалған істің үлгермейтіні бірден белгіленеді', () => {
    const plan = planDay({
      today: TODAY,
      capacity: 25,
      tasks: [
        task(1, { due_date: TODAY }),
        // Ертеңге дейін 8 сағаттық іс — қалған бір күнге сыймайды
        task(2, { estimate_minutes: 480, due_date: addDays(TODAY, 1) }),
      ],
    })

    const risky = plan.deferred.find((item) => item.task_id === 2)
    assert.equal(risky.at_risk, true)
  })

  test('апталық көрініс: сыймаса, ашық айтады', () => {
    const heavy = Array.from({ length: 6 }, (_, index) =>
      task(index + 1, { estimate_minutes: 600, due_date: endOfWeek(TODAY) }),
    )

    const { week } = outlookFor(heavy, TODAY)

    // Терезе — алдағы 7 күн, күнтізбелік апта емес
    assert.equal(week.until, '2026-08-18')
    assert.equal(week.days_left, 7)
    assert.equal(week.needed_minutes, 3600)
    assert.equal(week.verdict, 'over')
    assert.ok(week.over_by_minutes > 0)
  })

  test('мерзімі қойылмаған іс те апталық көріністе тұрады', () => {
    // Жексенбіде «аптам бітті» деп, мерзімсіз істер есептен шығып қалмауы керек
    const { week } = outlookFor([task(1, { estimate_minutes: 120 })], '2026-08-16')

    assert.equal(week.tasks, 1)
    assert.equal(week.needed_minutes, 120)
    assert.equal(week.days_left, 7)
  })

  test('апталық көрініс: шақ келсе, «ok»', () => {
    const { week } = outlookFor(
      [task(1, { estimate_minutes: 120, due_date: endOfWeek(TODAY) })],
      TODAY,
    )

    assert.equal(week.verdict, 'ok')
    assert.equal(week.over_by_minutes, 0)
  })

  test('кеш оянған күні ұсынылатын уақыт та қысқа', () => {
    const morning = capacityPresets(8, 0)
    const evening = capacityPresets(19, 0)

    assert.equal(morning[0].id, 'full')
    assert.ok(morning[0].minutes > evening[0].minutes)

    // Тізім әрқашан ұзақтан қысқаға қарай — кештетіп қалғанда «жарты күн»
    // «бір-екі сағаттан» да қысқа болып қалуы мүмкін
    for (const presets of [morning, evening, capacityPresets(18, 0)]) {
      const minutes = presets.map((preset) => preset.minutes)
      assert.deepEqual(minutes, [...minutes].sort((a, b) => b - a))
    }
    // Кеш болса да ең болмаса бір шағын блок ұсынылады
    assert.ok(evening.at(-1).minutes >= 25)
    assert.ok(capacityPresets(23, 30).length >= 1)
  })
})

/** Тіркеліп, seed тапсырмаларын өшіреді — тест таза беттен басталады. */
async function freshUser() {
  const client = createClient(server.base)
  const { data } = await registerUser(client)

  await server.query('DELETE FROM tasks WHERE user_id = $1', [data.user.id])

  return { client, userId: data.user.id }
}

const createTask = (client, body) =>
  client.request('/api/tasks', { method: 'POST', body })

describe('Жоспар API', () => {
  test('кірмеген қолданушыға берілмейді', async () => {
    const guest = createClient(server.base)

    assert.equal((await guest.request('/api/plan')).status, 401)
    assert.equal(
      (await guest.request('/api/plan', { method: 'POST', body: { capacity_minutes: 60 } }))
        .status,
      401,
    )
  })

  test('тіркелмей тұрғанда жоспар жоқ, бірақ нұсқалар бар', async () => {
    const { client } = await freshUser()

    const { status, data } = await client.request('/api/plan')

    assert.equal(status, 200)
    assert.equal(data.plan, null)
    assert.ok(data.presets.length >= 1)
    assert.match(data.today, /^\d{4}-\d{2}-\d{2}$/)
    assert.equal(data.outlook.week.needed_minutes, 0)
  })

  test('тапсырмаға жоспарлау өрістері жазылады', async () => {
    const { client } = await freshUser()
    const { data: today } = await client.request('/api/plan')

    const { status, data } = await createTask(client, {
      title: 'Курстық жұмыс',
      estimate_minutes: 240,
      priority: 1,
      due_date: addDays(today.today, 3),
    })

    assert.equal(status, 201)
    assert.equal(data.task.estimate_minutes, 240)
    assert.equal(data.task.priority, 1)
    assert.equal(data.task.due_date, addDays(today.today, 3))
  })

  test('дұрыс емес өрістер қабылданбайды', async () => {
    const { client } = await freshUser()

    assert.equal((await createTask(client, { title: 'a', estimate_minutes: 3 })).status, 400)
    assert.equal((await createTask(client, { title: 'a', estimate_minutes: 5000 })).status, 400)
    assert.equal((await createTask(client, { title: 'a', priority: 9 })).status, 400)
    assert.equal((await createTask(client, { title: 'a', due_date: '12.08.2026' })).status, 400)
    assert.equal((await createTask(client, { title: 'a', due_date: '2026-02-31' })).status, 400)
  })

  test('өрістерді кейін де қоюға, тазалауға болады', async () => {
    const { client } = await freshUser()
    const { data: created } = await createTask(client, { title: 'Кейін бағаланады' })

    assert.equal(created.task.estimate_minutes, null)
    assert.equal(created.task.priority, 2)

    const { data: updated } = await client.request(`/api/tasks/${created.task.id}`, {
      method: 'PATCH',
      body: { estimate_minutes: 90, priority: 1, due_date: '2026-08-20' },
    })

    assert.equal(updated.task.estimate_minutes, 90)
    assert.equal(updated.task.due_date, '2026-08-20')

    const { data: cleared } = await client.request(`/api/tasks/${created.task.id}`, {
      method: 'PATCH',
      body: { estimate_minutes: null, due_date: null },
    })

    assert.equal(cleared.task.estimate_minutes, null)
    assert.equal(cleared.task.due_date, null)
    // Тимеген өріс өзгермеуі керек
    assert.equal(cleared.task.priority, 1)
  })

  test('тіркелу жоспар құрады', async () => {
    const { client } = await freshUser()
    const { data: state } = await client.request('/api/plan')

    await createTask(client, {
      title: 'Есеп жазу',
      estimate_minutes: 300,
      due_date: addDays(state.today, 2),
    })
    await createTask(client, {
      title: 'Пәтерді жинау',
      estimate_minutes: 60,
      priority: 3,
      due_date: addDays(state.today, 6),
    })

    const { status, data } = await client.request('/api/plan', {
      method: 'POST',
      body: { capacity_minutes: 120 },
    })

    assert.equal(status, 201)
    assert.equal(data.plan.capacity_minutes, 120)
    assert.ok(data.plan.items.length >= 1)
    assert.ok(data.plan.planned_minutes <= 120)
    assert.equal(data.plan.items[0].title, 'Есеп жазу')
    assert.equal(data.plan.done_minutes, 0)
  })

  test('қайта жоспарлағанда ескісі ауысады, қосарланбайды', async () => {
    const { client, userId } = await freshUser()
    const { data: state } = await client.request('/api/plan')

    await createTask(client, {
      title: 'Ұзақ іс',
      estimate_minutes: 600,
      due_date: addDays(state.today, 3),
    })

    await client.request('/api/plan', { method: 'POST', body: { capacity_minutes: 300 } })
    const { data } = await client.request('/api/plan', {
      method: 'POST',
      body: { capacity_minutes: 60 },
    })

    assert.equal(data.plan.capacity_minutes, 60)
    assert.equal(data.plan.items.length, 1)
    assert.ok(data.plan.planned_minutes <= 60)

    const { rows } = await server.query(
      'SELECT COUNT(*)::int AS count FROM day_plans WHERE user_id = $1',
      [userId],
    )
    assert.equal(rows[0].count, 1)
  })

  test('дұрыс емес уақыт қабылданбайды', async () => {
    const { client } = await freshUser()

    for (const capacity of [0, 5, 900, 'көп', null, 60.5]) {
      const { status } = await client.request('/api/plan', {
        method: 'POST',
        body: { capacity_minutes: capacity },
      })
      assert.equal(status, 400, `${capacity} қабылданып кетті`)
    }
  })

  test('таймермен өткен уақыт жоспардың орындалуы болып көрінеді', async () => {
    const { client, userId } = await freshUser()
    const { data: state } = await client.request('/api/plan')

    const { data: created } = await createTask(client, {
      title: 'Мақала',
      estimate_minutes: 120,
      due_date: state.today,
    })

    await client.request('/api/plan', { method: 'POST', body: { capacity_minutes: 120 } })

    // Бүгін 30 минут жазылды
    await server.query(
      `INSERT INTO time_entries (user_id, task_id, started_at, ended_at, seconds)
       VALUES ($1, $2, now() - interval '30 minutes', now(), 1800)`,
      [userId, created.task.id],
    )

    const { data } = await client.request('/api/plan')

    assert.equal(data.plan.items[0].done_minutes, 30)
    assert.equal(data.plan.done_minutes, 30)
    assert.equal(data.plan.items[0].progress, 25)
    assert.equal(data.plan.remaining_minutes, 90)
  })

  test('аяқталған тапсырма жоспарда орындалды болып тұрады', async () => {
    const { client } = await freshUser()
    const { data: state } = await client.request('/api/plan')

    const { data: created } = await createTask(client, {
      title: 'Хат жіберу',
      estimate_minutes: 30,
      due_date: state.today,
    })

    await client.request('/api/plan', { method: 'POST', body: { capacity_minutes: 60 } })
    await client.request(`/api/tasks/${created.task.id}`, {
      method: 'PATCH',
      body: { done: true },
    })

    const { data } = await client.request('/api/plan')

    assert.equal(data.plan.items[0].done, true)
    assert.equal(data.plan.items[0].progress, 100)
    assert.equal(data.plan.finished, 1)
  })

  test('жоспардан бас тартуға болады', async () => {
    const { client } = await freshUser()

    await createTask(client, { title: 'Бірдеңе', estimate_minutes: 60 })
    await client.request('/api/plan', { method: 'POST', body: { capacity_minutes: 60 } })

    const { status, data } = await client.request('/api/plan', { method: 'DELETE' })

    assert.equal(status, 200)
    assert.equal(data.plan, null)
  })

  test('жоспар басқа қолданушыға көрінбейді', async () => {
    const first = await freshUser()
    const second = await freshUser()

    await createTask(first.client, { title: 'Жеке іс', estimate_minutes: 60 })
    await first.client.request('/api/plan', { method: 'POST', body: { capacity_minutes: 60 } })

    const { data } = await second.client.request('/api/plan')

    assert.equal(data.plan, null)
    assert.equal(data.backlog.length, 0)
  })
})
