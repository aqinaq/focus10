import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, Timer, TriangleAlert } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/authContext'
import { useUI } from '../context/uiContext'

export default function Settings() {
  const { user } = useAuth()
  const { notify } = useUI()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between px-6">
          <Link to="/app" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
              <Timer className="size-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              FocusFlow
            </span>
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Артқа
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Параметрлер
        </h1>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Аккаунт</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Row label="Аты-жөні" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Тариф" value={user.plan} />
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Деректі жүктеу</h2>
          <p className="mt-2 text-sm/6 text-slate-600">
            Есептелген уақытыңды CSV түрінде ал — Excel мен Google Sheets ашады.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { range: 'week', label: 'Соңғы 7 күн' },
              { range: 'month', label: 'Соңғы 30 күн' },
              { range: 'all', label: 'Барлық уақыт' },
            ].map((item) => (
              <a
                key={item.range}
                href={`/api/reports/export.csv?range=${item.range}`}
                download
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Download className="size-4" />
                {item.label}
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
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 truncate text-sm text-slate-900">{value}</dd>
    </div>
  )
}

function PasswordForm({ notify }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setErrors({})

    if (next.length < 8) {
      setErrors({ new_password: 'Құпиясөз кемінде 8 таңба болуы керек.' })
      return
    }

    setSaving(true)
    try {
      await api.changePassword({ current_password: current, new_password: next })
      setCurrent('')
      setNext('')
      notify('Құпиясөз ауыстырылды. Басқа құрылғылардан шығарылдың.')
    } catch (error) {
      if (Object.keys(error.fields ?? {}).length > 0) setErrors(error.fields)
      else notify(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Құпиясөзді ауыстыру</h2>
      <p className="mt-2 text-sm/6 text-slate-600">
        Ауыстырғаннан кейін басқа құрылғылардағы сессиялар жойылады.
      </p>

      <form onSubmit={submit} noValidate className="mt-4 max-w-sm space-y-4">
        <Field
          id="current_password"
          label="Ағымдағы құпиясөз"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          error={errors.current_password}
        />
        <Field
          id="new_password"
          label="Жаңа құпиясөз"
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
          Ауыстыру
        </button>
      </form>
    </section>
  )
}

function DangerZone({ notify }) {
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
    <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-6">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-900">Аккаунтты жою</h2>
          <p className="mt-2 text-sm/6 text-slate-600">
            Барлық жоба, тапсырма және уақыт жазбаң біржола өшеді. Бұл әрекетті
            кері қайтару мүмкін емес — алдымен деректі CSV-ге жүктеп ал.
          </p>

          {confirming ? (
            <form onSubmit={remove} className="mt-4 max-w-sm space-y-4">
              <Field
                id="delete_password"
                label="Растау үшін құпиясөзіңді енгіз"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={deleting || password === ''}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting && <Loader2 className="size-4 animate-spin" />}
                  Біржола жою
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false)
                    setPassword('')
                  }}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Болдырмау
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              Аккаунтты жою
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
      <label htmlFor={id} className="block text-sm font-medium text-slate-900">
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
        className={`mt-2 block w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors ${
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
