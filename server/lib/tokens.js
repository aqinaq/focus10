import { createHash, randomBytes } from 'node:crypto'
import { one, pool } from '../db.js'

/**
 * Бір реттік токендер: құпиясөзді қалпына келтіру («reset») мен email растау
 * («verify»).
 *
 * Токеннің өзі тек сілтемеде — қорда оның sha256 хеші жатады. Дерекқорға қол
 * жеткізген адам сілтемені қайта құрастыра алмайды. Хештеу үшін scrypt қажет
 * емес: токен — 32 байт кездейсоқ сан, оны сөздікпен тауып алу мүмкін емес.
 */
export const TOKEN_KINDS = { reset: 'reset', verify: 'verify' }

const TTL_MINUTES = { reset: 60, verify: 60 * 24 }

const digest = (token) => createHash('sha256').update(token).digest('hex')

/**
 * Жаңа токен құрады да, сол қолданушының сол түрдегі ескі токендерін
 * жарамсыз етеді — «сілтемені қайта жібер» дегенде бұрынғысы жұмыс істемеуі
 * керек.
 */
export async function issueToken(userId, kind) {
  const token = randomBytes(32).toString('hex')

  await pool.query('DELETE FROM auth_tokens WHERE user_id = $1 AND kind = $2', [
    userId,
    kind,
  ])

  await pool.query(
    `INSERT INTO auth_tokens (token_hash, user_id, kind, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' minutes')::interval)`,
    [digest(token), userId, kind, String(TTL_MINUTES[kind])],
  )

  return token
}

/**
 * Токенді тексеріп, бірден жояды: екі рет қолдануға болмайды. Жарамсыз,
 * мерзімі өткен немесе басқа түрдегі токенде — `null`.
 *
 * Тексеру мен жоюды бір `DELETE ... RETURNING` сұранысымен жасаймыз: екі
 * бөлек сұраныс болса, дәл қатар келген екі сұраныс екеуі де «жарамды» деп
 * шешіп қалуы мүмкін еді.
 */
export async function consumeToken(token, kind) {
  if (typeof token !== 'string' || token.length !== 64) return null

  const row = await one(
    `DELETE FROM auth_tokens
      WHERE token_hash = $1 AND kind = $2 AND expires_at > now()
     RETURNING user_id`,
    [digest(token), kind],
  )

  return row?.user_id ?? null
}
