/**
 * Схеманы бөлек құрады: `npm run db:migrate`.
 *
 * Тұрақты серверде мұны `server/index.js` іске қосылу кезінде өзі істейді.
 * Vercel-де ондай «іске қосылу» сәті жоқ — функция әр сұраныста қайта
 * оянады, ал әр оянған сайын DDL жіберу артық жүк әрі бір мезгілде бірнеше
 * функция бірдей `CREATE TABLE` жіберіп қалуы мүмкін. Сондықтан схема
 * деплойдың build қадамында, бір рет жаңарады (`vercel.json` → buildCommand).
 *
 * Сұраныстар мұны күтпейді: build сәтті бітпейінше жаңа нұсқа тірі
 * трафикке шықпайды.
 */

const { CONFIG_ERROR, closePool, dbConfigured, dbUrlSource, migrate } = await import(
  '../server/db.js'
)

// Preview деплойға немесе бөгде ортаға айнымалы қойылмаған болуы мүмкін —
// ондайда build-ты құлатқаннан гөрі, себебін жазып шыққан дұрыс. Қор жоқ
// болса қолданба қалай болса да іске қосылмайды.
if (!dbConfigured()) {
  console.warn(`${CONFIG_ERROR} Схема жаңартылмады.`)
  process.exit(0)
}

console.log(`Дерекқор: ${dbUrlSource} айнымалысынан.`)

try {
  await migrate()
  console.log('Схема дайын.')
} catch (error) {
  console.error('Схеманы жаңарту сәтсіз:', error)
  process.exitCode = 1
} finally {
  await closePool().catch(() => {})
}
