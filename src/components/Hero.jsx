import { ArrowRight, Play, Sparkles, Check } from 'lucide-react'
import { useUI } from '../context/uiContext'
import { useI18n } from '../i18n/i18nContext'

export default function Hero() {
  const { openSignup, openDemo } = useUI()
  const { t } = useI18n()

  // Ойдан шығарылған клиент логотиптері мен «12 000+ қолданушы» деген сан
  // орнына — бәрі де тексеруге болатын нақты фактілер.
  const facts = t('hero.facts')
  // Сынақ мерзімі де, жазылым да жоқ — сондықтан «14 күн тегін» немесе
  // «кез келген уақытта бас тарт» деп жаза алмаймыз.
  const trust = t('hero.trust')

  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* фондық жұмсақ сәуле */}
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[64rem] -translate-x-1/2 opacity-[0.07]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-balance text-slate-600 shadow-sm transition-colors hover:border-brand-200 hover:text-slate-900 sm:py-1.5 sm:text-sm"
          >
            <Sparkles className="size-4 shrink-0 text-brand-600" />
            <span>{t('hero.badge')}</span>
            <ArrowRight className="size-4 shrink-0" />
          </a>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:mt-8 sm:text-5xl md:text-6xl lg:text-7xl">
            {t('hero.titleLead')}{' '}
            <span className="relative whitespace-nowrap text-brand-600">
              {t('hero.titleAccent')}
              <svg
                aria-hidden="true"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-2.5 w-full fill-brand-200"
              >
                <path d="M0 8c40-6 160-6 200 0v4H0z" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-pretty text-slate-600 sm:mt-8 sm:text-xl">
            {t('hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => openSignup()}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:w-auto"
            >
              {t('hero.getStarted')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={openDemo}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              <Play className="size-4 fill-current" />
              {t('hero.watchDemo')}
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-brand-600" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Өнім скриншоты */}
        <div className="relative mt-12 sm:mt-20">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-8 -z-10 h-full rounded-3xl bg-brand-600/10 blur-2xl"
          />
          {/* Салынған макет емес — жұмыс істеп тұрған қолданбадан алынған
              нағыз экран суреті. */}
          <button
            type="button"
            onClick={openDemo}
            aria-label={t('hero.watchDemoAria')}
            className="group block w-full cursor-pointer text-left"
          >
            <span className="relative block overflow-hidden rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10">
              <img
                src="/app-dashboard.png"
                width={2720}
                height={1640}
                alt={t('hero.screenshotAlt')}
                className="block w-full"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/10 group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg">
                  <Play className="size-4 fill-current" />
                  {t('hero.screenshotCta')}
                </span>
              </span>
            </span>
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">
            {t('hero.screenshotNote')}
          </p>
        </div>

        {/* Нақты фактілер */}
        <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-8 sm:mt-20 sm:gap-8 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.value} className="text-center">
              <dt className="text-2xl font-semibold tracking-tight text-slate-900">
                {fact.value}
              </dt>
              <dd className="mt-2 text-sm text-pretty text-slate-500">
                {fact.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
