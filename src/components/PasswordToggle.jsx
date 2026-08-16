import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

/**
 * Құпиясөзді көрсету/жасыру батырмасы.
 * `relative` контейнердің ішіне қойылады, input-та `pr-12` болуы керек.
 */
export default function PasswordToggle({ visible, onToggle, controls }) {
  const { t } = useI18n()
  const label = visible ? t('auth.hidePassword') : t('auth.showPassword')
  const Icon = visible ? EyeOff : Eye

  return (
    <button
      type="button"
      onClick={onToggle}
      // Батырма фокусты өрістен тартып алмауы үшін — басқаннан кейін де
      // жазуды жалғастыра беруге болады
      onMouseDown={(event) => event.preventDefault()}
      tabIndex={-1}
      aria-label={label}
      aria-pressed={visible}
      aria-controls={controls}
      title={label}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
    >
      <Icon className="size-5" />
    </button>
  )
}
