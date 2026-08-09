import { Code2, Download, ExternalLink, Eye } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

/**
 * Өнімнің артында кім тұрғанын және неге сенуге болатынын түсіндіретін
 * бөлім. Мұндағы әр тұжырым тексеріледі: код ашық, тесттің саны нақты,
 * дерек экспорты шынымен жұмыс істейді.
 * Мәтіні аудармада, мұнда тек реті мен таңбашасы.
 */
const REPO_URL = 'https://github.com/aqinaq/focus10'
const icons = [Eye, Download, Code2]

export default function About() {
  const { t } = useI18n()

  return (
    <section id="about" className="py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-2 lg:items-start">
          {/* Сол жақ: не үшін жасалды */}
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
              {t('about.eyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-4xl md:text-5xl">
              {t('about.title')}
            </h2>
            <p className="mt-5 text-base text-pretty text-slate-600 sm:mt-6 sm:text-lg">
              {t('about.lead')}
            </p>
            <p className="mt-4 text-sm/6 text-pretty text-slate-500 sm:text-base/7">
              {t('about.body')}
            </p>

            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 sm:mt-8"
            >
              {t('about.repoCta')}
              <ExternalLink className="size-4 text-slate-400" />
            </a>
            <p className="mt-3 text-xs text-slate-400">{t('about.repoNote')}</p>
          </div>

          {/* Оң жақ: ұстанымдар */}
          <ul className="flex flex-col gap-4">
            {t('about.points').map((point, index) => {
              const Icon = icons[index]

              return (
                <li
                  key={point.title}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:gap-5 sm:p-6"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:size-11">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm/6 text-slate-500">{point.body}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
