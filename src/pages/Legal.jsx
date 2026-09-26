import { Link } from 'react-router-dom'
import { Timer } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'

export default function LegalPage({ kind }) {
  const { t } = useI18n()
  const document = t(`legal.${kind}`)

  return (
    <div className="min-h-dvh bg-white dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
              <Timer className="size-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Focus10</span>
          </Link>
          <div className="flex gap-3"><LanguageSwitcher /><ThemeSwitcher /></div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{t('legal.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">{document.title}</h1>
        <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">{t('legal.effective')}</p>
        <p className="mt-6 text-base/7 text-slate-600 dark:text-slate-400">{document.intro}</p>

        <aside className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900 dark:bg-brand-950/40">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t('legal.contactTitle')}</h2>
          <p className="mt-2 text-sm/6 text-slate-600 dark:text-slate-400">{t('legal.contactBody')}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
            <a href="https://github.com/aqinaq/focus10/issues" target="_blank" rel="noreferrer" className="text-brand-700 hover:text-brand-800 dark:text-brand-300">{t('legal.generalContact')}</a>
            <a href="https://github.com/aqinaq/focus10/security/advisories/new" target="_blank" rel="noreferrer" className="text-brand-700 hover:text-brand-800 dark:text-brand-300">{t('legal.privateContact')}</a>
          </div>
        </aside>

        <div className="mt-10 space-y-9">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
              {section.body && <p className="mt-3 text-sm/7 text-slate-600 dark:text-slate-400">{section.body}</p>}
              {section.items && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm/7 text-slate-600 marker:text-brand-500 dark:text-slate-400">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-slate-200 pt-8 dark:border-slate-800">
          <Link to="/" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">{t('notFound.home')}</Link>
          <Link to={kind === 'privacy' ? '/terms' : '/privacy'} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            {t(`legal.${kind === 'privacy' ? 'terms' : 'privacy'}.title`)}
          </Link>
        </div>
      </main>
    </div>
  )
}
