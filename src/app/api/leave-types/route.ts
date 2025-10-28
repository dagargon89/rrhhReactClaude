import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createLeaveTypeSchema } from "@/lib/validations/leave"
import { z } from "zod"

// GET - Listar tipos de permisos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive")
    const isPaid = searchParams.get("isPaid")

    const where: any = {}

    if (isActive !== null) {
      where.isActive = isActive === "true"
    }

    if (isPaid !== null) {
      where.isPaid = isPaid === "true"
    }

    const leaveTypes = await prisma.leaveType.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(leaveTypes)
  } catch (error) {
    console.error("Error fetching leave types:", error)
    return NextResponse.json(
      { error: "Error al obtener tipos de permisos" },
      { status: 500 }
    )
  }
}

// POST - Crear tipo de permiso
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createLeaveTypeSchema.parse(body)

    // Verificar que no exista un tipo con el mismo nombre
    const existingName = await prisma.leaveType.findUnique({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return NextResponse.json(
        { error: "Ya existe un tipo de permiso con ese nombre" },
        { status: 400 }
      )
    }

    // Verificar que no exista un tipo con el mismo código
    const existingCode = await prisma.leaveType.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "Ya existe un tipo de permiso con ese código" },
        { status: 400 }
      )
    }

    const leaveType = await prisma.leaveType.create({
      data: validatedData,
    })

    return NextResponse.json(leaveType, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating leave type:", error)
    return NextResponse.json(
      { error: "Error al crear tipo de permiso" },
      { status: 500 }
    )
  }
}
