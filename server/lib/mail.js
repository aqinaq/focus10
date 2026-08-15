/**
 * Хат жіберу. Провайдер — Resend: оның HTTP API-ы жеткілікті қарапайым,
 * сондықтан SMTP кітапханасының қажеті жоқ (тәуелділік аз болған сайын
 * жақсы, әрі бұл `fetch`-тен басқа ештеңе талап етпейді).
 *
 * RESEND_API_KEY мен MAIL_FROM қойылмаса, хат жіберілмейді: dev пен тестте
 * сілтеме консольге жазылады, продакшнда маршрут 503 қайтарады. Хат
 * «жіберілді» деп жалған айтқаннан гөрі, ашық қате қайтарған дұрыс.
 */
const ENDPOINT = 'https://api.resend.com/emails'

const silent = process.env.LOG_LEVEL === 'silent'

export const mailEnabled = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM)

/**
 * Хаттағы сілтеме қай доменге сілтейді. `Host` тақырыбына сүйенбейміз: оны
 * сұраныспен қоса жалғандап жіберуге болады да, шынайы қолданушыға бөтен
 * доменге апаратын қалпына келтіру сілтемесі кетер еді. Сондықтан бірінші
 * кезекте айнымалыдан аламыз (Render `RENDER_EXTERNAL_URL`-ды өзі қояды),
 * ал сұраныстың өзіне тек жергілікті әзірлеуде сүйенеміз.
 */
export function appUrl(req) {
  const configured = process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL

  if (configured) return configured.replace(/\/+$/, '')
  if (process.env.NODE_ENV === 'production') return ''

  return `${req.protocol}://${req.get('host')}`
}

/**
 * Хатты жібереді. Қайтаратын мәні — жіберілді ме (`true`), әлде тек
 * консольге жазылды ма (`false`). Провайдер қате берсе, қате лақтырылады:
 * шақырушы оны өзі шешеді.
 */
export async function sendMail({ to, subject, text }) {
  if (!mailEnabled()) {
    if (!silent) {
      console.log(
        `[mail] Хат жіберілмеді (RESEND_API_KEY жоқ). ${to} → ${subject}\n${text}`,
      )
    }
    return false
  }

  // Провайдер жауап бермей қалса, сұраныс мәңгі ілініп тұрмауы керек
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 200)}`)
  }

  return true
}
