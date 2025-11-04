import { prisma } from "@/lib/prisma"
import { getTodayDateUTC } from "@/lib/date-utils"

/**
 * Servicio para gestionar el auto-checkout de empleados
 * Este servicio ejecuta el checkout automático para empleados que tienen turnos
 * con auto-checkout habilitado y han excedido su hora de salida
 */

interface AutoCheckoutResult {
  success: boolean
  processed: number
  errors: number
  details: Array<{
    attendanceId: string
    employeeId: string
    employeeName: string
    checkOutTime: Date
    error?: string
  }>
}

/**
 * Ejecuta el auto-checkout para todas las asistencias pendientes
 */
export async function processAutoCheckout(): Promise<AutoCheckoutResult> {
  console.log('🔄 Iniciando proceso de auto-checkout...')

  const result: AutoCheckoutResult = {
    success: true,
    processed: 0,
    errors: 0,
    details: []
  }

  try {
    const now = new Date()
    const today = getTodayDateUTC()

    // Buscar todas las asistencias activas (con check-in pero sin check-out) del día de hoy
    const activeAttendances = await prisma.attendance.findMany({
      where: {
        date: today,
        checkInTime: {
          not: null
        },
        checkOutTime: null // Sin check-out
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            defaultShift: {
              include: {
                periods: true
              }
            }
          }
        },
        shiftOverride: {
          include: {
            periods: true
          }
        }
      }
    })

    console.log(`📋 Encontradas ${activeAttendances.length} asistencias activas`)

    for (const attendance of activeAttendances) {
      try {
        // Usar shiftOverride si existe, sino usar defaultShift
        const shift = attendance.shiftOverride || attendance.employee.defaultShift

        // Verificar si el turno tiene auto-checkout habilitado
        if (!shift || !shift.autoCheckoutEnabled) {
          continue
        }

        // Obtener los períodos del día actual (usar UTC para consistencia con el campo date)
        const dayOfWeek = today.getUTCDay()
        const todayPeriods = shift.periods
          .filter(p => p.dayOfWeek === dayOfWeek)
          .sort((a, b) => Number(b.hourTo) - Number(a.hourTo)) // Ordenar por hora de fin descendente

        if (todayPeriods.length === 0) {
          continue
        }

        // Usar la hora de fin más tarde del día como referencia
        const lastPeriod = todayPeriods[0]
        const endHourDecimal = Number(lastPeriod.hourTo)
        const endHour = Math.floor(endHourDecimal)
        const endMin = Math.round((endHourDecimal - endHour) * 60)

        // Crear fecha de fin de turno en la zona horaria local
        // Los valores hourFrom/hourTo representan horas del día en la zona horaria configurada
        const shiftEndTime = new Date(now)
        shiftEndTime.setHours(endHour, endMin, 0, 0)

        // Solo hacer auto-checkout si ya pasó la hora de fin del turno
        // Nota: Esta comparación usa la hora local del servidor, que debe coincidir
        // con la zona horaria configurada en el cron job (America/Chihuahua)
        if (now < shiftEndTime) {
          continue
        }

        console.log(`⏰ Procesando auto-checkout para ${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`)

        // Calcular horas trabajadas
        const checkInTime = new Date(attendance.checkInTime!)
        const checkOutTime = now
        const diffMs = checkOutTime.getTime() - checkInTime.getTime()
        const workedHours = diffMs / (1000 * 60 * 60)

        // Calcular horas extra
        let overtimeHours = 0
        let expectedHours = 0
        for (const period of todayPeriods) {
          const periodHours = Number(period.hourTo) - Number(period.hourFrom)
          expectedHours += periodHours
        }
        if (expectedHours > 0) {
          overtimeHours = Math.max(0, workedHours - expectedHours)
        }

        // Realizar el auto-checkout
        await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            checkOutTime: checkOutTime,
            checkOutMethod: "AUTO",
            isAutoCheckout: true,
            workedHours,
            overtimeHours
          }
        })

        result.processed++
        result.details.push({
          attendanceId: attendance.id,
          employeeId: attendance.employee.id,
          employeeName: `${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`,
          checkOutTime: checkOutTime
        })

        console.log(`✅ Auto-checkout completado para ${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`)

      } catch (error) {
        result.errors++
        result.details.push({
          attendanceId: attendance.id,
          employeeId: attendance.employee.id,
          employeeName: `${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`,
          checkOutTime: now,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
        console.error(`❌ Error en auto-checkout para ${attendance.employee.user.firstName}:`, error)
      }
    }

    console.log(`✅ Proceso de auto-checkout completado: ${result.processed} procesados, ${result.errors} errores`)

    return result

  } catch (error) {
    console.error('❌ Error fatal en proceso de auto-checkout:', error)
    result.success = false
    throw error
  }
}

/**
 * Ejecuta auto-checkout para un empleado específico
 */
export async function processAutoCheckoutForEmployee(employeeId: string): Promise<AutoCheckoutResult> {
  console.log(`🔄 Ejecutando auto-checkout para empleado: ${employeeId}`)

  const result: AutoCheckoutResult = {
    success: true,
    processed: 0,
    errors: 0,
    details: []
  }

  try {
    const now = new Date()
    const today = getTodayDateUTC()

    // Buscar la asistencia activa del empleado
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
        checkInTime: {
          not: null
        },
        checkOutTime: null
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            defaultShift: {
              include: {
                periods: true
              }
            }
          }
        },
        shiftOverride: {
          include: {
            periods: true
          }
        }
      }
    })

    if (!attendance) {
      return {
        ...result,
        success: false,
        details: [{
          attendanceId: '',
          employeeId,
          employeeName: 'Desconocido',
          checkOutTime: now,
          error: 'No hay asistencia activa para este empleado'
        }]
      }
    }

    const shift = attendance.shiftOverride || attendance.employee.defaultShift

    if (!shift || !shift.autoCheckoutEnabled) {
      return {
        ...result,
        success: false,
        details: [{
          attendanceId: attendance.id,
          employeeId,
          employeeName: `${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`,
          checkOutTime: now,
          error: 'El turno no tiene auto-checkout habilitado'
        }]
      }
    }

    // Calcular horas trabajadas
    const checkInTime = new Date(attendance.checkInTime!)
    const checkOutTime = now
    const diffMs = checkOutTime.getTime() - checkInTime.getTime()
    const workedHours = diffMs / (1000 * 60 * 60)

    // Calcular horas extra (usar UTC para consistencia con el campo date)
    const dayOfWeek = today.getUTCDay()
    const todayPeriods = shift.periods.filter(p => p.dayOfWeek === dayOfWeek)
    let expectedHours = 0
    for (const period of todayPeriods) {
      const periodHours = Number(period.hourTo) - Number(period.hourFrom)
      expectedHours += periodHours
    }
    const overtimeHours = expectedHours > 0 ? Math.max(0, workedHours - expectedHours) : 0

    // Realizar el auto-checkout
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: checkOutTime,
        checkOutMethod: "AUTO",
        isAutoCheckout: true,
        workedHours,
        overtimeHours
      }
    })

    result.processed++
    result.details.push({
      attendanceId: attendance.id,
      employeeId,
      employeeName: `${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`,
      checkOutTime: checkOutTime
    })

    console.log(`✅ Auto-checkout completado para ${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`)

    return result

  } catch (error) {
    console.error(`❌ Error en auto-checkout para empleado ${employeeId}:`, error)
    result.success = false
    result.errors++
    throw error
  }
}
