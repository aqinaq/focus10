import { ArrowRight } from 'lucide-react'
import { useUI } from '../context/uiContext'
import { useI18n } from '../i18n/i18nContext'

export default function CTA() {
  const { openSignup } = useUI()
  const { t } = useI18n()

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:px-8">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-16 sm:py-20">
        {/* фондық безендіру */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-brand-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 -z-10 size-80 rounded-full bg-brand-900/40 blur-3xl"
        />

        <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl md:text-5xl">
          {t('cta.title')}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-pretty text-brand-100 sm:mt-6 sm:text-lg">
          {t('cta.subtitle')}
        </p>

        <div className="mt-8 flex justify-center sm:mt-10">
          <button
            type="button"
            onClick={() => openSignup()}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            {t('cta.button')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
