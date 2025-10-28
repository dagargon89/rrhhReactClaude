import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { IncidentsChart } from "../components/IncidentsChart"
import { IncidentsByTypeChart } from "../components/IncidentsByTypeChart"
import { IncidentsByDepartmentChart } from "../components/IncidentsByDepartmentChart"
import { IncidentsTrendChart } from "../components/IncidentsTrendChart"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { es } from "date-fns/locale"

// Obtener datos para gráficas
async function getAnalyticsData() {
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)

  // Últimos 6 meses
  const sixMonthsAgo = subMonths(now, 5)
  const sixMonthsStart = startOfMonth(sixMonthsAgo)

  // Incidencias del mes actual
  const currentMonthIncidents = await prisma.incident.findMany({
    where: {
      date: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
    include: {
      incidentType: true,
      department: true,
      employee: true,
    },
  })

  // Incidencias de los últimos 6 meses para tendencias
  const sixMonthsIncidents = await prisma.incident.findMany({
    where: {
      date: {
        gte: sixMonthsStart,
        lte: currentMonthEnd,
      },
    },
    include: {
      incidentType: true,
      department: true,
    },
    orderBy: {
      date: "asc",
    },
  })

  // Estadísticas por tipo
  const statsByType = await prisma.incident.groupBy({
    by: ["incidentTypeId"],
    where: {
      date: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
    _count: true,
    _avg: {
      value: true,
    },
    _sum: {
      value: true,
    },
  })

  // Obtener nombres de tipos
  const incidentTypes = await prisma.incidentType.findMany()
  const typesMap = Object.fromEntries(incidentTypes.map(t => [t.id, t]))

  const typeStats = statsByType.map(stat => ({
    ...stat,
    type: typesMap[stat.incidentTypeId],
  }))

  // Estadísticas por departamento
  const statsByDepartment = await prisma.incident.groupBy({
    by: ["departmentId"],
    where: {
      date: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
      departmentId: { not: null },
    },
    _count: true,
    _avg: {
      value: true,
    },
  })

  // Obtener nombres de departamentos
  const departments = await prisma.department.findMany()
  const deptMap = Object.fromEntries(departments.map(d => [d.id, d]))

  const departmentStats = statsByDepartment
    .filter(stat => stat.departmentId)
    .map(stat => ({
      ...stat,
      department: deptMap[stat.departmentId!],
    }))

  return {
    currentMonthIncidents,
    sixMonthsIncidents,
    typeStats,
    departmentStats,
    period: {
      start: currentMonthStart,
      end: currentMonthEnd,
    },
  }
}

export default async function IncidentsAnalyticsPage() {
  const data = await getAnalyticsData()

  // Serializar datos
  const serializedData = {
    ...data,
    currentMonthIncidents: data.currentMonthIncidents.map(i => ({
      ...i,
      date: i.date.toISOString(),
      value: i.value.toString(),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
    sixMonthsIncidents: data.sixMonthsIncidents.map(i => ({
      ...i,
      date: i.date.toISOString(),
      value: i.value.toString(),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
    typeStats: data.typeStats.map(s => ({
      ...s,
      _avg: {
        value: s._avg.value?.toString() || "0",
      },
      _sum: {
        value: s._sum.value?.toString() || "0",
      },
    })),
    departmentStats: data.departmentStats.map(s => ({
      ...s,
      _avg: {
        value: s._avg.value?.toString() || "0",
      },
    })),
    period: {
      start: data.period.start.toISOString(),
      end: data.period.end.toISOString(),
    },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/incidents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Análisis de Incidencias
          </h1>
          <p className="text-lg text-muted-foreground">
            Estadísticas y tendencias - {format(data.period.start, "MMMM yyyy", { locale: es })}
          </p>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-red-700">
              Total Incidencias
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {data.currentMonthIncidents.length}
            </div>
            <p className="text-xs text-red-700 mt-1">
              En el mes actual
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700">
              Tipos Activos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {data.typeStats.length}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Con incidencias registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700">
              Departamentos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {data.departmentStats.length}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Con incidencias
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700">
              Período
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-900">
              {format(data.period.start, "MMM yyyy", { locale: es })}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Mes en análisis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfica: Incidencias por Tipo */}
        <IncidentsByTypeChart data={serializedData.typeStats} />

        {/* Gráfica: Incidencias por Departamento */}
        <IncidentsByDepartmentChart data={serializedData.departmentStats} />
      </div>

      {/* Gráfica de tendencia (full width) */}
      <IncidentsTrendChart data={serializedData.sixMonthsIncidents} />

      {/* Tabla de top incidencias */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top Incidencias del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.currentMonthIncidents
              .sort((a, b) => parseFloat(b.value.toString()) - parseFloat(a.value.toString()))
              .slice(0, 10)
              .map((incident, index) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{incident.incidentType.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {incident.department?.name || incident.employee ? `${incident.employee!.firstName} ${incident.employee!.lastName}` : "Global"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{parseFloat(incident.value.toString()).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(incident.date, "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
