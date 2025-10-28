import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updatePositionSchema } from "@/lib/validations/position"
import { z } from "zod"

// GET - Obtener una posición
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const position = await prisma.position.findUnique({
      where: { id: params.id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        employees: {
          select: {
            id: true,
            employeeCode: true,
            status: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          take: 10,
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json(
        { error: "Posición no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(position)
  } catch (error) {
    console.error("Error fetching position:", error)
    return NextResponse.json(
      { error: "Error al obtener posición" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar posición
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = updatePositionSchema.parse(body)

    // Verificar que la posición existe
    const existingPosition = await prisma.position.findUnique({
      where: { id: params.id },
    })

    if (!existingPosition) {
      return NextResponse.json(
        { error: "Posición no encontrada" },
        { status: 404 }
      )
    }

    // Verificar código único si se está actualizando
    if (validatedData.code && validatedData.code !== existingPosition.code) {
      const codeInUse = await prisma.position.findUnique({
        where: { code: validatedData.code },
      })

      if (codeInUse) {
        return NextResponse.json(
          { error: "El código de posición ya está en uso" },
          { status: 400 }
        )
      }
    }

    // Verificar que el departamento existe si se está actualizando
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId },
      })

      if (!department) {
        return NextResponse.json(
          { error: "El departamento seleccionado no existe" },
          { status: 400 }
        )
      }
    }

    // Actualizar posición
    const updatedPosition = await prisma.position.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPosition)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating position:", error)
    return NextResponse.json(
      { error: "Error al actualizar posición" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar posición
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que la posición existe
    const position = await prisma.position.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json(
        { error: "Posición no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que no tenga empleados asignados
    if (position._count.employees > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una posición con empleados asignados" },
        { status: 400 }
      )
    }

    // Eliminar posición
    await prisma.position.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Posición eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting position:", error)
    return NextResponse.json(
      { error: "Error al eliminar posición" },
      { status: 500 }
    )
  }
}
