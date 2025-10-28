import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createIncidentSchema, incidentFiltersSchema } from "@/lib/validations/incident"
import { z } from "zod"

// GET - Listar incidencias con filtros y paginaci\u00f3n
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Parsear y validar par\u00e1metros de filtro
    const filters = incidentFiltersSchema.parse({
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
      incidentTypeId: searchParams.get("incidentTypeId") || undefined,
      employeeId: searchParams.get("employeeId") || undefined,
      departmentId: searchParams.get("departmentId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      minValue: searchParams.get("minValue") ? parseFloat(searchParams.get("minValue")!) : undefined,
      maxValue: searchParams.get("maxValue") ? parseFloat(searchParams.get("maxValue")!) : undefined,
    })

    // Construir where clause
    const where: any = {}

    if (filters.incidentTypeId) where.incidentTypeId = filters.incidentTypeId
    if (filters.employeeId) where.employeeId = filters.employeeId
    if (filters.departmentId) where.departmentId = filters.departmentId

    if (filters.startDate || filters.endDate) {
      where.date = {}
      if (filters.startDate) where.date.gte = new Date(filters.startDate)
      if (filters.endDate) where.date.lte = new Date(filters.endDate)
    }

    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      where.value = {}
      if (filters.minValue !== undefined) where.value.gte = filters.minValue
      if (filters.maxValue !== undefined) where.value.lte = filters.maxValue
    }

    // Obtener incidencias con relaciones
    const [incidents, total] = await prisma.$transaction([
      prisma.incident.findMany({
        where,
        include: {
          incidentType: true,
          employee: {
            include: {
              department: true,
              position: true,
            },
          },
          department: true,
        },
        orderBy: {
          date: "desc",
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.incident.count({ where }),
    ])

    return NextResponse.json({
      incidents,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Par\u00e1metros de filtro inv\u00e1lidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error fetching incidents:", error)
    return NextResponse.json(
      { error: "Error al obtener incidencias" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva incidencia
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createIncidentSchema.parse(body)

    // Verificar que el tipo de incidencia existe y est\u00e1 activo
    const incidentType = await prisma.incidentType.findUnique({
      where: { id: validatedData.incidentTypeId },
    })

    if (!incidentType || !incidentType.isActive) {
      return NextResponse.json(
        { error: "Tipo de incidencia no v\u00e1lido o inactivo" },
        { status: 400 }
      )
    }

    // Verificar que al menos employeeId o departmentId est\u00e9 presente
    if (!validatedData.employeeId && !validatedData.departmentId) {
      return NextResponse.json(
        { error: "Debe especificar un empleado o un departamento" },
        { status: 400 }
      )
    }

    // Si se proporciona employeeId, verificar que existe
    if (validatedData.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: validatedData.employeeId },
      })

      if (!employee) {
        return NextResponse.json(
          { error: "Empleado no encontrado" },
          { status: 404 }
        )
      }
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

    // Crear incidencia
    const incident = await prisma.incident.create({
      data: {
        incidentTypeId: validatedData.incidentTypeId,
        employeeId: validatedData.employeeId || null,
        departmentId: validatedData.departmentId || null,
        date: new Date(validatedData.date),
        value: validatedData.value,
        metadata: validatedData.metadata || null,
        notes: validatedData.notes || null,
      },
      include: {
        incidentType: true,
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        department: true,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de validaci\u00f3n inv\u00e1lidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating incident:", error)
    return NextResponse.json(
      { error: "Error al crear incidencia" },
      { status: 500 }
    )
  }
}
