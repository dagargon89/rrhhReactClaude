import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createBulkSchedulesSchema } from "@/lib/validations/schedule"
import { z } from "zod"
import { eachDayOfInterval } from "date-fns"

// POST - Crear horarios masivos (múltiples empleados en rango de fechas)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBulkSchedulesSchema.parse(body)

    // Verificar que el turno existe
    const shift = await prisma.workShift.findUnique({
      where: { id: validatedData.shiftId },
    })

    if (!shift) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que todos los empleados existen
    const employees = await prisma.employee.findMany({
      where: {
        id: {
          in: validatedData.employeeIds,
        },
      },
    })

    if (employees.length !== validatedData.employeeIds.length) {
      return NextResponse.json(
        { error: "Uno o más empleados no fueron encontrados" },
        { status: 404 }
      )
    }

    // Generar todas las fechas en el rango
    const startDate = new Date(validatedData.startDate as any)
    const endDate = new Date(validatedData.endDate as any)
    const dates = eachDayOfInterval({ start: startDate, end: endDate })

    // Filtrar solo los días que están en los días de trabajo del turno
    const workDates = dates.filter(date => {
      const dayOfWeek = (date.getDay() + 6) % 7 // Convertir domingo=0 a lunes=0
      return shift.daysOfWeek.includes(dayOfWeek)
    })

    const schedulesToCreate = []
    const conflicts = []

    // Para cada empleado y cada fecha, crear un horario
    for (const employeeId of validatedData.employeeIds) {
      for (const date of workDates) {
        // Verificar si ya existe un horario para este empleado en esta fecha
        const existingSchedule = await prisma.schedule.findFirst({
          where: {
            employeeId,
            date,
          },
        })

        if (existingSchedule) {
          conflicts.push({
            employeeId,
            date: date.toISOString().split('T')[0],
            reason: "Ya existe un horario para este empleado en esta fecha",
          })
        } else {
          schedulesToCreate.push({
            employeeId,
            shiftId: validatedData.shiftId,
            date,
            isOverride: validatedData.isOverride,
            notes: validatedData.notes,
          })
        }
      }
    }

    // Crear todos los horarios en una transacción
    const createdSchedules = await prisma.$transaction(
      schedulesToCreate.map(schedule =>
        prisma.schedule.create({
          data: schedule,
        })
      )
    )

    return NextResponse.json({
      message: "Horarios creados exitosamente",
      created: createdSchedules.length,
      conflicts: conflicts.length,
      conflictDetails: conflicts,
      schedules: createdSchedules,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating bulk schedules:", error)
    return NextResponse.json(
      { error: "Error al crear horarios masivos" },
      { status: 500 }
    )
  }
}
