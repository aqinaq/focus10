import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus, Settings, Square, Timer } from 'lucide-react'
import { api } from '../lib/api'
import {
  DUE_CHOICES,
  ESTIMATE_CHOICES,
  PRIORITY_CHOICES,
  dueFromChoice,
} from '../lib/dates'
import { useAuth } from '../context/authContext'
import { useUI } from '../context/uiContext'
import { useI18n } from '../i18n/i18nContext'
import WeekChart from '../components/dashboard/WeekChart'
import PlanPanel from '../components/dashboard/PlanPanel'
import TaskRow from '../components/dashboard/TaskRow'
import ProjectsPanel from '../components/dashboard/ProjectsPanel'
import InsightsPanel from '../components/dashboard/InsightsPanel'
import VerifyBanner from '../components/dashboard/VerifyBanner'
import UserMenu from '../components/dashboard/UserMenu'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import WakingLoader from '../components/WakingLoader'

const FILTERS = ['open', 'done', 'all']

/** Жоспарлау өрістері негізгі өрістерден кішірек — олар қосымша. */
const PLANNING_SELECT =
  'min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-brand-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:flex-none'

export default function Dashboard() {
  const { user } = useAuth()
  const { notify } = useUI()
  const { t, formatClock, formatDuration } = useI18n()

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [report, setReport] = useState(null)
  const [insights, setInsights] = useState(null)
  const [plan, setPlan] = useState(null)
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  // Жаңа тапсырманың жоспарлау өрістері. Мәндері «жабысқақ»: бір мерзімге
  // бірнеше іс қосу — жиі кездесетін жағдай.
  const [estimate, setEstimate] = useState('')
  const [priority, setPriority] = useState(2)
  const [due, setDue] = useState('none')
  const [filter, setFilter] = useState('open')
  const [projectFilter, setProjectFilter] = useState('all')

  // Жүріп тұрған таймердің секундын клиентте өсіріп отырамыз
  const [elapsed, setElapsed] = useState(0)
  const startedAtRef = useRef(null)

  const loadAll = useCallback(async () => {
    const [taskData, projectData, reportData, insightData, planData, timerData] =
      await Promise.all([
        api.tasks(),
        api.projects(),
        api.week(),
        api.insights(),
        api.plan(),
        api.timer(),
      ])

    setTasks(taskData.tasks)
    setProjects(projectData.projects)
    setReport(reportData)
    setInsights(insightData)
    setPlan(planData)
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

      // Жоспар кез келген өзгерістен кейін жаңарады: тапсырма қосылса да,
      // біткен деп белгіленсе де, бүгінгі тізім мен апталық көрініс сол
      // сәтте өзгереді.
      const planPromise = api.plan()

      if (reloadTiming) {
        const [taskData, reportData, insightData, timerData] = await Promise.all([
          api.tasks(),
          api.week(),
          api.insights(),
          api.timer(),
        ])
        setTasks(taskData.tasks)
        setReport(reportData)
        setInsights(insightData)
        setActive(timerData.active)
      }

      setPlan(await planPromise)
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
        estimate_minutes: estimate === '' ? null : Number(estimate),
        priority,
        due_date: dueFromChoice(due, plan?.today),
      })
      setTasks((current) => [task, ...current])
      setTitle('')
      if (task.project_id) refreshProjects()
    })
  }

  // Күндік тіркелу мен одан бас тарту: жаңа күйді `mutate` өзі жүктейді
  const checkIn = (minutes) => mutate(() => api.checkIn(minutes))
  const clearPlan = () => mutate(() => api.clearPlan())

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

  if (loading) return <WakingLoader />


  const openCount = tasks.filter((task) => !task.done).length
  const todaySeconds = (report?.today_seconds ?? 0) + (active ? elapsed : 0)
  const weekSeconds = (report?.week_seconds ?? 0) + (active ? elapsed : 0)

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
              <Timer className="size-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Focus10
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Жасыруды сыртқы div атқарады: ауыстырғыштардың өз
                `inline-flex` класы `hidden`-мен қақтығысады да, мобильде
                бәрібір көрініп қалады. Телефонда екеуі де UserMenu ішінде. */}
            <div className="hidden gap-3 sm:flex">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <VerifyBanner />

        {/* Жүріп тұрған таймер. Мобильде тік жайғасады: жоғарыда тапсырма аты,
            астында сағат пен тоқтату батырмасы — батырма кең әрі саусаққа
            ыңғайлы жерде тұрады. */}
        {active ? (
          <div className="flex flex-col gap-4 rounded-2xl bg-brand-600 p-5 text-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <p className="text-xs font-medium text-brand-200">
                {t('dashboard.timerRunning')}
              </p>
              <p className="mt-1 truncate text-lg font-semibold">{active.task_title}</p>
              {active.project_name && (
                <p className="truncate text-sm text-brand-200">{active.project_name}</p>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 sm:gap-5">
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
                className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60 sm:py-2.5"
              >
                <Square className="size-3.5 fill-current" />
                {t('dashboard.stop')}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-pretty text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 sm:p-6">
            {t('dashboard.timerIdle')}
          </div>
        )}

        {/* Статистика. Мобильде үшеуін тігінен тізсек, тапсырмалар экраннан
            тым төмен кетеді — сондықтан екі бағанға сыйғызамыз. */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-6">
          <Stat label={t('dashboard.today')} value={formatDuration(todaySeconds)} />
          <Stat label={t('dashboard.thisWeek')} value={formatDuration(weekSeconds)} />
          <Stat wide label={t('dashboard.openTasks')} value={String(openCount)} />
        </div>

        <PlanPanel
          data={plan}
          busy={busy}
          onCheckIn={checkIn}
          onClear={clearPlan}
          onStart={(taskId) =>
            mutate(() => api.startTimer(taskId), { reloadTiming: true })
          }
          onStop={() => mutate(() => api.stopTimer(), { reloadTiming: true })}
        />

        <InsightsPanel data={insights} />

        {/* items-start — әйтпесе қысқа карта көрші бағанның биіктігіне
            созылып, астында бос орын қалады */}
        <div className="mt-4 grid grid-cols-1 items-start gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
          {/* Тапсырмалар */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('dashboard.tasks')}
            </h2>

            <form
              onSubmit={addTask}
              className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t('dashboard.newTaskPlaceholder')}
                maxLength={200}
                enterKeyHint="done"
                aria-label={t('dashboard.newTask')}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-brand-900 sm:py-2.5"
              />
              {/* Мобильде жоба мен «Қосу» бір жолда тұрады — үшеуін тік тізсек
                  форма экранның жартысын алып кетеді. sm:contents — үлкен
                  экранда бұл орауыш жоғалып, бәрі бір қатарға қайта тізіледі. */}
              <div className="flex gap-3 sm:contents">
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  aria-label={t('dashboard.project')}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:text-slate-300 sm:flex-none sm:py-2.5"
                >
                  <option value="">{t('dashboard.noProject')}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={busy || title.trim() === ''}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50 sm:py-2.5"
                >
                  <Plus className="size-4" />
                  {t('dashboard.add')}
                </button>
              </div>

              {/* Жоспарлауға керек үш жауап. Үшеуі де міндетті емес: бос
                  қалса, жоспарлағыш әдепкі мәнмен жұмыс істейді, ал кейін
                  тапсырманы басып толықтыруға болады. */}
              <div className="flex flex-wrap gap-2 sm:basis-full">
                <select
                  value={estimate}
                  onChange={(event) => setEstimate(event.target.value)}
                  aria-label={t('plan.fields.estimate')}
                  className={PLANNING_SELECT}
                >
                  <option value="">{t('plan.fields.noEstimate')}</option>
                  {ESTIMATE_CHOICES.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {formatDuration(minutes * 60)}
                    </option>
                  ))}
                </select>

                <select
                  value={priority}
                  onChange={(event) => setPriority(Number(event.target.value))}
                  aria-label={t('plan.fields.priority')}
                  className={PLANNING_SELECT}
                >
                  {PRIORITY_CHOICES.map((value) => (
                    <option key={value} value={value}>
                      {t(`plan.priority.${value}`)}
                    </option>
                  ))}
                </select>

                <select
                  value={due}
                  onChange={(event) => setDue(event.target.value)}
                  aria-label={t('plan.fields.due')}
                  className={PLANNING_SELECT}
                >
                  {DUE_CHOICES.map((value) => (
                    <option key={value} value={value}>
                      {t(`plan.dueChoices.${value}`)}
                    </option>
                  ))}
                </select>
              </div>
            </form>

            {/* Сүзгілер */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label={t('dashboard.statusFilter')}
                className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800"
              >
                {FILTERS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    aria-pressed={filter === id}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:py-1.5 ${
                      filter === id
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    {t(`dashboard.filters.${id}`)}
                  </button>
                ))}
              </div>

              <select
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                aria-label={t('dashboard.projectFilter')}
                className="max-w-[45%] rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:text-slate-300 sm:max-w-none sm:py-1.5"
              >
                <option value="all">{t('dashboard.allProjects')}</option>
                <option value="none">{t('dashboard.noProject')}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                {t('dashboard.taskCount', { count: visibleTasks.length })}
              </span>
            </div>

            {visibleTasks.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {tasks.length === 0
                  ? t('dashboard.emptyAll')
                  : t('dashboard.emptyFiltered')}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    today={plan?.today}
                    busy={busy}
                    onUpdate={(fields) =>
                      mutate(async () => {
                        const { task: updated } = await api.updateTask(task.id, fields)
                        replaceTask(updated)
                      })
                    }
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

          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Есеп */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t('dashboard.thisWeek')}
                </h2>
                <a
                  href="/api/reports/export.csv?range=month"
                  download
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:py-1.5"
                >
                  <Download className="size-3.5" />
                  CSV
                </a>
              </div>

              <div className="mt-6">{report && <WeekChart days={report.days} />}</div>

              <h3 className="mt-8 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('dashboard.byProject')}
              </h3>
              {report?.by_project.length ? (
                <ul className="mt-3 space-y-2">
                  {report.by_project.map((row) => (
                    <li
                      key={row.project ?? ''}
                      className="flex items-center justify-between text-sm"
                    >
                      {/* Жобасы жоқ уақыт серверден `null` болып келеді —
                          атауын аударма береді */}
                      <span className="truncate text-slate-600 dark:text-slate-400">
                        {row.project ?? t('dashboard.noProject')}
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-900 dark:text-slate-100">
                        {formatDuration(row.seconds)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {t('dashboard.noTimeThisWeek')}
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

        <p className="mt-8 pb-[env(safe-area-inset-bottom)] text-center text-xs text-slate-400 dark:text-slate-500 sm:mt-10">
          <Link
            to="/app/settings"
            className="inline-flex items-center gap-1.5 py-2 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Settings className="size-3.5" />
            {t('dashboard.accountSettings')}
          </Link>
        </p>
      </main>
    </div>
  )
}

/**
 * `wide` — мобильде екі бағанды алып тұратын карта. Ондай карта тік
 * жайғасса ішінде бос орын көп болып көрінеді, сондықтан телефонда
 * тақырыбы мен мәні бір жолға тізіледі.
 */
function Stat({ label, value, wide = false }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:block sm:p-6 ${
        wide ? 'col-span-2 flex items-center justify-between sm:col-span-1' : ''
      }`}
    >
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p
        className={`text-2xl font-semibold tracking-tight text-balance text-slate-900 sm:mt-2 sm:text-3xl dark:text-slate-100 ${
          wide ? '' : 'mt-1.5'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
