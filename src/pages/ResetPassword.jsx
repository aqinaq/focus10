import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Loader2, Timer } from 'lucide-react'
import { api } from '../lib/api'
import { useUI } from '../context/uiContext'
import { useI18n } from '../i18n/i18nContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import PasswordToggle from '../components/PasswordToggle'

/**
 * Хаттағы сілтеме осында әкеледі: /reset-password?token=…
 *
 * Токен URL-де тұр, сондықтан ол ешқайда жіберілмеуі керек. React Router
 * бетті сервер жағында жаңартпайды, ал сілтемені сыртқа шығаратын нәрсе
 * бұл бетте жоқ.
 */
export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { openSignin, openForgot, notify } = useUI()
  const { t } = useI18n()

  const [password, setPassword] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState('')
  const [linkDead, setLinkDead] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password.length < 8) {
      setError(t('auth.errors.password'))
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api.resetPassword({ token, new_password: password })
      // Жаңа құпиясөзбен өзі кіреді — сол арқылы ол шынымен есте қалғаны
      // тексеріледі
      navigate('/')
      notify(t('reset.done'))
      openSignin()
    } catch (failure) {
      const fieldError = failure.fields?.new_password
      setError(fieldError ?? failure.message)
      // Құпиясөздің өзі дұрыс, бірақ сілтеме жарамсыз болса — жаңасын
      // сұрайтын жол көрсетеміз, әйтпесе адам бұл бетте тұйыққа тіреледі
      setLinkDead(!fieldError && failure.status === 400)
      setSubmitting(false)
    }
  }

  return (
    <Shell>
      <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600">
        <KeyRound className="size-6 text-white" strokeWidth={2.5} />
      </span>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {t('reset.title')}
      </h1>

      {token === '' ? (
        <>
          <p className="mt-3 text-sm/6 text-slate-500 dark:text-slate-400">
            {t('reset.noToken')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                navigate('/')
                openForgot()
              }}
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {t('reset.newLink')}
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('notFound.home')}
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm/6 text-slate-500 dark:text-slate-400">
            {t('reset.body')}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 text-left">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              {t('settings.newPassword')}
            </label>
            <div className="relative mt-2">
              <input
                id="new-password"
                name="new-password"
                type={revealed ? 'text' : 'password'}
                autoComplete="new-password"
                enterKeyHint="go"
                autoFocus
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                  setLinkDead(false)
                }}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'new-password-error' : undefined}
                className={`block w-full rounded-xl border py-3 pl-4 pr-12 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 ${
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-red-700 dark:focus:ring-red-900/50'
                    : 'border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:focus:ring-brand-900'
                }`}
              />
              <PasswordToggle
                visible={revealed}
                onToggle={() => setRevealed((prev) => !prev)}
                controls="new-password"
              />
            </div>
            {error && (
              <div id="new-password-error" role="alert" className="mt-2">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                {linkDead && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/')
                      openForgot()
                    }}
                    className="mt-1.5 text-sm font-semibold text-red-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-red-300"
                  >
                    {t('reset.newLink')}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? t('auth.submitting') : t('reset.submit')}
            </button>
          </form>
        </>
      )}
    </Shell>
  )
}

/** Екі бетте де (қалпына келтіру, растау) бірдей орау. */
export function Shell({ children }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12 text-center dark:bg-slate-950">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
          <Timer className="size-5 text-white" strokeWidth={2.5} />
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Focus10
        </span>
      </Link>

      <main
        id="main"
        className="mt-10 flex w-full max-w-sm flex-col items-center sm:mt-14"
      >
        {children}
      </main>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </div>
  )
}
