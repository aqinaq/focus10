import {
  ArrowUpRight,
  DatabaseZap,
  Download,
  FileSpreadsheet,
  FlaskConical,
  LockKeyhole,
} from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

const REPO_URL = 'https://github.com/aqinaq/focus10'

export default function ProductProof() {
  const { t } = useI18n()

  return (
    <section id="proof" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
            {t('proof.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-4xl dark:text-slate-100">
            {t('proof.title')}
          </h2>
          <p className="mt-4 text-base/7 text-slate-600 dark:text-slate-400">
            {t('proof.subtitle')}
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <LockKeyhole className="size-6 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('proof.security.title')}
            </h3>
            <ul className="mt-4 space-y-3 text-sm/6 text-slate-600 dark:text-slate-400">
              {t('proof.security.items').map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <FlaskConical className="size-6 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('proof.tests.title')}
            </h3>
            <p className="mt-2 text-sm/6 text-slate-600 dark:text-slate-400">
              {t('proof.tests.intro')}
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {t('proof.tests.layers').map((layer) => (
                <div key={layer.title} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <dt className="text-sm font-semibold text-slate-900 dark:text-slate-100">{layer.title}</dt>
                  <dd className="mt-1 text-xs/5 text-slate-500 dark:text-slate-400">{layer.body}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
            <FileSpreadsheet className="size-6 text-brand-300" />
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{t('proof.csv.title')}</h3>
                <p className="mt-2 text-sm/6 text-slate-300">{t('proof.csv.body')}</p>
              </div>
              <a
                href="/focus10-sample.csv"
                download
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
              >
                <Download className="size-4" />
                {t('proof.csv.download')}
              </a>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 p-4 text-xs/6 text-slate-300"><code>{t('proof.csv.sample')}</code></pre>
          </article>

          <article id="engineering" className="scroll-mt-24 rounded-2xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-900 dark:bg-brand-950/40 sm:p-8">
            <DatabaseZap className="size-6 text-brand-600 dark:text-brand-400" />
            <p className="mt-4 text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-300">
              {t('proof.engineering.eyebrow')}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('proof.engineering.title')}
            </h3>
            <p className="mt-3 text-sm/6 text-slate-600 dark:text-slate-400">
              {t('proof.engineering.body')}
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            >
              {t('proof.engineering.link')}
              <ArrowUpRight className="size-4" />
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}
