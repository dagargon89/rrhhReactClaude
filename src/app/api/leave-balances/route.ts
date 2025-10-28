import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { leaveBalanceSchema } from "@/lib/validations/leave"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

// GET - Listar saldos de permisos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const leaveTypeId = searchParams.get("leaveTypeId")
    const year = searchParams.get("year")

    const where: any = {}

    // Si no es staff/superuser, solo puede ver sus propios saldos
    if (!session.user.isStaff && !session.user.isSuperuser) {
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

    if (leaveTypeId) {
      where.leaveTypeId = leaveTypeId
    }

    if (year) {
      where.year = parseInt(year)
    } else {
      // Por defecto, mostrar el año actual
      where.year = new Date().getFullYear()
    }

    const leaveBalances = await prisma.leaveBalance.findMany({
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
      },
      orderBy: {
        employee: {
          firstName: "asc",
        },
      },
    })

    // Calcular días disponibles para cada saldo
    const balancesWithAvailable = leaveBalances.map((balance) => ({
      ...balance,
      availableDays:
        balance.totalDays.toNumber() -
        balance.usedDays.toNumber() -
        balance.pendingDays.toNumber(),
    }))

    return NextResponse.json(balancesWithAvailable)
  } catch (error) {
    console.error("Error fetching leave balances:", error)
    return NextResponse.json(
      { error: "Error al obtener saldos de permisos" },
      { status: 500 }
    )
  }
}

// POST - Crear/Asignar saldo de permiso
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = leaveBalanceSchema.parse(body)

    // Verificar que el empleado exista
    const employee = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
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

    // Verificar si ya existe un saldo para este empleado, tipo y año
    const existingBalance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        leaveTypeId: validatedData.leaveTypeId,
        year: validatedData.year,
      },
    })

    if (existingBalance) {
      return NextResponse.json(
        {
          error:
            "Ya existe un saldo de permisos para este empleado, tipo y año",
        },
        { status: 400 }
      )
    }

    // Verificar que totalDays sea mayor o igual a usedDays + pendingDays
    const totalDays = new Decimal(validatedData.totalDays)
    const usedDays = validatedData.usedDays
      ? new Decimal(validatedData.usedDays)
      : new Decimal(0)
    const pendingDays = validatedData.pendingDays
      ? new Decimal(validatedData.pendingDays)
      : new Decimal(0)

    if (totalDays.lessThan(usedDays.plus(pendingDays))) {
      return NextResponse.json(
        {
          error:
            "El total de días debe ser mayor o igual a la suma de días usados y días pendientes",
        },
        { status: 400 }
      )
    }

    const leaveBalance = await prisma.leaveBalance.create({
      data: {
        ...validatedData,
        totalDays,
        usedDays,
        pendingDays,
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

    return NextResponse.json(leaveBalance, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating leave balance:", error)
    return NextResponse.json(
      { error: "Error al crear saldo de permisos" },
      { status: 500 }
    )
  }
}
