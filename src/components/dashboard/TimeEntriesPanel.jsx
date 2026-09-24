import { useCallback, useEffect, useState } from 'react'
import { Check, Clock3, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api'
import { useI18n } from '../../i18n/i18nContext'
import { useUI } from '../../context/uiContext'

const localInputValue = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

const payloadFrom = ({ taskId, startedAt, minutes }) => ({
  task_id: Number(taskId),
  started_at: new Date(startedAt).toISOString(),
  duration_minutes: Number(minutes),
})

export default function TimeEntriesPanel({ tasks, busy, onChange }) {
  const { t, lang, formatDuration } = useI18n()
  const { notify } = useUI()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({
    taskId: '',
    startedAt: localInputValue(),
    minutes: '30',
  })

  const load = useCallback(async () => {
    const data = await api.timeEntries()
    setEntries(data.entries)
  }, [])

  useEffect(() => {
    load().catch((error) => notify(error.message)).finally(() => setLoading(false))
  }, [load, notify])

  useEffect(() => {
    if (form.taskId === '' && tasks[0]) {
      setForm((current) => ({ ...current, taskId: String(tasks[0].id) }))
    }
  }, [form.taskId, tasks])

  const run = async (action) => {
    setSaving(true)
    try {
      await onChange(action)
      await load()
      setEditing(null)
      setConfirmDelete(null)
    } catch (error) {
      notify(error.message)
    } finally {
      setSaving(false)
    }
  }

  const add = (event) => {
    event.preventDefault()
    if (!form.taskId || !form.startedAt || Number(form.minutes) < 1) return
    run(() => api.createTimeEntry(payloadFrom(form))).then(() => {
      setForm((current) => ({ ...current, startedAt: localInputValue(), minutes: '30' }))
    })
  }

  const startEdit = (entry) => {
    setConfirmDelete(null)
    setEditing({
      id: entry.id,
      taskId: String(entry.task_id),
      startedAt: localInputValue(entry.started_at),
      minutes: String(Math.max(1, Math.round(entry.seconds / 60))),
    })
  }

  const dateTime = (value) =>
    new Intl.DateTimeFormat(lang === 'kk' ? 'kk-KZ' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))

  const disabled = busy || saving

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-6">
      <div className="flex items-start gap-3">
        <Clock3 className="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('timeEntries.title')}
          </h2>
          <p className="mt-1 text-sm/6 text-slate-500 dark:text-slate-400">
            {t('timeEntries.body')}
          </p>
        </div>
      </div>

      <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_7rem_auto]">
        <select
          value={form.taskId}
          onChange={(event) => setForm({ ...form, taskId: event.target.value })}
          aria-label={t('timeEntries.task')}
          disabled={disabled || tasks.length === 0}
          className="min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
        >
          {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
        </select>
        <input
          type="datetime-local"
          value={form.startedAt}
          onChange={(event) => setForm({ ...form, startedAt: event.target.value })}
          aria-label={t('timeEntries.startedAt')}
          disabled={disabled}
          className="min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
        />
        <input
          type="number"
          min="1"
          max="1440"
          value={form.minutes}
          onChange={(event) => setForm({ ...form, minutes: event.target.value })}
          aria-label={t('timeEntries.minutes')}
          disabled={disabled}
          className="min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
        />
        <button
          type="submit"
          disabled={disabled || tasks.length === 0 || !form.startedAt || Number(form.minutes) < 1}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {t('timeEntries.add')}
        </button>
      </form>

      {loading ? (
        <p className="mt-5 text-sm text-slate-400">{t('common.loading')}</p>
      ) : entries.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{t('timeEntries.empty')}</p>
      ) : (
        <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
          {entries.map((entry) => (
            <li key={entry.id} className="py-3">
              {editing?.id === entry.id ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_7rem_auto]">
                  <select
                    value={editing.taskId}
                    onChange={(event) => setEditing({ ...editing, taskId: event.target.value })}
                    aria-label={t('timeEntries.task')}
                    className="min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-sm dark:border-slate-700 dark:text-slate-300"
                  >
                    {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
                  </select>
                  <input
                    type="datetime-local"
                    value={editing.startedAt}
                    onChange={(event) => setEditing({ ...editing, startedAt: event.target.value })}
                    aria-label={t('timeEntries.startedAt')}
                    className="min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-sm dark:border-slate-700 dark:text-slate-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={editing.minutes}
                    onChange={(event) => setEditing({ ...editing, minutes: event.target.value })}
                    aria-label={t('timeEntries.minutes')}
                    className="min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-sm dark:border-slate-700 dark:text-slate-300"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => run(() => api.updateTimeEntry(entry.id, payloadFrom(editing)))}
                      disabled={disabled}
                      aria-label={t('common.save')}
                      className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white disabled:opacity-50"
                    ><Check className="size-4" /></button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      aria-label={t('common.cancel')}
                      className="flex size-9 items-center justify-center rounded-lg border border-slate-300 text-slate-500 dark:border-slate-700"
                    ><X className="size-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{entry.task_title}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                      {dateTime(entry.started_at)}{entry.project_name ? ` · ${entry.project_name}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-slate-700 dark:text-slate-300">{formatDuration(entry.seconds)}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(entry)}
                    aria-label={t('timeEntries.edit')}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  ><Pencil className="size-3.5" /></button>
                  <button
                    type="button"
                    onClick={() => confirmDelete === entry.id
                      ? run(() => api.deleteTimeEntry(entry.id))
                      : setConfirmDelete(entry.id)}
                    disabled={disabled}
                    aria-label={confirmDelete === entry.id ? t('timeEntries.confirmDelete') : t('timeEntries.delete')}
                    className={`flex h-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${confirmDelete === entry.id ? 'px-3 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300' : 'w-9 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40'}`}
                  >{confirmDelete === entry.id ? t('timeEntries.confirm') : <Trash2 className="size-3.5" />}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
