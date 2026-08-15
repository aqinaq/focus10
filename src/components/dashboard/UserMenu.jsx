import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../context/authContext'
import { useUI } from '../../context/uiContext'
import { useI18n } from '../../i18n/i18nContext'
import LanguageSwitcher from '../LanguageSwitcher'
import ThemeSwitcher from '../ThemeSwitcher'

export default function UserMenu({ user }) {
  const { logout } = useAuth()
  const { notify } = useUI()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Сыртқа басқанда және Escape-те жабылады
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pr-2 pl-1.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 sm:gap-3 sm:pr-3"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            {user.name}
          </span>
        </span>
        <ChevronDown className="size-4 text-slate-400 dark:text-slate-500" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>

          {/* Тақырыптағы тіл мен түс ауыстырғыш мобильде орын үнемдеу үшін
              жасырылған — сондықтан оларды осында береміз, әйтпесе телефоннан
              оларды тек баптаулар бетінен ғана ауыстыруға болар еді */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:hidden">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {t('common.language')}
            </span>
            <LanguageSwitcher />
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:hidden">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {t('common.theme')}
            </span>
            <ThemeSwitcher />
          </div>

          <Link
            to="/app/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 sm:py-2.5"
          >
            <Settings className="size-4 text-slate-400 dark:text-slate-500" />
            {t('userMenu.settings')}
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => logout().catch((error) => notify(error.message))}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 sm:py-2.5"
          >
            <LogOut className="size-4 text-slate-400 dark:text-slate-500" />
            {t('userMenu.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
