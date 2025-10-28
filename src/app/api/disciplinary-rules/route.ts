import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createDisciplinaryRuleSchema } from "@/lib/validations/disciplinaryRule"
import { z } from "zod"

// GET - Listar reglas disciplinarias
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Filtros
    const filters: any = {}

    const triggerType = searchParams.get("triggerType")
    if (triggerType) {
      filters.triggerType = triggerType
    }

    const actionType = searchParams.get("actionType")
    if (actionType) {
      filters.actionType = actionType
    }

    const isActive = searchParams.get("isActive")
    if (isActive !== null) {
      filters.isActive = isActive === "true"
    }

    // Obtener reglas
    const rules = await prisma.disciplinaryActionRule.findMany({
      where: filters,
      orderBy: [
        { triggerType: "asc" },
        { triggerCount: "asc" },
      ],
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Error fetching disciplinary rules:", error)
    return NextResponse.json(
      { error: "Error al obtener reglas disciplinarias" },
      { status: 500 }
    )
  }
}

// POST - Crear regla disciplinaria
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createDisciplinaryRuleSchema.parse(body)

    // Verificar que no exista una regla duplicada
    const existingRule = await prisma.disciplinaryActionRule.findFirst({
      where: {
        triggerType: validatedData.triggerType,
        triggerCount: validatedData.triggerCount,
        periodDays: validatedData.periodDays,
        isActive: true,
      },
    })

    if (existingRule) {
      return NextResponse.json(
        {
          error: "Ya existe una regla activa con los mismos parámetros de disparador",
        },
        { status: 400 }
      )
    }

    // Crear regla
    const rule = await prisma.disciplinaryActionRule.create({
      data: {
        ...validatedData,
        suspensionDays: validatedData.suspensionDays || null,
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

    console.error("Error creating disciplinary rule:", error)
    return NextResponse.json(
      { error: "Error al crear regla disciplinaria" },
      { status: 500 }
    )
  }
}
