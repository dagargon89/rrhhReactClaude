import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateLeaveTypeSchema } from "@/lib/validations/leave"
import { z } from "zod"

// GET - Obtener un tipo de permiso
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const leaveType = await prisma.leaveType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            leaveRequests: true,
            leaveBalances: true,
          },
        },
      },
    })

    if (!leaveType) {
      return NextResponse.json(
        { error: "Tipo de permiso no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(leaveType)
  } catch (error) {
    console.error("Error fetching leave type:", error)
    return NextResponse.json(
      { error: "Error al obtener tipo de permiso" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar tipo de permiso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateLeaveTypeSchema.parse(body)

    // Verificar que el tipo exista
    const existingLeaveType = await prisma.leaveType.findUnique({
      where: { id: params.id },
    })

    if (!existingLeaveType) {
      return NextResponse.json(
        { error: "Tipo de permiso no encontrado" },
        { status: 404 }
      )
    }

    // Verificar unicidad de nombre (si se está actualizando)
    if (validatedData.name && validatedData.name !== existingLeaveType.name) {
      const existingName = await prisma.leaveType.findFirst({
        where: {
          name: validatedData.name,
          id: { not: params.id },
        },
      })

      if (existingName) {
        return NextResponse.json(
          { error: "Ya existe un tipo de permiso con ese nombre" },
          { status: 400 }
        )
      }
    }

    // Verificar unicidad de código (si se está actualizando)
    if (validatedData.code && validatedData.code !== existingLeaveType.code) {
      const existingCode = await prisma.leaveType.findFirst({
        where: {
          code: validatedData.code,
          id: { not: params.id },
        },
      })

      if (existingCode) {
        return NextResponse.json(
          { error: "Ya existe un tipo de permiso con ese código" },
          { status: 400 }
        )
      }
    }

    const updatedLeaveType = await prisma.leaveType.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedLeaveType)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating leave type:", error)
    return NextResponse.json(
      { error: "Error al actualizar tipo de permiso" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar tipo de permiso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el tipo exista
    const existingLeaveType = await prisma.leaveType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            leaveRequests: true,
            leaveBalances: true,
          },
        },
      },
    })

    if (!existingLeaveType) {
      return NextResponse.json(
        { error: "Tipo de permiso no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que no tenga solicitudes o saldos asociados
    if (
      existingLeaveType._count.leaveRequests > 0 ||
      existingLeaveType._count.leaveBalances > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar este tipo de permiso porque tiene solicitudes o saldos asociados",
        },
        { status: 400 }
      )
    }

    await prisma.leaveType.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Tipo de permiso eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting leave type:", error)
    return NextResponse.json(
      { error: "Error al eliminar tipo de permiso" },
      { status: 500 }
    )
  }
}
