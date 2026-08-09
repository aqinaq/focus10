import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Timer } from 'lucide-react'
import Modal from './Modal'
import { useAuth } from '../context/authContext'
import { useI18n } from '../i18n/i18nContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const emptyForm = { name: '', email: '', password: '' }

export default function AuthModal({ open, mode, onClose, onSwitchMode }) {
  const isSignup = mode === 'signup'
  const { register, login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Модаль әр ашылғанда форманы тазартамыз
  useEffect(() => {
    if (open) {
      setForm(emptyForm)
      setErrors({})
      setFormError('')
      setSubmitting(false)
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
    if (form.password.length < 8) {
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

  const title = isSignup ? t('auth.signupTitle') : t('auth.signinTitle')

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600">
        <Timer className="size-6 text-white" strokeWidth={2.5} />
      </span>

      <h2 className="mt-4 pr-10 text-2xl font-semibold tracking-tight text-slate-900 sm:mt-5 sm:pr-0">
        {title}
      </h2>
      <p className="mt-2 text-sm/6 text-slate-500">
        {isSignup ? t('auth.signupSubtitle') : t('auth.signinSubtitle')}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
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
        />

        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
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
            : isSignup
              ? t('auth.signupSubmit')
              : t('auth.signinSubmit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {isSignup ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
        <button
          type="button"
          onClick={() => onSwitchMode(isSignup ? 'signin' : 'signup')}
          className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          {isSignup ? t('auth.switchToSignin') : t('auth.switchToSignup')}
        </button>
      </p>
    </Modal>
  )
}

function Field({ id, label, error, autoFocus, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-900">
        {label}
      </label>
      <input
        id={id}
        name={id}
        {...props}
        {...(autoFocus ? { 'data-autofocus': true } : {})}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
