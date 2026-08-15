import test, { before, after, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createClient, registerUser, startTestServer } from './helpers.js'

let server

before(async () => {
  server = await startTestServer()
})

after(async () => {
  await server.close()
})

/**
 * Хат тестте жіберілмейді (RESEND_API_KEY жоқ), сондықтан сілтемедегі
 * токенді қордан аламыз. Қорда токеннің хеші жатқандықтан, оны кері шығара
 * алмаймыз — тесттің өзі токен құрып, хешін салыстырады.
 */
async function tokenRowsFor(email, kind) {
  const { rows } = await server.query(
    `SELECT a.token_hash, a.expires_at
       FROM auth_tokens a
       JOIN users u ON u.id = a.user_id
      WHERE lower(u.email) = lower($1) AND a.kind = $2`,
    [email, kind],
  )
  return rows
}

let counter = 0

/**
 * Токеннің орнына тестте өз мәнімізді қоямыз — сілтеме дәл солай жұмыс
 * істейді. `token_hash` — бірінші кілт, сондықтан әр тестке бөлек мән керек.
 */
async function plantToken(email, kind, { expired = false } = {}) {
  counter += 1
  const token = String(counter).padStart(64, '0')

  const { rows } = await server.query(
    'SELECT id FROM users WHERE lower(email) = lower($1)',
    [email],
  )

  await server.query(
    `INSERT INTO auth_tokens (token_hash, user_id, kind, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' minutes')::interval)`,
    [
      createHash('sha256').update(token).digest('hex'),
      rows[0].id,
      kind,
      expired ? '-1' : '60',
    ],
  )

  return token
}

describe('Құпиясөзді ұмытқанда', () => {
  test('тіркелген email-ге токен құрылады', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    const { status } = await client.request('/api/auth/forgot', {
      method: 'POST',
      body: { email: payload.email },
    })

    assert.equal(status, 204)
    assert.equal((await tokenRowsFor(payload.email, 'reset')).length, 1)
  })

  test('белгісіз email де 204 қайтарады — тіркелген-тіркелмегені сыр болып қалады', async () => {
    const client = createClient(server.base)

    const { status } = await client.request('/api/auth/forgot', {
      method: 'POST',
      body: { email: 'жоқадам@focus10.test' },
    })

    assert.equal(status, 204)
  })

  test('жаңа сұраныс ескі сілтемені жарамсыз етеді', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    await client.request('/api/auth/forgot', {
      method: 'POST',
      body: { email: payload.email },
    })
    const first = await tokenRowsFor(payload.email, 'reset')

    await client.request('/api/auth/forgot', {
      method: 'POST',
      body: { email: payload.email },
    })
    const second = await tokenRowsFor(payload.email, 'reset')

    assert.equal(second.length, 1)
    assert.notEqual(second[0].token_hash, first[0].token_hash)
  })

  test('токен ашық түрде сақталмайды', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    const token = await plantToken(payload.email, 'reset')
    const [row] = await tokenRowsFor(payload.email, 'reset')

    assert.notEqual(row.token_hash, token)
    assert.match(row.token_hash, /^[0-9a-f]{64}$/)
  })
})

describe('Құпиясөзді қалпына келтіру', () => {
  test('жарамды токенмен құпиясөз ауысады және ескі құпиясөз жұмыс істемейді', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    const token = await plantToken(payload.email, 'reset')

    const reset = await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: 'жаңақұпиясөз1' },
    })
    assert.equal(reset.status, 204)

    const guest = createClient(server.base)
    const stale = await guest.request('/api/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: payload.password },
    })
    assert.equal(stale.status, 401)

    const fresh = await guest.request('/api/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: 'жаңақұпиясөз1' },
    })
    assert.equal(fresh.status, 200)
  })

  test('токен бір-ақ рет жұмыс істейді', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    const token = await plantToken(payload.email, 'reset')

    await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: 'бірінші-рет1' },
    })

    const second = await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: 'екінші-рет12' },
    })

    assert.equal(second.status, 400)
  })

  test('мерзімі өткен токен қабылданбайды', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    const token = await plantToken(payload.email, 'reset', { expired: true })

    const { status } = await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: 'жаңақұпиясөз1' },
    })

    assert.equal(status, 400)
  })

  test('жалған токен 400 қайтарады', async () => {
    const client = createClient(server.base)

    const { status } = await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token: 'b'.repeat(64), new_password: 'жаңақұпиясөз1' },
    })

    assert.equal(status, 400)
  })

  test('қысқа құпиясөз токенді жоймайды', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    const token = await plantToken(payload.email, 'reset')

    const short = await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: '123' },
    })
    assert.equal(short.status, 400)
    assert.ok(short.data.errors.new_password)

    // Токен әлі күшінде: адам ұзынырақ құпиясөз жазып қайталай алады
    const retry = await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: 'жеткіліктіұзын1' },
    })
    assert.equal(retry.status, 204)
  })

  test('қалпына келтіру барлық құрылғыдағы сессияны жабады', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    // Тіркелген соң сессия бар — ол қалпына келтіруден кейін жарамсыз болуы керек
    assert.equal((await client.request('/api/auth/me')).status, 200)

    const token = await plantToken(payload.email, 'reset')
    await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: 'жаңақұпиясөз1' },
    })

    assert.equal((await client.request('/api/auth/me')).status, 401)
  })
})

describe('Email растау', () => {
  test('тіркелген соң растау токені құрылады, ал аккаунт әлі расталмаған', async () => {
    const client = createClient(server.base)
    const { data, payload } = await registerUser(client)

    assert.equal(data.user.email_verified, false)
    assert.equal((await tokenRowsFor(payload.email, 'verify')).length, 1)
  })

  test('сілтеме email-ді растайды', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    const token = await plantToken(payload.email, 'verify')

    const { status } = await client.request('/api/auth/verify', {
      method: 'POST',
      body: { token },
    })
    assert.equal(status, 204)

    const me = await client.request('/api/auth/me')
    assert.equal(me.data.user.email_verified, true)
  })

  test('растау токенін қалпына келтіруге қолдануға болмайды', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    const token = await plantToken(payload.email, 'verify')

    const { status } = await client.request('/api/auth/reset', {
      method: 'POST',
      body: { token, new_password: 'жаңақұпиясөз1' },
    })

    assert.equal(status, 400)
  })

  test('расталған аккаунтқа хат қайта жіберілмейді', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)
    const token = await plantToken(payload.email, 'verify')
    await client.request('/api/auth/verify', { method: 'POST', body: { token } })

    const { status } = await client.request('/api/auth/verify/resend', {
      method: 'POST',
    })

    assert.equal(status, 409)
  })

  test('расталмаған аккаунт хатты қайта сұрай алады', async () => {
    const client = createClient(server.base)
    await registerUser(client)

    const { status } = await client.request('/api/auth/verify/resend', {
      method: 'POST',
    })

    assert.equal(status, 204)
  })

  test('кірмеген қолданушы хат қайта сұрай алмайды', async () => {
    const guest = createClient(server.base)

    const { status } = await guest.request('/api/auth/verify/resend', {
      method: 'POST',
    })

    assert.equal(status, 401)
  })

  test('аккаунт өшкенде токендері де өшеді', async () => {
    const client = createClient(server.base)
    const { payload } = await registerUser(client)

    await client.request('/api/auth/account', {
      method: 'DELETE',
      body: { password: payload.password },
    })

    assert.equal((await tokenRowsFor(payload.email, 'verify')).length, 0)
  })
})
