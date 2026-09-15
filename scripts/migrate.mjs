/**
 * Схеманы бөлек құрады: `npm run db:migrate`.
 *
 * Тұрақты серверде мұны `server/index.js` іске қосылу кезінде өзі істейді.
 * Vercel функциясы схеманы алғашқы API сұранысында жаңартады. Бұл команда
 * жергілікті ортада немесе тұрақты серверде схеманы алдын ала дайындау үшін
 * қолжетімді. Дерекқорды build кезеңіне байламаймыз.
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
