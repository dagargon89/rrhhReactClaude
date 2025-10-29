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

    // Verificar que los departamentos existen
    const departments = await prisma.department.findMany({
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
            employees: true,
            subDepartments: true,
            positions: true,
          },
        },
      },
    })

    if (departments.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron departamentos para eliminar" },
        { status: 404 }
      )
    }

    // Verificar que ninguno tenga empleados, subdepartamentos o posiciones
    const departmentsWithRelations = departments.filter(
      dept => dept._count.employees > 0 || dept._count.subDepartments > 0 || dept._count.positions > 0
    )

    if (departmentsWithRelations.length > 0) {
      const deptNames = departmentsWithRelations.map(d => d.name).join(", ")
      return NextResponse.json(
        { error: `Los siguientes departamentos tienen empleados, subdepartamentos o posiciones asignadas: ${deptNames}` },
        { status: 400 }
      )
    }

    // Eliminar los departamentos
    await prisma.department.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${departments.length} departamento(s) eliminado(s) exitosamente`,
      deletedCount: departments.length,
    })
  } catch (error) {
    console.error("Error en bulk delete de departamentos:", error)
    return NextResponse.json(
      { error: "Error al eliminar los departamentos" },
      { status: 500 }
    )
  }
}
