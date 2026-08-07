/**
 * Қауіпсіздік тақырыптары. helmet-тің орнына қолмен жазылған — қажет
 * тақырыптар саны аз, ал тәуелділік аз болған сайын жақсы.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Tailwind мен React инлайн style атрибуттарын қолданады
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'object-src \'none\'',
].join('; ')

export default function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')

  // CSP тек продакшнда: dev режимде Vite инлайн скрипт пен ws қолданады
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Content-Security-Policy', CSP)
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    )
  }

  next()
}
