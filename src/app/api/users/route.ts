import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
})

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

    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ]
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: {
          employee: {
            include: {
              department: true,
              position: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
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
    const validatedData = createUserSchema.parse(body)

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Verificar que el username no exista si se proporciona
    if (validatedData.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: validatedData.username },
      })

      if (existingUsername) {
        return NextResponse.json(
          { error: "El nombre de usuario ya está en uso" },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}
