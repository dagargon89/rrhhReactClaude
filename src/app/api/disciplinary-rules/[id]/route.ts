import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateDisciplinaryRuleSchema } from "@/lib/validations/disciplinaryRule"
import { z } from "zod"

// GET - Obtener una regla específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const rule = await prisma.disciplinaryActionRule.findUnique({
      where: { id: params.id },
    })

    if (!rule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(rule)
  } catch (error) {
    console.error("Error fetching disciplinary rule:", error)
    return NextResponse.json(
      { error: "Error al obtener regla disciplinaria" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar regla
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateDisciplinaryRuleSchema.parse(body)

    // Verificar que la regla existe
    const existingRule = await prisma.disciplinaryActionRule.findUnique({
      where: { id: params.id },
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    // Si se están actualizando los disparadores, verificar duplicados
    if (
      validatedData.triggerType !== undefined ||
      validatedData.triggerCount !== undefined ||
      validatedData.periodDays !== undefined
    ) {
      const newTriggerType = validatedData.triggerType ?? existingRule.triggerType
      const newTriggerCount = validatedData.triggerCount ?? existingRule.triggerCount
      const newPeriodDays = validatedData.periodDays ?? existingRule.periodDays

      const duplicateRule = await prisma.disciplinaryActionRule.findFirst({
        where: {
          triggerType: newTriggerType,
          triggerCount: newTriggerCount,
          periodDays: newPeriodDays,
          isActive: true,
          id: {
            not: params.id,
          },
        },
      })

      if (duplicateRule) {
        return NextResponse.json(
          {
            error: "Ya existe otra regla activa con los mismos parámetros de disparador",
          },
          { status: 400 }
        )
      }
    }

    // Actualizar regla
    const updatedRule = await prisma.disciplinaryActionRule.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        suspensionDays: validatedData.suspensionDays !== undefined
          ? (validatedData.suspensionDays || null)
          : undefined,
      },
    })

    return NextResponse.json(updatedRule)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating disciplinary rule:", error)
    return NextResponse.json(
      { error: "Error al actualizar regla disciplinaria" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar regla
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que la regla existe
    const rule = await prisma.disciplinaryActionRule.findUnique({
      where: { id: params.id },
    })

    if (!rule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    // Verificar si hay registros asociados
    const associatedRecords = await prisma.employeeDisciplinaryRecord.count({
      where: { ruleId: params.id },
    })

    if (associatedRecords > 0) {
      // En lugar de eliminar, desactivar
      await prisma.disciplinaryActionRule.update({
        where: { id: params.id },
        data: { isActive: false },
      })

      return NextResponse.json({
        message: `Regla desactivada exitosamente (tiene ${associatedRecords} registros asociados)`,
      })
    }

    // Si no tiene registros, se puede eliminar
    await prisma.disciplinaryActionRule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Regla eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting disciplinary rule:", error)
    return NextResponse.json(
      { error: "Error al eliminar regla disciplinaria" },
      { status: 500 }
    )
  }
}
