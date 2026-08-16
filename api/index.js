/**
 * Vercel serverless кірер нүктесі.
 *
 * Vercel `api/` бумасындағы әр файлды жеке функцияға айналдырады, ал
 * `vercel.json`-дағы rewrite барлық `/api/*` сұранысын осында бағыттайды.
 * Express қосымшасының өзі `(req, res)` функциясы болғандықтан, оны тікелей
 * экспорттай береміз — бөлек адаптердің қажеті жоқ.
 *
 * `server/index.js`-тен айырмашылығы: мұнда `listen()` де, `migrate()` де
 * шақырылмайды. Функция сұраныстар арасында өмір сүрмейді, сондықтан
 * серверде «іске қосылу кезінде» істелетін жұмыс екіге бөлінді:
 *   • схеманы құру      → `scripts/migrate.mjs`, build кезінде бір рет
 *   • ескіні тазалау    → `api/cron/purge.js`, Vercel Cron кестесімен
 *
 * Фронт бұл функцияға мүлдем соқпайды: `dist/` Vercel-дің CDN-інен
 * беріледі, сондықтан `server/app.js`-тегі `express.static` блогы бұл
 * ортада іске қосылмайды (`dist` функция бумасында жоқ).
 */
import { createApp } from '../server/app.js'

/**
 * Функция іске қосыла алмаса (импорт кезіндегі қате, жетпейтін тәуелділік),
 * Vercel өзінің «FUNCTION_INVOCATION_FAILED» бетін қайтарады: онда JSON да,
 * себеп те жоқ, ал фронт оны «сұраныс өтпеді» деп қана көрсете алады.
 * Сондықтан құлауды өзіміз ұстап, себебін жауап денесіне саламыз — логқа
 * кіре алмайтын жағдайда бұл жалғыз көрінетін жер.
 */
let handler

try {
  handler = createApp()
} catch (error) {
  console.error('Қосымша іске қосылмады:', error)

  handler = (req, res) => {
    res.statusCode = 503
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: `Сервер іске қосылмады: ${error.message}` }))
  }
}

export default handler
