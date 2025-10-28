import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { approveDisciplinaryRecordSchema } from "@/lib/validations/disciplinaryRecord"
import { z } from "zod"

// POST - Aprobar o rechazar un registro disciplinario
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = approveDisciplinaryRecordSchema.parse(body)

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

    if (record.status !== "PENDING") {
      return NextResponse.json(
        { error: "El registro ya fue procesado" },
        { status: 400 }
      )
    }

    // Actualizar registro
    const updatedRecord = await prisma.employeeDisciplinaryRecord.update({
      where: { id: params.id },
      data: {
        status: validatedData.approved ? "ACTIVE" : "CANCELLED",
        approvedById: session.user.id,
        approvalDate: new Date(),
        notes: validatedData.notes || record.notes,
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
            department: true,
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

    // TODO: Enviar notificación al empleado

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

    return NextResponse.json({
      message: validatedData.approved
        ? "Registro aprobado exitosamente"
        : "Registro rechazado exitosamente",
      record: serializedRecord,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error approving/rejecting disciplinary record:", error)
    return NextResponse.json(
      { error: "Error al procesar registro disciplinario" },
      { status: 500 }
    )
  }
}
