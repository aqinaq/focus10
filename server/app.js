import express from 'express'
import cookieParser from 'cookie-parser'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { CONFIG_ERROR, dbConfigured, query } from './db.js'
import securityHeaders from './middleware/security.js'
import requestLogger from './middleware/logger.js'
import i18n, { pickLang, translate } from './lib/i18n.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import timerRoutes from './routes/timer.js'
import reportRoutes from './routes/reports.js'
import planRoutes from './routes/plan.js'

export function createApp() {
  const app = express()

  // Rate limiter req.ip-ке сүйенеді, ал прокси артында ол әрқашан 127.0.0.1
  // болып қалады — сондықтан proxy тақырыптарына сенеміз.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(requestLogger)
  app.use(securityHeaders)
  // Тіл express.json()-нан бұрын анықталады: бүлінген JSON туралы қате де
  // қолданушының тілінде қайтуы керек.
  app.use(i18n)
  app.use(express.json({ limit: '32kb' }))
  app.use(cookieParser())

  // Диагностика: қосымша тірі ме, дерекқорға жете ме. Құпия мән қайтармайды.
  app.get('/api/health', async (req, res) => {
    if (!dbConfigured()) {
      return res.json({ ok: false, db: 'not-configured', hint: CONFIG_ERROR })
    }

    try {
      await query('SELECT 1')
      res.json({ ok: true, db: 'up' })
    } catch (error) {
      res.json({ ok: false, db: 'down', hint: error.message })
    }
  })

  // Дерекқорсыз бірде-бір маршрут жұмыс істей алмайды. «Күтпеген қате» деп
  // 500 қайтарғанша, нақты себебін айтқан дұрыс — әйтпесе хостингті
  // баптаудағы қате мүлде көрінбей қалады.
  app.use('/api', (req, res, next) => {
    if (dbConfigured()) return next()
    res.status(503).json({ error: req.t('app.notConfigured') })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/projects', projectRoutes)
  app.use('/api/tasks', taskRoutes)
  app.use('/api/timer', timerRoutes)
  app.use('/api/reports', reportRoutes)
  app.use('/api/plan', planRoutes)

  app.use('/api', (req, res) => res.status(404).json({ error: req.t('app.noRoute') }))

  // Продакшнда фронт пен API бір серверден беріледі
  const dist = resolve(process.cwd(), 'dist')
  if (existsSync(dist)) {
    app.use(
      express.static(dist, {
        // Хешталған ассеттерді ұзақ кэштейміз, index.html-ді ешқашан
        setHeaders(res, path) {
          if (path.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          }
        },
      }),
    )
    app.get(/^(?!\/api).*/, (req, res) => {
      res.setHeader('Cache-Control', 'no-cache')
      res.sendFile(resolve(dist, 'index.html'))
    })
  }

  // Қате өңдегішке i18n middleware-і жетпей қалуы мүмкін, сондықтан тілді
  // қажет болса осы жерде қайта анықтаймыз
  const t = (req, key) => req.t?.(key) ?? translate(pickLang(req), key)

  // Дұрыс емес JSON body-ді 500 емес, 400 деп қайтарамыз
  app.use((error, req, res, next) => {
    if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
      return res.status(400).json({ error: t(req, 'app.badJson') })
    }
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: t(req, 'app.tooLarge') })
    }
    next(error)
  })

  // eslint-disable-next-line no-unused-vars -- Express қате өңдегішін 4 аргументпен таниды
  app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).json({ error: t(req, 'app.serverError') })
  })

  return app
}
