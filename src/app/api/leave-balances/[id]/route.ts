import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { leaveBalanceSchema } from "@/lib/validations/leave"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

// GET - Obtener un saldo de permiso
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const leaveBalance = await prisma.leaveBalance.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
            department: true,
            position: true,
          },
        },
        leaveType: true,
      },
    })

    if (!leaveBalance) {
      return NextResponse.json(
        { error: "Saldo de permiso no encontrado" },
        { status: 404 }
      )
    }

    // Verificar permisos de acceso
    if (!session.user.isStaff && !session.user.isSuperuser) {
      if (leaveBalance.employee.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
    }

    // Calcular días disponibles
    const availableDays =
      leaveBalance.totalDays.toNumber() -
      leaveBalance.usedDays.toNumber() -
      leaveBalance.pendingDays.toNumber()

    return NextResponse.json({
      ...leaveBalance,
      availableDays,
    })
  } catch (error) {
    console.error("Error fetching leave balance:", error)
    return NextResponse.json(
      { error: "Error al obtener saldo de permiso" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar saldo de permiso
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
    const validatedData = leaveBalanceSchema.partial().parse(body)

    // Verificar que el saldo exista
    const existingBalance = await prisma.leaveBalance.findUnique({
      where: { id: params.id },
    })

    if (!existingBalance) {
      return NextResponse.json(
        { error: "Saldo de permiso no encontrado" },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {}

    if (validatedData.totalDays !== undefined) {
      updateData.totalDays = new Decimal(validatedData.totalDays)
    }

    if (validatedData.usedDays !== undefined) {
      updateData.usedDays = new Decimal(validatedData.usedDays)
    }

    if (validatedData.pendingDays !== undefined) {
      updateData.pendingDays = new Decimal(validatedData.pendingDays)
    }

    if (validatedData.year !== undefined) {
      updateData.year = validatedData.year
    }

    // Verificar que totalDays >= usedDays + pendingDays
    const totalDays = updateData.totalDays || existingBalance.totalDays
    const usedDays = updateData.usedDays || existingBalance.usedDays
    const pendingDays = updateData.pendingDays || existingBalance.pendingDays

    if (totalDays.lessThan(usedDays.plus(pendingDays))) {
      return NextResponse.json(
        {
          error:
            "El total de días debe ser mayor o igual a la suma de días usados y días pendientes",
        },
        { status: 400 }
      )
    }

    const updatedBalance = await prisma.leaveBalance.update({
      where: { id: params.id },
      data: updateData,
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
        leaveType: true,
      },
    })

    const availableDays =
      updatedBalance.totalDays.toNumber() -
      updatedBalance.usedDays.toNumber() -
      updatedBalance.pendingDays.toNumber()

    return NextResponse.json({
      ...updatedBalance,
      availableDays,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating leave balance:", error)
    return NextResponse.json(
      { error: "Error al actualizar saldo de permiso" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar saldo de permiso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el saldo exista
    const existingBalance = await prisma.leaveBalance.findUnique({
      where: { id: params.id },
    })

    if (!existingBalance) {
      return NextResponse.json(
        { error: "Saldo de permiso no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que no tenga días usados o pendientes
    if (
      existingBalance.usedDays.toNumber() > 0 ||
      existingBalance.pendingDays.toNumber() > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar este saldo porque tiene días usados o pendientes",
        },
        { status: 400 }
      )
    }

    await prisma.leaveBalance.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Saldo de permiso eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting leave balance:", error)
    return NextResponse.json(
      { error: "Error al eliminar saldo de permiso" },
      { status: 500 }
    )
  }
}
