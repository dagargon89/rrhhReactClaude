import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateUserSchema.parse(body)

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que el email no esté en uso por otro usuario
    if (validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 }
        )
      }
    }

    // Verificar que el username no esté en uso por otro usuario
    if (validatedData.username && validatedData.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: validatedData.username },
      })

      if (usernameExists) {
        return NextResponse.json(
          { error: "El nombre de usuario ya está en uso" },
          { status: 400 }
        )
      }
    }

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || !session.user.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // No permitir eliminar el propio usuario
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      )
    }

    // Eliminar usuario (esto eliminará automáticamente el empleado asociado por la relación CASCADE)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}
