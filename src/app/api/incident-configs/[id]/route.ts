import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateIncidentConfigSchema } from "@/lib/validations/incident"
import { z } from "zod"

// GET - Obtener una configuración por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const config = await prisma.incidentConfig.findUnique({
      where: { id: params.id },
      include: {
        incidentType: true,
        department: true,
      },
    })

    if (!config) {
      return NextResponse.json(
        { error: "Configuración no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching incident config:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una configuración
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que la configuración existe
    const existingConfig = await prisma.incidentConfig.findUnique({
      where: { id: params.id },
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuración no encontrada" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateIncidentConfigSchema.parse(body)

    // Si se actualiza el tipo de incidencia, verificar que existe
    if (validatedData.incidentTypeId) {
      const incidentType = await prisma.incidentType.findUnique({
        where: { id: validatedData.incidentTypeId },
      })

      if (!incidentType) {
        return NextResponse.json(
          { error: "Tipo de incidencia no encontrado" },
          { status: 404 }
        )
      }
    }

    // Si se actualiza el departamento, verificar que existe
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId },
      })

      if (!department) {
        return NextResponse.json(
          { error: "Departamento no encontrado" },
          { status: 404 }
        )
      }
    }

    // Actualizar configuración
    const updatedConfig = await prisma.incidentConfig.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        incidentType: true,
        department: true,
      },
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de validación inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating incident config:", error)
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una configuración
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que la configuración existe
    const config = await prisma.incidentConfig.findUnique({
      where: { id: params.id },
    })

    if (!config) {
      return NextResponse.json(
        { error: "Configuración no encontrada" },
        { status: 404 }
      )
    }

    // Eliminar configuración
    await prisma.incidentConfig.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Configuración eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting incident config:", error)
    return NextResponse.json(
      { error: "Error al eliminar configuración" },
      { status: 500 }
    )
  }
}
