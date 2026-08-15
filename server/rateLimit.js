/**
 * Қарапайым жадтағы rate limiter — auth маршруттарын brute force-тан
 * қорғау үшін жеткілікті. Бір процесте ғана жұмыс істейді; бірнеше
 * инстанс болса Redis керек болады.
 */
const buckets = new Map()

/** Тесттер лимитті өз бетінше өзгерте алуы үшін мән әр сұраныста оқылады. */
const limitFor = (fallback) => Number(process.env.RATE_LIMIT_MAX ?? fallback)

export function resetRateLimits() {
  buckets.clear()
}

export default function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    bucket.count += 1

    if (bucket.count > limitFor(max)) {
      const seconds = Math.ceil((bucket.resetAt - now) / 1000)
      res.setHeader('Retry-After', seconds)
      return res.status(429).json({
        error: req.t('rateLimit.tooMany', { seconds }),
      })
    }

    next()
  }
}

// Ескірген жазбаларды мезгіл-мезгіл тазалап отырамыз
const cleanup = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}, 60_000)

cleanup.unref()
