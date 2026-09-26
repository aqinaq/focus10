import { ArrowRight, Play, Check, MousePointer2 } from 'lucide-react'
import { useUI } from '../context/uiContext'
import { useI18n } from '../i18n/i18nContext'
import { useNavigate } from 'react-router-dom'

const previews = [
  { key: 'dashboard', src: '/app-dashboard.png', classes: 'col-span-3 aspect-[16/8]' },
  { key: 'timer', src: '/app-timer.png', classes: 'col-span-2 aspect-[16/5]', position: '100% 50%' },
  { key: 'reports', src: '/app-reports.png', classes: 'col-span-1 aspect-square' },
]

export default function Hero() {
  const { openSignup, openDemo } = useUI()
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[64rem] -translate-x-1/2 opacity-[0.07] dark:opacity-[0.16]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <MousePointer2 className="size-3.5" />
              {t('hero.badge')}
            </p>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100">
              {t('hero.title')}
            </h1>
            <p className="mt-5 max-w-lg text-base/7 text-pretty text-slate-600 sm:text-lg/8 dark:text-slate-400">
              {t('hero.subtitle')}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700"
              >
                {t('hero.getStarted')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Play className="size-4 fill-current" />
                {t('hero.watchDemo')}
              </button>
            </div>
            <button
              type="button"
              onClick={openSignup}
              className="mt-4 text-sm font-medium text-brand-700 underline underline-offset-4 dark:text-brand-300"
            >
              {t('guest.createAccount')}
            </button>

            <ul className="mt-6 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              {t('hero.trust').map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-brand-600 dark:text-brand-400" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={openDemo}
            aria-label={t('hero.watchDemoAria')}
            className="group grid grid-cols-3 gap-3 text-left"
          >
            {previews.map((preview) => (
              <span
                key={preview.key}
                className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 ${preview.classes}`}
              >
                <img
                  src={preview.src}
                  alt={t(`hero.previews.${preview.key}.alt`)}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ objectPosition: preview.position ?? '50% 50%' }}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 pt-10 pb-3 text-sm font-semibold text-white">
                  {t(`hero.previews.${preview.key}.label`)}
                </span>
              </span>
            ))}
            <span className="col-span-3 text-center text-xs text-slate-400 dark:text-slate-500">
              {t('hero.screenshotNote')}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
