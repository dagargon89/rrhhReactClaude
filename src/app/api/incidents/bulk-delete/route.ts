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

    // Verificar que las incidencias existen
    const incidents = await prisma.incident.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    })

    if (incidents.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron incidencias para eliminar" },
        { status: 404 }
      )
    }

    // Eliminar las incidencias
    await prisma.incident.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${incidents.length} incidencia(s) eliminada(s) exitosamente`,
      deletedCount: incidents.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de incidencias:", error)
    return NextResponse.json(
      { error: "Error al eliminar las incidencias" },
      { status: 500 }
    )
  }
}
