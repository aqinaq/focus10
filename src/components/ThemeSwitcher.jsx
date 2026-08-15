import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/themeContext'
import { THEMES } from '../theme/theme'
import { useI18n } from '../i18n/i18nContext'

const icons = { system: Monitor, light: Sun, dark: Moon }

/**
 * Тақырып ауыстырғыш. LanguageSwitcher-мен бір үлгіде: тізім қысқа
 * болғандықтан ашылмалы мәзірдің қажеті жоқ, үшеуі де көрініп тұрады.
 *
 * «Жүйе бойынша» — бөлек нұсқа, әрі әдепкісі: телефонын кешке қараңғы
 * режимге ауыстыратын қолданушы қолданбаны қолмен қайта баптамауы керек.
 * Батырмада тек таңбаша тұрады — навигацияда орын аз, аты aria-label-де.
 */
export default function ThemeSwitcher({ className = '' }) {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('common.themeSwitch')}
      className={`inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800 ${className}`}
    >
      {THEMES.map((id) => {
        const Icon = icons[id]

        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-pressed={theme === id}
            aria-label={t(`theme.${id}`)}
            title={t(`theme.${id}`)}
            className={`rounded-full px-3 py-2 transition-colors sm:px-2.5 sm:py-1.5 ${
              theme === id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
