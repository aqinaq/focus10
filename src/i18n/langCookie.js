import { DEFAULT_LANG, isLang } from './messages'

export const LANG_COOKIE = 'lang'
const MAX_AGE = 60 * 60 * 24 * 365

/**
 * Тілді серверге cookie арқылы білдіреміз: API қателері (мысалы, «Кіру
 * қажет.») сол тілде қайтуы үшін. Тақырып емес, cookie — себебі CSV
 * экспорты жай `<a download>` сілтемесі, оған қолмен тақырып қоса алмаймыз.
 */
export function writeLangCookie(lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${MAX_AGE}; samesite=lax`
}

/**
 * Ағымдағы тіл. React күйіне тәуелді емес, сондықтан компонент емес кодта
 * (мысалы, API клиентінде) да қолданыла береді.
 */
export function readLangCookie() {
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/)
  const value = match ? decodeURIComponent(match[1]) : null
  return isLang(value) ? value : DEFAULT_LANG
}
