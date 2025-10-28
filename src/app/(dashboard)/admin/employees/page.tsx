import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Users, 
  UserCheck, 
  Building2,
  Briefcase
} from "lucide-react"
import Link from "next/link"
import { EmployeesTable } from "./components/EmployeesTable"

async function getEmployees() {
  const employees = await prisma.employee.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      department: true,
      position: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  return employees
}

export default async function EmployeesPage() {
  const employees = await getEmployees()

  // Estadísticas
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(emp => emp.status === "ACTIVE").length
  const fullTimeEmployees = employees.filter(emp => emp.employmentType === "FULL_TIME").length
  const employeesWithDept = employees.filter(emp => emp.department).length

  // Serializar los datos para pasarlos al componente cliente
  const serializedEmployees = employees.map(employee => ({
    ...employee,
    dateOfBirth: employee.dateOfBirth?.toISOString() || null,
    hireDate: employee.hireDate.toISOString(),
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Empleados
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra la información de los empleados de la organización
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Link>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Empleados */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Empleados
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalEmployees}</div>
              <p className="text-xs text-blue-700 mt-1">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          {/* Card: Empleados Activos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Empleados Activos
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{activeEmployees}</div>
              <p className="text-xs text-green-700 mt-1">
                {totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0}% del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Tiempo Completo */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Tiempo Completo
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Briefcase className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{fullTimeEmployees}</div>
              <p className="text-xs text-purple-700 mt-1">
                Empleados de tiempo completo
              </p>
            </CardContent>
          </Card>

          {/* Card: Con Departamento */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Con Departamento
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{employeesWithDept}</div>
              <p className="text-xs text-orange-700 mt-1">
                Asignados a departamentos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de empleados con búsqueda y filtros */}
      <EmployeesTable employees={serializedEmployees} />
    </div>
  )
}
