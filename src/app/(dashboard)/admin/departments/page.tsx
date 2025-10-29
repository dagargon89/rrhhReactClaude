import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, Users, GitBranch, Briefcase } from "lucide-react"
import Link from "next/link"
import { DepartmentsTableEnhanced } from "./components/DepartmentsTableEnhanced"

async function getDepartments() {
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

  return departments
}

export default async function DepartmentsPage() {
  const departments = await getDepartments()

  // Cálculo de estadísticas
  const totalDepartments = departments.length
  const activeDepartments = departments.filter(dept => dept.isActive).length
  const totalEmployees = departments.reduce((sum, dept) => sum + dept._count.employees, 0)
  const totalPositions = departments.reduce((sum, dept) => sum + dept._count.positions, 0)
  const departmentsWithManager = departments.filter(dept => dept.managerId).length

  // Serialización de datos para componentes cliente
  const serializedDepartments = departments.map(dept => ({
    ...dept,
    createdAt: dept.createdAt.toISOString(),
    updatedAt: dept.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Departamentos
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra departamentos, jerarquías y estructura organizacional
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/departments/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Departamento
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Departamentos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Departamentos
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalDepartments}</div>
              <p className="text-xs text-blue-700 mt-1">
                {activeDepartments} activos
              </p>
            </CardContent>
          </Card>

          {/* Card: Total Empleados */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Total Empleados
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{totalEmployees}</div>
              <p className="text-xs text-green-700 mt-1">
                En todos los departamentos
              </p>
            </CardContent>
          </Card>

          {/* Card: Con Manager */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Con Manager
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <GitBranch className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{departmentsWithManager}</div>
              <p className="text-xs text-purple-700 mt-1">
                {((departmentsWithManager / totalDepartments) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Posiciones */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Posiciones
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Briefcase className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{totalPositions}</div>
              <p className="text-xs text-orange-700 mt-1">
                Puestos disponibles
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de departamentos con búsqueda y filtros */}
      <DepartmentsTableEnhanced departments={serializedDepartments} />
    </div>
  )
}
