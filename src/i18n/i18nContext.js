import { createContext, useContext } from 'react'

export const I18nContext = createContext(null)

/**
 * Тіл жүйесіне қол жеткізудің жалғыз жолы. Қайтаратыны:
 * `lang` — ағымдағы тіл коды, `setLang` — оны ауыстыру,
 * `t` — аударма іздегіш, қалғандары — тілге тәуелді пішімдеуіштер.
 */
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n тек <I18nProvider> ішінде қолданылады')
  }
  return context
}
