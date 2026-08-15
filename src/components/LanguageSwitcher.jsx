import { useI18n } from '../i18n/i18nContext'
import { LANGUAGES, translate } from '../i18n/messages'

/**
 * Тіл ауыстырғыш. Тізім қысқа болғандықтан ашылмалы мәзірдің қажеті жоқ —
 * екеуі де көрініп тұрады, бір басумен ауысады.
 *
 * Батырмада тілдің қысқа коды тұрады (kk / en) — навигацияда орын аз.
 * Толық аты aria-label арқылы беріледі, әрі ол өз тілінде жазылады:
 * қолданушы түсінбейтін тілде тұрып та керегін таба алуы керек.
 */
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('common.languageSwitch')}
      className={`inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800 ${className}`}
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          aria-label={translate(code, 'meta.name')}
          lang={translate(code, 'meta.htmlLang')}
          className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors sm:px-3 sm:py-1.5 ${
            lang === code
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
