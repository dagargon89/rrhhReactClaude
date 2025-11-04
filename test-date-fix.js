// Script para probar que las fechas ahora se guardan correctamente en zona horaria local

const now = new Date()

console.log('=== FECHA ACTUAL ===')
console.log('Fecha/hora completa:', now.toString())
console.log('Fecha local:', now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
console.log('ISO String:', now.toISOString())

console.log('\n=== ANTES (UTC) - INCORRECTO ===')
const oldWayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
console.log('Date.UTC:', oldWayUTC.toISOString())
console.log('Interpretado en local:', oldWayUTC.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

console.log('\n=== AHORA (Local) - CORRECTO ===')
const newWayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
console.log('new Date(local):', newWayLocal.toISOString())
console.log('Interpretado en local:', newWayLocal.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

console.log('\n=== COMPARACIÓN ===')
console.log('Día del calendario actual:', now.getDate())
console.log('Día guardado (UTC - incorrecto):', new Date(oldWayUTC.toISOString()).toLocaleDateString('es-MX'))
console.log('Día guardado (Local - correcto):', new Date(newWayLocal.toISOString()).toLocaleDateString('es-MX'))
