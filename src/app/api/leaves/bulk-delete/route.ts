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

    // Verificar que las solicitudes existen
    const requests = await prisma.leaveRequest.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (requests.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron solicitudes para eliminar" },
        { status: 404 }
      )
    }

    // Verificar que no haya solicitudes aprobadas
    const approvedRequests = requests.filter(request => request.status === "APPROVED")

    if (approvedRequests.length > 0) {
      return NextResponse.json(
        { error: `No se pueden eliminar ${approvedRequests.length} solicitud(es) aprobada(s)` },
        { status: 400 }
      )
    }

    // Eliminar las solicitudes
    await prisma.leaveRequest.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${requests.length} solicitud(es) eliminada(s) exitosamente`,
      deletedCount: requests.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de solicitudes de permisos:", error)
    return NextResponse.json(
      { error: "Error al eliminar las solicitudes" },
      { status: 500 }
    )
  }
}
