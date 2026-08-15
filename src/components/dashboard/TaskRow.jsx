import { useEffect, useRef, useState } from 'react'
import { Check, Pause, Pencil, Play, Trash2, X } from 'lucide-react'
import { useI18n } from '../../i18n/i18nContext'
import { ESTIMATE_CHOICES, PRIORITY_CHOICES } from '../../lib/dates'

export default function TaskRow({
  task,
  today,
  busy,
  onToggle,
  onRename,
  onUpdate,
  onStart,
  onStop,
  onDelete,
}) {
  const { t, formatDuration, formatDate } = useI18n()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const save = () => {
    const value = draft.trim()
    setEditing(false)

    if (value === '' || value === task.title) {
      setDraft(task.title)
      return
    }
    onRename(value)
  }

  const cancel = () => {
    setDraft(task.title)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="py-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            maxLength={200}
            enterKeyHint="done"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') save()
              if (event.key === 'Escape') cancel()
            }}
            aria-label={t('task.editAria')}
            className="min-w-0 flex-1 rounded-lg border border-brand-500 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100 dark:text-slate-100 dark:focus:ring-brand-900"
          />
          <button
            type="button"
            onClick={save}
            aria-label={t('task.saveEdit')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 sm:size-8"
          >
            <Check className="size-4" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={cancel}
            aria-label={t('common.cancel')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 sm:size-8"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Жоспарлау өрістері осы жерде тұрады: тапсырманы қосқан сәтте
            бәрін білу міндет емес, кейін толықтыруға болады */}
        <PlanningFields task={task} busy={busy} onUpdate={onUpdate} />
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-2 py-2 sm:gap-3 sm:py-3">
      {/* Белгіше көзге кішкентай, бірақ before-арқылы тию аймағы кеңейтілген —
          саусақпен дәл түсу үшін */}
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        aria-label={task.done ? t('task.markUndone') : t('task.markDone')}
        aria-pressed={task.done}
        className={`relative flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors before:absolute before:-inset-2.5 before:content-[''] disabled:opacity-50 sm:before:hidden ${
          task.done
            ? 'border-brand-600 bg-brand-600'
            : 'border-slate-300 hover:border-brand-500 dark:border-slate-600'
        }`}
      >
        {task.done && <Check className="size-3 text-white" strokeWidth={3.5} />}
      </button>

      <button
        type="button"
        onClick={() => setEditing(true)}
        title={t('task.editTitle')}
        className="min-w-0 flex-1 py-1 text-left"
      >
        <span
          className={`block truncate text-sm ${
            task.done
              ? 'text-slate-400 line-through dark:text-slate-500'
              : 'font-medium text-slate-900 dark:text-slate-100'
          }`}
        >
          {/* Міндетті іс тізімнен бөлініп тұруы керек */}
          {!task.done && task.priority === 1 && (
            <span className="mr-1.5 text-brand-600 dark:text-brand-400">●</span>
          )}
          {task.title}
        </span>

        {/* Мобильде жоба таңбашасына орын жоқ — атын аттың астына жазамыз */}
        <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          {task.project_name && (
            <span className="truncate sm:hidden">{task.project_name}</span>
          )}
          {task.estimate_minutes !== null && (
            <span className="shrink-0 tabular-nums">
              {formatDuration(task.estimate_minutes * 60)}
            </span>
          )}
          {task.due_date && !task.done && (
            <DueLabel due={task.due_date} today={today} format={formatDate} />
          )}
        </span>
      </button>

      {/* Тек тінтуірмен көрінеді — сенсорлы экранда hover жоқ, сондықтан жасырамыз */}
      <Pencil className="hidden size-3.5 shrink-0 text-slate-300 opacity-0 dark:text-slate-600 transition-opacity group-hover:opacity-100 sm:block" />

      {task.project_name && (
        <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline">
          {task.project_name}
        </span>
      )}

      <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-slate-500">
        {formatDuration(task.tracked_seconds)}
      </span>

      {!task.done && (
        <button
          type="button"
          onClick={task.running ? onStop : onStart}
          disabled={busy}
          aria-label={task.running ? t('task.stopTimer') : t('task.startTimer')}
          className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 sm:size-8 ${
            task.running
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          {task.running ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
        </button>
      )}

      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        aria-label={t('task.delete')}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 sm:size-8"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  )
}

/**
 * Мерзім. Күні өтіп кетсе қызыл, бүгін-ертең болса сары: адам тізімге
 * қарағанда қайсысының уақыты жетіп қалғанын оқымай-ақ көруі керек.
 */
function DueLabel({ due, today, format }) {
  const { t } = useI18n()

  if (!today) return <span className="shrink-0">{format(due)}</span>

  const overdue = due < today
  const label =
    due === today
      ? t('plan.due.today')
      : due < today
        ? t('plan.due.overdue')
        : format(due)

  return (
    <span
      className={`shrink-0 ${
        overdue
          ? 'font-medium text-red-600 dark:text-red-400'
          : due === today
            ? 'font-medium text-amber-600 dark:text-amber-400'
            : ''
      }`}
    >
      {label}
    </span>
  )
}

/** Баға, маңыздылық, мерзім — үшеуі де бірден сақталады. */
function PlanningFields({ task, busy, onUpdate }) {
  const { t, formatDuration } = useI18n()

  const select =
    'rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
      <select
        value={task.estimate_minutes ?? ''}
        disabled={busy}
        onChange={(event) =>
          onUpdate({
            estimate_minutes: event.target.value === '' ? null : Number(event.target.value),
          })
        }
        aria-label={t('plan.fields.estimate')}
        className={select}
      >
        <option value="">{t('plan.fields.noEstimate')}</option>
        {ESTIMATE_CHOICES.map((minutes) => (
          <option key={minutes} value={minutes}>
            {formatDuration(minutes * 60)}
          </option>
        ))}
      </select>

      <select
        value={task.priority}
        disabled={busy}
        onChange={(event) => onUpdate({ priority: Number(event.target.value) })}
        aria-label={t('plan.fields.priority')}
        className={select}
      >
        {PRIORITY_CHOICES.map((priority) => (
          <option key={priority} value={priority}>
            {t(`plan.priority.${priority}`)}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={task.due_date ?? ''}
        disabled={busy}
        onChange={(event) => onUpdate({ due_date: event.target.value || null })}
        aria-label={t('plan.fields.due')}
        className={select}
      />
    </div>
  )
}
