import { Briefcase, PenTool, Users } from 'lucide-react'

/**
 * Бұрын бұл жерде ойдан шығарылған адамдардың «пікірлері» тұрған. Артында
 * нақты жұмыс істейтін өнім болғандықтан, жалған пікірдің орнына — өнім
 * кімге, қандай жағдайда керек екенін адал сипаттайтын сценарийлер.
 */
const cases = [
  {
    icon: PenTool,
    audience: 'Фрилансер дизайнер',
    problem: 'Клиентке «неге сонша уақыт кетті?» дегенге жауап беру қиын.',
    solution:
      'Әр тапсырманың уақыты жеке жазылады. Ай соңында CSV-ді жүктеп, есеп-қисапты бір файлмен жібересің.',
  },
  {
    icon: Briefcase,
    audience: 'Дербес әзірлеуші',
    problem: 'Бір мезгілде үш жоба жүріп жатыр, қайсысы қанша уақыт жеп жатқаны белгісіз.',
    solution:
      'Тапсырманы жобаға тіркейсің де, апталық есептен қай жобаға қанша сағат кеткенін көресің.',
  },
  {
    icon: Users,
    audience: 'Шағын студия',
    problem: 'Уақыт есебі әркімнің блокнотында, жинақтауға күш кетеді.',
    solution:
      'Әркім өз аккаунтынан жүргізеді, дерек серверде сақталады. Экспорт кез келген сәтте қолжетімді.',
  },
]

export default function UseCases() {
  return (
    <section id="about" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Кімге арналған
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Уақытын өзі есептейтіндерге
          </h2>
          <p className="mt-6 text-lg text-pretty text-slate-600">
            FocusFlow — жаңа өнім, сондықтан мұнда клиент пікірлерінің орнына
            оның нақты қандай жағдайда көмектесетіні жазылған.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {cases.map(({ icon: Icon, audience, problem, solution }) => (
            <div
              key={audience}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-5" />
              </span>

              <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-900">
                {audience}
              </h3>

              <p className="mt-4 text-sm/6 text-slate-500">
                <span className="font-medium text-slate-700">Мәселе. </span>
                {problem}
              </p>
              <p className="mt-3 flex-1 text-sm/6 text-slate-500">
                <span className="font-medium text-slate-700">Шешім. </span>
                {solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
