// Test de la corrección de fechas

const now = new Date()
console.log('=== FECHA/HORA ACTUAL ===')
console.log('Hora local completa:', now.toString())
console.log('Día del calendario local:', now.getDate())
console.log()

// Simular getTodayDateUTC()
const year = now.getFullYear()
const month = now.getMonth()
const day = now.getDate()
const todayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))

console.log('=== getTodayDateUTC() ===')
console.log('ISO String:', todayUTC.toISOString())
console.log('getUTCDate():', todayUTC.getUTCDate(), '(correcto - día del calendario local)')
console.log('getDate():', todayUTC.getDate(), '(incorrecto si usamos esto)')
console.log()

// Simular lo que devuelve MySQL cuando guardamos y leemos
const mysqlDate = new Date('2025-11-04T00:00:00.000Z') // Lo que viene de MySQL

console.log('=== Fecha leída de MySQL ===')
console.log('ISO String:', mysqlDate.toISOString())
console.log('getUTCDate():', mysqlDate.getUTCDate(), '(correcto - 4)')
console.log('getDate():', mysqlDate.getDate(), '(incorrecto - 3 en GMT-7)')
console.log()

// Comparar con isSameDay usando UTC
const isSameDayUTC = (
  todayUTC.getUTCFullYear() === mysqlDate.getUTCFullYear() &&
  todayUTC.getUTCMonth() === mysqlDate.getUTCMonth() &&
  todayUTC.getUTCDate() === mysqlDate.getUTCDate()
)

console.log('=== Comparación ===')
console.log('Hoy (UTC):', `${todayUTC.getUTCFullYear()}-${todayUTC.getUTCMonth()+1}-${todayUTC.getUTCDate()}`)
console.log('MySQL (UTC):', `${mysqlDate.getUTCFullYear()}-${mysqlDate.getUTCMonth()+1}-${mysqlDate.getUTCDate()}`)
console.log('isSameDay():', isSameDayUTC ? 'SI - CORRECTO' : 'NO - INCORRECTO')
