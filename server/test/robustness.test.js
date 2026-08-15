/**
 * Шеткі жағдайлар: жарамсыз кіріс пен қатар келген сұраныстар 500 емес,
 * түсінікті жауап беруі керек. Мұндағы тесттердің әрқайсысы бір кездері
 * шынымен 500 қайтарған жағдайды бекітеді.
 */
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
  await registerUser(client)
  return client
}

// int4 шегінен асатын сан: `Number.isInteger()` оны өткізіп жібереді
const TOO_BIG = 9999999999

describe('int4 шегінен асқан id', () => {
  test('тапсырманы өшіргенде 404 қайтарады, 500 емес', async () => {
    const client = await freshUser()
    const { status, data } = await client.request(`/api/tasks/${TOO_BIG}`, {
      method: 'DELETE',
    })

    assert.equal(status, 404)
    assert.equal(data.error, 'Тапсырма табылмады.')
  })

  test('тапсырманы өңдегенде 404 қайтарады', async () => {
    const client = await freshUser()
    const { status } = await client.request(`/api/tasks/${TOO_BIG}`, {
      method: 'PATCH',
      body: { done: true },
    })

    assert.equal(status, 404)
  })

  test('жобаны өшіргенде 404 қайтарады', async () => {
    const client = await freshUser()
    const { status, data } = await client.request(`/api/projects/${TOO_BIG}`, {
      method: 'DELETE',
    })

    assert.equal(status, 404)
    assert.equal(data.error, 'Жоба табылмады.')
  })

  test('таймерді қосқанда 404 қайтарады', async () => {
    const client = await freshUser()
    const { status } = await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: TOO_BIG },
    })

    assert.equal(status, 404)
  })

  test('жоқ жобаға тапсырма қосқанда 400 қайтарады', async () => {
    const client = await freshUser()
    const { status, data } = await client.request('/api/tasks', {
      method: 'POST',
      body: { title: 'Тапсырма', project_id: TOO_BIG },
    })

    assert.equal(status, 400)
    assert.equal(data.error, 'Мұндай жоба жоқ.')
  })

  test('шектегі ең үлкен жарамды id әлі де қабылданады', async () => {
    const client = await freshUser()
    const { status } = await client.request('/api/tasks/2147483647', {
      method: 'DELETE',
    })

    // Мұндай жазба жоқ, бірақ сұраныс қорға жетіп, дұрыс 404 алуы керек
    assert.equal(status, 404)
  })
})

describe('CSV экспорт диапазоны', () => {
  test('прототип тізбегіндегі атау әдепкі диапазонға түседі', async () => {
    const client = await freshUser()

    for (const range of ['constructor', 'toString', '__proto__', 'valueOf']) {
      const { status } = await client.request(
        `/api/reports/export.csv?range=${range}`,
        { raw: true },
      )

      assert.equal(status, 200, `?range=${range} 200 қайтаруы керек`)
    }
  })

  test('белгісіз мән де әдепкі диапазонға түседі', async () => {
    const client = await freshUser()
    const { status } = await client.request('/api/reports/export.csv?range=xyz', {
      raw: true,
    })

    assert.equal(status, 200)
  })

  test('жарамды диапазондар жұмыс істейді', async () => {
    const client = await freshUser()

    for (const range of ['week', 'month', 'all']) {
      const { status } = await client.request(
        `/api/reports/export.csv?range=${range}`,
        { raw: true },
      )

      assert.equal(status, 200)
    }
  })
})

describe('Қатар келген таймер сұраныстары', () => {
  test('бір мезгілде бірнеше рет қосылса да 500 болмайды', async () => {
    const client = await freshUser()
    const { data } = await client.request('/api/tasks')
    const ids = data.tasks.map((task) => task.id)

    const results = await Promise.all(
      ids.map((id) =>
        client.request('/api/timer/start', {
          method: 'POST',
          body: { task_id: id },
        }),
      ),
    )

    const statuses = results.map((result) => result.status)
    assert.ok(
      statuses.every((status) => status === 201),
      `бәрі 201 болуы керек еді, келгені: ${statuses}`,
    )

    // Дерек тұтастығы сақталуы керек: жүріп тұрған таймер тек біреу
    const { rows } = await server.query(
      'SELECT COUNT(*)::int AS running FROM time_entries WHERE ended_at IS NULL',
    )
    assert.equal(rows[0].running, 1)
  })

  test('қатар тоқтатқанда біреуі ғана сәтті болады', async () => {
    const client = await freshUser()
    const { data } = await client.request('/api/tasks')

    await client.request('/api/timer/start', {
      method: 'POST',
      body: { task_id: data.tasks[0].id },
    })

    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        client.request('/api/timer/stop', { method: 'POST' }),
      ),
    )

    const statuses = results.map((result) => result.status)
    assert.equal(statuses.filter((status) => status === 200).length, 1)
    assert.ok(
      statuses.every((status) => status === 200 || status === 400),
      `тек 200/400 күтілген, келгені: ${statuses}`,
    )
  })
})

describe('Rate limit хабарламасы', () => {
  test('таңдалған тілде қайтады', async () => {
    const { resetRateLimits } = await import('../rateLimit.js')
    const previous = process.env.RATE_LIMIT_MAX

    process.env.RATE_LIMIT_MAX = '1'
    resetRateLimits()

    try {
      const hit = async (lang) => {
        let last
        for (let i = 0; i < 3; i += 1) {
          const response = await fetch(`${server.base}/api/auth/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', cookie: `lang=${lang}` },
            body: JSON.stringify({ email: 'nobody@focus10.test', password: 'x' }),
          })
          last = { status: response.status, data: await response.json() }
        }
        return last
      }

      const kk = await hit('kk')
      assert.equal(kk.status, 429)
      assert.match(kk.data.error, /Тым көп әрекет/)
      assert.match(kk.data.error, /\d+ секундтан/, 'секунд саны қойылуы керек')
      assert.ok(!kk.data.error.includes('{{'), 'орын толтырғыш қалып қоймауы керек')

      resetRateLimits()

      const en = await hit('en')
      assert.equal(en.status, 429)
      assert.match(en.data.error, /Too many attempts/)
      assert.match(en.data.error, /in \d+ seconds/)
    } finally {
      process.env.RATE_LIMIT_MAX = previous
      resetRateLimits()
    }
  })
})
