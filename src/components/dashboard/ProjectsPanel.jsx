import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function ProjectsPanel({ projects, busy, onCreate, onDelete }) {
  const [name, setName] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const value = name.trim()
    if (value === '') return

    onCreate(value)
    setName('')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Жобалар</h2>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Жаңа жоба…"
          maxLength={60}
          aria-label="Жаңа жобаның аты"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={busy || name.trim() === ''}
          aria-label="Жоба қосу"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          <Plus className="size-4" />
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Әзірге жоба жоқ.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {projects.map((project) => (
            <li key={project.id} className="group flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
                {project.name}
              </span>
              <span className="shrink-0 text-xs text-slate-400">
                {project.open_tasks} ашық
              </span>
              <button
                type="button"
                onClick={() => onDelete(project)}
                disabled={busy}
                aria-label={`«${project.name}» жобасын жою`}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Жобаны жойғанда тапсырмалары сақталады — олар «Жобасыз» болып қалады.
      </p>
    </section>
  )
}
