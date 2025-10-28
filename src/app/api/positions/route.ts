import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPositionSchema } from "@/lib/validations/position"
import { z } from "zod"

// GET - Listar posiciones
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const positions = await prisma.position.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(positions)
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json(
      { error: "Error al obtener posiciones" },
      { status: 500 }
    )
  }
}

// POST - Crear posición
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = createPositionSchema.parse(body)

    // Verificar código único
    const existingCode = await prisma.position.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "El código de posición ya está en uso" },
        { status: 400 }
      )
    }

    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: validatedData.departmentId },
    })

    if (!department) {
      return NextResponse.json(
        { error: "El departamento seleccionado no existe" },
        { status: 400 }
      )
    }

    // Crear posición
    const position = await prisma.position.create({
      data: validatedData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating position:", error)
    return NextResponse.json(
      { error: "Error al crear posición" },
      { status: 500 }
    )
  }
}
