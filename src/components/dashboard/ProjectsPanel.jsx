import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n/i18nContext'

export default function ProjectsPanel({ projects, busy, onCreate, onDelete }) {
  const { t } = useI18n()
  const [name, setName] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const value = name.trim()
    if (value === '') return

    onCreate(value)
    setName('')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{t('projects.title')}</h2>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('projects.newPlaceholder')}
          maxLength={60}
          enterKeyHint="done"
          aria-label={t('projects.newAria')}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:py-2"
        />
        <button
          type="submit"
          disabled={busy || name.trim() === ''}
          aria-label={t('projects.add')}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          <Plus className="size-4" />
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{t('projects.empty')}</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {projects.map((project) => (
            <li key={project.id} className="group flex items-center gap-3 py-1.5 sm:py-2.5">
              <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
                {project.name}
              </span>
              <span className="shrink-0 text-xs text-slate-400">
                {t('projects.openCount', { count: project.open_tasks })}
              </span>
              <button
                type="button"
                onClick={() => onDelete(project)}
                disabled={busy}
                aria-label={t('projects.deleteAria', { name: project.name })}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:size-7"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-slate-400">{t('projects.note')}</p>
    </section>
  )
}
