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

/** Тіл тақырыптарын қолмен беру үшін — createClient оны қолдамайды. */
const get = async (path, headers = {}) => {
  const response = await fetch(server.base + path, { headers })
  const text = await response.text()
  return {
    status: response.status,
    text,
    data: text ? JSON.parse(text) : null,
  }
}

describe('Тілді анықтау', () => {
  test('тіл көрсетілмесе қазақша қайтарады', async () => {
    const { status, data } = await get('/api/auth/me')

    assert.equal(status, 401)
    assert.equal(data.error, 'Кіру қажет.')
  })

  test('lang cookie ағылшынша жауап алдырады', async () => {
    const { status, data } = await get('/api/auth/me', { cookie: 'lang=en' })

    assert.equal(status, 401)
    assert.equal(data.error, 'You need to sign in.')
  })

  test('cookie болмаса Accept-Language ескеріледі', async () => {
    const { data } = await get('/api/auth/me', {
      'accept-language': 'en-GB,en;q=0.9,kk;q=0.8',
    })

    assert.equal(data.error, 'You need to sign in.')
  })

  test('cookie Accept-Language-тен басым', async () => {
    const { data } = await get('/api/auth/me', {
      cookie: 'lang=kk',
      'accept-language': 'en-US,en;q=0.9',
    })

    assert.equal(data.error, 'Кіру қажет.')
  })

  test('белгісіз тіл әдепкіге қайта оралады', async () => {
    const { data } = await get('/api/auth/me', { cookie: 'lang=de' })

    assert.equal(data.error, 'Кіру қажет.')
  })

  test('басқа cookie-лердің арасынан да табылады', async () => {
    const { data } = await get('/api/auth/me', {
      cookie: 'ff_session=abc; lang=en; theme=dark',
    })

    assert.equal(data.error, 'You need to sign in.')
  })

  test('бүлінген JSON туралы қате де аударылады', async () => {
    const response = await fetch(`${server.base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'lang=en' },
      body: '{ бұл JSON емес',
    })
    const data = await response.json()

    assert.equal(response.status, 400)
    assert.equal(data.error, 'The JSON is malformed.')
  })
})

describe('Тілге тәуелді дерек', () => {
  test('тіркелген тілде бастапқы жоба мен тапсырмалар беріледі', async () => {
    const response = await fetch(`${server.base}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept-language': 'en' },
      body: JSON.stringify({
        name: 'Alex Doe',
        email: `en.${Date.now()}@focus10.test`,
        password: 'supersecret1',
      }),
    })

    assert.equal(response.status, 201)
    const cookie = response.headers.get('set-cookie').split(';')[0]

    const tasksResponse = await fetch(`${server.base}/api/tasks`, { headers: { cookie } })
    const { tasks } = await tasksResponse.json()

    assert.equal(tasks.length, 3)
    assert.ok(tasks.every((task) => task.project_name === 'My first project'))
    assert.ok(tasks.some((task) => task.title === 'Add your first task'))
  })

  test('CSV тақырыптары таңдалған тілде шығады', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    const kk = await fetch(`${server.base}/api/reports/export.csv`, {
      headers: { cookie: client.cookie },
    })
    assert.match(await kk.text(), /Күні,Басталды,Аяқталды,Жоба,Тапсырма/)

    const en = await fetch(`${server.base}/api/reports/export.csv`, {
      headers: { cookie: `${client.cookie}; lang=en` },
    })
    assert.match(await en.text(), /Date,Start,End,Project,Task/)
  })

  test('жобасы жоқ уақыт есепте null болып қайтады', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    const { data: created } = await client.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Жобасыз тапсырма' },
    })

    // Таймерді бірден тоқтатсақ 0 секунд шығады да, есептен сүзіліп қалады
    const { data: me } = await client.request('/api/auth/me')
    await server.query(
      `INSERT INTO time_entries (user_id, task_id, started_at, ended_at, seconds)
       VALUES ($1, $2, now() - interval '10 minutes', now(), 600)`,
      [me.user.id, created.task.id],
    )

    const { data: report } = await client.request('/api/reports/week')
    const row = report.by_project.find((item) => item.project === null)

    // Атауын клиент өз тілінде қояды, сондықтан серверде белгі болмауы керек
    assert.ok(row, 'жобасыз жол болуы керек')
  })
})
