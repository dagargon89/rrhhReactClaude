import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

// Schema de validación para actualización
const updateAccumulationSchema = z.object({
  lateArrivalsCount: z.number().min(0).optional(),
  directTardinessCount: z.number().min(0).optional(),
  formalTardiesCount: z.number().min(0).optional(),
  administrativeActs: z.number().min(0).optional(),
})

// GET - Obtener una acumulación específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const accumulation = await prisma.tardinessAccumulation.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
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
                code: true,
              },
            },
            position: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })

    if (!accumulation) {
      return NextResponse.json(
        { error: "Acumulación no encontrada" },
        { status: 404 }
      )
    }

    // Serializar fechas
    const serializedAccumulation = {
      ...accumulation,
      createdAt: accumulation.createdAt.toISOString(),
      updatedAt: accumulation.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedAccumulation)
  } catch (error) {
    console.error("Error fetching tardiness accumulation:", error)
    return NextResponse.json(
      { error: "Error al obtener acumulación de tardanzas" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una acumulación (solo para correcciones administrativas)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json(
        { error: "No autorizado. Solo superusuarios pueden editar acumulaciones." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateAccumulationSchema.parse(body)

    // Verificar que la acumulación existe
    const existingAccumulation = await prisma.tardinessAccumulation.findUnique({
      where: { id: params.id },
    })

    if (!existingAccumulation) {
      return NextResponse.json(
        { error: "Acumulación no encontrada" },
        { status: 404 }
      )
    }

    // Actualizar acumulación
    const updatedAccumulation = await prisma.tardinessAccumulation.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        employee: {
          include: {
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
        },
      },
    })

    // Serializar fechas
    const serializedAccumulation = {
      ...updatedAccumulation,
      createdAt: updatedAccumulation.createdAt.toISOString(),
      updatedAt: updatedAccumulation.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedAccumulation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating tardiness accumulation:", error)
    return NextResponse.json(
      { error: "Error al actualizar acumulación de tardanzas" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una acumulación (solo superusuarios)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json(
        { error: "No autorizado. Solo superusuarios pueden eliminar acumulaciones." },
        { status: 403 }
      )
    }

    // Verificar que la acumulación existe
    const accumulation = await prisma.tardinessAccumulation.findUnique({
      where: { id: params.id },
    })

    if (!accumulation) {
      return NextResponse.json(
        { error: "Acumulación no encontrada" },
        { status: 404 }
      )
    }

    // Eliminar acumulación
    await prisma.tardinessAccumulation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Acumulación eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting tardiness accumulation:", error)
    return NextResponse.json(
      { error: "Error al eliminar acumulación de tardanzas" },
      { status: 500 }
    )
  }
}
