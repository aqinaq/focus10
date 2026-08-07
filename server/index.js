import { createApp } from './app.js'
import { db, purgeExpiredSessions } from './db.js'

const PORT = Number(process.env.PORT ?? 3080)

const server = createApp().listen(PORT, () => {
  console.log(`FocusFlow API → http://localhost:${PORT}`)
})

// Мерзімі өткен сессияларды сағат сайын тазалап отырамыз
const sweeper = setInterval(purgeExpiredSessions, 60 * 60 * 1000)
sweeper.unref()

/**
 * Деплой кезінде процесс SIGTERM алады. Жүріп жатқан сұраныстарды аяқтап,
 * SQLite-ты дұрыс жабамыз — әйтпесе WAL файлы жартылай жазылып қалуы мүмкін.
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

  server.close(() => {
    clearTimeout(force)
    db.close()
    console.log('Сервер тоқтады.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
