import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateDepartmentSchema } from "@/lib/validations/department"
import { z } from "zod"

// GET - Obtener un departamento
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        manager: {
          select: {
            id: true,
            employeeCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
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
        subDepartments: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
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
        positions: {
          select: {
            id: true,
            title: true,
            code: true,
            isActive: true,
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
    })

    if (!department) {
      return NextResponse.json(
        { error: "Departamento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("Error fetching department:", error)
    return NextResponse.json(
      { error: "Error al obtener departamento" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar departamento
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
    const validatedData = updateDepartmentSchema.parse(body)

    // Verificar que el departamento existe
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
    })

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Departamento no encontrado" },
        { status: 404 }
      )
    }

    // Verificar código único si se está actualizando
    if (validatedData.code && validatedData.code !== existingDepartment.code) {
      const codeInUse = await prisma.department.findUnique({
        where: { code: validatedData.code },
      })

      if (codeInUse) {
        return NextResponse.json(
          { error: "El código de departamento ya está en uso" },
          { status: 400 }
        )
      }
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

    // Verificar que no se esté creando una referencia circular con parentDepartmentId
    if (validatedData.parentDepartmentId) {
      if (validatedData.parentDepartmentId === params.id) {
        return NextResponse.json(
          { error: "Un departamento no puede ser su propio padre" },
          { status: 400 }
        )
      }
    }

    // Actualizar departamento
    const updatedDepartment = await prisma.department.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedDepartment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating department:", error)
    return NextResponse.json(
      { error: "Error al actualizar departamento" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar departamento
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            employees: true,
            subDepartments: true,
            positions: true,
          },
        },
      },
    })

    if (!department) {
      return NextResponse.json(
        { error: "Departamento no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que no tenga empleados, subdepartamentos o posiciones
    if (department._count.employees > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un departamento con empleados asignados" },
        { status: 400 }
      )
    }

    if (department._count.subDepartments > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un departamento con subdepartamentos" },
        { status: 400 }
      )
    }

    if (department._count.positions > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un departamento con posiciones asignadas" },
        { status: 400 }
      )
    }

    // Eliminar departamento
    await prisma.department.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Departamento eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting department:", error)
    return NextResponse.json(
      { error: "Error al eliminar departamento" },
      { status: 500 }
    )
  }
}
