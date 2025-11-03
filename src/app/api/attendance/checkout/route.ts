import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkOutSchema } from "@/lib/validations/attendance"
import { z } from "zod"

// POST - Registrar salida (check-out)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkOutSchema.parse(body)

    const attendance = await prisma.attendance.findUnique({
      where: { id: validatedData.attendanceId },
      include: {
        employee: {
          include: {
            defaultShift: {
              include: {
                periods: true,
              },
            },
          },
        },
        shiftOverride: {
          include: {
            periods: true,
          },
        },
      },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: "Registro de asistencia no encontrado" },
        { status: 404 }
      )
    }

    if (!attendance.checkInTime) {
      return NextResponse.json(
        { error: "No se ha registrado la entrada" },
        { status: 400 }
      )
    }

    if (attendance.checkOutTime) {
      return NextResponse.json(
        { error: "Ya se registró la salida" },
        { status: 400 }
      )
    }

    const checkOutTime = new Date()

    // Calcular horas trabajadas
    const diffMs = checkOutTime.getTime() - attendance.checkInTime.getTime()
    const workedHours = diffMs / (1000 * 60 * 60)

    console.log('⏱️ Hours calculation:', {
      attendanceId: attendance.id,
      checkInTime: attendance.checkInTime.toISOString(),
      checkOutTime: checkOutTime.toISOString(),
      diffMs,
      diffMinutes: diffMs / (1000 * 60),
      workedHours,
      workedHoursRounded: Math.round(workedHours * 100) / 100,
    })

    // Calcular horas extra
    let overtimeHours = 0

    // Usar shiftOverride si existe, sino usar defaultShift
    const shift = attendance.shiftOverride || attendance.employee.defaultShift

    if (shift && shift.periods.length > 0) {
      const dayOfWeek = attendance.date.getDay()

      // Calcular horas esperadas sumando todos los períodos del día
      const todayPeriods = shift.periods.filter(p => p.dayOfWeek === dayOfWeek)

      let expectedHours = 0
      for (const period of todayPeriods) {
        const periodHours = Number(period.hourTo) - Number(period.hourFrom)
        expectedHours += periodHours
      }

      if (expectedHours > 0) {
        overtimeHours = Math.max(0, workedHours - expectedHours)
      }
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: validatedData.attendanceId },
      data: {
        checkOutTime,
        checkOutMethod: validatedData.checkOutMethod,
        checkOutLocation: validatedData.checkOutLocation,
        workedHours,
        overtimeHours,
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

    return NextResponse.json(updatedAttendance)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error during check-out:", error)
    return NextResponse.json(
      { error: "Error al registrar salida" },
      { status: 500 }
    )
  }
}





