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

    // Verificar que las reglas existen
    const rules = await prisma.disciplinaryActionRule.findMany({
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
            records: true,
          },
        },
      },
    })

    if (rules.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron reglas para eliminar" },
        { status: 404 }
      )
    }

    // Verificar que ninguna tenga registros asociados
    const rulesWithRecords = rules.filter(rule => rule._count.records > 0)

    if (rulesWithRecords.length > 0) {
      const ruleNames = rulesWithRecords.map(r => r.name).join(", ")
      return NextResponse.json(
        { error: `Las siguientes reglas tienen registros asociados: ${ruleNames}` },
        { status: 400 }
      )
    }

    // Eliminar las reglas
    await prisma.disciplinaryActionRule.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${rules.length} regla(s) eliminada(s) exitosamente`,
      deletedCount: rules.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de reglas disciplinarias:", error)
    return NextResponse.json(
      { error: "Error al eliminar las reglas" },
      { status: 500 }
    )
  }
}
