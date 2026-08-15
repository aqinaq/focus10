import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext } from './i18nContext'
import { DEFAULT_LANG, isLang, normalizeLang, translate } from './messages'
import { writeLangCookie } from './langCookie'
import { formatClock, formatDate, formatDuration, weekdayLabel } from '../lib/format'

const STORAGE_KEY = 'focus10.lang'

// Жеке режимде localStorage-ке қол жеткізудің өзі қате лақтыруы мүмкін
const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

const writeStored = (lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Сақталмаса да қолданба жұмысын жалғастыра береді
  }
}

/**
 * Таңдау реті: бұрын сақталған таңдау → браузердің тілі → әдепкі.
 * Cookie-ді бірінші рендерде-ақ жазамыз, әйтпесе қолданба іске қосылғандағы
 * алғашқы сұраныс тілсіз кетіп қалады.
 */
function resolveInitialLang() {
  const stored = readStored()
  if (isLang(stored)) {
    writeLangCookie(stored)
    return stored
  }

  const fromBrowser = (navigator.languages ?? [navigator.language])
    .map(normalizeLang)
    .find(Boolean)

  const lang = fromBrowser ?? DEFAULT_LANG
  writeLangCookie(lang)
  return lang
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(resolveInitialLang)

  const setLang = useCallback((next) => {
    if (!isLang(next)) return
    writeStored(next)
    writeLangCookie(next)
    setLangState(next)
  }, [])

  // Тіл ауысқанда бет метадеректері де ілесуі керек: `lang` атрибуты —
  // скринридер мен дұрыс тасымалдау үшін, title/description — бөліскенде.
  useEffect(() => {
    document.documentElement.lang = translate(lang, 'meta.htmlLang')
    document.title = translate(lang, 'meta.title')

    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute('content', translate(lang, 'meta.description'))
    }
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (path, vars) => translate(lang, path, vars),
      formatDuration: (seconds) => formatDuration(seconds, lang),
      formatDate: (isoDate) => formatDate(isoDate, lang),
      weekdayLabel: (isoDate) => weekdayLabel(isoDate, lang),
      formatClock,
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
