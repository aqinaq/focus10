import { Link } from 'react-router-dom'
import { ArrowLeft, Timer } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12 text-center">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
          <Timer className="size-5 text-white" strokeWidth={2.5} />
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          Focus10
        </span>
      </Link>

      <p className="mt-10 text-sm font-semibold tracking-wide text-brand-600 uppercase sm:mt-16">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
        {t('notFound.title')}
      </h1>
      <p className="mt-5 max-w-md text-base text-pretty text-slate-600 sm:mt-6 sm:text-lg">
        {t('notFound.body')}
      </p>

      <Link
        to="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <ArrowLeft className="size-4" />
        {t('notFound.home')}
      </Link>

      <LanguageSwitcher className="mt-10" />
    </div>
  )
}
