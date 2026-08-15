/** Тізімдегі бірінші мән — әдепкі: жүйенің қалауына ереміз. */
export const THEMES = ['system', 'light', 'dark']
export const DEFAULT_THEME = THEMES[0]

export const isTheme = (value) => THEMES.includes(value)

/** index.html-дегі шағын скрипт те дәл осы кілтті оқиды — екеуі сәйкес тұруы керек. */
export const STORAGE_KEY = 'focus10.theme'
export const DARK_QUERY = '(prefers-color-scheme: dark)'

// Браузердің үстіңгі жолағы беттің фонымен үндессін
const META_COLOR = { light: '#4f46e5', dark: '#020617' }

// Жеке режимде localStorage-ке қол жеткізудің өзі қате лақтыруы мүмкін
export function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isTheme(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function writeStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Сақталмаса да қолданба жұмысын жалғастыра береді
  }
}

export function prefersDark() {
  return window.matchMedia?.(DARK_QUERY).matches ?? false
}

/** 'system' → құрылғының ағымдағы қалауы. Қалғаны өзгеріссіз. */
export function resolveTheme(theme, systemDark) {
  if (theme === 'light' || theme === 'dark') return theme
  return systemDark ? 'dark' : 'light'
}

/**
 * Түсті ауыстыратын жалғыз жер: `data-theme` атрибуты. Tailwind-тың `dark:`
 * нұсқасы да, `color-scheme` де (өрістер мен скролл жолағының өз түсі) содан
 * шығады — сондықтан бір атрибут бүкіл бетті ауыстырады.
 */
export function applyTheme(resolved) {
  document.documentElement.dataset.theme = resolved

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', META_COLOR[resolved])
}
