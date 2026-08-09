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
  constructor(message, { status, fields }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields ?? {}
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.error ?? translate(readLangCookie(), 'api.failed'), {
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
}
