import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateTardinessRuleSchema } from "@/lib/validations/tardinessRule"
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

    const rule = await prisma.tardinessRule.findUnique({
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
    console.error("Error fetching tardiness rule:", error)
    return NextResponse.json(
      { error: "Error al obtener regla de tardanzas" },
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
    const validatedData = updateTardinessRuleSchema.parse(body)

    // Verificar que la regla existe
    const existingRule = await prisma.tardinessRule.findUnique({
      where: { id: params.id },
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    // Si se están actualizando los rangos, verificar overlapping
    if (validatedData.startMinutesLate !== undefined || validatedData.endMinutesLate !== undefined) {
      const newStart = validatedData.startMinutesLate ?? existingRule.startMinutesLate
      const newEnd = validatedData.endMinutesLate !== undefined
        ? (validatedData.endMinutesLate || 9999)
        : (existingRule.endMinutesLate || 9999)
      const ruleType = validatedData.type ?? existingRule.type

      const otherRules = await prisma.tardinessRule.findMany({
        where: {
          type: ruleType,
          isActive: true,
          id: {
            not: params.id,
          },
        },
      })

      for (const other of otherRules) {
        const otherStart = other.startMinutesLate
        const otherEnd = other.endMinutesLate || 9999

        if (
          (newStart >= otherStart && newStart <= otherEnd) ||
          (newEnd >= otherStart && newEnd <= otherEnd) ||
          (newStart <= otherStart && newEnd >= otherEnd)
        ) {
          return NextResponse.json(
            {
              error: `El rango de minutos se sobrepone con la regla existente: ${other.name}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Actualizar regla
    const updatedRule = await prisma.tardinessRule.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        endMinutesLate: validatedData.endMinutesLate !== undefined
          ? (validatedData.endMinutesLate || null)
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

    console.error("Error updating tardiness rule:", error)
    return NextResponse.json(
      { error: "Error al actualizar regla de tardanzas" },
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
    const rule = await prisma.tardinessRule.findUnique({
      where: { id: params.id },
    })

    if (!rule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    // En lugar de eliminar, desactivar la regla
    await prisma.tardinessRule.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: "Regla desactivada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting tardiness rule:", error)
    return NextResponse.json(
      { error: "Error al eliminar regla de tardanzas" },
      { status: 500 }
    )
  }
}
