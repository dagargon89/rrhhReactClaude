import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateAttendanceSchema } from "@/lib/validations/attendance"
import { z } from "zod"

// GET - Obtener una asistencia por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
            position: {
              select: {
                title: true,
              },
            },
          },
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
    })

    if (!attendance) {
      return NextResponse.json(
        { error: "Asistencia no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { error: "Error al obtener asistencia" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una asistencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateAttendanceSchema.parse(body)

    // Verificar que la asistencia existe
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: params.id },
      include: {
        schedule: {
          include: {
            shift: true,
          },
        },
      },
    })

    if (!existingAttendance) {
      return NextResponse.json(
        { error: "Asistencia no encontrada" },
        { status: 404 }
      )
    }

    // Calcular horas trabajadas si se actualizan los tiempos
    let workedHours = validatedData.workedHours ?? existingAttendance.workedHours
    let overtimeHours = validatedData.overtimeHours ?? existingAttendance.overtimeHours

    const checkInTime = validatedData.checkInTime 
      ? new Date(validatedData.checkInTime)
      : existingAttendance.checkInTime

    const checkOutTime = validatedData.checkOutTime
      ? new Date(validatedData.checkOutTime)
      : existingAttendance.checkOutTime

    if (checkInTime && checkOutTime) {
      const diffMs = checkOutTime.getTime() - checkInTime.getTime()
      workedHours = diffMs / (1000 * 60 * 60)

      // Calcular horas extra basado en el turno
      const shift = existingAttendance.shiftOverride || existingAttendance.employee.defaultShift

      if (shift && shift.periods && shift.periods.length > 0) {
        const dayOfWeek = existingAttendance.date.getDay()
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
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: params.id },
      data: {
        checkInTime: validatedData.checkInTime ? new Date(validatedData.checkInTime) : undefined,
        checkInMethod: validatedData.checkInMethod,
        checkInLocation: validatedData.checkInLocation,
        checkOutTime: validatedData.checkOutTime ? new Date(validatedData.checkOutTime) : undefined,
        checkOutMethod: validatedData.checkOutMethod,
        checkOutLocation: validatedData.checkOutLocation,
        workedHours,
        overtimeHours,
        status: validatedData.status,
        notes: validatedData.notes,
      },
      include: {
        employee: {
          select: {
            id: true,
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

    console.error("Error updating attendance:", error)
    return NextResponse.json(
      { error: "Error al actualizar asistencia" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una asistencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.attendance.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Asistencia eliminada exitosamente"
    })
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json(
      { error: "Error al eliminar asistencia" },
      { status: 500 }
    )
  }
}





