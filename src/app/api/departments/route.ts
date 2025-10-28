import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createDepartmentSchema } from "@/lib/validations/department"
import { z } from "zod"

// GET - Listar departamentos
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const departments = await prisma.department.findMany({
      include: {
        manager: {
          select: {
            id: true,
            employeeCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        parentDepartment: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            employees: true,
            subDepartments: true,
            positions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(
      { error: "Error al obtener departamentos" },
      { status: 500 }
    )
  }
}

// POST - Crear departamento
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = createDepartmentSchema.parse(body)

    // Verificar código único
    const existingCode = await prisma.department.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "El código de departamento ya está en uso" },
        { status: 400 }
      )
    }

    // Verificar que el manager existe si se proporciona
    if (validatedData.managerId) {
      const manager = await prisma.employee.findUnique({
        where: { id: validatedData.managerId },
      })

      if (!manager) {
        return NextResponse.json(
          { error: "El empleado seleccionado como manager no existe" },
          { status: 400 }
        )
      }
    }

    // Crear departamento
    const department = await prisma.department.create({
      data: validatedData,
      include: {
        manager: {
          select: {
            id: true,
            employeeCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        parentDepartment: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating department:", error)
    return NextResponse.json(
      { error: "Error al crear departamento" },
      { status: 500 }
    )
  }
}
