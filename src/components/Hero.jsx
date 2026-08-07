import { ArrowRight, Play, Sparkles, Check } from 'lucide-react'
import { useUI } from '../context/uiContext'

// Ойдан шығарылған клиент логотиптері мен «12 000+ қолданушы» деген сан
// орнына — бәрі де тексеруге болатын нақты фактілер.
const facts = [
  { value: '0 ₸', label: 'Барлық мүмкіндік ақысыз — төлем жүйесі жоқ' },
  { value: 'CSV', label: 'Дерегіңді кез келген сәтте жүктеп ал' },
  { value: 'SQLite', label: 'Дерек бір файлда, өз серверіңде' },
  { value: '38 тест', label: 'API-дың әр маршруты автотестпен жабылған' },
]

// Сынақ мерзімі де, жазылым да жоқ — сондықтан «14 күн тегін» немесе
// «кез келген уақытта бас тарт» деп жаза алмаймыз.
const trust = ['Тіркелу тегін', 'Карта сұралмайды', 'Дерегіңді жүктеп ала аласың']

export default function Hero() {
  const { openSignup, openDemo } = useUI()

  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* фондық жұмсақ сәуле */}
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[64rem] -translate-x-1/2 opacity-[0.07]"
      />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm transition-colors hover:border-brand-200 hover:text-slate-900"
          >
            <Sparkles className="size-4 text-brand-600" />
            <span>Жаңа: CSV экспорт және жоба бойынша есеп</span>
            <ArrowRight className="size-4" />
          </a>

          <h1 className="mt-8 text-5xl font-semibold tracking-tight text-balance text-slate-900 sm:text-6xl lg:text-7xl">
            Focus on what{' '}
            <span className="relative whitespace-nowrap text-brand-600">
              matters
              <svg
                aria-hidden="true"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-2.5 w-full fill-brand-200"
              >
                <path d="M0 8c40-6 160-6 200 0v4H0z" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-pretty text-slate-600 sm:text-xl">
            FocusFlow — уақытын өзі есептейтін фрилансерлерге арналған тапсырма
            мен таймер құралы. Тапсырманы жобаға тірке, таймерді бір басумен
            қос, апта соңында есебін CSV-ге жүктеп ал.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => openSignup()}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:w-auto"
            >
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={openDemo}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              <Play className="size-4 fill-current" />
              Watch Demo
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-brand-600" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Өнім скриншоты */}
        <div className="relative mt-16 sm:mt-20">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-8 -z-10 h-full rounded-3xl bg-brand-600/10 blur-2xl"
          />
          {/* Салынған макет емес — жұмыс істеп тұрған қолданбадан алынған
              нағыз экран суреті. */}
          <button
            type="button"
            onClick={openDemo}
            aria-label="Демоны қарау"
            className="group block w-full cursor-pointer text-left"
          >
            <span className="relative block overflow-hidden rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10">
              <img
                src="/app-dashboard.png"
                width={2720}
                height={1640}
                alt="FocusFlow қолданбасының басты экраны: жүріп тұрған таймер, күндік және апталық жиынтық, тапсырмалар тізімі мен апталық диаграмма"
                className="block w-full"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/10 group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg">
                  <Play className="size-4 fill-current" />
                  Қалай жұмыс істейді
                </span>
              </span>
            </span>
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">
            Қолданбаның нағыз экран суреті. Ондағы жоба мен тапсырмалар — мысал
            аккаунттың деректері.
          </p>
        </div>

        {/* Нақты фактілер */}
        <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 sm:mt-20 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.value} className="text-center">
              <dt className="text-2xl font-semibold tracking-tight text-slate-900">
                {fact.value}
              </dt>
              <dd className="mt-2 text-sm text-pretty text-slate-500">
                {fact.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
