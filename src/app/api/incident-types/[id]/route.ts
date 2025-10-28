import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateIncidentTypeSchema } from "@/lib/validations/incident"
import { z } from "zod"

// GET - Obtener un tipo de incidencia por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const incidentType = await prisma.incidentType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            incidents: true,
            configs: true,
          },
        },
      },
    })

    if (!incidentType) {
      return NextResponse.json(
        { error: "Tipo de incidencia no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(incidentType)
  } catch (error) {
    console.error("Error fetching incident type:", error)
    return NextResponse.json(
      { error: "Error al obtener tipo de incidencia" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un tipo de incidencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el tipo existe
    const existingType = await prisma.incidentType.findUnique({
      where: { id: params.id },
    })

    if (!existingType) {
      return NextResponse.json(
        { error: "Tipo de incidencia no encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateIncidentTypeSchema.parse(body)

    // Si se actualiza el código, verificar unicidad
    if (validatedData.code && validatedData.code !== existingType.code) {
      const existingCode = await prisma.incidentType.findUnique({
        where: { code: validatedData.code },
      })

      if (existingCode) {
        return NextResponse.json(
          { error: "El código ya está en uso" },
          { status: 400 }
        )
      }
    }

    // Si se actualiza el nombre, verificar unicidad
    if (validatedData.name && validatedData.name !== existingType.name) {
      const existingName = await prisma.incidentType.findUnique({
        where: { name: validatedData.name },
      })

      if (existingName) {
        return NextResponse.json(
          { error: "El nombre ya está en uso" },
          { status: 400 }
        )
      }
    }

    // Actualizar tipo de incidencia
    const updatedType = await prisma.incidentType.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedType)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de validación inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating incident type:", error)
    return NextResponse.json(
      { error: "Error al actualizar tipo de incidencia" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un tipo de incidencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el tipo existe
    const incidentType = await prisma.incidentType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            incidents: true,
          },
        },
      },
    })

    if (!incidentType) {
      return NextResponse.json(
        { error: "Tipo de incidencia no encontrado" },
        { status: 404 }
      )
    }

    // Verificar si tiene incidencias asociadas
    if (incidentType._count.incidents > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar el tipo de incidencia porque tiene incidencias asociadas",
          count: incidentType._count.incidents
        },
        { status: 400 }
      )
    }

    // Eliminar tipo de incidencia
    await prisma.incidentType.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Tipo de incidencia eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting incident type:", error)
    return NextResponse.json(
      { error: "Error al eliminar tipo de incidencia" },
      { status: 500 }
    )
  }
}
