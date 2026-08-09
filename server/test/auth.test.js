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

describe('Тіркелу', () => {
  test('дұрыс дерекпен аккаунт құрылады және сессия беріледі', async () => {
    const client = createClient(server.base)
    const { status, data } = await registerUser(client)

    assert.equal(status, 201)
    assert.ok(data.user.id)
    assert.match(client.cookie, /^ff_session=/)
  })

  test('құпиясөз жауапта қайтарылмайды', async () => {
    const client = createClient(server.base)
    const { data } = await registerUser(client)

    assert.equal(data.user.password, undefined)
    assert.equal(data.user.password_hash, undefined)
  })

  test('құпиясөз ашық түрде сақталмайды', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    const { rows } = await server.query(
      'SELECT password_hash FROM users WHERE lower(email) = lower($1)',
      [payload.email],
    )

    assert.notEqual(rows[0].password_hash, payload.password)
    assert.match(rows[0].password_hash, /^[0-9a-f]{32}:[0-9a-f]{128}$/)
  })

  test('жарамсыз дерек 400 және өріс қателерін қайтарады', async () => {
    const client = createClient(server.base)
    const { status, data } = await client.request('/api/auth/register', {
      method: 'POST',
      body: { name: 'A', email: 'жарамсыз', password: '123' },
    })

    assert.equal(status, 400)
    assert.ok(data.errors.name)
    assert.ok(data.errors.email)
    assert.ok(data.errors.password)
  })

  test('қайталанған email 409 қайтарады', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    const second = await client.request('/api/auth/register', {
      method: 'POST',
      body: { ...payload, name: 'Басқа адам' },
    })

    assert.equal(second.status, 409)
  })

  test('email регистрге тәуелсіз бірегей', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    const second = await client.request('/api/auth/register', {
      method: 'POST',
      body: { ...payload, email: payload.email.toUpperCase() },
    })

    assert.equal(second.status, 409)
  })

  test('жаңа қолданушыға бастапқы жоба мен тапсырмалар беріледі', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    const { data } = await client.request('/api/tasks')
    assert.equal(data.tasks.length, 3)
    assert.ok(data.tasks.every((task) => task.project_name))
  })
})

describe('Кіру', () => {
  test('дұрыс құпиясөзбен кіреді', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    client.clearCookie()

    const { status, data } = await client.request('/api/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: payload.password },
    })

    assert.equal(status, 200)
    assert.equal(data.user.email, payload.email)
  })

  test('қате құпиясөз 401 қайтарады', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    const { status } = await client.request('/api/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: 'қатеқұпиясөз' },
    })

    assert.equal(status, 401)
  })

  test('жоқ email мен қате құпиясөздің жауабы бірдей — email барын ашпайды', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    const missing = await client.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'жоқ@focus10.test', password: 'supersecret1' },
    })
    const wrong = await client.request('/api/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: 'басқақұпиясөз' },
    })

    assert.equal(missing.status, wrong.status)
    assert.deepEqual(missing.data, wrong.data)
  })
})

describe('Сессия', () => {
  test('/me cookie-сіз 401 қайтарады', async () => {
    const client = createClient(server.base)
    const { status } = await client.request('/api/auth/me')

    assert.equal(status, 401)
  })

  test('logout сессияны жарамсыз етеді', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    assert.equal((await client.request('/api/auth/me')).status, 200)
    await client.request('/api/auth/logout', { method: 'POST' })
    assert.equal((await client.request('/api/auth/me')).status, 401)
  })

  test('жалған токенмен кіруге болмайды', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    const response = await fetch(`${server.base}/api/auth/me`, {
      headers: { cookie: `ff_session=${'a'.repeat(64)}` },
    })

    assert.equal(response.status, 401)
  })

  test('мерзімі өткен сессия қабылданбайды', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    const token = client.cookie.split('=')[1]
    await server.query(
      `UPDATE sessions SET expires_at = now() - interval '1 day' WHERE token = $1`,
      [token],
    )

    assert.equal((await client.request('/api/auth/me')).status, 401)
  })
})

describe('Аккаунт', () => {
  test('құпиясөзді ауыстырады және басқа сессияларды жояды', async () => {
    const phone = createClient(server.base)
    const { payload } = await registerUser(phone)

    // Екінші «құрылғыдан» кіреміз
    const laptop = createClient(server.base)
    await laptop.request('/api/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: payload.password },
    })
    assert.equal((await laptop.request('/api/auth/me')).status, 200)

    const changed = await laptop.request('/api/auth/password', {
      method: 'PATCH',
      body: { current_password: payload.password, new_password: 'жаңақұпиясөз123' },
    })
    assert.equal(changed.status, 204)

    // Ауыстырған құрылғы жүйеде қалады, ескі сессия — жоқ
    assert.equal((await laptop.request('/api/auth/me')).status, 200)
    assert.equal((await phone.request('/api/auth/me')).status, 401)
  })

  test('ағымдағы құпиясөз қате болса ауыстырмайды', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    const { status } = await client.request('/api/auth/password', {
      method: 'PATCH',
      body: { current_password: 'қате', new_password: 'жаңақұпиясөз123' },
    })

    assert.equal(status, 403)
  })

  test('аккаунтты жойғанда бүкіл дерегі де жойылады', async () => {
    const client = createClient(server.base)
    const { data, payload } = await registerUser(client)
    const userId = data.user.id

    await client.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Жойылатын тапсырма' },
    })

    const deleted = await client.request('/api/auth/account', {
      method: 'DELETE',
      body: { password: payload.password },
    })
    assert.equal(deleted.status, 204)

    const counts = []
    for (const table of ['users', 'tasks', 'projects', 'sessions']) {
      const column = table === 'users' ? 'id' : 'user_id'
      const { rows } = await server.query(
        `SELECT COUNT(*)::int AS n FROM ${table} WHERE ${column} = $1`,
        [userId],
      )
      counts.push(rows[0].n)
    }

    assert.deepEqual(counts, [0, 0, 0, 0])
  })
})
