import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateLeaveRequestSchema } from "@/lib/validations/leave"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

// GET - Obtener una solicitud de permiso
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                image: true,
              },
            },
            department: true,
            position: true,
          },
        },
        leaveType: true,
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "Solicitud de permiso no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos de acceso
    if (!session.user.isStaff && !session.user.isSuperuser) {
      if (leaveRequest.employee.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
    }

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Error fetching leave request:", error)
    return NextResponse.json(
      { error: "Error al obtener solicitud de permiso" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar solicitud de permiso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateLeaveRequestSchema.parse(body)

    // Verificar que la solicitud exista
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        leaveType: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Solicitud de permiso no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos de edición
    if (!session.user.isStaff && !session.user.isSuperuser) {
      if (existingRequest.employee.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
    }

    // Solo se pueden editar solicitudes PENDIENTES
    if (existingRequest.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            "Solo se pueden editar solicitudes pendientes. Esta solicitud ya fue procesada.",
        },
        { status: 400 }
      )
    }

    let totalDays = existingRequest.totalDays.toNumber()

    // Si se están actualizando las fechas, recalcular días
    if (validatedData.startDate || validatedData.endDate) {
      const startDate = validatedData.startDate
        ? new Date(validatedData.startDate)
        : existingRequest.startDate
      const endDate = validatedData.endDate
        ? new Date(validatedData.endDate)
        : existingRequest.endDate

      if (endDate < startDate) {
        return NextResponse.json(
          {
            error: "La fecha de fin no puede ser anterior a la fecha de inicio",
          },
          { status: 400 }
        )
      }

      // Calcular días laborables
      const calculateBusinessDays = (start: Date, end: Date): number => {
        let count = 0
        const current = new Date(start)

        while (current <= end) {
          const dayOfWeek = current.getDay()
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++
          }
          current.setDate(current.getDate() + 1)
        }

        return count
      }

      totalDays = calculateBusinessDays(startDate, endDate)

      // Verificar saldo disponible con los nuevos días
      const currentYear = new Date().getFullYear()
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: existingRequest.employeeId,
          leaveTypeId: existingRequest.leaveTypeId,
          year: currentYear,
        },
      })

      if (balance) {
        const availableDays =
          balance.totalDays.toNumber() -
          balance.usedDays.toNumber() -
          balance.pendingDays.toNumber() +
          existingRequest.totalDays.toNumber() // Liberar días de la solicitud actual

        if (availableDays < totalDays) {
          return NextResponse.json(
            {
              error: `Saldo insuficiente. Disponible: ${availableDays} días, Solicitado: ${totalDays} días`,
            },
            { status: 400 }
          )
        }

        // Actualizar balance
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            pendingDays: {
              increment: totalDays - existingRequest.totalDays.toNumber(),
            },
          },
        })
      }

      // Verificar traslapes
      const overlappingRequests = await prisma.leaveRequest.findMany({
        where: {
          id: { not: params.id },
          employeeId: existingRequest.employeeId,
          status: { in: ["PENDING", "APPROVED"] },
          OR: [
            {
              startDate: {
                lte: endDate,
              },
              endDate: {
                gte: startDate,
              },
            },
          ],
        },
      })

      if (overlappingRequests.length > 0) {
        return NextResponse.json(
          {
            error:
              "Ya existe una solicitud de permiso para estas fechas o fechas que se traslapan",
          },
          { status: 400 }
        )
      }
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...(validatedData.startDate || validatedData.endDate
          ? { totalDays: new Decimal(totalDays) }
          : {}),
      },
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

    return NextResponse.json(updatedRequest)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating leave request:", error)
    return NextResponse.json(
      { error: "Error al actualizar solicitud de permiso" },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar/Eliminar solicitud de permiso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la solicitud exista
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Solicitud de permiso no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos de eliminación
    if (!session.user.isSuperuser) {
      if (!session.user.isStaff && existingRequest.employee.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
    }

    // Solo se pueden eliminar solicitudes PENDIENTES o REJECTED
    if (existingRequest.status === "APPROVED") {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar una solicitud aprobada. Debe rechazarla primero.",
        },
        { status: 400 }
      )
    }

    // Liberar días pendientes si estaba PENDING
    if (existingRequest.status === "PENDING") {
      const currentYear = new Date().getFullYear()
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: existingRequest.employeeId,
          leaveTypeId: existingRequest.leaveTypeId,
          year: currentYear,
        },
      })

      if (balance) {
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            pendingDays: {
              decrement: existingRequest.totalDays.toNumber(),
            },
          },
        })
      }
    }

    await prisma.leaveRequest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Solicitud de permiso eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting leave request:", error)
    return NextResponse.json(
      { error: "Error al eliminar solicitud de permiso" },
      { status: 500 }
    )
  }
}
