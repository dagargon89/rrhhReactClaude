import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Función para generar código de empleado consecutivo
async function generateEmployeeCode(): Promise<string> {
  try {
    // Buscar el último código de empleado que siga el patrón EMP###
    const lastEmployee = await prisma.employee.findFirst({
      where: {
        employeeCode: {
          startsWith: 'EMP'
        }
      },
      orderBy: { employeeCode: 'desc' },
      select: { employeeCode: true }
    })

    if (!lastEmployee) {
      return "EMP001"
    }

    // Extraer el número del último código
    const match = lastEmployee.employeeCode.match(/EMP(\d+)/)
    if (!match) {
      return "EMP001"
    }

    const lastNumber = parseInt(match[1])
    const nextNumber = lastNumber + 1
    
    // Formatear con ceros a la izquierda (3 dígitos)
    return `EMP${nextNumber.toString().padStart(3, '0')}`
  } catch (error) {
    console.error("Error generating employee code:", error)
    // En caso de error, generar un código basado en timestamp
    const timestamp = Date.now().toString().slice(-3)
    return `EMP${timestamp}`
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que el usuario no tenga ya un empleado
    const existingEmployee = await prisma.employee.findUnique({
      where: { userId: params.id },
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: "Este usuario ya tiene un empleado asociado" },
        { status: 400 }
      )
    }

    // Generar código de empleado automáticamente
    let employeeCode = await generateEmployeeCode()
    
    // Verificar que el código no exista (doble verificación)
    let attempts = 0
    while (attempts < 10) {
      const existingCode = await prisma.employee.findUnique({
        where: { employeeCode: employeeCode }
      })
      
      if (!existingCode) {
        break
      }
      
      // Si existe, generar el siguiente
      const match = employeeCode.match(/EMP(\d+)/)
      if (match) {
        const currentNumber = parseInt(match[1])
        employeeCode = `EMP${(currentNumber + 1).toString().padStart(3, '0')}`
      } else {
        employeeCode = `EMP${Date.now().toString().slice(-3)}`
      }
      
      attempts++
    }

    // Crear el empleado con datos por defecto
    const employee = await prisma.employee.create({
      data: {
        userId: params.id,
        employeeCode: employeeCode,
        hireDate: new Date(), // Fecha actual como fecha de contratación
        employmentType: "FULL_TIME",
        status: "ACTIVE",
      },
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

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Error creating employee from user:", error)
    return NextResponse.json(
      { error: "Error al crear empleado" },
      { status: 500 }
    )
  }
}
