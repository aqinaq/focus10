import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Әр тест файлы өз уақытша SQLite файлымен жұмыс істейді — тесттер
 * бір-бірінің дерегін көрмейді, әрі әзірлеушінің қорына тимейді.
 */
export async function startTestServer() {
  const dir = mkdtempSync(join(tmpdir(), 'focusflow-test-'))

  process.env.DB_FILE = join(dir, 'test.db')
  process.env.LOG_LEVEL = 'silent'
  process.env.NODE_ENV = 'test'
  // Тесттердің бәрі бір IP-ден жүреді — лимитті көтереміз. Лимиттің өзін
  // тексеретін тест оны уақытша қайта төмендетеді.
  process.env.RATE_LIMIT_MAX = '10000'

  // db.js импорт кезінде DB_FILE-ды оқиды, сондықтан динамикалық импорт
  const { createApp } = await import('../app.js')
  const { db } = await import('../db.js')

  const server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))

  const base = `http://127.0.0.1:${server.address().port}`

  return {
    base,
    db,
    async close() {
      await new Promise((resolve) => server.close(resolve))
      db.close()
      rmSync(dir, { recursive: true, force: true })
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

      if (raw) return { status: response.status, text: await response.text(), response }

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
    email: `user${counter}.${Date.now()}@focusflow.test`,
    password: 'supersecret1',
    ...overrides,
  }

  const result = await client.request('/api/auth/register', {
    method: 'POST',
    body: payload,
  })

  return { ...result, payload }
}
