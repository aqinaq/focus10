import { createServer } from 'node:net'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'

/**
 * `node --test` әр тест файлын бөлек процесте қатар жүргізеді, сондықтан
 * портты тұрақты санмен беруге болмайды — екі файл бір портқа таласады.
 * Бос портты ОЖ-дан сұраймыз.
 */
function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.unref()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
  })
}

/**
 * Тесттер нағыз Postgres-ке қарсы жүреді: PGlite — Postgres-тің WebAssembly-ге
 * компиляцияланған нұсқасы (эмулятор емес). Ол TCP сокет ашады, ал `pg`
 * клиенті оған продакшндағыдай қосылады — яғни SQL диалектіндегі
 * айырмашылықтар тестте де көрінеді.
 *
 * Әр тест файлы өз данасын көтереді, сондықтан бір-бірінің дерегін көрмейді.
 */
export async function startTestServer() {
  const port = await freePort()

  const pglite = await PGlite.create()
  const socket = new PGLiteSocketServer({ db: pglite, port, host: '127.0.0.1' })
  await socket.start()

  process.env.DATABASE_URL = `postgres://postgres@127.0.0.1:${port}/postgres`
  process.env.LOG_LEVEL = 'silent'
  process.env.NODE_ENV = 'test'
  // PGlite бір мезгілде бір байланысты ғана ұстайды. Пул одан көп ашса,
  // қатар кеткен сұраныстар ECONNRESET алады да, қосымшаның кінәсі жоқ
  // жерден 500 шығады. Байланысты біреу етіп, сұраныстарды кезекке қоямыз.
  process.env.PG_POOL_MAX = '1'
  // Тесттердің бәрі бір IP-ден жүреді — лимитті көтереміз. Лимиттің өзін
  // тексеретін тест оны уақытша қайта төмендетеді.
  process.env.RATE_LIMIT_MAX = '10000'

  // db.js импорт кезінде DATABASE_URL-ды оқиды, сондықтан динамикалық импорт
  const { createApp } = await import('../app.js')
  const dbModule = await import('../db.js')

  await dbModule.migrate()

  const server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))

  const base = `http://127.0.0.1:${server.address().port}`

  return {
    base,
    /** Тестте тікелей SQL жүргізу үшін. */
    query: dbModule.query,
    async close() {
      await new Promise((resolve) => server.close(resolve))
      await dbModule.closePool().catch(() => {})
      await socket.stop()
      await pglite.close()
    },
  }
}

/**
 * Cookie-ді есте сақтайтын жеңіл клиент — браузердегі сессияны имитациялайды.
 */
export function createClient(base) {
  let cookie = ''

  return {
    get cookie() {
      return cookie
    },
    clearCookie() {
      cookie = ''
    },
    async request(path, { method = 'GET', body, raw = false } = {}) {
      const response = await fetch(base + path, {
        method,
        headers: {
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
          ...(cookie ? { cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      })

      const setCookie = response.headers.get('set-cookie')
      if (setCookie) cookie = setCookie.split(';')[0]

      if (raw) {
        return { status: response.status, text: await response.text(), response }
      }

      const text = await response.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = text
      }

      return { status: response.status, data, response }
    },
  }
}

let counter = 0

export async function registerUser(client, overrides = {}) {
  counter += 1

  const payload = {
    name: `Тест Қолданушы ${counter}`,
    email: `user${counter}.${Date.now()}@focus10.test`,
    password: 'supersecret1',
    ...overrides,
  }

  const result = await client.request('/api/auth/register', {
    method: 'POST',
    body: payload,
  })

  return { ...result, payload }
}
