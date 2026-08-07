/**
 * 8178 → "2 сағ 16 мин".
 * Минуттан қысқа сессия "0 мин" болып жоғалып кетпеуі үшін секундпен
 * көрсетіледі: 4 → "4 сек".
 */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds ?? 0))
  if (total < 60) return `${total} сек`

  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  if (hours === 0) return `${minutes} мин`
  return `${hours} сағ ${minutes} мин`
}

/** 1458 → "24:18", 3721 → "1:02:01" — жүріп тұрған таймерге. */
export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(seconds ?? 0))
  const hours = Math.floor(total / 3600)
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const secs = String(total % 60).padStart(2, '0')

  return hours > 0 ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`
}

const WEEKDAYS = ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб']

/** "2026-08-06" → "Бс" */
export function weekdayLabel(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return WEEKDAYS[new Date(year, month - 1, day).getDay()]
}
