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

    // Verificar que las posiciones existen
    const positions = await prisma.position.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    })

    if (positions.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron posiciones para eliminar" },
        { status: 404 }
      )
    }

    // Verificar que ninguna tenga empleados asignados
    const positionsWithEmployees = positions.filter(pos => pos._count.employees > 0)

    if (positionsWithEmployees.length > 0) {
      const posNames = positionsWithEmployees.map(p => p.title).join(", ")
      return NextResponse.json(
        { error: `Las siguientes posiciones tienen empleados asignados: ${posNames}` },
        { status: 400 }
      )
    }

    // Eliminar las posiciones
    await prisma.position.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${positions.length} posición(es) eliminada(s) exitosamente`,
      deletedCount: positions.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de posiciones:", error)
    return NextResponse.json(
      { error: "Error al eliminar las posiciones" },
      { status: 500 }
    )
  }
}
