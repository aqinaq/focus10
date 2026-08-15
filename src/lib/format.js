import { DEFAULT_LANG, translate } from '../i18n/messages'

/**
 * 8178 → «2 сағ 16 мин» / "2h 16m".
 * Минуттан қысқа сессия «0 мин» болып жоғалып кетпеуі үшін секундпен
 * көрсетіледі: 4 → «4 сек» / "4s".
 */
export function formatDuration(seconds, lang = DEFAULT_LANG) {
  const total = Math.max(0, Math.floor(seconds ?? 0))
  if (total < 60) return translate(lang, 'format.seconds', { value: total })

  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  if (hours === 0) return translate(lang, 'format.minutes', { value: minutes })
  return translate(lang, 'format.hoursMinutes', { hours, minutes })
}

/** 1458 → "24:18", 3721 → "1:02:01" — жүріп тұрған таймерге. Тілге тәуелсіз. */
export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(seconds ?? 0))
  const hours = Math.floor(total / 3600)
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const secs = String(total % 60).padStart(2, '0')

  return hours > 0 ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`
}

/** "2026-08-20" → «20 там.» / "20 Aug». Жыл көрсетілмейді — мерзім жақын. */
export function formatDate(isoDate, lang = DEFAULT_LANG) {
  const [year, month, day] = isoDate.split('-').map(Number)

  return new Intl.DateTimeFormat(translate(lang, 'format.locale'), {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day))
}

/** "2026-08-06" → «Бс» / "Thu" */
export function weekdayLabel(isoDate, lang = DEFAULT_LANG) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return translate(lang, 'format.weekdays')[new Date(year, month - 1, day).getDay()]
}
