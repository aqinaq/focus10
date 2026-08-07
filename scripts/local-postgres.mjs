/**
 * Жергілікті әзірлеуге арналған Postgres. Supabase-ке қосылмай-ақ, ештеңе
 * орнатпай-ақ жобаны толық іске қосуға мүмкіндік береді.
 *
 * PGlite — Postgres-тің WebAssembly-ге компиляцияланған нағыз нұсқасы
 * (эмулятор емес), сондықтан SQL продакшндағыдай жүреді.
 *
 *   npm run db:local          # 55432 портында көтереді, дерек .pgdata/-да
 *   DATABASE_URL=postgres://postgres@127.0.0.1:55432/postgres npm run dev
 */
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'

const port = Number(process.env.PGLITE_PORT ?? 55432)
const dataDir = process.env.PGLITE_DIR ?? '.pgdata'

const db = await PGlite.create(dataDir)
const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1' })
await server.start()

console.log(`PGlite → postgres://postgres@127.0.0.1:${port}/postgres`)
console.log(`Дерек: ${dataDir}/`)
console.log(
  'ЕСКЕРТУ: PGlite бір мезгілде бір байланысты ұстайды — қосымшаны\n' +
    'PG_POOL_MAX=1 деп қос.',
)

const stop = async () => {
  await server.stop()
  await db.close()
  process.exit(0)
}

process.on('SIGTERM', stop)
process.on('SIGINT', stop)
