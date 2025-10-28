import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateEmployeeSchema } from "@/lib/validations/employee"
import { z } from "zod"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            username: true,
          },
        },
        department: true,
        position: true,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

    // Verificar permisos
    if (
      !session.user.isStaff &&
      !session.user.isSuperuser &&
      session.user.employeeId !== employee.id
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { error: "Error al obtener empleado" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // Validar los datos
    const validatedData = updateEmployeeSchema.parse(body)

    // Separar datos del empleado y del usuario
    const { email, username, firstName, lastName, ...employeeData } = validatedData

    // Limpiar campos undefined del employeeData
    const cleanedEmployeeData = Object.fromEntries(
      Object.entries(employeeData).filter(([_, value]) => value !== undefined)
    )

    // Actualizar empleado y usuario en una transacción
    const employee = await prisma.$transaction(async (tx) => {
      // Actualizar datos del empleado
      const updatedEmployee = await tx.employee.update({
        where: { id: params.id },
        data: cleanedEmployeeData,
        include: {
          user: true,
        },
      })

      // Preparar datos del usuario para actualizar
      const userData: any = {}
      if (email !== undefined) userData.email = email
      if (username !== undefined) userData.username = username
      if (firstName !== undefined) userData.firstName = firstName
      if (lastName !== undefined) userData.lastName = lastName

      // Actualizar datos del usuario si hay campos para actualizar
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: updatedEmployee.userId },
          data: userData,
        })
      }

      // Retornar empleado con datos actualizados
      return await tx.employee.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
              username: true,
            },
          },
          department: true,
          position: true,
        },
      })
    })

    return NextResponse.json(employee)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating employee:", error)
    return NextResponse.json(
      { error: "Error al actualizar empleado" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || !session.user.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.employee.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json(
      { error: "Error al eliminar empleado" },
      { status: 500 }
    )
  }
}
