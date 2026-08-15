import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext'
import {
  DARK_QUERY,
  applyTheme,
  isTheme,
  prefersDark,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
} from './theme'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)
  const [systemDark, setSystemDark] = useState(prefersDark)

  // Жүйе күндізгіден түнгі режимге ауысқанда 'system' таңдағандар бетті
  // қайта ашпай-ақ ілесуі керек
  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY)
    if (!media) return

    const onChange = (event) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved = resolveTheme(theme, systemDark)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const setTheme = useCallback((next) => {
    if (!isTheme(next)) return
    writeStoredTheme(next)
    setThemeState(next)
  }, [])

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
