import test, { before, after, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createClient, registerUser, startTestServer } from './helpers.js'

let server

before(async () => {
  server = await startTestServer()
})

after(async () => {
  await server.close()
})

const freshUser = async () => {
  const client = createClient(server.base)
  const { data } = await registerUser(client)
  return { client, user: data.user }
}

describe('Тапсырмалар', () => {
  test('қосылады, өңделеді, жойылады', async () => {
    const { client } = await freshUser()

    const created = await client.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Жаңа тапсырма' },
    })
    assert.equal(created.status, 201)
    const id = created.data.task.id

    const renamed = await client.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: { title: 'Аты өзгертілді' },
    })
    assert.equal(renamed.data.task.title, 'Аты өзгертілді')

    const removed = await client.request(`/api/tasks/${id}`, { method: 'DELETE' })
    assert.equal(removed.status, 204)

    const { data } = await client.request('/api/tasks')
    assert.ok(!data.tasks.some((task) => task.id === id))
  })

  test('аяқталған тапсырмаға completed_at қойылады, кері қайтарғанда тазаланады', async () => {
    const { client } = await freshUser()
    const { data: created } = await client.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Аяқталатын' },
    })
    const id = created.task.id

    const done = await client.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: { done: true },
    })
    assert.equal(done.data.task.done, true)
    assert.ok(done.data.task.completed_at)

    const undone = await client.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: { done: false },
    })
    assert.equal(undone.data.task.done, false)
    assert.equal(undone.data.task.completed_at, null)
  })

  test('бос ат қабылданбайды', async () => {
    const { client } = await freshUser()
    const { status } = await client.request('/api/tasks', {
      method: 'POST',
      body: { title: '   ' },
    })

    assert.equal(status, 400)
  })

  test('бөтен жобаға тапсырма қосуға болмайды', async () => {
    const { client: a } = await freshUser()
    const { client: b } = await freshUser()

    const { data } = await a.request('/api/projects')
    const foreignProject = data.projects[0].id

    const { status } = await b.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Қаскөй тапсырма', project_id: foreignProject },
    })

    assert.equal(status, 400)
  })

  test('авторизациясыз қол жеткізуге болмайды', async () => {
    const client = createClient(server.base)
    assert.equal((await client.request('/api/tasks')).status, 401)
  })
})

describe('Қолданушылардың бір-бірінен оқшаулануы', () => {
  test('бөтен тапсырманы көру, өзгерту, жою мүмкін емес', async () => {
    const { client: a } = await freshUser()
    const { client: b } = await freshUser()

    const { data: created } = await a.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Құпия тапсырма' },
    })
    const id = created.task.id

    const list = await b.request('/api/tasks')
    assert.ok(!list.data.tasks.some((task) => task.id === id))

    assert.equal(
      (await b.request(`/api/tasks/${id}`, { method: 'PATCH', body: { title: 'ұрланды' } }))
        .status,
      404,
    )
    assert.equal((await b.request(`/api/tasks/${id}`, { method: 'DELETE' })).status, 404)

    // Тапсырма өзгермей тұрғанына көз жеткіземіз
    const after = await a.request('/api/tasks')
    assert.ok(after.data.tasks.some((task) => task.title === 'Құпия тапсырма'))
  })

  test('бөтен тапсырмаға таймер қосуға болмайды', async () => {
    const { client: a } = await freshUser()
    const { client: b } = await freshUser()

    const { data } = await a.request('/api/tasks')
    const foreignTask = data.tasks[0].id

    const { status } = await b.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: foreignTask },
    })

    assert.equal(status, 404)
  })
})

describe('Таймер', () => {
  test('қосылады, белсенді болып көрінеді, тоқтайды', async () => {
    const { client } = await freshUser()
    const { data } = await client.request('/api/tasks')
    const taskId = data.tasks[0].id

    const started = await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: taskId },
    })
    assert.equal(started.status, 201)
    assert.equal(started.data.active.task_id, taskId)

    const active = await client.request('/api/timer')
    assert.equal(active.data.active.task_id, taskId)

    const stopped = await client.request('/api/timer/stop', { method: 'POST' })
    assert.equal(stopped.status, 200)
    assert.equal((await client.request('/api/timer')).data.active, null)
  })

  test('бір мезгілде тек бір таймер жүреді', async () => {
    const { client, user } = await freshUser()
    const { data } = await client.request('/api/tasks')

    await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: data.tasks[0].id },
    })
    await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: data.tasks[1].id },
    })

    const running = server.db
      .prepare(
        'SELECT COUNT(*) AS n FROM time_entries WHERE user_id = ? AND ended_at IS NULL',
      )
      .get(user.id).n

    assert.equal(running, 1)
    assert.equal((await client.request('/api/timer')).data.active.task_id, data.tasks[1].id)
  })

  test('жүріп тұрған таймері жоқта тоқтату 400 қайтарады', async () => {
    const { client } = await freshUser()
    const { status } = await client.request('/api/timer/stop', { method: 'POST' })

    assert.equal(status, 400)
  })

  test('тапсырма аяқталғанда таймері автоматты тоқтайды', async () => {
    const { client } = await freshUser()
    const { data } = await client.request('/api/tasks')
    const taskId = data.tasks[0].id

    await client.request('/api/timer/start', { method: 'POST', body: { task_id: taskId } })
    await client.request(`/api/tasks/${taskId}`, { method: 'PATCH', body: { done: true } })

    assert.equal((await client.request('/api/timer')).data.active, null)
  })

  test('аяқталған тапсырмаға таймер қосылмайды', async () => {
    const { client } = await freshUser()
    const { data } = await client.request('/api/tasks')
    const taskId = data.tasks[0].id

    await client.request(`/api/tasks/${taskId}`, { method: 'PATCH', body: { done: true } })
    const { status } = await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: taskId },
    })

    assert.equal(status, 400)
  })

  test('тоқтатылған сессия тапсырманың жалпы уақытына қосылады', async () => {
    const { client, user } = await freshUser()
    const { data } = await client.request('/api/tasks')
    const taskId = data.tasks[0].id

    await client.request('/api/timer/start', { method: 'POST', body: { task_id: taskId } })

    // Тесті 1 секунд күттірмеу үшін басталу уақытын артқа жылжытамыз
    server.db
      .prepare(
        `UPDATE time_entries SET started_at = datetime('now', '-90 seconds')
          WHERE user_id = ? AND ended_at IS NULL`,
      )
      .run(user.id)

    await client.request('/api/timer/stop', { method: 'POST' })

    const { data: after } = await client.request('/api/tasks')
    const task = after.tasks.find((item) => item.id === taskId)

    assert.ok(task.tracked_seconds >= 89 && task.tracked_seconds <= 92)
  })
})

describe('Есептер', () => {
  test('әрқашан 7 күн қайтарады, дерегі жоқ күндер нөл', async () => {
    const { client } = await freshUser()
    const { data } = await client.request('/api/reports/week')

    assert.equal(data.days.length, 7)
    assert.equal(data.week_seconds, 0)
    assert.deepEqual(data.by_project, [])
  })

  test('уақыт есептелген соң бүгінгі және апталық жиынтық өседі', async () => {
    const { client, user } = await freshUser()
    const { data } = await client.request('/api/tasks')

    await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: data.tasks[0].id },
    })
    server.db
      .prepare(
        `UPDATE time_entries SET started_at = datetime('now', '-120 seconds')
          WHERE user_id = ? AND ended_at IS NULL`,
      )
      .run(user.id)
    await client.request('/api/timer/stop', { method: 'POST' })

    const { data: report } = await client.request('/api/reports/week')

    assert.ok(report.today_seconds >= 119)
    assert.equal(report.days.at(-1).seconds, report.today_seconds)
    assert.equal(report.by_project.length, 1)
  })

  test('CSV экспорты дұрыс тақырыппен және экрандалған мәндермен келеді', async () => {
    const { client, user } = await freshUser()

    const { data: created } = await client.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Атында, үтір бар "тырнақшамен"' },
    })

    await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: created.task.id },
    })
    server.db
      .prepare(
        `UPDATE time_entries SET started_at = datetime('now', '-60 seconds')
          WHERE user_id = ? AND ended_at IS NULL`,
      )
      .run(user.id)
    await client.request('/api/timer/stop', { method: 'POST' })

    // response.text() BOM-ды стандарт бойынша алып тастайды, сондықтан
    // байттарды тікелей тексереміз
    const response = await fetch(`${server.base}/api/reports/export.csv`, {
      headers: { cookie: client.cookie },
    })
    const bytes = new Uint8Array(await response.arrayBuffer())
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes)

    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/csv/)
    assert.match(response.headers.get('content-disposition'), /attachment; filename=/)
    assert.deepEqual(
      [bytes[0], bytes[1], bytes[2]],
      [0xef, 0xbb, 0xbf],
      'Excel кириллицаны дұрыс оқуы үшін UTF-8 BOM керек',
    )
    assert.ok(text.includes('"Атында, үтір бар ""тырнақшамен"""'))
  })
})

describe('Сервер мінез-құлқы', () => {
  test('белгісіз API жолы JSON 404 қайтарады', async () => {
    const client = createClient(server.base)
    const { status, data } = await client.request('/api/жоқжол')

    assert.equal(status, 404)
    assert.ok(data.error)
  })

  test('бүлінген JSON 400 қайтарады, 500 емес', async () => {
    const response = await fetch(`${server.base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{бұл JSON емес',
    })

    assert.equal(response.status, 400)
  })

  test('қауіпсіздік тақырыптары жіберіледі', async () => {
    const response = await fetch(`${server.base}/api/health`)

    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(response.headers.get('x-frame-options'), 'DENY')
    assert.equal(response.headers.get('x-powered-by'), null)
  })

  test('сессия cookie httpOnly және sameSite болып қойылады', async () => {
    const client = createClient(server.base)
    const { response } = await registerUser(client)
    const setCookie = response.headers.get('set-cookie')

    assert.match(setCookie, /HttpOnly/i)
    assert.match(setCookie, /SameSite=Lax/i)
  })

  test('auth маршрутында rate limit жұмыс істейді', async () => {
    const { resetRateLimits } = await import('../rateLimit.js')
    const previous = process.env.RATE_LIMIT_MAX

    process.env.RATE_LIMIT_MAX = '3'
    resetRateLimits()

    try {
      const client = createClient(server.base)
      const statuses = []

      for (let i = 0; i < 6; i += 1) {
        const { status } = await client.request('/api/auth/login', {
          method: 'POST',
          body: { email: 'nobody@focusflow.test', password: 'қате' },
        })
        statuses.push(status)
      }

      assert.ok(statuses.includes(429), `429 күтілген, келгені: ${statuses}`)
      assert.equal(statuses[0], 401, 'алғашқы әрекет өтуі керек')
    } finally {
      process.env.RATE_LIMIT_MAX = previous
      resetRateLimits()
    }
  })
})
