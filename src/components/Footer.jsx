import { Timer } from 'lucide-react'
import { useUI } from '../context/uiContext'
import { useAuth } from '../context/authContext'
import { useI18n } from '../i18n/i18nContext'
import LanguageSwitcher from './LanguageSwitcher'

// Бұрын бұл жерде 14 сілтеме тұрған, оның бірде-бірі ешқайда апармайтын.
// Қазір тек шынымен бар нәрсе қалды.
const pageLinks = [
  { key: 'nav.features', href: '#features' },
  { key: 'nav.who', href: '#who' },
  { key: 'nav.about', href: '#about' },
]

export default function Footer() {
  const { openSignup, openSignin } = useUI()
  const { user } = useAuth()
  const { t } = useI18n()

  // py-1 — саусақпен дәл тиюге жеткілікті биіктік берсін
  const linkClass =
    'inline-block py-1 text-sm text-slate-500 transition-colors hover:text-slate-900'

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 pb-[calc(3rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {/* Бренд */}
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
                <Timer className="size-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                Focus10
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm/6 text-slate-500">
              {t('footer.tagline')}
            </p>
            <LanguageSwitcher className="mt-6" />
          </div>

          {/* Бет бойынша */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t('footer.pageHeading')}
            </h3>
            <ul className="mt-4 space-y-3">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {t(link.key)}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={user ? () => openSignup() : openSignin}
                  className={linkClass}
                >
                  {user ? t('footer.openApp') : t('footer.signIn')}
                </button>
              </li>
            </ul>
          </div>

          {/* Немен жасалған */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t('footer.stackHeading')}
            </h3>
            <ul className="mt-4 space-y-3">
              {t('footer.stack').map((item) => (
                <li key={item} className="text-sm text-slate-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Жоспарда */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t('footer.plannedHeading')}
            </h3>
            <ul className="mt-4 space-y-3">
              {t('footer.planned').map((item) => (
                <li key={item} className="text-sm text-slate-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Focus10
          </p>
          <p className="max-w-xl text-sm text-pretty text-slate-400">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
