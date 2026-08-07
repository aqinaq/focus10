import { useEffect, useRef, useState } from 'react'
import { Check, Pause, Pencil, Play, Trash2, X } from 'lucide-react'
import { formatDuration } from '../../lib/format'

export default function TaskRow({
  task,
  busy,
  onToggle,
  onRename,
  onStart,
  onStop,
  onDelete,
}) {
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
      <li className="flex items-center gap-2 py-2">
        <input
          ref={inputRef}
          value={draft}
          maxLength={200}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === 'Enter') save()
            if (event.key === 'Escape') cancel()
          }}
          aria-label="Тапсырма атын өңдеу"
          className="min-w-0 flex-1 rounded-lg border border-brand-500 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancel}
          aria-label="Болдырмау"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
        >
          <X className="size-4" />
        </button>
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        aria-label={task.done ? 'Аяқталмаған деп белгілеу' : 'Аяқталды деп белгілеу'}
        aria-pressed={task.done}
        className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors disabled:opacity-50 ${
          task.done
            ? 'border-brand-600 bg-brand-600'
            : 'border-slate-300 hover:border-brand-500'
        }`}
      >
        {task.done && <Check className="size-3 text-white" strokeWidth={3.5} />}
      </button>

      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Өңдеу үшін бас"
        className={`min-w-0 flex-1 truncate text-left text-sm ${
          task.done ? 'text-slate-400 line-through' : 'font-medium text-slate-900'
        }`}
      >
        {task.title}
      </button>

      <Pencil className="size-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />

      {task.project_name && (
        <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 sm:inline">
          {task.project_name}
        </span>
      )}

      <span className="shrink-0 text-xs tabular-nums text-slate-400">
        {formatDuration(task.tracked_seconds)}
      </span>

      {!task.done && (
        <button
          type="button"
          onClick={task.running ? onStop : onStart}
          disabled={busy}
          aria-label={task.running ? 'Таймерді тоқтату' : 'Таймерді қосу'}
          className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
            task.running
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
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
        aria-label="Тапсырманы жою"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  )
}
