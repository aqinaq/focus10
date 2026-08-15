import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'
import { one, pool, purgeExpiredSessions } from './db.js'

const scrypt = promisify(scryptCallback)

const KEY_LENGTH = 64
const SESSION_DAYS = 30
export const COOKIE_NAME = 'ff_session'

/** Құпиясөзді scrypt-пен хештейміз: `salt:hash`. */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, KEY_LENGTH)
  return `${salt}:${derived.toString('hex')}`
}

/**
 * Салыстыруды timingSafeEqual арқылы жасаймыз — қарапайым `===` жауап
 * уақыты арқылы хеш туралы ақпарат ағызып қоюы мүмкін.
 */
export async function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const actual = await scrypt(password, salt, KEY_LENGTH)

  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function createSession(userId) {
  const token = randomBytes(32).toString('hex')

  await pool.query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, now() + ($3 || ' days')::interval)`,
    [token, userId, String(SESSION_DAYS)],
  )

  return token
}

export async function destroySession(token) {
  if (token) await pool.query('DELETE FROM sessions WHERE token = $1', [token])
}

export async function userForToken(token) {
  if (!token) return null

  await purgeExpiredSessions()

  return one(
    `SELECT u.id, u.name, u.email, u.created_at,
            (u.email_verified_at IS NOT NULL) AS email_verified
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token = $1 AND s.expires_at > now()`,
    [token],
  )
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
}

/** Қорғалған маршруттарға арналған middleware. */
export async function requireAuth(req, res, next) {
  try {
    const user = await userForToken(req.cookies?.[COOKIE_NAME])

    if (!user) {
      return res.status(401).json({ error: req.t('auth.required') })
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
