import { useState } from 'react'
import { Check, Clock } from 'lucide-react'
import { useUI } from '../context/uiContext'

// planned: true — әлі жасалмаған мүмкіндік. Тізімде «жоспарда» деп
// белгіленеді, әйтпесе жоқ нәрсені бар қылып көрсеткен болар едік.
const plans = [
  {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    tagline: 'Жеке жобаңды енді бастап жүрсең.',
    cta: 'Тегін бастау',
    popular: false,
    features: [
      { text: 'Шексіз жоба және тапсырма' },
      { text: 'Таймер, апталық есеп' },
      { text: 'CSV экспорт' },
      { text: 'Деректі жүктеу және аккаунтты жою' },
    ],
  },
  {
    name: 'Pro',
    monthly: 12,
    yearly: 10,
    tagline: 'Клиентпен жұмыс істейтін фрилансерлерге.',
    cta: 'Pro-ны таңдау',
    popular: true,
    features: [
      { text: 'Free ішіндегінің бәрі' },
      { text: 'Шот-фактура шығару', planned: true },
      { text: 'PDF есеп', planned: true },
      { text: 'Күнтізбе синхронизациясы', planned: true },
      { text: 'Приоритетті қолдау', planned: true },
    ],
  },
  {
    name: 'Team',
    monthly: 29,
    yearly: 24,
    tagline: 'Бірге жұмыс істейтін шағын командаға.',
    cta: 'Командамен бастау',
    popular: false,
    features: [
      { text: 'Pro ішіндегінің бәрі' },
      { text: 'Ортақ жоба және жүктеме панелі', planned: true },
      { text: 'Рөлдер мен рұқсаттар', planned: true },
      { text: 'SSO және аудит журналы', planned: true },
    ],
  },
]

export default function Pricing() {
  const { openSignup } = useUI()
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Қарапайым әрі ашық баға
          </h2>
          <p className="mt-6 text-lg text-pretty text-slate-600">
            Қазір барлық мүмкіндік ақысыз. Төмендегі баға — төлем жүйесі
            қосылғандағы жоспар.
          </p>
        </div>

        {/* ай / жыл ауыстырғышы */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <div
            role="group"
            aria-label="Төлем кезеңі"
            className="inline-flex rounded-full bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                yearly ? 'text-slate-600 hover:text-slate-900' : 'bg-white text-slate-900 shadow-sm'
              }`}
            >
              Ай сайын
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                yearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Жыл сайын
            </button>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            2 ай тегін
          </span>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Төлем жүйесі әлі қосылған жоқ —{' '}
          <span className="font-medium text-slate-900">
            қазір барлық тариф тегін
          </span>
          . <Clock className="inline size-3.5 text-slate-400" /> белгісі
          мүмкіндіктің әлі жасалмағанын білдіреді.
        </p>

        <div className="mx-auto mt-14 grid max-w-md grid-cols-1 items-start gap-8 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-slate-900 shadow-2xl shadow-slate-900/20 lg:-mt-4 lg:pb-12'
                    : 'border border-slate-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
                    Popular
                  </span>
                )}

                <h3
                  className={`text-lg font-semibold ${
                    plan.popular ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-2 text-sm/6 ${
                    plan.popular ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {plan.tagline}
                </p>

                <p className="mt-6 flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-semibold tracking-tight tabular-nums ${
                      plan.popular ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    ${price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.popular ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    /айына
                  </span>
                </p>
                <p
                  className={`mt-2 h-5 text-xs ${
                    plan.popular ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {yearly && price > 0
                    ? `Жылына $${price * 12} — $${(plan.monthly - price) * 12} үнемдейсің`
                    : ''}
                </p>

                <button
                  type="button"
                  onClick={() => openSignup(plan.name)}
                  className={`mt-6 rounded-full px-5 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-brand-600 text-white hover:bg-brand-500'
                      : 'bg-slate-900 text-white hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex gap-3">
                      {feature.planned ? (
                        <Clock
                          className={`mt-0.5 size-5 shrink-0 ${
                            plan.popular ? 'text-slate-500' : 'text-slate-300'
                          }`}
                        />
                      ) : (
                        <Check
                          className={`mt-0.5 size-5 shrink-0 ${
                            plan.popular ? 'text-brand-400' : 'text-brand-600'
                          }`}
                          strokeWidth={2.5}
                        />
                      )}
                      <span
                        className={`text-sm/6 ${
                          feature.planned
                            ? plan.popular
                              ? 'text-slate-500'
                              : 'text-slate-400'
                            : plan.popular
                              ? 'text-slate-300'
                              : 'text-slate-600'
                        }`}
                      >
                        {feature.text}
                        {feature.planned && (
                          <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                              plan.popular
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            жоспарда
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
