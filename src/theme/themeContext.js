import { createContext, useContext } from 'react'

export const ThemeContext = createContext(null)

/**
 * `theme` — қолданушының таңдауы ('system' | 'light' | 'dark'),
 * `resolved` — соның нәтижесінде бетте шынымен қолданылып тұрған тақырып
 * ('light' | 'dark'). Ауыстырғыш біріншісін, ал түске тәуелді логика
 * (мысалы, суреттің үстіндегі көлеңке) екіншісін қарайды.
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme тек <ThemeProvider> ішінде қолданылады')
  }
  return context
}
