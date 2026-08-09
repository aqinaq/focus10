import { useI18n } from '../../i18n/i18nContext'

export default function WeekChart({ days }) {
  const { formatDuration, weekdayLabel } = useI18n()
  const peak = Math.max(...days.map((day) => day.seconds), 1)

  return (
    <div className="flex h-40 items-end gap-2 sm:gap-3">
      {days.map((day, index) => {
        const isToday = index === days.length - 1
        // Дерегі бар күн 4%-дан кем көрінбеуі керек, әйтпесе баған жоғалады
        const height = day.seconds === 0 ? 0 : Math.max(4, (day.seconds / peak) * 100)

        return (
          <div
            key={day.day}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            title={`${day.day}: ${formatDuration(day.seconds)}`}
          >
            <span className="text-[10px] font-medium text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
              {formatDuration(day.seconds)}
            </span>
            <div className="flex w-full flex-1 items-end">
              {day.seconds === 0 ? (
                // Бос күн де көрінуі керек — әйтпесе диаграмма бұзылған
                // сияқты, бірде-бір баған жоқ бос орын болып қалады
                <div className="h-1 w-full rounded-full bg-slate-100" />
              ) : (
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isToday ? 'bg-brand-600' : 'bg-brand-100'
                  }`}
                  style={{ height: `${height}%` }}
                />
              )}
            </div>
            <span
              className={`text-xs ${
                isToday ? 'font-semibold text-slate-900' : 'text-slate-400'
              }`}
            >
              {weekdayLabel(day.day)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
