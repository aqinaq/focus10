/**
 * Күн есептеу логикасы клиентте де, серверде де бірдей болуы керек: «осы
 * аптаның соңы» деген екі жерде екі түрлі күн шықса, жоспар да, мерзім де
 * бір күнге жылжып кетеді. Сондықтан оны қайта жазбай, жоспарлағыштың
 * функцияларын тікелей аламыз — олар таза әрі node-қа тәуелсіз.
 */
import { addDays, endOfMonth, endOfWeek, isDate } from '../../server/lib/planner.js'

export { addDays, endOfMonth, endOfWeek, isDate }

/** Тапсырма формасындағы жылдам нұсқалар. */
export const DUE_CHOICES = ['none', 'today', 'tomorrow', 'week', 'month']

/** Болжалды уақыт — минутпен. Бос мән «баға қойылмаған» дегені. */
export const ESTIMATE_CHOICES = [15, 30, 45, 60, 90, 120, 180, 240, 360, 480]

/** 1 — міндетті, 2 — керек, 3 — болса болды. */
export const PRIORITY_CHOICES = [1, 2, 3]

/**
 * «Осы аптада» → нақты күн. Бүгінгі күнді сервер береді (APP_TZ бойынша),
 * сондықтан браузердің уақыт белдеуі басқа болса да күн жылжымайды.
 */
export function dueFromChoice(choice, today) {
  switch (choice) {
    case 'today':
      return today
    case 'tomorrow':
      return addDays(today, 1)
    case 'week':
      return endOfWeek(today)
    case 'month':
      return endOfMonth(today)
    default:
      return null
  }
}
