import { ArrowRight } from 'lucide-react'
import { useUI } from '../context/uiContext'

export default function CTA() {
  const { openSignup } = useUI()

  return (
    <section className="px-6 py-24 sm:py-32 lg:px-8">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-600 px-6 py-20 text-center sm:px-16">
        {/* фондық безендіру */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-brand-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 -z-10 size-80 rounded-full bg-brand-900/40 blur-3xl"
        />

        <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          Бүгіннен бастап фокусыңды қайтар
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-brand-100">
          Тіркелу тегін, карта сұралмайды. Екі минутта аккаунт ашып,
          бірінші таймеріңді іске қос.
        </p>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => openSignup()}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Get Started — тегін
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
