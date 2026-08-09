import { createApp } from './app.js'
import { closePool, migrate, purgeExpiredSessions } from './db.js'

const PORT = Number(process.env.PORT ?? 3080)

// Схема дайын болмай тұрып сұраныс қабылдаудың мағынасы жоқ
await migrate()

const server = createApp().listen(PORT, () => {
  console.log(`Focus10 API → http://localhost:${PORT}`)
})

// Мерзімі өткен сессияларды сағат сайын тазалап отырамыз
const sweeper = setInterval(() => {
  purgeExpiredSessions().catch((error) =>
    console.error('Сессияларды тазалау сәтсіз:', error),
  )
}, 60 * 60 * 1000)
sweeper.unref()

/**
 * Деплой кезінде процесс SIGTERM алады. Жүріп жатқан сұраныстарды аяқтап,
 * Postgres пулын дұрыс жабамыз.
 */
let shuttingDown = false

function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`${signal} келді — сервер жабылуда…`)

  const force = setTimeout(() => {
    console.error('Сұраныстар уақытында аяқталмады, мәжбүрлеп жабамыз.')
    process.exit(1)
  }, 10_000)
  force.unref()

  server.close(async () => {
    clearTimeout(force)
    await closePool().catch(() => {})
    console.log('Сервер тоқтады.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
