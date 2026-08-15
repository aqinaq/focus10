import { Briefcase, PenTool, Users } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

/**
 * Бұрын бұл жерде ойдан шығарылған адамдардың «пікірлері» тұрған. Артында
 * нақты жұмыс істейтін өнім болғандықтан, жалған пікірдің орнына — өнім
 * кімге, қандай жағдайда керек екенін адал сипаттайтын сценарийлер.
 * Мәтіні аудармада, мұнда тек реті мен таңбашасы.
 */
const icons = [PenTool, Briefcase, Users]

export default function UseCases() {
  const { t } = useI18n()

  return (
    <section id="who" className="bg-slate-50 py-16 sm:py-24 md:py-32 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
            {t('useCases.eyebrow')}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-4xl md:text-5xl dark:text-slate-100">
            {t('useCases.title')}
          </h2>
          <p className="mt-5 text-base text-pretty text-slate-600 sm:mt-6 sm:text-lg dark:text-slate-400">
            {t('useCases.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-5 sm:mt-20 sm:gap-8 lg:max-w-none lg:grid-cols-3">
          {t('useCases.items').map((item, index) => {
            const Icon = icons[index]

            return (
              <div
                key={item.audience}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <Icon className="size-5" />
                </span>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 sm:mt-6 dark:text-slate-100">
                  {item.audience}
                </h3>

                <p className="mt-4 text-sm/6 text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('useCases.problemLabel')}
                  </span>
                  {item.problem}
                </p>
                <p className="mt-3 flex-1 text-sm/6 text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('useCases.solutionLabel')}
                  </span>
                  {item.solution}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
