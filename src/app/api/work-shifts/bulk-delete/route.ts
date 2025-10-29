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

    // Verificar que los turnos existen
    const workShifts = await prisma.workShift.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    })

    if (workShifts.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron turnos para eliminar" },
        { status: 404 }
      )
    }

    // Verificar que ninguno tenga horarios asignados
    const shiftsWithSchedules = workShifts.filter(shift => shift._count.schedules > 0)

    if (shiftsWithSchedules.length > 0) {
      const shiftNames = shiftsWithSchedules.map(s => s.name).join(", ")
      return NextResponse.json(
        { error: `Los siguientes turnos tienen horarios asignados: ${shiftNames}` },
        { status: 400 }
      )
    }

    // Eliminar los turnos
    await prisma.workShift.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${workShifts.length} turno(s) eliminado(s) exitosamente`,
      deletedCount: workShifts.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de turnos:", error)
    return NextResponse.json(
      { error: "Error al eliminar los turnos" },
      { status: 500 }
    )
  }
}
