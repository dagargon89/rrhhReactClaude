import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createWorkShiftSchema } from "@/lib/validations/workShift"
import { z } from "zod"

// GET - Listar todos los turnos
export async function GET(request: NextRequest) {
  try {
    const workShifts = await prisma.workShift.findMany({
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Parsear workingHours de string JSON a objeto
    const workShiftsWithParsed = workShifts.map(shift => ({
      ...shift,
      workingHours: JSON.parse(shift.workingHours),
    }))

    return NextResponse.json(workShiftsWithParsed)
  } catch (error) {
    console.error("Error fetching work shifts:", error)
    return NextResponse.json(
      { error: "Error al obtener turnos" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo turno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createWorkShiftSchema.parse(body)

    // Verificar que el código sea único
    const existingCode = await prisma.workShift.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "El código del turno ya existe" },
        { status: 400 }
      )
    }

    // Preparar datos para crear
    const dataToCreate = {
      name: validatedData.name,
      code: validatedData.code,
      description: validatedData.description || null,
      timezone: validatedData.timezone,
      weeklyHours: validatedData.weeklyHours,
      workingHours: JSON.stringify(validatedData.workingHours), // Convertir a JSON string
      isFlexible: validatedData.isFlexible,
      gracePeriodMinutes: validatedData.gracePeriodMinutes,
      autoCheckoutEnabled: validatedData.autoCheckoutEnabled,
      isActive: validatedData.isActive,
    }

    const workShift = await prisma.workShift.create({
      data: dataToCreate,
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    })

    // Parsear workingHours de vuelta a objeto para la respuesta
    const workShiftWithParsed = {
      ...workShift,
      workingHours: JSON.parse(workShift.workingHours),
    }

    return NextResponse.json(workShiftWithParsed, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating work shift:", error)
    return NextResponse.json(
      { error: "Error al crear turno" },
      { status: 500 }
    )
  }
}
