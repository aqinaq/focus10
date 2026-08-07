/**
 * Сұраныс логы. Тесттерде шуылдамауы үшін LOG_LEVEL=silent болғанда үнсіз.
 * Қателерді (5xx) қашан да шығарамыз.
 */
const silent = process.env.LOG_LEVEL === 'silent'

export default function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6

    if (silent && res.statusCode < 500) return

    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`

    if (res.statusCode >= 500) console.error(line)
    else if (!silent) console.log(line)
  })

  next()
}
