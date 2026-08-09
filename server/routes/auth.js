import { Router } from 'express'
import { one, pool, seedWorkspace } from '../db.js'
import {
  COOKIE_NAME,
  cookieOptions,
  createSession,
  destroySession,
  hashPassword,
  requireAuth,
  verifyPassword,
} from '../auth.js'
import rateLimit from '../rateLimit.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const authLimit = rateLimit({ windowMs: 60_000, max: 10 })

router.post('/register', authLimit, async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    const email = String(req.body?.email ?? '').trim()
    const password = String(req.body?.password ?? '')

    const errors = {}
    if (name.length < 2) errors.name = req.t('auth.nameTooShort')
    if (!EMAIL_RE.test(email)) errors.email = req.t('auth.emailInvalid')
    if (password.length < 8) {
      errors.password = req.t('auth.passwordTooShort')
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: req.t('auth.checkForm'), errors })
    }

    const passwordHash = await hashPassword(password)

    // Бірегейлікті бөлек SELECT-пен емес, индекске сүйеніп тексереміз —
    // әйтпесе екі сұраныс арасында бәсеке пайда болады (race condition).
    let user
    try {
      user = await one(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [name, email, passwordHash],
      )
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: req.t('auth.emailTaken'),
          errors: { email: req.t('auth.emailTakenField') },
        })
      }
      throw error
    }

    await seedWorkspace(user.id, req.lang)

    res.cookie(COOKIE_NAME, await createSession(user.id), cookieOptions)
    res.status(201).json({ user })
  } catch (error) {
    next(error)
  }
})

router.post('/login', authLimit, async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim()
    const password = String(req.body?.password ?? '')

    const row = await one('SELECT * FROM users WHERE lower(email) = lower($1)', [
      email,
    ])

    // Email бар-жоғын сыртқа шығармау үшін екі жағдайда да бірдей жауап
    const valid = row && (await verifyPassword(password, row.password_hash))

    if (!valid) {
      return res.status(401).json({ error: req.t('auth.badCredentials') })
    }

    res.cookie(COOKIE_NAME, await createSession(row.id), cookieOptions)
    res.json({
      user: { id: row.id, name: row.name, email: row.email },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    await destroySession(req.cookies?.[COOKIE_NAME])
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.patch('/password', requireAuth, authLimit, async (req, res, next) => {
  try {
    const current = String(req.body?.current_password ?? '')
    const next_ = String(req.body?.new_password ?? '')

    if (next_.length < 8) {
      return res.status(400).json({
        error: req.t('auth.checkForm'),
        errors: { new_password: req.t('auth.passwordTooShort') },
      })
    }

    const row = await one('SELECT password_hash FROM users WHERE id = $1', [
      req.user.id,
    ])

    if (!(await verifyPassword(current, row.password_hash))) {
      return res.status(403).json({
        error: req.t('auth.currentPasswordWrong'),
        errors: { current_password: req.t('auth.currentPasswordWrong') },
      })
    }

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      await hashPassword(next_),
      req.user.id,
    ])

    // Құпиясөз ауысқанда барлық құрылғыдан шығарамыз да, ағымдағы
    // браузерге жаңа сессия береміз — ұрланған сессия жарамсыз болады.
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [req.user.id])
    res.cookie(COOKIE_NAME, await createSession(req.user.id), cookieOptions)

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.delete('/account', requireAuth, authLimit, async (req, res, next) => {
  try {
    const password = String(req.body?.password ?? '')

    const row = await one('SELECT password_hash FROM users WHERE id = $1', [
      req.user.id,
    ])

    if (!(await verifyPassword(password, row.password_hash))) {
      return res.status(403).json({ error: req.t('auth.passwordWrong') })
    }

    // Жобалар, тапсырмалар, уақыт жазбалары мен сессиялар
    // ON DELETE CASCADE арқылы бірге өшеді
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id])

    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
