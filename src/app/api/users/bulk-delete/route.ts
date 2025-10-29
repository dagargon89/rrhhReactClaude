import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "Debe proporcionar al menos un ID"),
})

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)

    if (!session?.user || !session.user.isStaff) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Parsear y validar el body
    const body = await request.json()
    const validation = bulkDeleteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { ids } = validation.data

    // Verificar que ninguno de los usuarios a eliminar sea el usuario actual
    if (ids.includes(session.user.id)) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      )
    }

    // Verificar que los usuarios existen
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        email: true,
        isSuperuser: true,
      },
    })

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron usuarios para eliminar" },
        { status: 404 }
      )
    }

    // Verificar que no se intente eliminar a otros superusuarios si no eres superusuario
    if (!session.user.isSuperuser) {
      const hasSuperuser = users.some(user => user.isSuperuser)
      if (hasSuperuser) {
        return NextResponse.json(
          { error: "No tienes permisos para eliminar superusuarios" },
          { status: 403 }
        )
      }
    }

    // Eliminar los usuarios en una transacción
    await prisma.$transaction(async (tx) => {
      // Primero, eliminar las relaciones con empleados si existen
      await tx.employee.deleteMany({
        where: {
          userId: {
            in: ids,
          },
        },
      })

      // Luego, eliminar los usuarios
      await tx.user.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: `${users.length} usuario(s) eliminado(s) exitosamente`,
      deletedCount: users.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de usuarios:", error)
    return NextResponse.json(
      { error: "Error al eliminar los usuarios" },
      { status: 500 }
    )
  }
}
