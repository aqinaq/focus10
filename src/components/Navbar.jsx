import { useEffect, useState } from 'react'
import { Menu, X, Timer } from 'lucide-react'
import { useUI } from '../context/uiContext'
import { useAuth } from '../context/authContext'
import { useI18n } from '../i18n/i18nContext'
import useScrollLock from '../hooks/useScrollLock'
import LanguageSwitcher from './LanguageSwitcher'

const links = [
  { key: 'nav.features', href: '#features' },
  { key: 'nav.who', href: '#who' },
  { key: 'nav.about', href: '#about' },
]

export default function Navbar() {
  const { openSignup, openSignin } = useUI()
  const { user } = useAuth()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useScrollLock(open)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Модаль ашылмас бұрын мобиль меню жабылуы керек
  const runAndClose = (action) => () => {
    setOpen(false)
    action()
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-slate-200 bg-white/80 backdrop-blur-md'
          : 'border-b border-transparent bg-white'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
            <Timer className="size-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Focus10
          </span>
        </a>

        {/* Desktop меню */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 md:flex">
          <LanguageSwitcher />
          {!user && (
            <button
              type="button"
              onClick={openSignin}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {t('nav.signIn')}
            </button>
          )}
          <button
            type="button"
            onClick={() => openSignup()}
            className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {user ? t('nav.dashboard') : t('nav.getStarted')}
          </button>
        </div>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('nav.openMenu')}
          aria-expanded={open}
          className="-mr-2 rounded-lg p-2.5 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
        >
          <Menu className="size-6" />
        </button>
      </nav>

      {/* Мобиль меню */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Телефонды көлденең ұстағанда мәзір экраннан асып кетуі мүмкін —
              сондықтан биіктігі шектеліп, ішінде скроллданады */}
          <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto overscroll-contain bg-white px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-xl sm:px-6">
            <div className="flex h-16 items-center justify-between sm:h-20">
              <a
                href="#top"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
                  <Timer className="size-5 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                  Focus10
                </span>
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('nav.closeMenu')}
                className="-mr-2 rounded-lg p-2.5 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <X className="size-6" />
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-slate-50"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6">
              <LanguageSwitcher className="self-start" />
              {!user && (
                <button
                  type="button"
                  onClick={runAndClose(openSignin)}
                  className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                >
                  {t('nav.signIn')}
                </button>
              )}
              <button
                type="button"
                onClick={runAndClose(() => openSignup())}
                className="rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {user ? t('nav.dashboard') : t('nav.getStarted')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
