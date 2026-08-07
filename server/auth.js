import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'
import { db, purgeExpiredSessions } from './db.js'

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

export function createSession(userId) {
  const token = randomBytes(32).toString('hex')

  db.prepare(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES (?, ?, datetime('now', ?))`,
  ).run(token, userId, `+${SESSION_DAYS} days`)

  return token
}

export function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

export function userForToken(token) {
  if (!token) return null

  purgeExpiredSessions()

  return (
    db
      .prepare(
        `SELECT u.id, u.name, u.email, u.plan, u.created_at
           FROM sessions s
           JOIN users u ON u.id = s.user_id
          WHERE s.token = ? AND s.expires_at > datetime('now')`,
      )
      .get(token) ?? null
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
export function requireAuth(req, res, next) {
  const user = userForToken(req.cookies?.[COOKIE_NAME])

  if (!user) {
    return res.status(401).json({ error: 'Кіру қажет.' })
  }

  req.user = user
  next()
}
