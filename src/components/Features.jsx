import { Timer, ListChecks, BarChart3, ShieldCheck } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

// Тек шынымен жұмыс істеп тұрған мүмкіндіктер. Жоспардағылар — футердегі
// «Жоспарда» бағанында бөлек көрсетілген.
// Мәтіні аудармада, мұнда тек реті мен таңбашасы.
const icons = [Timer, ListChecks, BarChart3, ShieldCheck]

export default function Features() {
  const { t } = useI18n()

  return (
    <section id="features" className="bg-slate-50 py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            {t('features.eyebrow')}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-4xl md:text-5xl">
            {t('features.title')}
          </h2>
          <p className="mt-5 text-base text-pretty text-slate-600 sm:mt-6 sm:text-lg">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-5 sm:mt-20 sm:gap-6 lg:max-w-none lg:grid-cols-2">
          {t('features.items').map((feature, index) => {
            const Icon = icons[index]

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-8"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white sm:size-12">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 sm:mt-6 sm:text-xl">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm/6 text-slate-600 sm:text-base/7">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
