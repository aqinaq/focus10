import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Pause, Play, RotateCcw } from 'lucide-react'
import Modal from './Modal'
import { useUI } from '../context/uiContext'

/**
 * Қадамдардың `area` мәні — Hero-дағы нағыз скриншоттың қай бөлігі
 * ерекшеленетіні (сурет өлшеміне қатысты пайызбен).
 */
const steps = [
  {
    title: 'Таймерді бір басумен қос',
    body: 'Тапсырманың жанындағы ▶ батырмасын бас — уақыт сол тапсырмаға жазыла бастайды.',
    area: { left: 9, top: 14.5, width: 81.5, height: 14.5 },
  },
  {
    title: 'Тапсырмаңды жинақта',
    body: 'Жобаға тіркеп, күйі мен жобасы бойынша сүзгіле. Аяқтағанда таймері өзі тоқтайды.',
    area: { left: 9, top: 48, width: 54, height: 51 },
  },
  {
    title: 'Апталық статистиканы көр',
    body: 'Уақытыңның қай жобаға кеткенін диаграммадан бір қарағанда танисың.',
    area: { left: 64.5, top: 48, width: 26, height: 48.5 },
  },
  {
    title: 'Есепті CSV-ге жүкте',
    body: '7 күн, 30 күн немесе бүкіл тарихты бір файлмен алып, клиентке жібере сал.',
    area: { left: 82.5, top: 50.5, width: 8, height: 5 },
  },
]

const STEP_MS = 3200

export default function DemoModal({ open, onClose }) {
  const { openSignup } = useUI()
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (open) {
      setStep(0)
      setPlaying(true)
    }
  }, [open])

  useEffect(() => {
    if (!open || !playing) return

    const timer = setTimeout(() => {
      setStep((current) => {
        if (current === steps.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, STEP_MS)

    return () => clearTimeout(timer)
  }, [open, playing, step])

  const restart = useCallback(() => {
    setStep(0)
    setPlaying(true)
  }, [])

  const finished = !playing && step === steps.length - 1
  const area = steps[step].area

  return (
    <Modal open={open} onClose={onClose} label="FocusFlow демосы" size="max-w-3xl">
      <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
        Демо
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        FocusFlow қалай жұмыс істейді
      </h2>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <img
          src="/app-dashboard.png"
          width={2720}
          height={1640}
          alt="FocusFlow қолданбасының басты экраны"
          className="block w-full"
        />

        {/* Ішкі көлеңке арқылы қалған бөлікті күңгірттеп, керегін ашамыз */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-lg ring-2 ring-brand-500 transition-all duration-500 ease-out"
          style={{
            left: `${area.left}%`,
            top: `${area.top}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            boxShadow: '0 0 0 9999px rgb(15 23 42 / 0.45)',
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Жоғарыдағы — қолданбаның нағыз экран суреті, мысал аккаунттың
        деректерімен.
      </p>

      {/* қадам индикаторы */}
      <div className="mt-4 flex gap-2">
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              setStep(index)
              setPlaying(false)
            }}
            aria-label={`${index + 1}-қадам: ${item.title}`}
            aria-current={index === step ? 'step' : undefined}
            className="group flex-1 py-2"
          >
            <span
              className={`block h-1 rounded-full transition-colors ${
                index <= step
                  ? 'bg-brand-600'
                  : 'bg-slate-200 group-hover:bg-slate-300'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-h-20 flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {step + 1}. {steps[step].title}
          </h3>
          <p className="mt-1 text-sm/6 text-slate-600">{steps[step].body}</p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={finished ? restart : () => setPlaying((v) => !v)}
            data-autofocus
            aria-label={finished ? 'Қайта ойнату' : playing ? 'Кідірту' : 'Ойнату'}
            className="flex size-11 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50"
          >
            {finished ? (
              <RotateCcw className="size-4" />
            ) : playing ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              openSignup()
            }}
            className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Тегін бастау
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
