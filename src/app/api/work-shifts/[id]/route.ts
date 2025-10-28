import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateWorkShiftSchema } from "@/lib/validations/workShift"
import { z } from "zod"

// GET - Obtener un turno por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workShift = await prisma.workShift.findUnique({
      where: { id: params.id },
      include: {
        schedules: {
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
          take: 10,
          orderBy: {
            date: "desc",
          },
        },
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    })

    if (!workShift) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    // Parsear workingHours de string JSON a objeto
    const workShiftWithParsed = {
      ...workShift,
      workingHours: JSON.parse(workShift.workingHours),
    }

    return NextResponse.json(workShiftWithParsed)
  } catch (error) {
    console.error("Error fetching work shift:", error)
    return NextResponse.json(
      { error: "Error al obtener turno" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un turno
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateWorkShiftSchema.parse(body)

    // Verificar que el turno existe
    const existingShift = await prisma.workShift.findUnique({
      where: { id: params.id },
    })

    if (!existingShift) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    // Si se está actualizando el código, verificar que sea único
    if (validatedData.code && validatedData.code !== existingShift.code) {
      const codeExists = await prisma.workShift.findUnique({
        where: { code: validatedData.code },
      })

      if (codeExists) {
        return NextResponse.json(
          { error: "El código del turno ya existe" },
          { status: 400 }
        )
      }
    }

    // Limpiar valores undefined y preparar datos
    const cleanedData: any = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    )

    // Convertir workingHours a JSON string si existe
    if (cleanedData.workingHours) {
      cleanedData.workingHours = JSON.stringify(cleanedData.workingHours)
    }

    const updatedShift = await prisma.workShift.update({
      where: { id: params.id },
      data: cleanedData,
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
      ...updatedShift,
      workingHours: JSON.parse(updatedShift.workingHours),
    }

    return NextResponse.json(workShiftWithParsed)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating work shift:", error)
    return NextResponse.json(
      { error: "Error al actualizar turno" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un turno
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el turno existe
    const existingShift = await prisma.workShift.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    })

    if (!existingShift) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que no tenga horarios asignados
    if (existingShift._count.schedules > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar el turno porque tiene horarios asignados",
          schedulesCount: existingShift._count.schedules
        },
        { status: 400 }
      )
    }

    await prisma.workShift.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Turno eliminado exitosamente"
    })
  } catch (error) {
    console.error("Error deleting work shift:", error)
    return NextResponse.json(
      { error: "Error al eliminar turno" },
      { status: 500 }
    )
  }
}
