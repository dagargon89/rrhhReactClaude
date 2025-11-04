import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkInSchema } from "@/lib/validations/attendance"
import { processTardiness } from "@/services/tardinessService"
import { getTodayDateUTC } from "@/lib/date-utils"
import { z } from "zod"

// POST - Registrar entrada (check-in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkInSchema.parse(body)

    const today = getTodayDateUTC()
    const checkInTime = new Date()

    console.log('📅 Check-in date:', {
      today: today.toISOString(),
      checkInTime: checkInTime.toISOString(),
      dayOfWeek: today.getUTCDay(), // 0=domingo, 1=lunes, etc. (usar UTC porque `date` es DATE en MySQL)
    })

    // Buscar el último registro de asistencia del empleado para hoy
    const lastAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        date: today,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Verificar que el último registro tenga check-out antes de permitir un nuevo check-in
    if (lastAttendance && !lastAttendance.checkOutTime) {
      return NextResponse.json(
        { error: "Ya tienes una entrada activa. Debes registrar una salida primero." },
        { status: 400 }
      )
    }

    // Obtener el turno del empleado para calcular si llegó tarde
    const employee = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId },
      include: {
        defaultShift: {
          include: {
            periods: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

    // Determinar status (PRESENT o LATE) y calcular minutos de retraso
    let status = "PRESENT"
    let minutesLate = 0
    let scheduledStartTime: Date | null = null
    let tardinessResult = null

    // Solo calcular tardanza en el PRIMER check-in del día
    const isFirstCheckInOfDay = !lastAttendance

    if (isFirstCheckInOfDay && employee.defaultShift && employee.defaultShift.periods.length > 0) {
      const now = new Date()
      const dayOfWeek = now.getDay()

      // Buscar el primer período del día actual
      const todayPeriods = employee.defaultShift.periods
        .filter(p => p.dayOfWeek === dayOfWeek)
        .sort((a, b) => Number(a.hourFrom) - Number(b.hourFrom))

      if (todayPeriods.length > 0) {
        const firstPeriod = todayPeriods[0]

        // Convertir hourFrom decimal a hora (ej: 9.5 -> 09:30)
        const hourFromDecimal = Number(firstPeriod.hourFrom)
        const shiftHour = Math.floor(hourFromDecimal)
        const shiftMin = Math.round((hourFromDecimal - shiftHour) * 60)

        const shiftStart = new Date(now)
        shiftStart.setHours(shiftHour, shiftMin, 0, 0)
        scheduledStartTime = shiftStart

        // Agregar período de gracia
        const graceEnd = new Date(shiftStart.getTime() + employee.defaultShift.gracePeriodMinutes * 60 * 1000)

        if (now > graceEnd) {
          status = "LATE"
          // Calcular minutos de retraso (sin considerar período de gracia)
          minutesLate = Math.floor((now.getTime() - shiftStart.getTime()) / (1000 * 60))
        }
      }
    }

    // Crear nuevo registro de asistencia
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: validatedData.employeeId,
        date: today,
        checkInTime: checkInTime,
        checkInMethod: validatedData.checkInMethod,
        checkInLocation: validatedData.checkInLocation,
        status,
      },
      include: {
        employee: {
          select: {
            employeeCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    console.log('✅ Check-in saved:', {
      attendanceId: attendance.id,
      employeeId: attendance.employeeId,
      date: attendance.date.toISOString(),
      checkInTime: attendance.checkInTime?.toISOString(),
      status: attendance.status,
    })

    // Procesar tardanza solo en el primer check-in del día
    if (isFirstCheckInOfDay && minutesLate > 0 && scheduledStartTime) {
      try {
        tardinessResult = await processTardiness({
          employeeId: validatedData.employeeId,
          minutesLate,
          checkInTime: checkInTime,
          attendanceId: attendance.id,
        })

        console.log('✅ Tardanza procesada:', {
          employeeId: validatedData.employeeId,
          minutesLate,
          rule: tardinessResult.ruleName,
          type: tardinessResult.accumulationType,
          formalTardiesAdded: tardinessResult.formalTardiesAdded,
          stats: tardinessResult.currentMonthStats,
          disciplinaryAction: tardinessResult.disciplinaryActionTriggered,
        })
      } catch (error) {
        console.error("❌ Error al procesar tardanza:", error)
        // No fallar el check-in si hay error en el procesamiento de tardanzas
      }
    }

    return NextResponse.json({
      success: true,
      attendance,
      tardiness: tardinessResult ? {
        minutesLate,
        ruleApplied: tardinessResult.ruleName,
        accumulationType: tardinessResult.accumulationType,
        formalTardiesAdded: tardinessResult.formalTardiesAdded,
        currentMonthStats: tardinessResult.currentMonthStats,
        disciplinaryActionTriggered: tardinessResult.disciplinaryActionTriggered,
        disciplinaryActionId: tardinessResult.disciplinaryActionId,
      } : null
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error during check-in:", error)
    return NextResponse.json(
      { error: "Error al registrar entrada" },
      { status: 500 }
    )
  }
}

