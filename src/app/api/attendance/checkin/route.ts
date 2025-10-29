import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkInSchema } from "@/lib/validations/attendance"
import { processTardiness } from "@/services/tardinessService"
import { z } from "zod"

// POST - Registrar entrada (check-in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkInSchema.parse(body)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Verificar si ya tiene un check-in hoy
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        date: today,
      },
    })

    if (existingAttendance?.checkInTime) {
      return NextResponse.json(
        { error: "Ya se registró la entrada hoy" },
        { status: 400 }
      )
    }

    // Buscar horario del día
    const schedule = await prisma.schedule.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        date: today,
      },
      include: {
        shift: true,
      },
    })

    // Determinar status (PRESENT o LATE) y calcular minutos de retraso
    let status = "PRESENT"
    let minutesLate = 0
    let scheduledStartTime: Date | null = null
    let tardinessResult = null

    if (schedule?.shift) {
      const now = new Date()
      let shiftStartTime: string

      // Intentar obtener hora de inicio del workingHours JSON
      if (schedule.shift.workingHours) {
        try {
          const workingHours = JSON.parse(schedule.shift.workingHours)
          const dayOfWeek = now.getDay()
          const dayConfig = workingHours.find((d: any) => d.day === dayOfWeek)
          shiftStartTime = dayConfig?.startTime || schedule.shift.startTime
        } catch {
          shiftStartTime = schedule.shift.startTime
        }
      } else {
        shiftStartTime = schedule.shift.startTime
      }

      const [shiftHour, shiftMin] = shiftStartTime.split(":").map(Number)
      const shiftStart = new Date(now)
      shiftStart.setHours(shiftHour, shiftMin, 0, 0)
      scheduledStartTime = shiftStart

      // Agregar período de gracia
      const graceEnd = new Date(shiftStart.getTime() + schedule.shift.gracePeriodMinutes * 60 * 1000)

      if (now > graceEnd) {
        status = "LATE"
        // Calcular minutos de retraso (sin considerar período de gracia)
        minutesLate = Math.floor((now.getTime() - shiftStart.getTime()) / (1000 * 60))
      }
    }

    let attendance

    if (existingAttendance) {
      // Actualizar el registro existente
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkInTime: new Date(),
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
    } else {
      // Crear nuevo registro
      attendance = await prisma.attendance.create({
        data: {
          employeeId: validatedData.employeeId,
          scheduleId: schedule?.id,
          date: today,
          checkInTime: new Date(),
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
    }

    // Procesar tardanza si aplica (después del check-in exitoso)
    if (minutesLate > 0 && scheduledStartTime) {
      try {
        tardinessResult = await processTardiness({
          employeeId: validatedData.employeeId,
          minutesLate,
          checkInTime: attendance.checkInTime!,
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




