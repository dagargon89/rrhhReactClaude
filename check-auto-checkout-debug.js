const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugAutoCheckout() {
  try {
    console.log('🔍 DEBUG: Verificando configuración de auto-checkout\n')

    // 1. Buscar tu usuario
    const employee = await prisma.employee.findFirst({
      where: {
        user: {
          email: {
            contains: 'dgarcia'
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        defaultShift: {
          include: {
            periods: true
          }
        }
      }
    })

    if (!employee) {
      console.log('❌ No se encontró tu empleado')
      return
    }

    console.log('👤 Empleado:', {
      id: employee.id,
      name: `${employee.user.firstName} ${employee.user.lastName}`,
      email: employee.user.email,
    })

    // 2. Verificar turno
    const shift = employee.defaultShift
    console.log('\n⏰ Turno:', {
      id: shift?.id,
      name: shift?.name,
      autoCheckoutEnabled: shift?.autoCheckoutEnabled,
      periodsCount: shift?.periods?.length || 0
    })

    if (!shift) {
      console.log('❌ El empleado no tiene turno asignado')
      return
    }

    if (!shift.autoCheckoutEnabled) {
      console.log('⚠️  El turno NO tiene auto-checkout habilitado')
      console.log('   Para habilitarlo: Admin → Turnos → Editar turno → Marcar "Habilitar auto-checkout"')
      return
    }

    // 3. Mostrar períodos del turno
    const now = new Date()
    const dayOfWeek = now.getDay()
    const todayPeriods = shift.periods.filter(p => p.dayOfWeek === dayOfWeek)

    console.log('\n📅 Períodos de hoy (día', dayOfWeek, '):', todayPeriods.length)
    todayPeriods.forEach(period => {
      const startHour = Math.floor(Number(period.hourFrom))
      const startMin = Math.round((Number(period.hourFrom) - startHour) * 60)
      const endHour = Math.floor(Number(period.hourTo))
      const endMin = Math.round((Number(period.hourTo) - endHour) * 60)

      console.log(`  - ${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')} → ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`)
    })

    if (todayPeriods.length === 0) {
      console.log('⚠️  No hay períodos configurados para hoy')
      return
    }

    // 4. Calcular hora de fin del turno
    const lastPeriod = todayPeriods.sort((a, b) => Number(b.hourTo) - Number(a.hourTo))[0]
    const endHourDecimal = Number(lastPeriod.hourTo)
    const endHour = Math.floor(endHourDecimal)
    const endMin = Math.round((endHourDecimal - endHour) * 60)

    const shiftEndTime = new Date(now)
    shiftEndTime.setHours(endHour, endMin, 0, 0)

    console.log('\n⏰ Hora de fin del turno:', shiftEndTime.toLocaleTimeString('es-MX'))
    console.log('⏰ Hora actual:', now.toLocaleTimeString('es-MX'))

    const hasEnded = now > shiftEndTime
    console.log('✅ ¿Ya terminó el turno?:', hasEnded ? 'SÍ' : 'NO')

    if (!hasEnded) {
      const minutesRemaining = Math.round((shiftEndTime - now) / (1000 * 60))
      console.log(`⏳ Faltan ${minutesRemaining} minutos para que termine el turno`)
    }

    // 5. Buscar asistencia activa
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: today,
          lt: tomorrow
        },
        checkInTime: {
          not: null
        },
        checkOutTime: null
      }
    })

    console.log('\n📋 Asistencia activa (check-in sin check-out):')
    if (!activeAttendance) {
      console.log('❌ No hay asistencia activa')
      console.log('   Debes tener un check-in sin check-out para que aplique el auto-checkout')
      return
    }

    console.log('✅ Asistencia encontrada:', {
      id: activeAttendance.id,
      checkInTime: activeAttendance.checkInTime.toLocaleTimeString('es-MX'),
      checkOutTime: activeAttendance.checkOutTime
    })

    // 6. Verificar si debería aplicarse auto-checkout
    console.log('\n🎯 Resumen de condiciones para auto-checkout:')
    console.log('  ✅ Empleado tiene turno asignado:', !!shift)
    console.log('  ✅ Turno tiene auto-checkout habilitado:', shift.autoCheckoutEnabled)
    console.log('  ✅ Hay períodos para hoy:', todayPeriods.length > 0)
    console.log('  ✅ Hay asistencia activa:', !!activeAttendance)
    console.log('  ' + (hasEnded ? '✅' : '❌') + ' Ya pasó la hora de fin del turno:', hasEnded)

    if (shift.autoCheckoutEnabled && todayPeriods.length > 0 && activeAttendance && hasEnded) {
      console.log('\n✅ TODAS las condiciones se cumplen')
      console.log('   El auto-checkout DEBERÍA ejecutarse en la próxima ejecución del job (cada 30 min)')
    } else {
      console.log('\n⚠️  Algunas condiciones NO se cumplen')
      console.log('   El auto-checkout NO se ejecutará hasta que todas las condiciones sean verdaderas')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAutoCheckout()
