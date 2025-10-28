import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createTardinessRuleSchema, tardinessRuleFiltersSchema } from "@/lib/validations/tardinessRule"
import { z } from "zod"

// GET - Listar reglas de tardanzas
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Filtros
    const filters: any = {}

    const type = searchParams.get("type")
    if (type) {
      filters.type = type
    }

    const isActive = searchParams.get("isActive")
    if (isActive !== null) {
      filters.isActive = isActive === "true"
    }

    // Obtener reglas
    const rules = await prisma.tardinessRule.findMany({
      where: filters,
      orderBy: {
        startMinutesLate: "asc",
      },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Error fetching tardiness rules:", error)
    return NextResponse.json(
      { error: "Error al obtener reglas de tardanzas" },
      { status: 500 }
    )
  }
}

// POST - Crear regla de tardanzas
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTardinessRuleSchema.parse(body)

    // Verificar que no haya overlapping de rangos
    const existingRules = await prisma.tardinessRule.findMany({
      where: {
        type: validatedData.type,
        isActive: true,
      },
    })

    for (const existing of existingRules) {
      // Verificar si hay sobreposición de rangos
      const newStart = validatedData.startMinutesLate
      const newEnd = validatedData.endMinutesLate || 9999
      const existingStart = existing.startMinutesLate
      const existingEnd = existing.endMinutesLate || 9999

      if (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        return NextResponse.json(
          {
            error: `El rango de minutos se sobrepone con la regla existente: ${existing.name}`,
          },
          { status: 400 }
        )
      }
    }

    // Crear regla
    const rule = await prisma.tardinessRule.create({
      data: {
        ...validatedData,
        endMinutesLate: validatedData.endMinutesLate || null,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating tardiness rule:", error)
    return NextResponse.json(
      { error: "Error al crear regla de tardanzas" },
      { status: 500 }
    )
  }
}
