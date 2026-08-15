import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, Timer, TriangleAlert } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/authContext'
import { useUI } from '../context/uiContext'
import { useI18n } from '../i18n/i18nContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'

const RANGES = [
  { range: 'week', key: 'settings.rangeWeek' },
  { range: 'month', key: 'settings.rangeMonth' },
  { range: 'all', key: 'settings.rangeAll' },
]

export default function Settings() {
  const { user } = useAuth()
  const { notify } = useUI()
  const { t } = useI18n()

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <Link to="/app" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
              <Timer className="size-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Focus10
            </span>
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="size-4" />
            {t('common.back')}
          </Link>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto max-w-3xl px-4 py-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-10"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          {t('settings.title')}
        </h1>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-8 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('settings.account')}
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Row label={t('settings.name')} value={user.name} />
            <Row label={t('settings.email')} value={user.email} />
          </dl>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('settings.languageTitle')}
          </h2>
          <p className="mt-2 text-sm/6 text-slate-600 dark:text-slate-400">{t('settings.languageBody')}</p>
          <LanguageSwitcher className="mt-4" />
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('settings.themeTitle')}
          </h2>
          <p className="mt-2 text-sm/6 text-slate-600 dark:text-slate-400">
            {t('settings.themeBody')}
          </p>
          <ThemeSwitcher className="mt-4" />
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('settings.exportTitle')}
          </h2>
          <p className="mt-2 text-sm/6 text-slate-600 dark:text-slate-400">{t('settings.exportBody')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {RANGES.map((item) => (
              <a
                key={item.range}
                href={`/api/reports/export.csv?range=${item.range}`}
                download
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download className="size-4" />
                {t(item.key)}
              </a>
            ))}
          </div>
        </section>

        <PasswordForm notify={notify} />
        <DangerZone notify={notify} />
      </main>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-1 truncate text-sm text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  )
}

function PasswordForm({ notify }) {
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setErrors({})

    if (next.length < 8) {
      setErrors({ new_password: t('settings.passwordTooShort') })
      return
    }

    setSaving(true)
    try {
      await api.changePassword({ current_password: current, new_password: next })
      setCurrent('')
      setNext('')
      notify(t('settings.passwordChanged'))
    } catch (error) {
      if (Object.keys(error.fields ?? {}).length > 0) setErrors(error.fields)
      else notify(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {t('settings.passwordTitle')}
      </h2>
      <p className="mt-2 text-sm/6 text-slate-600 dark:text-slate-400">{t('settings.passwordBody')}</p>

      <form onSubmit={submit} noValidate className="mt-4 max-w-sm space-y-4">
        <Field
          id="current_password"
          label={t('settings.currentPassword')}
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          error={errors.current_password}
        />
        <Field
          id="new_password"
          label={t('settings.newPassword')}
          value={next}
          onChange={(event) => setNext(event.target.value)}
          error={errors.new_password}
        />
        <button
          type="submit"
          disabled={saving || current === '' || next === ''}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {t('settings.changePassword')}
        </button>
      </form>
    </section>
  )
}

function DangerZone({ notify }) {
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const remove = async (event) => {
    event.preventDefault()
    setDeleting(true)

    try {
      await api.deleteAccount(password)
      // Аккаунт жоқ болғандықтан күйді толық тазарту үшін қатты қайта жүктейміз
      window.location.assign('/')
    } catch (error) {
      notify(error.message)
      setDeleting(false)
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/60 dark:bg-red-950/20 sm:mt-6 sm:p-6">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('settings.dangerTitle')}
          </h2>
          <p className="mt-2 text-sm/6 text-slate-600 dark:text-slate-400">{t('settings.dangerBody')}</p>

          {confirming ? (
            <form onSubmit={remove} className="mt-4 max-w-sm space-y-4">
              <Field
                id="delete_password"
                label={t('settings.confirmPassword')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={deleting || password === ''}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting && <Loader2 className="size-4 animate-spin" />}
                  {t('settings.deleteForever')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false)
                    setPassword('')
                  }}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {t('settings.dangerTitle')}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="password"
        autoComplete="off"
        {...props}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 block w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors dark:text-slate-100 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-red-700 dark:focus:ring-red-900/50'
            : 'border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:focus:ring-brand-900'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
