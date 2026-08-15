/**
 * Сервер жағындағы аударма. Клиент таңдаған тілін `lang` cookie-мен
 * жібереді (`src/i18n/langCookie.js`), сондықтан API қателері мен CSV
 * тақырыптары да сол тілде қайтады.
 *
 * Мұндағы кілттер фронттағы каталогтан бөлек: серверге тек өзі
 * қайтаратын мәтіндер керек, лендинг мәтіндері емес.
 */

export const LANGUAGES = ['kk', 'en']
export const DEFAULT_LANG = LANGUAGES[0]

const messages = {
  kk: {
    'auth.required': 'Кіру қажет.',
    'auth.checkForm': 'Форманы тексер.',
    'auth.nameTooShort': 'Атыңды жаз (кемінде 2 таңба).',
    'auth.emailInvalid': 'Жарамды email енгіз.',
    'auth.passwordTooShort': 'Құпиясөз кемінде 8 таңба болуы керек.',
    'auth.emailTaken': 'Бұл email тіркелген.',
    'auth.emailTakenField': 'Бұл email тіркеліп қойған.',
    'auth.badCredentials': 'Email не құпиясөз қате.',
    'auth.currentPasswordWrong': 'Ағымдағы құпиясөз қате.',
    'auth.passwordWrong': 'Құпиясөз қате.',
    'auth.linkInvalid': 'Сілтеменің мерзімі өткен немесе ол қолданылып қойған.',
    'auth.mailDisabled':
      'Қазір хат жіберу мүмкін емес: серверде пошта бапталмаған.',
    'auth.mailFailed': 'Хат жіберілмеді. Сәл кейінірек қайталап көр.',
    'auth.alreadyVerified': 'Бұл email расталып қойған.',

    'mail.verify.subject': 'Focus10: email-іңді растап қой',
    'mail.verify.body':
      'Сәлем, {{name}}!\n\n' +
      'Focus10-да аккаунт ашқаның үшін рақмет. Email-іңді растау үшін мына ' +
      'сілтемеге өт:\n\n{{url}}\n\n' +
      'Сілтеме 24 сағат жарамды. Егер аккаунтты сен ашпаған болсаң, бұл ' +
      'хатты елемей қоя бер.',
    'mail.reset.subject': 'Focus10: құпиясөзді қалпына келтіру',
    'mail.reset.body':
      'Сәлем, {{name}}!\n\n' +
      'Құпиясөзді ауыстыру үшін мына сілтемеге өт:\n\n{{url}}\n\n' +
      'Сілтеме 1 сағат жарамды әрі бір рет қана жұмыс істейді. Егер бұны сен ' +
      'сұрамаған болсаң, ештеңе істеудің қажеті жоқ: құпиясөзің өзгермейді.',

    'rateLimit.tooMany':
      'Тым көп әрекет. {{seconds}} секундтан кейін қайталап көр.',

    'project.nameLength': 'Жоба аты 1–60 таңба болуы керек.',
    'project.notFound': 'Жоба табылмады.',
    'project.unknown': 'Мұндай жоба жоқ.',

    'task.titleLength': 'Тапсырма аты 1–200 таңба болуы керек.',
    'task.notFound': 'Тапсырма табылмады.',
    'task.estimateRange': 'Болжалды уақыт {{min}}–{{max}} минут аралығында болуы керек.',
    'task.priorityInvalid': 'Маңыздылық дұрыс емес.',
    'task.dueInvalid': 'Мерзім күні дұрыс емес.',

    'plan.capacityRange':
      'Бүгінгі уақытың {{min}}–{{max}} минут аралығында болуы керек.',

    'timer.taskDone': 'Аяқталған тапсырмаға таймер қосылмайды.',
    'timer.notRunning': 'Жүріп тұрған таймер жоқ.',

    'app.noRoute': 'Мұндай API жоқ.',
    'app.badJson': 'JSON форматы дұрыс емес.',
    'app.tooLarge': 'Сұраныс тым үлкен.',
    'app.serverError': 'Серверде күтпеген қате шықты.',

    'csv.date': 'Күні',
    'csv.start': 'Басталды',
    'csv.end': 'Аяқталды',
    'csv.project': 'Жоба',
    'csv.task': 'Тапсырма',
    'csv.seconds': 'Секунд',
    'csv.hours': 'Сағат',

    'seed.project': 'Бірінші жобам',
    'seed.task1': 'Focus10-мен танысу',
    'seed.task2': 'Бірінші тапсырманы қосу',
    'seed.task3': 'Таймерді іске қосып көру',
  },

  en: {
    'auth.required': 'You need to sign in.',
    'auth.checkForm': 'Check the form.',
    'auth.nameTooShort': 'Enter your name (at least 2 characters).',
    'auth.emailInvalid': 'Enter a valid email.',
    'auth.passwordTooShort': 'Password must be at least 8 characters.',
    'auth.emailTaken': 'That email is already registered.',
    'auth.emailTakenField': 'That email is already registered.',
    'auth.badCredentials': 'Wrong email or password.',
    'auth.currentPasswordWrong': 'Your current password is wrong.',
    'auth.passwordWrong': 'Wrong password.',
    'auth.linkInvalid': 'That link has expired or has already been used.',
    'auth.mailDisabled': 'Email cannot be sent right now: mail is not configured.',
    'auth.mailFailed': 'The email could not be sent. Try again in a moment.',
    'auth.alreadyVerified': 'That email is already verified.',

    'mail.verify.subject': 'Focus10: confirm your email',
    'mail.verify.body':
      'Hi {{name}},\n\n' +
      'Thanks for creating a Focus10 account. Confirm your email by opening ' +
      'this link:\n\n{{url}}\n\n' +
      'The link is valid for 24 hours. If you did not create this account, ' +
      'you can ignore this email.',
    'mail.reset.subject': 'Focus10: reset your password',
    'mail.reset.body':
      'Hi {{name}},\n\n' +
      'Open this link to set a new password:\n\n{{url}}\n\n' +
      'The link is valid for 1 hour and works only once. If you did not ask ' +
      'for it, no action is needed — your password stays as it is.',

    'rateLimit.tooMany': 'Too many attempts. Try again in {{seconds}} seconds.',

    'project.nameLength': 'A project name must be 1–60 characters.',
    'project.notFound': 'Project not found.',
    'project.unknown': 'No such project.',

    'task.titleLength': 'A task name must be 1–200 characters.',
    'task.notFound': 'Task not found.',
    'task.estimateRange': 'An estimate must be between {{min}} and {{max}} minutes.',
    'task.priorityInvalid': 'That priority is not valid.',
    'task.dueInvalid': 'That due date is not valid.',

    'plan.capacityRange': 'Today’s time must be between {{min}} and {{max}} minutes.',

    'timer.taskDone': 'A finished task cannot start a timer.',
    'timer.notRunning': 'No timer is running.',

    'app.noRoute': 'No such API route.',
    'app.badJson': 'The JSON is malformed.',
    'app.tooLarge': 'The request is too large.',
    'app.serverError': 'An unexpected server error occurred.',

    'csv.date': 'Date',
    'csv.start': 'Start',
    'csv.end': 'End',
    'csv.project': 'Project',
    'csv.task': 'Task',
    'csv.seconds': 'Seconds',
    'csv.hours': 'Hours',

    'seed.project': 'My first project',
    'seed.task1': 'Take a look around Focus10',
    'seed.task2': 'Add your first task',
    'seed.task3': 'Try starting the timer',
  },
}

const isLang = (value) => LANGUAGES.includes(value)

/** 'en-GB' → 'en'. Танылмаса — undefined. */
const normalize = (value) => {
  const base = String(value ?? '')
    .toLowerCase()
    .split('-')[0]
    .trim()
  return isLang(base) ? base : undefined
}

/**
 * Cookie-ді cookieParser-сіз оқимыз: тіл анықтау express.json()-нан бұрын
 * жүруі керек, әйтпесе бүлінген JSON туралы қате мәтіні тілсіз қалады.
 */
function langFromCookie(req) {
  const header = req.headers?.cookie
  if (!header) return undefined

  for (const part of header.split(';')) {
    const [name, ...rest] = part.split('=')
    if (name.trim() === 'lang') return normalize(rest.join('='))
  }
  return undefined
}

/** 'en-GB,en;q=0.9,kk;q=0.8' → 'en' */
function langFromHeader(req) {
  const header = req.headers?.['accept-language']
  if (!header) return undefined

  return header
    .split(',')
    .map((part) => normalize(part.split(';')[0]))
    .find(Boolean)
}

/** Таңдау реті: cookie → Accept-Language → әдепкі. */
export function pickLang(req) {
  return langFromCookie(req) ?? langFromHeader(req) ?? DEFAULT_LANG
}

/** «{{seconds}}» түріндегі орындарды vars мәндерімен алмастырады. */
const interpolate = (text, vars) =>
  text.replaceAll(/\{\{(\w+)\}\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  )

export function translate(lang, key, vars) {
  const text = messages[lang]?.[key] ?? messages[DEFAULT_LANG][key] ?? key

  return vars === undefined ? text : interpolate(text, vars)
}

/** Барлық сұранысқа `req.lang` мен `req.t` қосады. */
export default function i18n(req, res, next) {
  req.lang = pickLang(req)
  req.t = (key, vars) => translate(req.lang, key, vars)
  next()
}
