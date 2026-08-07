import { Router } from 'express'
import { db, seedWorkspace } from '../db.js'
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
const PLANS = new Set(['Free', 'Pro', 'Team'])

const authLimit = rateLimit({ windowMs: 60_000, max: 10 })

router.post('/register', authLimit, async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    const email = String(req.body?.email ?? '').trim()
    const password = String(req.body?.password ?? '')
    const plan = PLANS.has(req.body?.plan) ? req.body.plan : 'Free'

    const errors = {}
    if (name.length < 2) errors.name = 'Атыңды жаз (кемінде 2 таңба).'
    if (!EMAIL_RE.test(email)) errors.email = 'Жарамды email енгіз.'
    if (password.length < 8) {
      errors.password = 'Құпиясөз кемінде 8 таңба болуы керек.'
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Форманы тексер.', errors })
    }

    const taken = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email)

    if (taken) {
      return res.status(409).json({
        error: 'Бұл email тіркелген.',
        errors: { email: 'Бұл email тіркеліп қойған.' },
      })
    }

    const passwordHash = await hashPassword(password)
    const result = db
      .prepare(
        'INSERT INTO users (name, email, password_hash, plan) VALUES (?, ?, ?, ?)',
      )
      .run(name, email, passwordHash, plan)

    const userId = Number(result.lastInsertRowid)
    seedWorkspace(userId)

    res.cookie(COOKIE_NAME, createSession(userId), cookieOptions)
    res.status(201).json({
      user: { id: userId, name, email, plan },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', authLimit, async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim()
    const password = String(req.body?.password ?? '')

    const row = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email)

    // Email бар-жоғын сыртқа шығармау үшін екі жағдайда да бірдей жауап
    const valid = row && (await verifyPassword(password, row.password_hash))

    if (!valid) {
      return res.status(401).json({ error: 'Email не құпиясөз қате.' })
    }

    res.cookie(COOKIE_NAME, createSession(row.id), cookieOptions)
    res.json({
      user: { id: row.id, name: row.name, email: row.email, plan: row.plan },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (req, res) => {
  destroySession(req.cookies?.[COOKIE_NAME])
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined })
  res.status(204).end()
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
        error: 'Форманы тексер.',
        errors: { new_password: 'Құпиясөз кемінде 8 таңба болуы керек.' },
      })
    }

    const row = db
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .get(req.user.id)

    if (!(await verifyPassword(current, row.password_hash))) {
      return res.status(403).json({
        error: 'Ағымдағы құпиясөз қате.',
        errors: { current_password: 'Ағымдағы құпиясөз қате.' },
      })
    }

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
      await hashPassword(next_),
      req.user.id,
    )

    // Құпиясөз ауысқанда барлық құрылғыдан шығарамыз да, ағымдағы
    // браузерге жаңа сессия береміз — ұрланған сессия жарамсыз болады.
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(req.user.id)
    res.cookie(COOKIE_NAME, createSession(req.user.id), cookieOptions)

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.delete('/account', requireAuth, authLimit, async (req, res, next) => {
  try {
    const password = String(req.body?.password ?? '')

    const row = db
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .get(req.user.id)

    if (!(await verifyPassword(password, row.password_hash))) {
      return res.status(403).json({ error: 'Құпиясөз қате.' })
    }

    // Жобалар, тапсырмалар, уақыт жазбалары мен сессиялар
    // ON DELETE CASCADE арқылы бірге өшеді
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id)

    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
