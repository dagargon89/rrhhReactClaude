import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateScheduleSchema } from "@/lib/validations/schedule"
import { z } from "zod"

// GET - Obtener un horario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            status: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            position: {
              select: {
                id: true,
                title: true,
                code: true,
              },
            },
          },
        },
        shift: true,
        attendances: {
          select: {
            id: true,
            checkInTime: true,
            checkOutTime: true,
            workedHours: true,
            status: true,
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: "Horario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json(
      { error: "Error al obtener horario" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un horario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateScheduleSchema.parse(body)

    // Verificar que el horario existe
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: params.id },
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Horario no encontrado" },
        { status: 404 }
      )
    }

    // Si se está actualizando el empleado o la fecha, verificar que no exista conflicto
    if (validatedData.employeeId || validatedData.date) {
      const employeeId = validatedData.employeeId || existingSchedule.employeeId
      const date = validatedData.date ? new Date(validatedData.date as any) : existingSchedule.date

      const conflictSchedule = await prisma.schedule.findFirst({
        where: {
          employeeId,
          date,
          NOT: {
            id: params.id,
          },
        },
      })

      if (conflictSchedule) {
        return NextResponse.json(
          { error: "Ya existe un horario para este empleado en esta fecha" },
          { status: 400 }
        )
      }
    }

    // Limpiar valores undefined
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    )

    // Convertir fecha si existe
    if (cleanedData.date) {
      cleanedData.date = new Date(cleanedData.date as any)
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: params.id },
      data: cleanedData,
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
        shift: true,
      },
    })

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating schedule:", error)
    return NextResponse.json(
      { error: "Error al actualizar horario" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un horario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el horario existe
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Horario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que no tenga asistencias registradas
    if (existingSchedule._count.attendances > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar el horario porque tiene asistencias registradas",
          attendancesCount: existingSchedule._count.attendances
        },
        { status: 400 }
      )
    }

    await prisma.schedule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Horario eliminado exitosamente"
    })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json(
      { error: "Error al eliminar horario" },
      { status: 500 }
    )
  }
}
