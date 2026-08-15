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

const TZ = 'Asia/Almaty'

/** Тіркеліп, seed тапсырмаларының біріншісін қайтарады. */
async function userWithTask() {
  const client = createClient(server.base)
  const { data } = await registerUser(client)

  const { rows } = await server.query(
    'SELECT id FROM tasks WHERE user_id = $1 ORDER BY id LIMIT 1',
    [data.user.id],
  )

  return { client, userId: data.user.id, taskId: rows[0].id }
}

/**
 * Аяқталған уақыт жазбасын қосады. Күн мен сағат қолданушының уақыт
 * белдеуімен беріледі (есеп те солай саналады), сондықтан тест UTC-ке
 * қатысты жылжып кетпейді.
 */
function addEntry({ userId, taskId, daysAgo, hour, seconds }) {
  return server.query(
    `INSERT INTO time_entries (user_id, task_id, started_at, ended_at, seconds)
     SELECT $1, $2, started, started + ($5::text || ' seconds')::interval, $5::int
       FROM (
         SELECT (((now() AT TIME ZONE $6)::date
                  - ($3 || ' days')::interval
                  + ($4 || ' hours')::interval) AT TIME ZONE $6) AS started
       ) AS moment`,
    [userId, taskId, String(daysAgo), String(hour), seconds, TZ],
  )
}

const insightById = (data, id) => data.insights.find((row) => row.id === id)

describe('Insights', () => {
  test('кірмеген қолданушыға берілмейді', async () => {
    const guest = createClient(server.base)
    const { status } = await guest.request('/api/reports/insights')

    assert.equal(status, 401)
  })

  test('дерек аз болса, қорытынды жасалмайды', async () => {
    const { client } = await userWithTask()

    const { status, data } = await client.request('/api/reports/insights')

    assert.equal(status, 200)
    assert.equal(data.ready, false)
    assert.deepEqual(data.insights, [])
    assert.equal(data.sample.sessions, 0)
    assert.ok(data.needed.sessions > 0)
  })

  test('бір күндік дерек те жеткіліксіз — «заңдылық» бір күннен шықпайды', async () => {
    const { client, userId, taskId } = await userWithTask()

    for (const hour of [9, 11, 14]) {
      await addEntry({ userId, taskId, daysAgo: 1, hour, seconds: 1800 })
    }

    const { data } = await client.request('/api/reports/insights')

    assert.equal(data.ready, false)
    assert.equal(data.sample.days, 1)
  })

  test('ең қауырт үш сағаттық терезені табады', async () => {
    const { client, userId, taskId } = await userWithTask()

    // Күн сайын таңғы 9–11 аралығында жұмыс + бір кешкі жазба
    for (const daysAgo of [1, 2, 3]) {
      await addEntry({ userId, taskId, daysAgo, hour: 9, seconds: 3600 })
      await addEntry({ userId, taskId, daysAgo, hour: 10, seconds: 3600 })
    }
    await addEntry({ userId, taskId, daysAgo: 2, hour: 21, seconds: 600 })

    const { data } = await client.request('/api/reports/insights')
    const peak = insightById(data, 'peakWindow')

    assert.equal(data.ready, true)
    assert.ok(peak, 'peakWindow күтілген')
    // Жұмыс 9-да басталып 11-де бітеді — терезенің шеті бос сағатқа
    // жайылып кетпеуі керек
    assert.equal(peak.from, 9)
    assert.equal(peak.to, 11)
    assert.ok(peak.share > 80, `үлесі тым төмен: ${peak.share}`)
    assert.equal(data.hours.length, 24)
    assert.equal(data.hours[9], 3 * 3600)
  })

  test('ең өнімді күн бір рет қана кездескен күннен шықпайды', async () => {
    const { client, userId, taskId } = await userWithTask()

    // Қатарынан үш күн: әр апта күні бір-ақ рет кездеседі
    for (const daysAgo of [1, 2, 3]) {
      await addEntry({ userId, taskId, daysAgo, hour: 10, seconds: 3600 })
    }

    const { data } = await client.request('/api/reports/insights')

    assert.equal(insightById(data, 'bestWeekday'), undefined)
  })

  test('ең өнімді күнді жұмыс істелген күндер бойынша есептейді', async () => {
    const { client, userId, taskId } = await userWithTask()

    // Екі апта бойы бір апта күні (7 күн айырма) — екеуінде 2 сағаттан
    for (const daysAgo of [1, 8]) {
      await addEntry({ userId, taskId, daysAgo, hour: 10, seconds: 7200 })
    }
    // Салыстыратын екінші күн: одан әлдеқайда аз
    for (const daysAgo of [3, 10]) {
      await addEntry({ userId, taskId, daysAgo, hour: 10, seconds: 600 })
    }

    const { data } = await client.request('/api/reports/insights')
    const best = insightById(data, 'bestWeekday')

    // Аралығында жұмыс істелмеген күндер бар, бірақ олар орташаны түсірмеуі керек
    assert.equal(best.seconds, 7200)
  })

  test('уақыт күн бойына шашыраса, шың деп ештеңе көрсетілмейді', async () => {
    const { client, userId, taskId } = await userWithTask()

    // Тәулік бойы біркелкі: бірде-бір үш сағаттық терезе басым емес
    for (const hour of [1, 4, 7, 10, 13, 16, 19, 22]) {
      await addEntry({ userId, taskId, daysAgo: hour % 5, hour, seconds: 1800 })
    }

    const { data } = await client.request('/api/reports/insights')

    assert.equal(data.ready, true)
    assert.equal(insightById(data, 'peakWindow'), undefined)
  })

  test('үзілмеген күндер сериясын санайды', async () => {
    const { client, userId, taskId } = await userWithTask()

    for (const daysAgo of [0, 1, 2, 3]) {
      await addEntry({ userId, taskId, daysAgo, hour: 10, seconds: 1800 })
    }
    // Сериядан тыс, үзілістен кейінгі күн
    await addEntry({ userId, taskId, daysAgo: 6, hour: 10, seconds: 1800 })

    const { data } = await client.request('/api/reports/insights')

    assert.equal(insightById(data, 'streak').days, 4)
  })

  test('бүгін әлі жұмыс істемесе, кешегі серия үзілген деп саналмайды', async () => {
    const { client, userId, taskId } = await userWithTask()

    for (const daysAgo of [1, 2, 3]) {
      await addEntry({ userId, taskId, daysAgo, hour: 10, seconds: 1800 })
    }

    const { data } = await client.request('/api/reports/insights')

    assert.equal(insightById(data, 'streak').days, 3)
  })

  test('осы апта мен өткен аптаны салыстырады', async () => {
    const { client, userId, taskId } = await userWithTask()

    // Өткен апта: 2 сағат, осы апта: 3 сағат → +50%
    await addEntry({ userId, taskId, daysAgo: 9, hour: 10, seconds: 7200 })
    await addEntry({ userId, taskId, daysAgo: 1, hour: 10, seconds: 7200 })
    await addEntry({ userId, taskId, daysAgo: 2, hour: 10, seconds: 3600 })

    const { data } = await client.request('/api/reports/insights')
    const trend = insightById(data, 'trend')

    assert.equal(trend.direction, 'up')
    assert.equal(trend.percent, 50)
    assert.equal(trend.this_week, 10800)
    assert.equal(trend.prev_week, 7200)
  })

  test('қысқа сессиялар басым болса, оны бөлек көрсетеді', async () => {
    const { client, userId, taskId } = await userWithTask()

    // 5 сессияның 4-і 10 минуттан қысқа
    for (const daysAgo of [1, 2, 3, 4]) {
      await addEntry({ userId, taskId, daysAgo, hour: 10, seconds: 300 })
    }
    await addEntry({ userId, taskId, daysAgo: 5, hour: 10, seconds: 5400 })

    const { data } = await client.request('/api/reports/insights')
    const fragmentation = insightById(data, 'fragmentation')

    assert.equal(fragmentation.sessions, 4)
    assert.equal(fragmentation.percent, 80)

    const session = insightById(data, 'sessionLength')
    assert.equal(session.median, 300)
    assert.equal(session.longest, 5400)
  })

  test('бөтен қолданушының дерегі араласпайды', async () => {
    const owner = await userWithTask()
    for (const daysAgo of [1, 2, 3]) {
      await addEntry({ ...owner, daysAgo, hour: 10, seconds: 3600 })
    }

    const stranger = await userWithTask()
    const { data } = await stranger.client.request('/api/reports/insights')

    assert.equal(data.ready, false)
    assert.equal(data.sample.sessions, 0)
  })
})
