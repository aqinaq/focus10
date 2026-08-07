import { Timer } from 'lucide-react'
import { useUI } from '../context/uiContext'
import { useAuth } from '../context/authContext'

// Бұрын бұл жерде 14 сілтеме тұрған, оның бірде-бірі ешқайда апармайтын.
// Қазір тек шынымен бар нәрсе қалды.
const pageLinks = [
  { label: 'Мүмкіндіктер', href: '#features' },
  { label: 'Баға', href: '#pricing' },
  { label: 'Кімге арналған', href: '#about' },
]

const stack = [
  'React 19 + Vite + Tailwind CSS',
  'Express 5 + SQLite (node:sqlite)',
  '38 автотест API-ды жабады',
]

const planned = ['PDF есеп', 'Шот-фактура', 'Команда режимі', 'Күнтізбе синхронизациясы']

export default function Footer() {
  const { openSignup, openSignin } = useUI()
  const { user } = useAuth()

  const linkClass =
    'text-sm text-slate-500 transition-colors hover:text-slate-900'

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Бренд */}
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
                <Timer className="size-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                FocusFlow
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm/6 text-slate-500">
              Уақытын өзі есептейтін фрилансерлерге арналған тапсырма мен таймер
              құралы.
            </p>
          </div>

          {/* Бет бойынша */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Бет бойынша</h3>
            <ul className="mt-4 space-y-3">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={user ? () => openSignup() : openSignin}
                  className={linkClass}
                >
                  {user ? 'Қолданбаға өту' : 'Аккаунтқа кіру'}
                </button>
              </li>
            </ul>
          </div>

          {/* Немен жасалған */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Немен жасалған</h3>
            <ul className="mt-4 space-y-3">
              {stack.map((item) => (
                <li key={item} className="text-sm text-slate-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Жоспарда */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Жоспарда</h3>
            <ul className="mt-4 space-y-3">
              {planned.map((item) => (
                <li key={item} className="text-sm text-slate-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} FocusFlow
          </p>
          <p className="max-w-xl text-sm text-pretty text-slate-400">
            Өнім әлі ерте кезеңде: төлем жүйесі мен құқықтық құжаттар
            (Privacy, Terms) дайындалған жоқ.
          </p>
        </div>
      </div>
    </footer>
  )
}
