/**
 * Мерзімі өткен сессиялар мен токендерді тазалау.
 *
 * Тұрақты серверде мұны сағат сайынғы `setInterval` істейді
 * (`server/index.js`), бірақ serverless функция сұраныстар арасында өмір
 * сүрмейді — таймер орнатар процесс жоқ. Оның орнына Vercel Cron осы
 * маршрутты кестемен шақырады; кестенің өзі `vercel.json` ішінде.
 *
 * Vercel сұранысқа `Authorization: Bearer $CRON_SECRET` тақырыбын қосады,
 * сондықтан маршрут интернетке ашық қалмайды. `CRON_SECRET` қойылмаса,
 * үнсіз өткізіп жібергеннен гөрі ашық қате қайтарамыз.
 */
import { purgeExpiredSessions, purgeExpiredTokens } from '../../server/db.js'

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return res.status(503).json({ error: 'CRON_SECRET қойылмаған' })
  }

  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Рұқсат жоқ' })
  }

  try {
    await Promise.all([purgeExpiredSessions(), purgeExpiredTokens()])
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Ескі жазбаларды тазалау сәтсіз:', error)
    return res.status(500).json({ error: 'Тазалау сәтсіз аяқталды' })
  }
}
