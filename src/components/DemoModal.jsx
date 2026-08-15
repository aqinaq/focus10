import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Pause, Play, RotateCcw } from 'lucide-react'
import Modal from './Modal'
import { useUI } from '../context/uiContext'
import { useI18n } from '../i18n/i18nContext'

/**
 * `area` — Hero-дағы нағыз скриншоттың қай бөлігі ерекшеленетіні (сурет
 * өлшеміне қатысты пайызбен). Реті аудармадағы `demo.steps` тізімімен
 * сәйкес келеді.
 */
const areas = [
  { left: 9, top: 14.5, width: 81.5, height: 14.5 },
  { left: 9, top: 48, width: 54, height: 51 },
  { left: 64.5, top: 48, width: 26, height: 48.5 },
  { left: 82.5, top: 50.5, width: 8, height: 5 },
]

const STEP_MS = 3200

export default function DemoModal({ open, onClose }) {
  const { openSignup } = useUI()
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  const steps = t('demo.steps')

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
        if (current === areas.length - 1) {
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

  const finished = !playing && step === areas.length - 1
  const area = areas[step]

  return (
    <Modal open={open} onClose={onClose} label={t('demo.label')} size="max-w-3xl">
      <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase sm:text-sm dark:text-brand-400">
        {t('demo.eyebrow')}
      </p>
      <h2 className="mt-2 pr-10 text-xl font-semibold tracking-tight text-balance text-slate-900 sm:pr-0 sm:text-2xl dark:text-slate-100">
        {t('demo.title')}
      </h2>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 sm:mt-6">
        <img
          src="/app-dashboard.png"
          width={2720}
          height={1640}
          alt={t('demo.imageAlt')}
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
            boxShadow: '0 0 0 9999px var(--scrim)',
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{t('demo.imageNote')}</p>

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
            aria-label={t('demo.stepAria', { index: index + 1, title: item.title })}
            aria-current={index === step ? 'step' : undefined}
            className="group flex-1 py-2"
          >
            <span
              className={`block h-1 rounded-full transition-colors ${
                index <= step
                  ? 'bg-brand-600'
                  : 'bg-slate-200 group-hover:bg-slate-300 dark:bg-slate-700 dark:group-hover:bg-slate-600'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 sm:min-h-20">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {step + 1}. {steps[step].title}
          </h3>
          <p className="mt-1 text-sm/6 text-slate-600 dark:text-slate-400">{steps[step].body}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={finished ? restart : () => setPlaying((v) => !v)}
            data-autofocus
            aria-label={
              finished ? t('demo.replay') : playing ? t('demo.pause') : t('demo.play')
            }
            className="flex size-11 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:flex-none"
          >
            {t('demo.cta')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
