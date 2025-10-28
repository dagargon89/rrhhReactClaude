import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createIncidentTypeSchema } from "@/lib/validations/incident"
import { z } from "zod"

// GET - Listar tipos de incidencia
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const incidentTypes = await prisma.incidentType.findMany({
      where,
      include: {
        _count: {
          select: {
            incidents: true,
            configs: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(incidentTypes)
  } catch (error) {
    console.error("Error fetching incident types:", error)
    return NextResponse.json(
      { error: "Error al obtener tipos de incidencia" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo tipo de incidencia
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createIncidentTypeSchema.parse(body)

    // Verificar que el código sea único
    const existingCode = await prisma.incidentType.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "El código ya está en uso" },
        { status: 400 }
      )
    }

    // Verificar que el nombre sea único
    const existingName = await prisma.incidentType.findUnique({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return NextResponse.json(
        { error: "El nombre ya está en uso" },
        { status: 400 }
      )
    }

    // Crear tipo de incidencia
    const incidentType = await prisma.incidentType.create({
      data: validatedData,
    })

    return NextResponse.json(incidentType, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de validación inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating incident type:", error)
    return NextResponse.json(
      { error: "Error al crear tipo de incidencia" },
      { status: 500 }
    )
  }
}
