import express from 'express'
import cookieParser from 'cookie-parser'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import securityHeaders from './middleware/security.js'
import requestLogger from './middleware/logger.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import timerRoutes from './routes/timer.js'
import reportRoutes from './routes/reports.js'

export function createApp() {
  const app = express()

  // Rate limiter req.ip-ке сүйенеді, ал прокси артында ол әрқашан 127.0.0.1
  // болып қалады — сондықтан proxy тақырыптарына сенеміз.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(requestLogger)
  app.use(securityHeaders)
  app.use(express.json({ limit: '32kb' }))
  app.use(cookieParser())

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/projects', projectRoutes)
  app.use('/api/tasks', taskRoutes)
  app.use('/api/timer', timerRoutes)
  app.use('/api/reports', reportRoutes)

  app.use('/api', (req, res) => res.status(404).json({ error: 'Мұндай API жоқ.' }))

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

  // Дұрыс емес JSON body-ді 500 емес, 400 деп қайтарамыз
  app.use((error, req, res, next) => {
    if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
      return res.status(400).json({ error: 'JSON форматы дұрыс емес.' })
    }
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Сұраныс тым үлкен.' })
    }
    next(error)
  })

  // eslint-disable-next-line no-unused-vars -- Express қате өңдегішін 4 аргументпен таниды
  app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).json({ error: 'Серверде күтпеген қате шықты.' })
  })

  return app
}
