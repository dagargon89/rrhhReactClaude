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

    // Verificar que los saldos existen
    const balances = await prisma.leaveBalance.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        usedDays: true,
        pendingDays: true,
      },
    })

    if (balances.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron saldos para eliminar" },
        { status: 404 }
      )
    }

    // Verificar que no haya saldos con días usados o pendientes
    const balancesWithActivity = balances.filter(
      balance => balance.usedDays > 0 || balance.pendingDays > 0
    )

    if (balancesWithActivity.length > 0) {
      return NextResponse.json(
        { error: `No se pueden eliminar ${balancesWithActivity.length} saldo(s) con actividad registrada` },
        { status: 400 }
      )
    }

    // Eliminar los saldos
    await prisma.leaveBalance.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${balances.length} saldo(s) eliminado(s) exitosamente`,
      deletedCount: balances.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de saldos de permisos:", error)
    return NextResponse.json(
      { error: "Error al eliminar los saldos" },
      { status: 500 }
    )
  }
}
