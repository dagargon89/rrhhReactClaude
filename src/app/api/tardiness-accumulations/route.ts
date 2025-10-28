import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET - Obtener acumulaciones de tardanzas
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Filtros
    const filters: any = {}

    const employeeId = searchParams.get("employeeId")
    if (employeeId) {
      filters.employeeId = employeeId
    }

    const month = searchParams.get("month")
    if (month) {
      filters.month = parseInt(month)
    }

    const year = searchParams.get("year")
    if (year) {
      filters.year = parseInt(year)
    }

    // Si no se especifica mes/año, usar el actual
    if (!month && !year) {
      const now = new Date()
      filters.month = now.getMonth() + 1
      filters.year = now.getFullYear()
    }

    // Obtener acumulaciones
    const accumulations = await prisma.tardinessAccumulation.findMany({
      where: filters,
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                name: true,
                code: true,
              },
            },
            position: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: [
        { formalTardiesCount: "desc" },
        { administrativeActs: "desc" },
      ],
    })

    // Serializar fechas
    const serializedAccumulations = accumulations.map((acc) => ({
      ...acc,
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString(),
    }))

    return NextResponse.json(serializedAccumulations)
  } catch (error) {
    console.error("Error fetching tardiness accumulations:", error)
    return NextResponse.json(
      { error: "Error al obtener acumulaciones de tardanzas" },
      { status: 500 }
    )
  }
}
