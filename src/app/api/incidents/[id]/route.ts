import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateIncidentSchema } from "@/lib/validations/incident"
import { z } from "zod"

// GET - Obtener una incidencia por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        incidentType: true,
        employee: {
          include: {
            department: true,
            position: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        department: {
          include: {
            manager: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!incident) {
      return NextResponse.json(
        { error: "Incidencia no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(incident)
  } catch (error) {
    console.error("Error fetching incident:", error)
    return NextResponse.json(
      { error: "Error al obtener incidencia" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una incidencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que la incidencia existe
    const existingIncident = await prisma.incident.findUnique({
      where: { id: params.id },
    })

    if (!existingIncident) {
      return NextResponse.json(
        { error: "Incidencia no encontrada" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateIncidentSchema.parse(body)

    // Si se actualiza el tipo de incidencia, verificar que existe y est\u00e1 activo
    if (validatedData.incidentTypeId) {
      const incidentType = await prisma.incidentType.findUnique({
        where: { id: validatedData.incidentTypeId },
      })

      if (!incidentType || !incidentType.isActive) {
        return NextResponse.json(
          { error: "Tipo de incidencia no v\u00e1lido o inactivo" },
          { status: 400 }
        )
      }
    }

    // Si se actualiza el empleado, verificar que existe
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

    // Preparar datos para actualizar
    const updateData: any = {}

    if (validatedData.incidentTypeId !== undefined) {
      updateData.incidentTypeId = validatedData.incidentTypeId
    }
    if (validatedData.employeeId !== undefined) {
      updateData.employeeId = validatedData.employeeId || null
    }
    if (validatedData.departmentId !== undefined) {
      updateData.departmentId = validatedData.departmentId || null
    }
    if (validatedData.date !== undefined) {
      updateData.date = new Date(validatedData.date)
    }
    if (validatedData.value !== undefined) {
      updateData.value = validatedData.value
    }
    if (validatedData.metadata !== undefined) {
      updateData.metadata = validatedData.metadata || null
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes || null
    }

    // Actualizar incidencia
    const updatedIncident = await prisma.incident.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedIncident)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de validaci\u00f3n inv\u00e1lidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating incident:", error)
    return NextResponse.json(
      { error: "Error al actualizar incidencia" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una incidencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que la incidencia existe
    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
    })

    if (!incident) {
      return NextResponse.json(
        { error: "Incidencia no encontrada" },
        { status: 404 }
      )
    }

    // Eliminar incidencia
    await prisma.incident.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Incidencia eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting incident:", error)
    return NextResponse.json(
      { error: "Error al eliminar incidencia" },
      { status: 500 }
    )
  }
}
