import { useState } from 'react'
import {
  AlarmClock,
  Check,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Sunrise,
  TriangleAlert,
} from 'lucide-react'
import { useI18n } from '../../i18n/i18nContext'

/**
 * Күндік жоспар. Күні екі сұрақтан басталады: «бүгін қанша уақытым бар?»
 * — соған жауап берілгеннен кейін «нені істеймін?» дегенді қосымша өзі
 * шешеді.
 *
 * Мұндағы ең маңызды шешім — уақытты аз деп айтқаны үшін ешкім жазғырылмайды.
 * 25 минут та жарамды жауап: сонда жоспарда бір ғана іс тұрады, қалғаны
 * келесі күндерге жайылады. Кінәлау адамды қосымшадан қашырады, ал ол
 * жоспарлаудың мақсаты емес.
 */
export default function PlanPanel({ data, busy, onCheckIn, onClear, onStart, onStop }) {
  const { formatDuration } = useI18n()
  const [custom, setCustom] = useState('')

  if (!data) return null

  // Жоспарлағыш минутпен жұмыс істейді, ал форматтағыш секундпен
  const duration = (minutes) => formatDuration(Math.round(minutes) * 60)

  const submitCustom = (event) => {
    event.preventDefault()
    const hours = Number(custom.replace(',', '.'))
    if (!Number.isFinite(hours) || hours <= 0) return

    onCheckIn(Math.max(10, Math.round((hours * 60) / 5) * 5))
    setCustom('')
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-6">
      {data.plan ? (
        <TodayPlan
          plan={data.plan}
          busy={busy}
          duration={duration}
          onClear={onClear}
          onStart={onStart}
          onStop={onStop}
        />
      ) : (
        <CheckIn
          data={data}
          busy={busy}
          duration={duration}
          custom={custom}
          setCustom={setCustom}
          onCheckIn={onCheckIn}
          onSubmitCustom={submitCustom}
        />
      )}

      <Outlook outlook={data.outlook} duration={duration} />

      {/* Жоспарға кірмегендер бөлек тұрады: бүгінгі тізім таза күйінде
          қалуы керек, бірақ ұмыт қалған іс жоқ екенін де көрсету керек */}
      {data.backlog.length > 0 && (
        <Backlog items={data.backlog} duration={duration} />
      )}
    </section>
  )
}

/** Таңғы (немесе түстен кейінгі) сұрақ. */
function CheckIn({ data, busy, duration, custom, setCustom, onCheckIn, onSubmitCustom }) {
  const { t } = useI18n()
  const partOfDay = data.hour < 12 ? 'morning' : data.hour < 18 ? 'afternoon' : 'evening'

  return (
    <>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        <Sunrise className="size-4.5 text-brand-600 dark:text-brand-400" />
        {t('plan.checkIn.title')}
      </h2>

      <p className="mt-2 text-sm/6 text-pretty text-slate-500 dark:text-slate-400">
        {t(`plan.checkIn.${partOfDay}`)} {t('plan.checkIn.body')}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onCheckIn(preset.minutes)}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-left transition-colors hover:border-brand-500 hover:bg-brand-50 disabled:opacity-50 dark:border-slate-700 dark:hover:border-brand-500 dark:hover:bg-brand-950/40 sm:py-2.5"
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t(`plan.presets.${preset.id}`)}
            </span>
            <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
              {duration(preset.minutes)}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmitCustom} className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-slate-400 dark:text-slate-500" htmlFor="plan-custom">
          {t('plan.checkIn.customLabel')}
        </label>
        <input
          id="plan-custom"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          inputMode="decimal"
          placeholder="1.5"
          className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none focus:border-brand-500 dark:border-slate-700 dark:text-slate-100"
        />
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {t('plan.checkIn.customUnit')}
        </span>
        <button
          type="submit"
          disabled={busy || custom.trim() === ''}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {t('plan.checkIn.submit')}
        </button>
      </form>
    </>
  )
}

/** Құрылған жоспар: не істеу керек, қаншасы өтті. */
function TodayPlan({ plan, busy, duration, onClear, onStart, onStop }) {
  const { t } = useI18n()
  const percent =
    plan.planned_minutes === 0
      ? 0
      : Math.min(100, Math.round((plan.done_minutes / plan.planned_minutes) * 100))
  const complete = plan.planned_minutes > 0 && plan.done_minutes >= plan.planned_minutes

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <AlarmClock className="size-4.5 text-brand-600 dark:text-brand-400" />
          {t('plan.title')}
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50 dark:text-slate-500 dark:hover:text-slate-200"
        >
          <RotateCcw className="size-3.5" />
          {t('plan.replan')}
        </button>
      </div>

      {plan.items.length === 0 ? (
        <p className="mt-3 text-sm/6 text-pretty text-slate-500 dark:text-slate-400">
          {t('plan.emptyItems')}
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('plan.progress', {
              done: duration(plan.done_minutes),
              planned: duration(plan.planned_minutes),
              capacity: duration(plan.capacity_minutes),
            })}
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
            {plan.items.map((item, index) => (
              <PlanItem
                key={item.task_id}
                item={item}
                index={index}
                busy={busy}
                duration={duration}
                onStart={() => onStart(item.task_id)}
                onStop={onStop}
              />
            ))}
          </ul>

          {complete && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm/6 text-pretty text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
              <Check className="mt-0.5 size-4 shrink-0" strokeWidth={3} />
              {t('plan.allDone')}
            </p>
          )}
        </>
      )}

      {/* Күні бойы қанша уақыт «сұралғаны» есте тұрсын: кешке қарай жоспар
          неге қысқа болғаны түсінікті болады */}
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        {t('plan.capacityNote', { capacity: duration(plan.capacity_minutes) })}
        {plan.spare_minutes > 0 && plan.items.length > 0
          ? ` ${t('plan.spare', { spare: duration(plan.spare_minutes) })}`
          : ''}
      </p>
    </>
  )
}

function PlanItem({ item, index, busy, duration, onStart, onStop }) {
  const { t } = useI18n()

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="w-4 shrink-0 text-xs font-semibold tabular-nums text-slate-300 dark:text-slate-600">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p
            className={`min-w-0 truncate text-sm font-medium ${
              item.done
                ? 'text-slate-400 line-through dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {item.title}
          </p>
          <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-slate-500">
            {duration(item.minutes)}
          </span>
          {item.reason !== 'pace' && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                item.reason === 'overdue'
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
              }`}
            >
              {t(`plan.reasons.${item.reason}`)}
            </span>
          )}
        </div>

        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${item.done ? 'bg-slate-300 dark:bg-slate-600' : 'bg-brand-500'}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>

        <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">
          {item.done
            ? t('plan.itemDone')
            : t('plan.itemProgress', { done: duration(item.done_minutes) })}
          {item.project_name ? ` · ${item.project_name}` : ''}
        </p>
      </div>

      {!item.done && (
        <button
          type="button"
          onClick={item.running ? onStop : onStart}
          disabled={busy}
          aria-label={item.running ? t('task.stopTimer') : t('task.startTimer')}
          className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 sm:size-8 ${
            item.running
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          {item.running ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
        </button>
      )}
    </li>
  )
}

/**
 * Аптаның (керек болса — айдың) қалай тұрғаны. Мұнда жұбату жоқ: қалғаны
 * қалған күндерге сыймаса, оны бүгін білген дұрыс — сонда мерзімді жылжытуға
 * да, бір істен бас тартуға да әлі уақыт бар.
 */
function Outlook({ outlook, duration }) {
  const { t } = useI18n()
  const { week, month } = outlook

  if (week.tasks === 0 && month.tasks === 0) return null

  const tone = {
    ok: 'text-slate-500 dark:text-slate-400',
    tight: 'text-amber-700 dark:text-amber-300',
    over: 'text-red-700 dark:text-red-300',
  }

  const line = (horizon, key) =>
    t(`plan.outlook.${key}.${horizon.verdict}`, {
      needed: duration(horizon.needed_minutes),
      days: horizon.days_left,
      perDay: duration(horizon.per_day_minutes),
      tasks: horizon.tasks,
      over: duration(horizon.over_by_minutes),
    })

  return (
    <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
      {week.tasks > 0 && (
        <p className={`text-sm/6 text-pretty ${tone[week.verdict]}`}>{line(week, 'week')}</p>
      )}
      {/* Айлық жол тек апталықтан тыс жұмыс болғанда ғана мағыналы */}
      {month.needed_minutes > week.needed_minutes && (
        <p className={`text-sm/6 text-pretty ${tone[month.verdict]}`}>
          {line(month, 'month')}
        </p>
      )}
    </div>
  )
}

/** Бүгінге кірмей қалғандар — тізім емес, қысқа ескертпе. */
function Backlog({ items, duration }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const risky = items.filter((item) => item.at_risk)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
      >
        <ChevronRight className={`size-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
        {t('plan.backlog.title', { count: items.length })}
      </button>

      {risky.length > 0 && !open && (
        <p className="mt-1 flex items-start gap-1.5 text-xs/5 text-pretty text-amber-700 dark:text-amber-300">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          {t('plan.backlog.riskySummary', { count: risky.length })}
        </p>
      )}

      {open && (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li
              key={item.task_id}
              className="flex items-baseline justify-between gap-3 text-xs"
            >
              <span className="min-w-0 truncate text-slate-500 dark:text-slate-400">
                {item.at_risk && (
                  <TriangleAlert className="mr-1 inline size-3 -translate-y-px text-amber-600 dark:text-amber-400" />
                )}
                {item.title}
              </span>
              <span className="shrink-0 tabular-nums text-slate-400 dark:text-slate-500">
                {t('plan.backlog.left', {
                  duration: duration(item.remaining_minutes),
                  days: item.days_left,
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
