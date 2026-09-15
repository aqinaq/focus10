/**
 * Vercel serverless кірер нүктесі.
 *
 * Vercel `api/` бумасындағы әр файлды жеке функцияға айналдырады, ал
 * `vercel.json`-дағы rewrite барлық `/api/*` сұранысын осында бағыттайды.
 * Express қосымшасының өзі `(req, res)` функциясы болғандықтан, оны тікелей
 * экспорттай береміз — бөлек адаптердің қажеті жоқ.
 *
 * `server/index.js`-тен айырмашылығы: мұнда `listen()` шақырылмайды.
 * Функция сұраныстар арасында өмір сүрмейді, сондықтан
 * серверде «іске қосылу кезінде» істелетін жұмыс екіге бөлінді:
 *   • схеманы құру      → бірінші API сұранысында, әр суық функция данасында
 *   • ескіні тазалау    → `api/cron/purge.js`, Vercel Cron кестесімен
 *
 * Фронт бұл функцияға мүлдем соқпайды: `dist/` Vercel-дің CDN-інен
 * беріледі, сондықтан `server/app.js`-тегі `express.static` блогы бұл
 * ортада іске қосылмайды (`dist` функция бумасында жоқ).
 */
import { createApp } from '../server/app.js'
import { dbConfigured, migrate } from '../server/db.js'

/**
 * Функция іске қосыла алмаса (импорт кезіндегі қате, жетпейтін тәуелділік),
 * Vercel өзінің «FUNCTION_INVOCATION_FAILED» бетін қайтарады: онда JSON да,
 * себеп те жоқ, ал фронт оны «сұраныс өтпеді» деп қана көрсете алады.
 * Сондықтан құлауды өзіміз ұстап, себебін жауап денесіне саламыз — логқа
 * кіре алмайтын жағдайда бұл жалғыз көрінетін жер.
 */
let handler
let schemaReady

try {
  const app = createApp()
  handler = async (req, res) => {
    // Keep health available when the database is down, so it can report why.
    if (dbConfigured() && req.url?.split('?')[0] !== '/api/health') {
      // A cold function instance initializes once. Retry on the next request
      // if the database was temporarily unavailable.
      schemaReady ??= migrate().catch((error) => {
        schemaReady = undefined
        throw error
      })

      try {
        await schemaReady
      } catch (error) {
        console.error('Схеманы жаңарту сәтсіз:', error)
        res.statusCode = 503
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'Дерекқор схемасы дайын емес', code: error.code }))
        return
      }
    }

    return app(req, res)
  }
} catch (error) {
  console.error('Қосымша іске қосылмады:', error)

  handler = (req, res) => {
    res.statusCode = 503
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: `Сервер іске қосылмады: ${error.message}` }))
  }
}

export default handler
