import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createIncidentConfigSchema } from "@/lib/validations/incident"
import { z } from "zod"

// GET - Listar configuraciones de umbrales
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const incidentTypeId = searchParams.get("incidentTypeId")
    const departmentId = searchParams.get("departmentId")
    const includeInactive = searchParams.get("includeInactive") === "true"

    const where: any = {}
    if (incidentTypeId) where.incidentTypeId = incidentTypeId
    if (departmentId) where.departmentId = departmentId
    if (!includeInactive) where.isActive = true

    const configs = await prisma.incidentConfig.findMany({
      where,
      include: {
        incidentType: true,
        department: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error("Error fetching incident configs:", error)
    return NextResponse.json(
      { error: "Error al obtener configuraciones" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva configuración de umbral
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createIncidentConfigSchema.parse(body)

    // Verificar que el tipo de incidencia existe
    const incidentType = await prisma.incidentType.findUnique({
      where: { id: validatedData.incidentTypeId },
    })

    if (!incidentType) {
      return NextResponse.json(
        { error: "Tipo de incidencia no encontrado" },
        { status: 404 }
      )
    }

    // Si se proporciona departmentId, verificar que existe
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

    // Verificar que no exista una configuración duplicada
    const existingConfig = await prisma.incidentConfig.findFirst({
      where: {
        incidentTypeId: validatedData.incidentTypeId,
        departmentId: validatedData.departmentId || null,
        periodType: validatedData.periodType,
        isActive: true,
      },
    })

    if (existingConfig) {
      return NextResponse.json(
        { error: "Ya existe una configuración activa para este tipo, departamento y período" },
        { status: 400 }
      )
    }

    // Crear configuración
    const config = await prisma.incidentConfig.create({
      data: {
        incidentTypeId: validatedData.incidentTypeId,
        departmentId: validatedData.departmentId || null,
        thresholdValue: validatedData.thresholdValue,
        thresholdOperator: validatedData.thresholdOperator,
        periodType: validatedData.periodType,
        notificationEnabled: validatedData.notificationEnabled,
        notificationEmails: validatedData.notificationEmails,
        isActive: validatedData.isActive,
      },
      include: {
        incidentType: true,
        department: true,
      },
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de validación inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating incident config:", error)
    return NextResponse.json(
      { error: "Error al crear configuración" },
      { status: 500 }
    )
  }
}
