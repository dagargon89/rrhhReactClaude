const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDavidAutoCheckout() {
  console.log('='.repeat(80))
  console.log('VERIFICACIÓN DE AUTO CHECK-OUT PARA DAVID')
  console.log('='.repeat(80))

  try {
    // Buscar usuario David (buscar por varios criterios)
    const davidUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'David' } },
          { firstName: { contains: 'david' } },
          { email: { contains: 'david' } }
        ]
      },
      include: {
        employee: {
          include: {
            defaultShift: {
              include: {
                periods: {
                  orderBy: [
                    { dayOfWeek: 'asc' },
                    { hourFrom: 'asc' }
                  ]
                }
              }
            }
          }
        }
      }
    })

    if (!davidUser || !davidUser.employee) {
      console.log('❌ No se encontró el empleado David')
      return
    }

    console.log('\n👤 INFORMACIÓN DEL EMPLEADO:')
    console.log(`  - Nombre: ${davidUser.firstName} ${davidUser.lastName}`)
    console.log(`  - Email: ${davidUser.email}`)
    console.log(`  - Employee ID: ${davidUser.employee.id}`)
    console.log(`  - Employee Code: ${davidUser.employee.employeeCode}`)

    // Obtener fecha de hoy en UTC
    const now = new Date()
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0))
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

    console.log('\n📅 FECHAS:')
    console.log(`  - Ahora (local): ${now.toLocaleString('es-MX', { timeZone: 'America/Chihuahua' })}`)
    console.log(`  - Ahora (UTC): ${now.toISOString()}`)
    console.log(`  - Hoy (UTC): ${today.toISOString()}`)
    console.log(`  - Día de la semana (UTC): ${today.getUTCDay()} (0=domingo, 1=lunes, 2=martes, ...)`)

    // Buscar asistencia activa
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: davidUser.employee.id,
        date: today,
        checkInTime: { not: null },
        checkOutTime: null
      },
      include: {
        shiftOverride: {
          include: {
            periods: {
              orderBy: [
                { dayOfWeek: 'asc' },
                { hourFrom: 'asc' }
              ]
            }
          }
        }
      }
    })

    if (!activeAttendance) {
      console.log('\n❌ No hay asistencia activa para hoy (sin check-out)')

      // Buscar todas las asistencias de hoy
      const allToday = await prisma.attendance.findMany({
        where: {
          employeeId: davidUser.employee.id,
          date: today
        }
      })

      console.log(`\n📋 Asistencias de hoy encontradas: ${allToday.length}`)
      allToday.forEach(att => {
        console.log(`  - ID: ${att.id}`)
        console.log(`    Check-in: ${att.checkInTime?.toISOString() || 'N/A'}`)
        console.log(`    Check-out: ${att.checkOutTime?.toISOString() || 'N/A'}`)
      })

      return
    }

    console.log('\n✅ ASISTENCIA ACTIVA ENCONTRADA:')
    console.log(`  - ID: ${activeAttendance.id}`)
    console.log(`  - Fecha: ${activeAttendance.date.toISOString()}`)
    console.log(`  - Check-in: ${activeAttendance.checkInTime?.toISOString()}`)
    console.log(`  - Check-in (local): ${activeAttendance.checkInTime?.toLocaleString('es-MX', { timeZone: 'America/Chihuahua' })}`)
    console.log(`  - Check-out: ${activeAttendance.checkOutTime || 'PENDIENTE'}`)

    // Determinar qué turno usar
    const shift = activeAttendance.shiftOverride || davidUser.employee.defaultShift

    if (!shift) {
      console.log('\n❌ No hay turno configurado para este empleado')
      return
    }

    console.log('\n⏰ CONFIGURACIÓN DEL TURNO:')
    console.log(`  - Nombre: ${shift.name}`)
    console.log(`  - Código: ${shift.code}`)
    console.log(`  - Auto check-out habilitado: ${shift.autoCheckoutEnabled ? '✅ SÍ' : '❌ NO'}`)
    console.log(`  - Zona horaria: ${shift.timezone}`)

    if (!shift.autoCheckoutEnabled) {
      console.log('\n⚠️ EL AUTO CHECK-OUT NO ESTÁ HABILITADO PARA ESTE TURNO')
      console.log('   Para habilitarlo, edita el turno y activa "Auto check-out"')
      return
    }

    // Obtener períodos del día actual (usar UTC)
    const dayOfWeek = today.getUTCDay()
    const todayPeriods = shift.periods.filter(p => p.dayOfWeek === dayOfWeek)

    console.log(`\n📋 PERÍODOS DEL TURNO PARA HOY (día ${dayOfWeek}):`)
    if (todayPeriods.length === 0) {
      console.log('  ❌ No hay períodos configurados para hoy')
      console.log('\n🔍 Todos los períodos del turno:')
      shift.periods.forEach(p => {
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        console.log(`    - ${dayNames[p.dayOfWeek]}: ${p.hourFrom} - ${p.hourTo} (${p.name})`)
      })
      return
    }

    todayPeriods.forEach(p => {
      console.log(`  - ${p.name}: ${p.hourFrom} - ${p.hourTo}`)
    })

    // Obtener la hora de fin más tarde
    const lastPeriod = todayPeriods.sort((a, b) => Number(b.hourTo) - Number(a.hourTo))[0]
    const endHourDecimal = Number(lastPeriod.hourTo)
    const endHour = Math.floor(endHourDecimal)
    const endMin = Math.round((endHourDecimal - endHour) * 60)

    console.log(`\n⏱️ HORA DE FIN DEL TURNO: ${endHour}:${String(endMin).padStart(2, '0')}`)

    // Crear fecha de fin de turno en hora local
    const shiftEndTime = new Date(now)
    shiftEndTime.setHours(endHour, endMin, 0, 0)

    console.log(`  - Hora de fin (calculada): ${shiftEndTime.toLocaleString('es-MX', { timeZone: 'America/Chihuahua' })}`)
    console.log(`  - Hora actual: ${now.toLocaleString('es-MX', { timeZone: 'America/Chihuahua' })}`)

    const timeDiff = now.getTime() - shiftEndTime.getTime()
    const minutesDiff = Math.floor(timeDiff / (1000 * 60))

    if (now >= shiftEndTime) {
      console.log(`\n✅ YA PASÓ LA HORA DE FIN DEL TURNO (hace ${minutesDiff} minutos)`)
      console.log('   El auto check-out DEBERÍA haberse ejecutado')

      console.log('\n🔍 POSIBLES RAZONES POR LAS QUE NO SE EJECUTÓ:')
      console.log('  1. El cron job no está corriendo')
      console.log('  2. El servidor se reinició recientemente')
      console.log('  3. Hay un error en el job de auto check-out')
      console.log('\n💡 SOLUCIÓN: Ejecutar auto check-out manual')

    } else {
      console.log(`\n⏳ AÚN NO ES HORA DE AUTO CHECK-OUT`)
      console.log(`   Faltan ${Math.abs(minutesDiff)} minutos`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDavidAutoCheckout()
