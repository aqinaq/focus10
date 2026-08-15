import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, MailCheck, Timer } from 'lucide-react'
import Modal from './Modal'
import { api } from '../lib/api'
import { useAuth } from '../context/authContext'
import { useI18n } from '../i18n/i18nContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const emptyForm = { name: '', email: '', password: '' }

export default function AuthModal({ open, mode, onClose, onSwitchMode }) {
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'
  const { register, login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  // Модаль әр ашылғанда форманы тазартамыз
  useEffect(() => {
    if (open) {
      setForm(emptyForm)
      setErrors({})
      setFormError('')
      setSubmitting(false)
      setSent(false)
    }
  }, [open, mode])

  const setField = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFormError('')
  }

  // Серверде де дәл осындай тексеру бар — бұл жерде тек жылдам кері байланыс
  const validate = () => {
    const next = {}
    if (isSignup && form.name.trim().length < 2) {
      next.name = t('auth.errors.name')
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      next.email = t('auth.errors.email')
    }
    if (!isForgot && form.password.length < 8) {
      next.password = t('auth.errors.password')
    }
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    setFormError('')

    try {
      if (isForgot) {
        await api.forgotPassword(form.email.trim())
        // Сервер email тіркелген-тіркелмегенін айтпайды, біз де айтпаймыз
        setSent(true)
        setSubmitting(false)
        return
      }

      if (isSignup) {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        })
      } else {
        await login({ email: form.email.trim(), password: form.password })
      }

      onClose()
      navigate('/app')
    } catch (error) {
      // Сервер өріс деңгейіндегі қателерді қайтарса, соларды көрсетеміз
      if (error.fields && Object.keys(error.fields).length > 0) {
        setErrors(error.fields)
      } else {
        setFormError(error.message)
      }
      setSubmitting(false)
    }
  }

  const title = isForgot
    ? t('auth.forgotTitle')
    : isSignup
      ? t('auth.signupTitle')
      : t('auth.signinTitle')

  const subtitle = isForgot
    ? t('auth.forgotSubtitle')
    : isSignup
      ? t('auth.signupSubtitle')
      : t('auth.signinSubtitle')

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600">
        {sent ? (
          <MailCheck className="size-6 text-white" strokeWidth={2.5} />
        ) : (
          <Timer className="size-6 text-white" strokeWidth={2.5} />
        )}
      </span>

      <h2 className="mt-4 pr-10 text-2xl font-semibold tracking-tight text-slate-900 sm:mt-5 dark:text-slate-100 sm:pr-0">
        {sent ? t('auth.forgotSentTitle') : title}
      </h2>
      <p className="mt-2 text-sm/6 text-slate-500 dark:text-slate-400">
        {sent ? t('auth.forgotSentBody') : subtitle}
      </p>

      {sent ? (
        <button
          type="button"
          onClick={() => onSwitchMode('signin')}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t('auth.backToSignin')}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
        >
          {isSignup && (
            <Field
              id="name"
              label={t('auth.name')}
              type="text"
              autoComplete="name"
              placeholder={t('auth.namePlaceholder')}
              value={form.name}
              onChange={setField('name')}
              error={errors.name}
              autoFocus
            />
          )}

          {/* Мобиль пернетақта поштаны бас әріппен бастап, астын сызып
              «түзетпеуі» үшін */}
          <Field
            id="email"
            label={t('auth.email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t('auth.emailPlaceholder')}
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            autoFocus={!isSignup}
          />

          {!isForgot && (
            <Field
              id="password"
              label={t('auth.password')}
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              enterKeyHint="go"
              placeholder={t('auth.passwordPlaceholder')}
              value={form.password}
              onChange={setField('password')}
              error={errors.password}
              hint={
                mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => onSwitchMode('forgot')}
                    className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    {t('auth.forgotLink')}
                  </button>
                )
              }
            />
          )}

          {formError && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting
              ? t('auth.submitting')
              : isForgot
                ? t('auth.forgotSubmit')
                : isSignup
                  ? t('auth.signupSubmit')
                  : t('auth.signinSubmit')}
          </button>
        </form>
      )}

      {!sent && (
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isForgot ? (
            <button
              type="button"
              onClick={() => onSwitchMode('signin')}
              className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {t('auth.backToSignin')}
            </button>
          ) : (
            <>
              {isSignup ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
              <button
                type="button"
                onClick={() => onSwitchMode(isSignup ? 'signin' : 'signup')}
                className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {isSignup ? t('auth.switchToSignin') : t('auth.switchToSignup')}
              </button>
            </>
          )}
        </p>
      )}
    </Modal>
  )
}

function Field({ id, label, error, hint, autoFocus, ...props }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          {label}
        </label>
        {hint}
      </div>
      <input
        id={id}
        name={id}
        {...props}
        {...(autoFocus ? { 'data-autofocus': true } : {})}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 ${
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
