import { readLangCookie } from '../i18n/langCookie'
import { translate } from '../i18n/messages'

/**
 * API клиенті. Сессия httpOnly cookie-де тұрғандықтан токенді қолмен
 * тасымалдаудың қажеті жоқ — тек credentials жіберілуін қамтамасыз етеміз.
 *
 * Сервер қате мәтінін `lang` cookie-ге қарап аударып береді, сондықтан
 * мұндағы аударма тек жауапта мәтін мүлде болмаған жағдайға арналған.
 */
export class ApiError extends Error {
  constructor(message, { status, fields, code }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields ?? {}
    // 'offline' | 'timeout' | 'network' | 'http' — қолданушыға не істеу
    // керегін айту үшін шақырушы осыған қарайды
    this.code = code ?? 'http'
  }
}

/**
 * Тегін хостингте ұйықтап қалған сервер 30–60 секундқа дейін оянуы мүмкін,
 * сондықтан күту мерзімі ұзақ. Онсыз fetch мәңгі ілініп тұрып, батырма
 * «Тексерілуде…» күйінде қатып қалар еді.
 */
const TIMEOUT_MS = 45_000

// AbortSignal.timeout — салыстырмалы жаңа API. Ескі браузерде күту мерзімі
// болмай қалғаны — қатеге айналдырғаннан жақсы.
const timeoutSignal = () =>
  typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(TIMEOUT_MS) : undefined

const t = (key, vars) => translate(readLangCookie(), key, vars)

/**
 * Сервер жауабында мәтін болмаған жағдайға арналған хабарламалар. Мұндай
 * жауап әдетте қосымшадан емес, хостингтен келеді (502/504 беттері), сол
 * себепті «сұраныс сәтсіз» деудің орнына нақты не болғанын айтамыз.
 */
function httpMessage(status, retryAfter) {
  if (status === 429) return t('api.tooMany', { seconds: retryAfter ?? 60 })
  if (status === 404) return t('api.notFound')
  if (status === 408 || status === 504) return t('api.timeout')
  if (status === 502 || status === 503) return t('api.waking')
  if (status >= 500) return t('api.serverError', { status })
  return t('api.failed', { status })
}

/**
 * Сессия біткенде (немесе басқа құрылғыда құпиясөз ауысқанда) серверден 401
 * келеді. Ондайда қолданушыны күйден шығару керек, әйтпесе ол ескірген
 * dashboard-та қалып, әр әрекетіне тек хабарлама алады да, ештеңе жұмыс
 * істемейді. Кім хабардар болатынын AuthProvider шешеді.
 */
let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// Бұл екеуінің 401-і сессияның бітуін білдірмейді: /auth/login «құпиясөз
// қате» дегенді де 401-мен қайтарады, ал /auth/me кірмеген қонақта әрқашан
// 401 болады — оны AuthProvider өзі өңдейді.
const EXPECTED_401 = new Set(['/auth/login', '/auth/me'])

async function request(path, { method = 'GET', body } = {}) {
  let response

  // Желі үзілуі мен күту мерзімі — HTTP қатесі емес, бірақ қолданушы үшін
  // дәл сондай оқиға. Екеуін де ApiError-ға айналдырамыз, әйтпесе жоғарыда
  // «Failed to fetch» деген аударылмаған браузер мәтіні шығады.
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: timeoutSignal(),
    })
  } catch (error) {
    const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError'
    const offline = !timedOut && navigator.onLine === false

    throw new ApiError(
      timedOut ? t('api.timeout') : offline ? t('api.offline') : t('api.unreachable'),
      { status: 0, code: timedOut ? 'timeout' : offline ? 'offline' : 'network' },
    )
  }

  if (response.status === 401 && !EXPECTED_401.has(path)) onUnauthorized?.()

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const retryAfter = Number(response.headers.get('retry-after')) || undefined

    throw new ApiError(data.error ?? httpMessage(response.status, retryAfter), {
      status: response.status,
      fields: data.errors,
    })
  }

  return data
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  changePassword: (payload) =>
    request('/auth/password', { method: 'PATCH', body: payload }),
  forgotPassword: (email) =>
    request('/auth/forgot', { method: 'POST', body: { email } }),
  resetPassword: (payload) => request('/auth/reset', { method: 'POST', body: payload }),
  verifyEmail: (token) => request('/auth/verify', { method: 'POST', body: { token } }),
  resendVerification: () => request('/auth/verify/resend', { method: 'POST' }),
  deleteAccount: (password) =>
    request('/auth/account', { method: 'DELETE', body: { password } }),

  projects: () => request('/projects'),
  createProject: (name) => request('/projects', { method: 'POST', body: { name } }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  tasks: () => request('/tasks'),
  createTask: (payload) => request('/tasks', { method: 'POST', body: payload }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: 'PATCH', body: payload }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  timer: () => request('/timer'),
  startTimer: (taskId) => request('/timer/start', { method: 'POST', body: { task_id: taskId } }),
  stopTimer: () => request('/timer/stop', { method: 'POST' }),

  week: () => request('/reports/week'),
  insights: () => request('/reports/insights'),

  plan: () => request('/plan'),
  checkIn: (minutes) =>
    request('/plan', { method: 'POST', body: { capacity_minutes: minutes } }),
  clearPlan: () => request('/plan', { method: 'DELETE' }),
}
