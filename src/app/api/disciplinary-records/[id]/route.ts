import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateDisciplinaryRecordSchema } from "@/lib/validations/disciplinaryRecord"
import { z } from "zod"

// GET - Obtener un registro específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const record = await prisma.employeeDisciplinaryRecord.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                image: true,
              },
            },
            department: true,
            position: true,
          },
        },
        rule: true,
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      )
    }

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

    return NextResponse.json(serializedRecord)
  } catch (error) {
    console.error("Error fetching disciplinary record:", error)
    return NextResponse.json(
      { error: "Error al obtener registro disciplinario" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar registro (incluyendo aprobar/rechazar)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateDisciplinaryRecordSchema.parse(body)

    // Verificar que el registro existe
    const existingRecord = await prisma.employeeDisciplinaryRecord.findUnique({
      where: { id: params.id },
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      )
    }

    // Si se está aprobando, agregar el ID del aprobador
    const updateData: any = { ...validatedData }

    if (validatedData.status === "ACTIVE" && existingRecord.status === "PENDING") {
      updateData.approvedById = session.user.id
      updateData.approvalDate = new Date()
    }

    // Actualizar registro
    const updatedRecord = await prisma.employeeDisciplinaryRecord.update({
      where: { id: params.id },
      data: updateData,
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
        rule: true,
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Serializar fechas
    const serializedRecord = {
      ...updatedRecord,
      appliedDate: updatedRecord.appliedDate.toISOString(),
      effectiveDate: updatedRecord.effectiveDate?.toISOString() || null,
      expirationDate: updatedRecord.expirationDate?.toISOString() || null,
      approvalDate: updatedRecord.approvalDate?.toISOString() || null,
      createdAt: updatedRecord.createdAt.toISOString(),
      updatedAt: updatedRecord.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedRecord)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating disciplinary record:", error)
    return NextResponse.json(
      { error: "Error al actualizar registro disciplinario" },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar registro
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el registro existe
    const record = await prisma.employeeDisciplinaryRecord.findUnique({
      where: { id: params.id },
    })

    if (!record) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      )
    }

    // En lugar de eliminar, cancelar el registro
    await prisma.employeeDisciplinaryRecord.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({
      message: "Registro cancelado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting disciplinary record:", error)
    return NextResponse.json(
      { error: "Error al cancelar registro disciplinario" },
      { status: 500 }
    )
  }
}
