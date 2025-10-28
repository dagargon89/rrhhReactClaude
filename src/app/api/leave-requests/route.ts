import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createLeaveRequestSchema } from "@/lib/validations/leave"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

// GET - Listar solicitudes de permisos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")
    const leaveTypeId = searchParams.get("leaveTypeId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    // Si no es staff/superuser, solo puede ver sus propias solicitudes
    if (!session.user.isStaff && !session.user.isSuperuser) {
      // Obtener el empleado del usuario
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
      })

      if (!employee) {
        return NextResponse.json(
          { error: "No tiene un perfil de empleado asociado" },
          { status: 403 }
        )
      }

      where.employeeId = employee.id
    } else if (employeeId) {
      where.employeeId = employeeId
    }

    if (status) {
      where.status = status
    }

    if (leaveTypeId) {
      where.leaveTypeId = leaveTypeId
    }

    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) {
        where.startDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate)
      }
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        leaveType: true,
        approvedBy: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return NextResponse.json(
      { error: "Error al obtener solicitudes de permisos" },
      { status: 500 }
    )
  }
}

// POST - Crear solicitud de permiso
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createLeaveRequestSchema.parse(body)

    // Verificar que el empleado exista
    const employee = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId },
      include: {
        user: true,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

    // Si no es staff/superuser, solo puede crear solicitudes para sí mismo
    if (!session.user.isStaff && !session.user.isSuperuser) {
      if (employee.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
    }

    // Verificar que el tipo de permiso exista
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: validatedData.leaveTypeId },
    })

    if (!leaveType) {
      return NextResponse.json(
        { error: "Tipo de permiso no encontrado" },
        { status: 404 }
      )
    }

    if (!leaveType.isActive) {
      return NextResponse.json(
        { error: "Este tipo de permiso no está activo" },
        { status: 400 }
      )
    }

    // Calcular días totales
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "La fecha de fin no puede ser anterior a la fecha de inicio" },
        { status: 400 }
      )
    }

    // Calcular días laborables (excluyendo fines de semana)
    const calculateBusinessDays = (start: Date, end: Date): number => {
      let count = 0
      const current = new Date(start)

      while (current <= end) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // No es domingo ni sábado
          count++
        }
        current.setDate(current.getDate() + 1)
      }

      return count
    }

    const totalDays = calculateBusinessDays(startDate, endDate)

    // Verificar saldo disponible
    const currentYear = new Date().getFullYear()
    const balance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        leaveTypeId: validatedData.leaveTypeId,
        year: currentYear,
      },
    })

    if (balance) {
      const availableDays =
        balance.totalDays.toNumber() -
        balance.usedDays.toNumber() -
        balance.pendingDays.toNumber()

      if (availableDays < totalDays) {
        return NextResponse.json(
          {
            error: `Saldo insuficiente. Disponible: ${availableDays} días, Solicitado: ${totalDays} días`,
          },
          { status: 400 }
        )
      }
    } else if (leaveType.maxDaysPerYear && totalDays > leaveType.maxDaysPerYear) {
      return NextResponse.json(
        {
          error: `La solicitud excede el máximo de ${leaveType.maxDaysPerYear} días permitidos`,
        },
        { status: 400 }
      )
    }

    // Verificar que no haya solicitudes aprobadas que se traslapen
    const overlappingRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: validatedData.employeeId,
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

    // Crear la solicitud
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        ...validatedData,
        totalDays: new Decimal(totalDays),
        status: "PENDING",
        requestedAt: new Date(),
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

    // Actualizar saldo pendiente
    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          pendingDays: {
            increment: totalDays,
          },
        },
      })
    }

    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating leave request:", error)
    return NextResponse.json(
      { error: "Error al crear solicitud de permiso" },
      { status: 500 }
    )
  }
}
