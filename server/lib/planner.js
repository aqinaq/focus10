/**
 * Күндік жоспарды құрайтын логика. Мұнда дерекқор да, уақыт та жоқ:
 * «бүгін» деген күн параметр болып беріледі. Сол себепті бұл файлды
 * қалаған күнмен, қалаған тапсырмалармен тестілеуге болады.
 *
 * Негізгі идея: адам «бүгін не істеймін» дегенді өзі шешпеуі керек.
 * Ол тек екі нәрсені айтады — не істегісі келеді (тапсырма, мерзімі,
 * маңыздылығы) және бүгін қанша уақыты бар. Қалғанын осы файл есептейді.
 */

/** 1 — міндетті, 2 — керек, 3 — болса болды. */
export const PRIORITIES = [1, 2, 3]
export const DEFAULT_PRIORITY = 2

/** Бағасы қойылмаған тапсырма да жоспарға түсуі керек — әдепкі шама. */
export const DEFAULT_ESTIMATE_MINUTES = 60

/** Мерзімі жоқ іс «осы аптада» деп есептеледі. */
export const DEFAULT_HORIZON_DAYS = 7

/** Жоспардағы ең кіші блок: 7 минуттық тапсырма адамға көмектеспейді. */
export const MIN_BLOCK = 20
export const BLOCK_STEP = 5

/**
 * Бір күнде адам шынымен қанша уақыт зейін қоя алады. Бұл «бос уақыт» емес:
 * 8 сағат бос болу — 8 сағат жұмыс істеу деген сөз емес.
 */
export const SUSTAINABLE_DAY = 180
export const DAILY_FOCUS_CEILING = 360

/** Тізімде бес істен көп тұрса, ол жоспар емес — тағы бір тізім. */
export const MAX_ITEMS = 5

const DAY_MS = 86_400_000

const toUtc = (iso) => {
  const [year, month, day] = String(iso).split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

const fromUtc = (ms) => new Date(ms).toISOString().slice(0, 10)

/** 'YYYY-MM-DD' форматындағы күнге n күн қосады. */
export const addDays = (iso, n) => fromUtc(toUtc(iso) + n * DAY_MS)

/** a-дан b-ға дейінгі күн саны (b кейін болса — оң сан). */
export const daysBetween = (a, b) => Math.round((toUtc(b) - toUtc(a)) / DAY_MS)

/** Аптаның соңы — жексенбі (апта дүйсенбіден басталады). */
export function endOfWeek(iso) {
  const weekday = new Date(toUtc(iso)).getUTCDay()
  return addDays(iso, (7 - weekday) % 7)
}

/** Айдың соңғы күні. */
export function endOfMonth(iso) {
  const [year, month] = String(iso).split('-').map(Number)
  // Келесі айдың «0-күні» — осы айдың соңғы күні
  return fromUtc(Date.UTC(year, month, 0))
}

export const isDate = (value) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  fromUtc(toUtc(value)) === value

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const roundBlock = (minutes) => Math.round(minutes / BLOCK_STEP) * BLOCK_STEP
const floorBlock = (minutes) => Math.floor(minutes / BLOCK_STEP) * BLOCK_STEP

/**
 * Тапсырмадан жоспарлауға керек мәліметті шығарады.
 *
 * `remaining` — істелмей қалғаны: бағадан бұрын жазылған уақытты шегереміз.
 * Сондықтан таймерді басқан сайын ертеңгі жүктеме азаяды.
 */
function toCandidate(task, today) {
  const estimate = task.estimate_minutes ?? DEFAULT_ESTIMATE_MINUTES
  const tracked = Math.round((task.tracked_seconds ?? 0) / 60)
  const remaining = Math.max(0, estimate - tracked)

  // Мерзімі жоқ іс аптаның ішінде бітуі керек деп саналады — әйтпесе
  // ол ешқашан жоспарға ілікпей, тізімнің түбінде жата береді.
  const due = isDate(task.due_date) ? task.due_date : addDays(today, DEFAULT_HORIZON_DAYS - 1)
  const overdue = daysBetween(today, due) < 0

  // Мерзімі өтіп кетсе де «бүгін» деп қараймыз: кешігуді жасырудың мәні жоқ,
  // бірақ жоспарда ол бәрібір бүгінгі күнге сыюы керек.
  const daysLeft = Math.max(1, daysBetween(today, due) + 1)

  return {
    task_id: task.id,
    title: task.title,
    project_name: task.project_name ?? null,
    priority: PRIORITIES.includes(task.priority) ? task.priority : DEFAULT_PRIORITY,
    estimate_minutes: task.estimate_minutes ?? null,
    due_date: isDate(task.due_date) ? task.due_date : null,
    effective_due: due,
    remaining_minutes: remaining,
    days_left: daysLeft,
    overdue,
    // Мерзімге дейін біту үшін күніне қанша керек
    pace_minutes: Math.ceil(remaining / daysLeft),
  }
}

/**
 * Кезек. Мерзімі бірінші, маңыздылығы содан кейін: жұма күні тапсырылатын
 * «міндетті» істің әлі уақыты бар, ал бүгін бітуге тиіс «болса болды» істің
 * жоқ. Тең түскенде үлкенін алдымен бастаймыз — ұсақ істер алдамшы
 * «бітірдім» сезімін беріп, үлкенін кешке қалдырады.
 */
function byUrgency(a, b) {
  if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
  if (a.days_left !== b.days_left) return a.days_left - b.days_left
  if (a.priority !== b.priority) return a.priority - b.priority
  if (a.remaining_minutes !== b.remaining_minutes) {
    return b.remaining_minutes - a.remaining_minutes
  }
  return a.task_id - b.task_id
}

/** Аяқталмаған, әлі уақыты қалған тапсырмалар — кезекке тізілген күйде. */
export function candidatesFor(tasks, today) {
  return tasks
    .filter((task) => !task.done)
    .map((task) => toCandidate(task, today))
    .filter((candidate) => candidate.remaining_minutes > 0)
    .sort(byUrgency)
}

/**
 * Бүгін қалдырсақ, қалған күндерге сыймайтын іс. Мұны адам мерзімі
 * келгенде емес, дәл бүгін білуі керек — сонда әлі бір амал бар.
 */
export const atRisk = (candidate) =>
  candidate.remaining_minutes > Math.max(0, candidate.days_left - 1) * SUSTAINABLE_DAY

const reasonFor = (candidate) => {
  if (candidate.overdue) return 'overdue'
  if (candidate.days_left === 1) return 'dueToday'
  return 'pace'
}

/**
 * Бүгінге жоспар құрады.
 *
 * Ең маңызды шешім — жоспар бос уақытқа емес, нақты қажеттілікке қарай
 * толтырылады. Әр іске алдымен «күндік үлесі» ғана беріледі (қалғаны ÷
 * қалған күн). Сондықтан кеш оянып, «екі-ақ сағатым бар» десең, жоспар
 * қысқарады да, істің қалғаны келесі күндерге жайылады — бір күнде бәрін
 * үлгеру талап етілмейді.
 *
 * Уақыт артып қалса ғана алдағы күндердің жүгін бүгінге тартамыз: ертең
 * қиналмау үшін бүгін артық істеу — жоспардың бонусы, міндеті емес.
 */
export function planDay({ tasks, today, capacity }) {
  const candidates = candidatesFor(tasks, today)

  // Аз уақытта аз іс. 25 минутқа үш тапсырма жазсақ, оның үшеуі де
  // басталмайды — адам тізімге қарап, түк істемей жабады.
  const maxItems = clamp(Math.round(capacity / 60), 1, MAX_ITEMS)

  const items = []
  let left = capacity

  for (const candidate of candidates) {
    if (items.length >= maxItems || left < BLOCK_STEP) break

    let minutes = roundBlock(Math.min(candidate.pace_minutes, candidate.remaining_minutes))

    // Күндік үлесі тым ұсақ болса, бәрібір нақты блок береміз: 8 минуттық
    // «жұмысты» ешкім бастамайды. Істің өзі одан аз қалса — сол қалғаны.
    if (minutes < MIN_BLOCK) {
      minutes = Math.min(MIN_BLOCK, candidate.remaining_minutes)
    }

    minutes = Math.min(minutes, left)
    if (minutes < BLOCK_STEP) break

    items.push({
      ...candidate,
      minutes,
      pulled_forward: 0,
      reason: reasonFor(candidate),
    })
    left -= minutes
  }

  // Артылған уақытты алдыңғы істерге қосамыз — жаңа тапсырма ашпаймыз.
  if (left >= BLOCK_STEP) {
    for (const item of items) {
      if (left < BLOCK_STEP) break

      const room = item.remaining_minutes - item.minutes
      if (room <= 0) continue

      const extra = floorBlock(Math.min(room, left))
      if (extra < BLOCK_STEP) continue

      item.minutes += extra
      item.pulled_forward = extra
      left -= extra
    }
  }

  const planned = items.reduce((total, item) => total + item.minutes, 0)
  const chosen = new Set(items.map((item) => item.task_id))

  const deferred = candidates
    .filter((candidate) => !chosen.has(candidate.task_id))
    .map((candidate) => ({ ...candidate, at_risk: atRisk(candidate) }))

  return {
    capacity_minutes: capacity,
    planned_minutes: planned,
    spare_minutes: Math.max(0, capacity - planned),
    items,
    deferred,
  }
}

/**
 * «Аптаның/айдың соңына үлгерем бе?» — жоспарлаудың ең пайдалы жауабы.
 * Бұл жерде жалған үміт бермейміз: қалғанын қалған күнге бөліп,
 * күніне қанша сағат керегін тікелей айтамыз.
 */
function horizonOutlook(candidates, today, until) {
  const days = Math.max(1, daysBetween(today, until) + 1)
  const scoped = candidates.filter((candidate) => candidate.effective_due <= until)
  const needed = scoped.reduce((total, item) => total + item.remaining_minutes, 0)
  const perDay = Math.ceil(needed / days)

  return {
    until,
    days_left: days,
    tasks: scoped.length,
    needed_minutes: needed,
    per_day_minutes: perDay,
    // «over» — қалған күндерге сыймайды: не мерзімін жылжыту керек,
    // не бір істі алып тастау керек.
    verdict: perDay <= SUSTAINABLE_DAY ? 'ok' : perDay <= DAILY_FOCUS_CEILING ? 'tight' : 'over',
    over_by_minutes: Math.max(0, needed - days * DAILY_FOCUS_CEILING),
  }
}

/**
 * Апталық және айлық көрініс.
 *
 * Терезе күнтізбелік аптаға емес, алдағы 7 (және 30) күнге қарайды. Себебі
 * жексенбіде «аптаң тек бір күн қалды» деген жалған дабыл шығар еді, ал
 * мерзімі қойылмаған істер жексенбіден кейінгі күнге түсіп, есептен мүлде
 * шығып қалар еді. Есеп пен қорытындылар да дәл осылай — жылжымалы
 * тереземен — саналады.
 */
export function outlookFor(tasks, today) {
  const candidates = candidatesFor(tasks, today)

  return {
    week: horizonOutlook(candidates, today, addDays(today, DEFAULT_HORIZON_DAYS - 1)),
    month: horizonOutlook(candidates, today, addDays(today, 29)),
  }
}

/** Күн аяғы — содан кейін жоспарланған уақыт шындыққа жанаспайды. */
export const DAY_END_HOUR = 22

/**
 * Сағат нешеде тұрғаныңа қарай ұсынылатын нұсқалар.
 *
 * «Бүгін бос күнім» деген сағат 14-те де, 8-де де айтылады, бірақ олар бір
 * нәрсе емес. Сондықтан «толық күн» дегенді қазірден кешке дейінгі уақыттан
 * есептейміз — оның бәрі жұмыс емес, сондықтан 60%-ын ғана аламыз.
 */
export function capacityPresets(hour, minute = 0) {
  const hoursLeft = Math.max(0, DAY_END_HOUR - hour - minute / 60)
  const full = clamp(Math.round((hoursLeft * 60 * 0.6) / 15) * 15, 25, DAILY_FOCUS_CEILING)

  const presets = [
    { id: 'full', minutes: full },
    { id: 'half', minutes: clamp(Math.round(full / 2 / 15) * 15, 25, full) },
    { id: 'short', minutes: 90 },
    // Кеш оянған, көңіл жоқ күнге арналған нұсқа. Бір ғана блок — бірақ
    // нөл емес: серия үзілмейді, ертең қайта бастау жеңіл болады.
    { id: 'tiny', minutes: 25 },
  ]

  const seen = new Set()

  return presets
    .filter((preset) => {
      if (preset.minutes > full || seen.has(preset.minutes)) return false
      seen.add(preset.minutes)
      return true
    })
    // Кештетіп қалғанда «жарты күн» «бір-екі сағаттан» қысқа болып қалады —
    // сондықтан тізім атауымен емес, ұзақтығымен реттеледі
    .sort((a, b) => b.minutes - a.minutes)
}
