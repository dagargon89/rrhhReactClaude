import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { reviewLeaveRequestSchema } from "@/lib/validations/leave"
import { z } from "zod"

// POST - Aprobar o rechazar una solicitud de permiso
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = reviewLeaveRequestSchema.parse(body)

    // Verificar que la solicitud exista
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
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

    // Verificar que la solicitud esté pendiente
    if (existingRequest.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Esta solicitud ya fue ${existingRequest.status === "APPROVED" ? "aprobada" : "rechazada"}`,
        },
        { status: 400 }
      )
    }

    const currentYear = new Date().getFullYear()

    if (validatedData.action === "approve") {
      // APROBAR SOLICITUD
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: existingRequest.employeeId,
          leaveTypeId: existingRequest.leaveTypeId,
          year: currentYear,
        },
      })

      if (!balance) {
        return NextResponse.json(
          { error: "No se encontró el saldo de permisos del empleado" },
          { status: 404 }
        )
      }

      // Verificar que haya saldo suficiente
      const availableDays =
        balance.totalDays.toNumber() - balance.usedDays.toNumber()

      if (availableDays < existingRequest.totalDays.toNumber()) {
        return NextResponse.json(
          {
            error: `Saldo insuficiente. Disponible: ${availableDays} días, Solicitado: ${existingRequest.totalDays} días`,
          },
          { status: 400 }
        )
      }

      // Transacción para aprobar
      const [updatedRequest, updatedBalance] = await prisma.$transaction([
        // Actualizar solicitud
        prisma.leaveRequest.update({
          where: { id: params.id },
          data: {
            status: "APPROVED",
            approvedById: session.user.id,
            approvedAt: new Date(),
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
        }),
        // Actualizar balance
        prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            usedDays: {
              increment: existingRequest.totalDays.toNumber(),
            },
            pendingDays: {
              decrement: existingRequest.totalDays.toNumber(),
            },
          },
        }),
      ])

      // TODO: Enviar notificación por email al empleado

      return NextResponse.json({
        message: "Solicitud aprobada exitosamente",
        leaveRequest: updatedRequest,
        balance: updatedBalance,
      })
    } else {
      // RECHAZAR SOLICITUD
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: existingRequest.employeeId,
          leaveTypeId: existingRequest.leaveTypeId,
          year: currentYear,
        },
      })

      // Transacción para rechazar
      const transactions: any[] = [
        // Actualizar solicitud
        prisma.leaveRequest.update({
          where: { id: params.id },
          data: {
            status: "REJECTED",
            approvedById: session.user.id,
            approvedAt: new Date(),
            rejectionReason: validatedData.rejectionReason || null,
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
        }),
      ]

      // Liberar días pendientes si hay balance
      if (balance) {
        transactions.push(
          prisma.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: {
                decrement: existingRequest.totalDays.toNumber(),
              },
            },
          })
        )
      }

      const [updatedRequest, updatedBalance] = await prisma.$transaction(
        transactions
      )

      // TODO: Enviar notificación por email al empleado

      return NextResponse.json({
        message: "Solicitud rechazada exitosamente",
        leaveRequest: updatedRequest,
        balance: updatedBalance || null,
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error reviewing leave request:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud de permiso" },
      { status: 500 }
    )
  }
}
