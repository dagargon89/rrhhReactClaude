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
        schedule: {
          include: {
            shift: true,
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

    // Calcular horas extra
    let overtimeHours = 0
    if (attendance.schedule?.shift) {
      let expectedHours = 8

      if (attendance.schedule.shift.workingHours) {
        try {
          const workingHours = JSON.parse(attendance.schedule.shift.workingHours)
          const dayOfWeek = attendance.date.getDay()
          const dayConfig = workingHours.find((d: any) => d.day === dayOfWeek)
          if (dayConfig?.enabled) {
            expectedHours = dayConfig.duration
          }
        } catch {
          // Fallback
          const [startHour, startMin] = attendance.schedule.shift.startTime.split(":").map(Number)
          const [endHour, endMin] = attendance.schedule.shift.endTime.split(":").map(Number)
          expectedHours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60
        }
      }

      overtimeHours = Math.max(0, workedHours - expectedHours)
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




