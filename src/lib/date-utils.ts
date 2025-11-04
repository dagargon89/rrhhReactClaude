/**
 * Obtiene la fecha actual según el calendario LOCAL pero guardada como medianoche UTC
 * Esto es necesario porque MySQL DATE se guarda siempre en UTC
 *
 * Ejemplo: Si hoy es "4 de noviembre" en zona GMT-7, devuelve "2025-11-04T00:00:00.000Z"
 * (no "2025-11-04T07:00:00.000Z")
 */
export function getTodayDateUTC(): Date {
  const now = new Date()

  // Obtener la fecha según el calendario LOCAL
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  // Crear fecha UTC con los valores del calendario local
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

/**
 * Obtiene una fecha específica según calendario LOCAL guardada como medianoche UTC
 * @param date - La fecha a convertir
 */
export function getDateUTC(date: Date): Date {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

/**
 * Verifica si dos fechas son el mismo día (comparando solo fecha, no hora)
 * Usa UTC porque el campo DATE de MySQL se guarda en UTC
 * @param date1 - Primera fecha (puede ser un DATE de MySQL en UTC)
 * @param date2 - Segunda fecha (debe ser creada con getTodayDateUTC())
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  )
}

/**
 * Formatea una fecha como string legible usando solo los valores UTC
 * Esto asegura que la fecha se muestre correctamente independientemente de la zona horaria
 * @param date - La fecha a formatear (puede ser un string ISO o Date object)
 * @param options - Opciones de formato (incluye formato corto o largo)
 */
export function formatDateUTC(
  date: Date | string,
  options: {
    includeWeekday?: boolean
    short?: boolean
  } = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const year = dateObj.getUTCFullYear()
  const month = dateObj.getUTCMonth()
  const day = dateObj.getUTCDate()
  const weekday = dateObj.getUTCDay()

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  const monthNamesShort = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ]

  const weekdayNames = [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
  ]

  const weekdayNamesShort = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

  const monthName = options.short ? monthNamesShort[month] : monthNames[month]
  const weekdayName = options.short ? weekdayNamesShort[weekday] : weekdayNames[weekday]

  if (options.includeWeekday && !options.short) {
    return `${weekdayName}, ${day} de ${monthName} de ${year}`
  }

  if (options.includeWeekday && options.short) {
    return `${weekdayName}, ${day} ${monthName} ${year}`
  }

  if (options.short) {
    return `${day} ${monthName} ${year}`
  }

  return `${day} de ${monthName} de ${year}`
}

/**
 * Convierte una fecha a formato ISO (YYYY-MM-DD) usando valores UTC
 * @param date - La fecha a convertir
 */
export function toISODateUTC(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const year = dateObj.getUTCFullYear()
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Obtiene el año y mes en formato YYYY-MM usando valores UTC
 * @param date - La fecha a convertir
 */
export function toYearMonthUTC(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const year = dateObj.getUTCFullYear()
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

/**
 * Obtiene el número del día del mes usando valores UTC
 * @param date - La fecha
 */
export function getDayUTC(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getUTCDate()
}

/**
 * Obtiene el nombre corto del día de la semana usando valores UTC
 * @param date - La fecha
 */
export function getWeekdayShortUTC(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const weekday = dateObj.getUTCDay()
  const weekdayNamesShort = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  return weekdayNamesShort[weekday]
}

/**
 * Obtiene el nombre del mes usando valores UTC
 * @param date - La fecha
 * @param capitalize - Si se debe capitalizar la primera letra
 */
export function getMonthNameUTC(date: Date | string, capitalize = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const month = dateObj.getUTCMonth()
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  const monthName = monthNames[month]
  return capitalize ? monthName.charAt(0).toUpperCase() + monthName.slice(1) : monthName
}

/**
 * Obtiene el año usando valores UTC
 * @param date - La fecha
 */
export function getYearUTC(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getUTCFullYear()
}
