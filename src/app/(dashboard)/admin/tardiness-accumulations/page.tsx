import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, TrendingUp, Users } from "lucide-react"
import { TardinessAccumulationsTableEnhanced } from "./components/TardinessAccumulationsTableEnhanced"

// Función Server-Side para obtener acumulaciones
async function getTardinessAccumulations(month?: number, year?: number) {
  const now = new Date()
  const targetMonth = month || now.getMonth() + 1
  const targetYear = year || now.getFullYear()

  const accumulations = await prisma.tardinessAccumulation.findMany({
    where: {
      month: targetMonth,
      year: targetYear,
    },
    include: {
      employee: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          department: {
            select: {
              name: true,
            },
          },
          position: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      formalTardiesCount: "desc",
    },
  })

  return accumulations
}

export default async function TardinessAccumulationsPage() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const accumulations = await getTardinessAccumulations(currentMonth, currentYear)

  // Cálculo de estadísticas
  const totalEmployees = accumulations.length
  const employeesWithTardies = accumulations.filter(a => a.formalTardiesCount > 0).length
  const totalFormalTardies = accumulations.reduce((sum, a) => sum + a.formalTardiesCount, 0)
  const totalLateArrivals = accumulations.reduce((sum, a) => sum + a.lateArrivalsCount, 0)
  const totalAdministrativeActs = accumulations.reduce((sum, a) => sum + a.administrativeActs, 0)

  // Empleados en riesgo (4 retardos formales o más)
  const atRiskEmployees = accumulations.filter(a => a.formalTardiesCount >= 4).length

  // Promedio de retardos formales
  const avgFormalTardies = totalEmployees > 0
    ? (totalFormalTardies / totalEmployees).toFixed(1)
    : "0"

  // Serialización de datos para componentes cliente
  const serializedAccumulations = accumulations.map(acc => ({
    ...acc,
    createdAt: acc.createdAt.toISOString(),
    updatedAt: acc.updatedAt.toISOString(),
    employee: {
      ...acc.employee,
      dateOfBirth: acc.employee.dateOfBirth?.toISOString() || null,
      hireDate: acc.employee.hireDate.toISOString(),
      createdAt: acc.employee.createdAt.toISOString(),
      updatedAt: acc.employee.updatedAt.toISOString(),
    },
  }))

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <div className="space-y-8">
      {/* Header con título */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Acumulaciones Mensuales
            </h1>
            <p className="text-lg text-muted-foreground">
              {monthNames[currentMonth - 1]} {currentYear} - Seguimiento de tardanzas por empleado
            </p>
          </div>
        </div>

        {/* Estadísticas Generales */}
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
                Con registros este mes
              </p>
            </CardContent>
          </Card>

          {/* Card: Llegadas Tardías */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-yellow-700">
                Llegadas Tardías
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{totalLateArrivals}</div>
              <p className="text-xs text-yellow-700 mt-1">
                Total de llegadas 1-15 min
              </p>
            </CardContent>
          </Card>

          {/* Card: Retardos Formales */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Retardos Formales
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{totalFormalTardies}</div>
              <p className="text-xs text-orange-700 mt-1">
                Promedio: {avgFormalTardies} por empleado
              </p>
            </CardContent>
          </Card>

          {/* Card: En Riesgo */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Empleados en Riesgo
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{atRiskEmployees}</div>
              <p className="text-xs text-red-700 mt-1">
                Con 4+ retardos formales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas Adicionales */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Card: Empleados con Tardanzas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Empleados con Tardanzas
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{employeesWithTardies}</div>
              <p className="text-xs text-purple-700 mt-1">
                {totalEmployees > 0
                  ? `${((employeesWithTardies / totalEmployees) * 100).toFixed(1)}% del total`
                  : "0% del total"
                }
              </p>
            </CardContent>
          </Card>

          {/* Card: Actas Generadas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Actas Generadas
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{totalAdministrativeActs}</div>
              <p className="text-xs text-red-700 mt-1">
                Por 5 retardos formales
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de acumulaciones con búsqueda y filtros */}
      <TardinessAccumulationsTableEnhanced
        accumulations={serializedAccumulations}
      />
    </div>
  )
}
