import { Link } from 'react-router-dom'
import { ArrowLeft, Timer } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
          <Timer className="size-5 text-white" strokeWidth={2.5} />
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          FocusFlow
        </span>
      </Link>

      <p className="mt-16 text-sm font-semibold tracking-wide text-brand-600 uppercase">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Мұндай бет жоқ
      </h1>
      <p className="mt-6 max-w-md text-lg text-pretty text-slate-600">
        Сілтеме ескірген немесе мекенжайда қате болуы мүмкін.
      </p>

      <Link
        to="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <ArrowLeft className="size-4" />
        Басты бетке
      </Link>
    </div>
  )
}
