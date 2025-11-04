/**
 * Obtiene la fecha actual en UTC configurada a medianoche (00:00:00)
 * Esto asegura que siempre obtenemos la fecha correcta independientemente de la zona horaria del servidor
 */
export function getTodayDateUTC(): Date {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const day = now.getUTCDate()

  // Crear una nueva fecha en UTC a medianoche
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

/**
 * Obtiene una fecha específica en UTC configurada a medianoche
 * @param date - La fecha a convertir
 */
export function getDateUTC(date: Date): Date {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

/**
 * Verifica si dos fechas son el mismo día (comparando solo fecha, no hora)
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  )
}
