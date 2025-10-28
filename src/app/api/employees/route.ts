import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { employeeSchema } from "@/lib/validations/employee"
import { z } from "zod"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const departmentId = searchParams.get("departmentId") || undefined
    const status = searchParams.get("status") || undefined

    const where: any = {}

    if (search) {
      where.OR = [
        { employeeCode: { contains: search } },
        { user: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
            ]
          }
        },
      ]
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (status) {
      where.status = status
    }

    const [employees, total] = await prisma.$transaction([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
            },
          },
          department: true,
          position: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count({ where }),
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { error: "Error al obtener empleados" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // Validar si viene con datos de usuario o sin ellos
    let userId: string

    if (body.user) {
      // Crear usuario nuevo
      const { email, password, username } = body.user

      // Verificar que el email no exista
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          isActive: true,
        },
      })

      userId = user.id
    } else if (body.userId) {
      userId = body.userId
    } else {
      return NextResponse.json(
        { error: "Se requiere userId o datos de usuario" },
        { status: 400 }
      )
    }

    // Validar datos del empleado
    const employeeData = employeeSchema.parse({
      ...body,
      userId,
    })

    const employee = await prisma.employee.create({
      data: employeeData,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
        department: true,
        position: true,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Error al crear empleado" },
      { status: 500 }
    )
  }
}
