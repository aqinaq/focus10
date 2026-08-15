import {
  CalendarDays,
  Clock,
  Flame,
  FolderOpen,
  Hourglass,
  Shuffle,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useI18n } from '../../i18n/i18nContext'

/**
 * Диаграмма «қанша сағат» дегенді көрсетеді. Мұндағы қорытындылар «қашан
 * және қалай» дегенге жауап береді: соңғы 28 күндегі нақты жазбалардан
 * шығарылған заңдылық.
 *
 * Сандардың бәрі серверде есептеледі, мұнда тек тілге салынады: сөйлемнің
 * құрылымы қазақша мен ағылшыншада әртүрлі, сондықтан оны серверде құрастыру
 * қате болар еді.
 */
const ICONS = {
  peakWindow: Clock,
  trend: TrendingUp,
  streak: Flame,
  bestWeekday: CalendarDays,
  sessionLength: Hourglass,
  fragmentation: Shuffle,
  topProject: FolderOpen,
}

const hourLabel = (hour) => `${String(hour).padStart(2, '0')}:00`

export default function InsightsPanel({ data }) {
  const { t, formatDuration } = useI18n()

  if (!data) return null

  /** Әр қорытындының сөйлемі мен оған керек мәндері. */
  const sentenceFor = (insight) => {
    switch (insight.id) {
      case 'peakWindow':
        return t('insights.items.peakWindow', {
          from: hourLabel(insight.from),
          to: hourLabel(insight.to),
          share: insight.share,
        })
      case 'trend':
        return t(`insights.items.trend.${insight.direction}`, {
          percent: insight.percent,
          current: formatDuration(insight.this_week),
          previous: formatDuration(insight.prev_week),
        })
      case 'streak':
        return t('insights.items.streak', { days: insight.days })
      case 'bestWeekday':
        return t('insights.items.bestWeekday', {
          weekday: t('format.weekdaysLong')[insight.weekday],
          duration: formatDuration(insight.seconds),
        })
      case 'sessionLength':
        return t('insights.items.sessionLength', {
          median: formatDuration(insight.median),
          longest: formatDuration(insight.longest),
        })
      case 'fragmentation':
        return t('insights.items.fragmentation', {
          percent: insight.percent,
          sessions: insight.sessions,
        })
      case 'topProject':
        return t('insights.items.topProject', {
          project: insight.project,
          share: insight.share,
        })
      default:
        return null
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Sparkles className="size-4.5 text-brand-600 dark:text-brand-400" />
          {t('insights.title')}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('insights.sample', {
            days: data.window_days,
            sessions: data.sample.sessions,
          })}
        </p>
      </div>

      {data.ready ? (
        <>
          <HourStrip hours={data.hours} peak={data.insights.find((i) => i.id === 'peakWindow')} />

          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {data.insights.map((insight) => {
              // Тренд бағыты белгішені де өзгертеді
              const Icon =
                insight.id === 'trend' && insight.direction === 'down'
                  ? TrendingDown
                  : ICONS[insight.id]

              return (
                <li key={insight.id} className="flex items-start gap-3">
                  {Icon && (
                    <Icon className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                  )}
                  <p className="text-sm/6 text-pretty text-slate-600 dark:text-slate-400">
                    {sentenceFor(insight)}
                  </p>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm/6 text-pretty text-slate-500 dark:text-slate-400">
          {t('insights.notReady', {
            sessions: Math.max(1, data.needed.sessions),
          })}
        </p>
      )}
    </section>
  )
}

/**
 * Тәулік бойындағы таралу. Сағат сайынғы баған — ең жоғарғысы 100%.
 * Ең қауырт үш сағаттық терезе бөлектеніп тұрады: сөйлемдегі сан мен
 * суреттегі шың бір нәрсені көрсетіп тұрғаны бірден көрінуі керек.
 */
function HourStrip({ hours, peak }) {
  const { t, formatDuration } = useI18n()
  const top = Math.max(...hours, 1)

  const inPeak = (hour) => {
    if (!peak) return false
    // Терезе тәулік шегінен асып кетуі мүмкін (мысалы, 23:00–02:00)
    const offset = (hour - peak.from + 24) % 24
    return offset < 3
  }

  return (
    <div className="mt-5">
      <div className="flex h-16 items-end gap-px" aria-hidden="true">
        {hours.map((seconds, hour) => (
          <div
            key={hour}
            title={`${hourLabel(hour)} — ${formatDuration(seconds)}`}
            className="flex h-full flex-1 items-end"
          >
            <div
              className={`w-full rounded-sm ${
                seconds === 0
                  ? 'h-px bg-slate-200 dark:bg-slate-800'
                  : inPeak(hour)
                    ? 'bg-brand-600'
                    : 'bg-brand-100 dark:bg-brand-900'
              }`}
              style={seconds === 0 ? undefined : { height: `${Math.max(6, (seconds / top) * 100)}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
        {[0, 6, 12, 18, 23].map((hour) => (
          <span key={hour}>{hourLabel(hour)}</span>
        ))}
      </div>

      <p className="sr-only">{t('insights.stripAlt')}</p>
    </div>
  )
}
