/**
 * Postgres-тің INTEGER (int4) типінің шегі. Одан үлкен сан `Number.isInteger()`
 * тексерісінен өтіп кетеді де, қорға жеткенде «value out of range for type
 * integer» (22003) қатесін тудырады — сонда жоқ жазбаны сұрау 404 емес, 500
 * болып қайтады. Сондықтан шекті сұраныс қорға бармай тұрып тексереміз.
 */
export const PG_INT_MAX = 2147483647

/**
 * Сыртқы мәннен жарамды жазба id-ін алады. Жарамсыз болса (әріп, бөлшек сан,
 * теріс мән немесе int4 шегінен асқан сан) — `null`.
 */
export function toId(value) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 && id <= PG_INT_MAX ? id : null
}
