import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createDisciplinaryRecordSchema } from "@/lib/validations/disciplinaryRecord"
import { z } from "zod"

// GET - Listar registros disciplinarios
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Filtros
    const filters: any = {}

    const employeeId = searchParams.get("employeeId")
    if (employeeId) {
      filters.employeeId = employeeId
    }

    const actionType = searchParams.get("actionType")
    if (actionType) {
      filters.actionType = actionType
    }

    const status = searchParams.get("status")
    if (status) {
      filters.status = status
    }

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      filters.appliedDate = {}
      if (startDate) {
        filters.appliedDate.gte = new Date(startDate)
      }
      if (endDate) {
        filters.appliedDate.lte = new Date(endDate)
      }
    }

    // Obtener registros
    const records = await prisma.employeeDisciplinaryRecord.findMany({
      where: filters,
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
          },
        },
        rule: {
          select: {
            name: true,
            description: true,
            actionType: true,
          },
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        appliedDate: "desc",
      },
    })

    // Serializar fechas
    const serializedRecords = records.map((record) => ({
      ...record,
      appliedDate: record.appliedDate.toISOString(),
      effectiveDate: record.effectiveDate?.toISOString() || null,
      expirationDate: record.expirationDate?.toISOString() || null,
      approvalDate: record.approvalDate?.toISOString() || null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }))

    return NextResponse.json(serializedRecords)
  } catch (error) {
    console.error("Error fetching disciplinary records:", error)
    return NextResponse.json(
      { error: "Error al obtener registros disciplinarios" },
      { status: 500 }
    )
  }
}

// POST - Crear registro disciplinario manual
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createDisciplinaryRecordSchema.parse(body)

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

    // Crear registro
    const record = await prisma.employeeDisciplinaryRecord.create({
      data: {
        employeeId: validatedData.employeeId,
        ruleId: null, // Manual, no viene de regla automática
        actionType: validatedData.actionType,
        triggerType: validatedData.triggerType || null,
        triggerCount: validatedData.triggerCount || null,
        appliedDate: new Date(validatedData.appliedDate),
        effectiveDate: validatedData.effectiveDate ? new Date(validatedData.effectiveDate) : null,
        expirationDate: validatedData.expirationDate ? new Date(validatedData.expirationDate) : null,
        suspensionDays: validatedData.suspensionDays || null,
        affectsSalary: validatedData.affectsSalary,
        reason: validatedData.reason,
        notes: validatedData.notes || null,
        status: "PENDING", // Por defecto requiere aprobación
      },
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
          },
        },
      },
    })

    // Serializar fechas
    const serializedRecord = {
      ...record,
      appliedDate: record.appliedDate.toISOString(),
      effectiveDate: record.effectiveDate?.toISOString() || null,
      expirationDate: record.expirationDate?.toISOString() || null,
      approvalDate: record.approvalDate?.toISOString() || null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedRecord, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating disciplinary record:", error)
    return NextResponse.json(
      { error: "Error al crear registro disciplinario" },
      { status: 500 }
    )
  }
}
