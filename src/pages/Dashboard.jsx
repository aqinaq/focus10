import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Loader2, Plus, Settings, Square, Timer } from 'lucide-react'
import { api } from '../lib/api'
import { formatClock, formatDuration } from '../lib/format'
import { useAuth } from '../context/authContext'
import { useUI } from '../context/uiContext'
import WeekChart from '../components/dashboard/WeekChart'
import TaskRow from '../components/dashboard/TaskRow'
import ProjectsPanel from '../components/dashboard/ProjectsPanel'
import UserMenu from '../components/dashboard/UserMenu'

const FILTERS = [
  { id: 'open', label: 'Ашық' },
  { id: 'done', label: 'Аяқталған' },
  { id: 'all', label: 'Барлығы' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { notify } = useUI()

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [report, setReport] = useState(null)
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [filter, setFilter] = useState('open')
  const [projectFilter, setProjectFilter] = useState('all')

  // Жүріп тұрған таймердің секундын клиентте өсіріп отырамыз
  const [elapsed, setElapsed] = useState(0)
  const startedAtRef = useRef(null)

  const loadAll = useCallback(async () => {
    const [taskData, projectData, reportData, timerData] = await Promise.all([
      api.tasks(),
      api.projects(),
      api.week(),
      api.timer(),
    ])

    setTasks(taskData.tasks)
    setProjects(projectData.projects)
    setReport(reportData)
    setActive(timerData.active)
  }, [])

  useEffect(() => {
    loadAll()
      .catch((error) => notify(error.message))
      .finally(() => setLoading(false))
  }, [loadAll, notify])

  // Серверден келген elapsed-ті бастапқы нүкте етіп аламыз да, әрі қарай
  // жергілікті сағатпен санаймыз — әр секунд сайын сұраныс жасамау үшін.
  useEffect(() => {
    if (!active) {
      setElapsed(0)
      startedAtRef.current = null
      return
    }

    startedAtRef.current = Date.now() - active.elapsed * 1000
    setElapsed(active.elapsed)

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)

    return () => clearInterval(id)
  }, [active])

  // Бет фонда тұрғанда таймер дрейф жасауы мүмкін — қайта оралғанда
  // серверден нақты мәнді сұраймыз.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      api.timer().then((data) => setActive(data.active)).catch(() => {})
    }

    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  /**
   * Мутацияны орындап, тек шынымен өзгерген бөлікті қайта жүктейді.
   * Бүкіл бетті refetch жасағаннан әлдеқайда жылдам.
   */
  const mutate = async (action, { reloadTiming = false } = {}) => {
    setBusy(true)
    try {
      await action()
      if (reloadTiming) {
        const [taskData, reportData, timerData] = await Promise.all([
          api.tasks(),
          api.week(),
          api.timer(),
        ])
        setTasks(taskData.tasks)
        setReport(reportData)
        setActive(timerData.active)
      }
    } catch (error) {
      notify(error.message)
      // Күй серверден ажырап қалмауы үшін толық қайта жүктейміз
      await loadAll().catch(() => {})
    } finally {
      setBusy(false)
    }
  }

  const addTask = (event) => {
    event.preventDefault()
    const value = title.trim()
    if (value === '') return

    mutate(async () => {
      const { task } = await api.createTask({
        title: value,
        project_id: projectId === '' ? null : Number(projectId),
      })
      setTasks((current) => [task, ...current])
      setTitle('')
      if (task.project_id) refreshProjects()
    })
  }

  const refreshProjects = () => {
    api.projects().then((data) => setProjects(data.projects)).catch(() => {})
  }

  const replaceTask = (task) =>
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)))

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'open' && task.done) return false
      if (filter === 'done' && !task.done) return false
      if (projectFilter === 'none' && task.project_id !== null) return false
      if (
        projectFilter !== 'all' &&
        projectFilter !== 'none' &&
        task.project_id !== Number(projectFilter)
      ) {
        return false
      }
      return true
    })
  }, [tasks, filter, projectFilter])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-600" />
        <span className="sr-only">Жүктелуде…</span>
      </div>
    )
  }

  const openCount = tasks.filter((task) => !task.done).length
  const todaySeconds = (report?.today_seconds ?? 0) + (active ? elapsed : 0)
  const weekSeconds = (report?.week_seconds ?? 0) + (active ? elapsed : 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
              <Timer className="size-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              FocusFlow
            </span>
          </Link>

          <UserMenu user={user} />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6 py-10">
        {/* Жүріп тұрған таймер */}
        {active ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-600 p-6 text-white">
            <div className="min-w-0">
              <p className="text-xs font-medium text-brand-200">Таймер жүріп тұр</p>
              <p className="mt-1 truncate text-lg font-semibold">{active.task_title}</p>
              {active.project_name && (
                <p className="text-sm text-brand-200">{active.project_name}</p>
              )}
            </div>
            <div className="flex items-center gap-5">
              <span
                className="text-3xl font-semibold tabular-nums"
                role="timer"
                aria-live="off"
              >
                {formatClock(elapsed)}
              </span>
              <button
                type="button"
                onClick={() => mutate(() => api.stopTimer(), { reloadTiming: true })}
                disabled={busy}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
              >
                <Square className="size-3.5 fill-current" />
                Тоқтату
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Таймер тоқтап тұр. Тапсырманың жанындағы ▶ батырмасын бас.
          </div>
        )}

        {/* Статистика */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Stat label="Бүгін" value={formatDuration(todaySeconds)} />
          <Stat label="Осы апта" value={formatDuration(weekSeconds)} />
          <Stat label="Ашық тапсырма" value={String(openCount)} />
        </div>

        {/* items-start — әйтпесе қысқа карта көрші бағанның биіктігіне
            созылып, астында бос орын қалады */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Тапсырмалар */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Тапсырмалар</h2>

            <form onSubmit={addTask} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Жаңа тапсырма…"
                maxLength={200}
                aria-label="Жаңа тапсырма"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                aria-label="Жоба"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500"
              >
                <option value="">Жобасыз</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={busy || title.trim() === ''}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                <Plus className="size-4" />
                Қосу
              </button>
            </form>

            {/* Сүзгілер */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div role="group" aria-label="Күй бойынша сүзгі" className="inline-flex rounded-full bg-slate-100 p-1">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    aria-pressed={filter === item.id}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      filter === item.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <select
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                aria-label="Жоба бойынша сүзгі"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500"
              >
                <option value="all">Барлық жоба</option>
                <option value="none">Жобасыз</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <span className="ml-auto text-xs text-slate-400">
                {visibleTasks.length} тапсырма
              </span>
            </div>

            {visibleTasks.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-500">
                {tasks.length === 0
                  ? 'Әзірге тапсырма жоқ. Жоғарыдан біреуін қос.'
                  : 'Бұл сүзгіге сай тапсырма табылмады.'}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    busy={busy}
                    onToggle={() =>
                      mutate(
                        async () => {
                          const { task: updated } = await api.updateTask(task.id, {
                            done: !task.done,
                          })
                          replaceTask(updated)
                          refreshProjects()
                        },
                        // Аяқталған тапсырманың таймері сөнеді → есеп өзгереді
                        { reloadTiming: task.running },
                      )
                    }
                    onRename={(value) =>
                      mutate(async () => {
                        const { task: updated } = await api.updateTask(task.id, {
                          title: value,
                        })
                        replaceTask(updated)
                      })
                    }
                    onStart={() =>
                      mutate(() => api.startTimer(task.id), { reloadTiming: true })
                    }
                    onStop={() => mutate(() => api.stopTimer(), { reloadTiming: true })}
                    onDelete={() =>
                      mutate(
                        async () => {
                          await api.deleteTask(task.id)
                          setTasks((current) =>
                            current.filter((item) => item.id !== task.id),
                          )
                          refreshProjects()
                        },
                        { reloadTiming: task.running },
                      )
                    }
                  />
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-col gap-6">
            {/* Есеп */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Осы апта</h2>
                <a
                  href="/api/reports/export.csv?range=month"
                  download
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Download className="size-3.5" />
                  CSV
                </a>
              </div>

              <div className="mt-6">{report && <WeekChart days={report.days} />}</div>

              <h3 className="mt-8 text-sm font-semibold text-slate-900">
                Жоба бойынша
              </h3>
              {report?.by_project.length ? (
                <ul className="mt-3 space-y-2">
                  {report.by_project.map((row) => (
                    <li
                      key={row.project}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate text-slate-600">{row.project}</span>
                      <span className="shrink-0 tabular-nums text-slate-900">
                        {formatDuration(row.seconds)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Осы аптада әлі уақыт есептелмеген.
                </p>
              )}
            </section>

            <ProjectsPanel
              projects={projects}
              busy={busy}
              onCreate={(name) =>
                mutate(async () => {
                  await api.createProject(name)
                  refreshProjects()
                })
              }
              onDelete={(project) =>
                mutate(async () => {
                  await api.deleteProject(project.id)
                  const [projectData, taskData] = await Promise.all([
                    api.projects(),
                    api.tasks(),
                  ])
                  setProjects(projectData.projects)
                  setTasks(taskData.tasks)
                })
              }
            />
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          <Link
            to="/app/settings"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-600"
          >
            <Settings className="size-3.5" />
            Аккаунт параметрлері
          </Link>
        </p>
      </main>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  )
}
