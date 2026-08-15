import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleCheck, CircleX, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/authContext'
import { useI18n } from '../i18n/i18nContext'
import { Shell } from './ResetPassword'

/**
 * Хаттағы растау сілтемесі: /verify-email?token=…
 *
 * Токенді бет ашылған бойда жібереміз — адамға қосымша батырма басқызудың
 * қажеті жоқ. Токен бір реттік болғандықтан, сұраныс дәл бір рет кетуі
 * керек: React әзірлеу режимінде эффектіні екі рет шақырады, сондықтан
 * жіберілгенін ref-пен белгілеп қоямыз.
 */
export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const { user, refresh } = useAuth()
  const { t } = useI18n()

  const [state, setState] = useState(token === '' ? 'failed' : 'working')
  const [error, setError] = useState('')
  const sentRef = useRef(false)

  useEffect(() => {
    if (token === '' || sentRef.current) return
    sentRef.current = true

    api
      .verifyEmail(token)
      .then(() => {
        setState('done')
        // Кірген қолданушының бетіндегі ескерту бірден жоғалуы үшін
        return refresh().catch(() => {})
      })
      .catch((failure) => {
        setError(failure.message)
        setState('failed')
      })
  }, [token, refresh])

  if (state === 'working') {
    return (
      <Shell>
        <Loader2 className="size-8 animate-spin text-brand-600 dark:text-brand-400" />
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          {t('verify.working')}
        </p>
      </Shell>
    )
  }

  const done = state === 'done'

  return (
    <Shell>
      <span
        className={`flex size-11 items-center justify-center rounded-xl ${
          done ? 'bg-brand-600' : 'bg-red-600'
        }`}
      >
        {done ? (
          <CircleCheck className="size-6 text-white" strokeWidth={2.5} />
        ) : (
          <CircleX className="size-6 text-white" strokeWidth={2.5} />
        )}
      </span>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {done ? t('verify.doneTitle') : t('verify.failedTitle')}
      </h1>
      <p className="mt-3 text-sm/6 text-pretty text-slate-500 dark:text-slate-400">
        {done ? t('verify.doneBody') : (error ?? t('verify.failedBody'))}
      </p>

      <Link
        to={user ? '/app' : '/'}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {user ? t('nav.dashboard') : t('notFound.home')}
      </Link>
    </Shell>
  )
}
