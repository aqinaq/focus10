import kk from './locales/kk'
import en from './locales/en'

export const messages = { kk, en }

/** Тізімдегі бірінші тіл — әдепкі тіл. */
export const LANGUAGES = ['kk', 'en']
export const DEFAULT_LANG = LANGUAGES[0]

export const isLang = (value) => LANGUAGES.includes(value)

/** 'en-GB' → 'en'. Танылмаса — undefined. */
export function normalizeLang(value) {
  const base = String(value ?? '')
    .toLowerCase()
    .split('-')[0]
  return isLang(base) ? base : undefined
}

const lookup = (dict, path) =>
  path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict)

/** «{{name}}» түріндегі орындарды vars мәндерімен алмастырады. */
export function interpolate(text, vars) {
  if (vars === undefined) return text
  return text.replaceAll(/\{\{(\w+)\}\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  )
}

/**
 * Аудармасы жоқ кілт болса, әдепкі тілге қайта оралады да, ол да болмаса
 * кілттің өзін қайтарады — бет мәтінсіз қалып қоймауы үшін.
 */
export function translate(lang, path, vars) {
  const value = lookup(messages[lang] ?? messages[DEFAULT_LANG], path)
  const found = value === undefined ? lookup(messages[DEFAULT_LANG], path) : value

  if (found === undefined) return path
  if (typeof found === 'string') return interpolate(found, vars)
  return found
}
