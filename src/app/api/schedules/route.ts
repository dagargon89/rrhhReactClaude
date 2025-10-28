import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createScheduleSchema } from "@/lib/validations/schedule"
import { z } from "zod"

// GET - Listar todos los horarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const shiftId = searchParams.get("shiftId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (shiftId) {
      where.shiftId = shiftId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    const schedules = await prisma.schedule.findMany({
      where,
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
          },
        },
        shift: {
          select: {
            id: true,
            name: true,
            code: true,
            startTime: true,
            endTime: true,
            isFlexible: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
      take: 100,
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json(
      { error: "Error al obtener horarios" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo horario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createScheduleSchema.parse(body)

    // Verificar que el empleado existe
    const employee = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

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

    // Verificar que no existe un horario para este empleado en esta fecha
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        date: new Date(validatedData.date as any),
      },
    })

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Ya existe un horario para este empleado en esta fecha" },
        { status: 400 }
      )
    }

    const schedule = await prisma.schedule.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date as any),
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
        shift: true,
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating schedule:", error)
    return NextResponse.json(
      { error: "Error al crear horario" },
      { status: 500 }
    )
  }
}
