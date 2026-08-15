import {
  Timer,
  ListChecks,
  BarChart3,
  Sparkles,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

// Тек шынымен жұмыс істеп тұрған мүмкіндіктер. Жоспардағылар — футердегі
// «Жоспарда» бағанында бөлек көрсетілген.
// Мәтіні аудармада, мұнда тек реті мен таңбашасы.
const icons = [Timer, ListChecks, BarChart3, Sparkles, KeyRound, ShieldCheck]

export default function Features() {
  const { t } = useI18n()

  return (
    <section id="features" className="bg-slate-50 py-16 sm:py-24 md:py-32 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
            {t('features.eyebrow')}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-4xl md:text-5xl dark:text-slate-100">
            {t('features.title')}
          </h2>
          <p className="mt-5 text-base text-pretty text-slate-600 sm:mt-6 sm:text-lg dark:text-slate-400">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-5 sm:mt-20 sm:gap-6 lg:max-w-none lg:grid-cols-2">
          {t('features.items').map((feature, index) => {
            const Icon = icons[index]

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-800 sm:p-8"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950 dark:text-brand-400 dark:group-hover:text-white sm:size-12">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 sm:mt-6 sm:text-xl dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm/6 text-slate-600 sm:text-base/7 dark:text-slate-400">
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
