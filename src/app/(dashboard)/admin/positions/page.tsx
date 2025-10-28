import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Briefcase, Users, Building2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { PositionsTable } from "./components/PositionsTable"

async function getPositions() {
  const positions = await prisma.position.findMany({
    include: {
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return positions
}

export default async function PositionsPage() {
  const positions = await getPositions()

  // Cálculo de estadísticas
  const totalPositions = positions.length
  const activePositions = positions.filter(pos => pos.isActive).length
  const totalEmployees = positions.reduce((sum, pos) => sum + pos._count.employees, 0)
  const positionsWithEmployees = positions.filter(pos => pos._count.employees > 0).length

  // Estadísticas por nivel
  const byLevel = {
    ENTRY: positions.filter(p => p.level === "ENTRY").length,
    MID: positions.filter(p => p.level === "MID").length,
    SENIOR: positions.filter(p => p.level === "SENIOR").length,
    MANAGER: positions.filter(p => p.level === "MANAGER").length,
    DIRECTOR: positions.filter(p => p.level === "DIRECTOR").length,
  }

  // Serialización de datos para componentes cliente
  const serializedPositions = positions.map(pos => ({
    ...pos,
    createdAt: pos.createdAt.toISOString(),
    updatedAt: pos.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Posiciones
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra puestos de trabajo, niveles y estructura organizacional
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/positions/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Posición
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Posiciones */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Posiciones
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalPositions}</div>
              <p className="text-xs text-blue-700 mt-1">
                {activePositions} activas
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
                En todas las posiciones
              </p>
            </CardContent>
          </Card>

          {/* Card: Con Empleados */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Con Empleados
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{positionsWithEmployees}</div>
              <p className="text-xs text-purple-700 mt-1">
                {((positionsWithEmployees / totalPositions) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Departamentos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Departamentos
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {new Set(positions.map(p => p.departmentId)).size}
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Con posiciones asignadas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de posiciones con búsqueda y filtros */}
      <PositionsTable positions={serializedPositions} />
    </div>
  )
}
