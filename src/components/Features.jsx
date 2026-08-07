import { Timer, ListChecks, BarChart3, ShieldCheck } from 'lucide-react'

// Тек шынымен жұмыс істеп тұрған мүмкіндіктер. Жоспардағылар — Pricing
// бөліміндегі «жоспарда» белгісімен бөлек көрсетілген.
const features = [
  {
    icon: Timer,
    title: 'Бір басумен таймер',
    description:
      'Тапсырманың жанындағы ▶ батырмасын бас — уақыт сол тапсырмаға жазыла бастайды. Бір мезгілде бір ғана таймер жүреді, қосарланып кетпейді.',
  },
  {
    icon: ListChecks,
    title: 'Тапсырма мен жоба',
    description:
      'Тапсырманы жобаға тіркеп, күйі мен жобасы бойынша сүзгіле. Атын тізімнен шықпай-ақ өңдейсің, аяқталғанда таймері өзі тоқтайды.',
  },
  {
    icon: BarChart3,
    title: 'Есеп және CSV',
    description:
      'Апталық диаграмма мен жоба бойынша бөліс нақты деректен құралады. 7 күн, 30 күн немесе бүкіл тарихты CSV-ге жүктеп, клиентке жібере аласың.',
  },
  {
    icon: ShieldCheck,
    title: 'Дерек сенікі',
    description:
      'Құпиясөз scrypt-пен хештеледі, сессия httpOnly cookie-де. Деректі кез келген сәтте жүктеп алуға, аккаунтты бүкіл дерегімен бірге жоюға болады.',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Features
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Жұмысты жүргізуге керектің бәрі
          </h2>
          <p className="mt-6 text-lg text-pretty text-slate-600">
            Артық ештеңесі жоқ: жоспарла, уақытты есепте, есебін ал. Төмендегінің
            бәрі қазір жұмыс істеп тұр.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:max-w-none lg:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900">
                {title}
              </h3>
              <p className="mt-3 text-base/7 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
