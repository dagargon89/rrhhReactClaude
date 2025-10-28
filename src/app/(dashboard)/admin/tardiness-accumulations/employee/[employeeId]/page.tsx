import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Clock, AlertTriangle, TrendingUp, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { TardinessAccumulationActions } from "./TardinessAccumulationActions"

async function getEmployeeAccumulations(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: true,
      department: true,
      position: true,
    },
  })

  if (!employee) return null

  const accumulations = await prisma.tardinessAccumulation.findMany({
    where: { employeeId },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  })

  return { employee, accumulations }
}

export default async function EmployeeAccumulationsPage({
  params,
}: {
  params: { employeeId: string }
}) {
  const data = await getEmployeeAccumulations(params.employeeId)

  if (!data) {
    notFound()
  }

  const { employee, accumulations } = data

  // Estadísticas totales
  const totalLateArrivals = accumulations.reduce((sum, a) => sum + a.lateArrivalsCount, 0)
  const totalDirectTardiness = accumulations.reduce((sum, a) => sum + a.directTardinessCount, 0)
  const totalFormalTardies = accumulations.reduce((sum, a) => sum + a.formalTardiesCount, 0)
  const totalAdministrativeActs = accumulations.reduce((sum, a) => sum + a.administrativeActs, 0)

  // Acumulación actual (mes actual)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const currentAccumulation = accumulations.find(
    a => a.month === currentMonth && a.year === currentYear
  )

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const getRiskLevel = (formalTardies: number) => {
    if (formalTardies >= 5) return { label: "Acta Generada", color: "bg-red-600 text-white" }
    if (formalTardies >= 4) return { label: "Alto Riesgo", color: "bg-red-100 text-red-800 border-red-300" }
    if (formalTardies >= 3) return { label: "Riesgo Medio", color: "bg-orange-100 text-orange-800 border-orange-300" }
    if (formalTardies >= 1) return { label: "Riesgo Bajo", color: "bg-yellow-100 text-yellow-800 border-yellow-300" }
    return { label: "Sin Retardos", color: "bg-green-100 text-green-800 border-green-300" }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/tardiness-accumulations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Historial de Tardanzas
          </h1>
          <p className="text-lg text-muted-foreground">
            {employee.user.firstName} {employee.user.lastName} ({employee.employeeCode})
          </p>
        </div>
      </div>

      {/* Información del Empleado */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Información del Empleado
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Código</p>
            <p className="font-mono font-medium">{employee.employeeCode}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm">{employee.user.email}</p>
          </div>
          {employee.department && (
            <div>
              <p className="text-sm text-muted-foreground">Departamento</p>
              <p className="text-sm">{employee.department.name}</p>
            </div>
          )}
          {employee.position && (
            <div>
              <p className="text-sm text-muted-foreground">Posición</p>
              <p className="text-sm">{employee.position.title}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas Totales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-yellow-700">
              Llegadas Tardías
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{totalLateArrivals}</div>
            <p className="text-xs text-yellow-700 mt-1">Total histórico</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700">
              Retardos Directos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{totalDirectTardiness}</div>
            <p className="text-xs text-orange-700 mt-1">Total histórico</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-red-700">
              Retardos Formales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{totalFormalTardies}</div>
            <p className="text-xs text-red-700 mt-1">Total histórico</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700">
              Actas Generadas
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{totalAdministrativeActs}</div>
            <p className="text-xs text-purple-700 mt-1">Total histórico</p>
          </CardContent>
        </Card>
      </div>

      {/* Acumulación Actual */}
      {currentAccumulation && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="h-5 w-5" />
              Acumulación del Mes Actual ({monthNames[currentMonth - 1]} {currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-blue-700">Llegadas Tardías</p>
                <p className="text-2xl font-bold text-blue-900">{currentAccumulation.lateArrivalsCount}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {currentAccumulation.lateArrivalsCount > 0
                    ? `${4 - (currentAccumulation.lateArrivalsCount % 4)} para retardo`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Retardos Directos</p>
                <p className="text-2xl font-bold text-blue-900">{currentAccumulation.directTardinessCount}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Retardos Formales</p>
                <p className="text-2xl font-bold text-red-600">{currentAccumulation.formalTardiesCount}</p>
                <p className="text-xs text-red-600 mt-1">
                  {currentAccumulation.formalTardiesCount >= 5
                    ? "¡Acta generada!"
                    : currentAccumulation.formalTardiesCount >= 4
                    ? `${5 - currentAccumulation.formalTardiesCount} para acta`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Nivel de Riesgo</p>
                <Badge className={getRiskLevel(currentAccumulation.formalTardiesCount).color}>
                  {getRiskLevel(currentAccumulation.formalTardiesCount).label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial Mensual */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Historial Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accumulations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros de acumulaciones para este empleado
            </div>
          ) : (
            <div className="space-y-4">
              {accumulations.map((acc) => {
                const risk = getRiskLevel(acc.formalTardiesCount)
                const isCurrentMonth = acc.month === currentMonth && acc.year === currentYear

                return (
                  <div
                    key={acc.id}
                    className={`p-4 rounded-lg border ${
                      isCurrentMonth
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {monthNames[acc.month - 1]} {acc.year}
                        </p>
                        {isCurrentMonth && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                            Actual
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={risk.color}>
                          {risk.label}
                        </Badge>
                        <TardinessAccumulationActions accumulation={acc} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Llegadas Tardías</p>
                        <p className="font-medium text-yellow-600">{acc.lateArrivalsCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Retardos Directos</p>
                        <p className="font-medium text-orange-600">{acc.directTardinessCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Retardos Formales</p>
                        <p className="font-medium text-red-600">{acc.formalTardiesCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Actas</p>
                        <p className="font-medium text-purple-600">{acc.administrativeActs}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
