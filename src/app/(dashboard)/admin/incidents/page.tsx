import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react"
import Link from "next/link"
import { IncidentsTable } from "./components/IncidentsTable"
import { startOfMonth, endOfMonth } from "date-fns"

// Funci\u00f3n Server-Side para obtener datos
async function getIncidents() {
  const incidents = await prisma.incident.findMany({
    include: {
      incidentType: true,
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
      department: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 100, // Limitar a las \u00faltimas 100 incidencias
  })

  return incidents
}

// Obtener estad\u00edsticas del mes actual
async function getMonthlyStats() {
  const startDate = startOfMonth(new Date())
  const endDate = endOfMonth(new Date())

  const [
    totalIncidents,
    turnoverIncidents,
    absenteeismIncidents,
    tardinessIncidents,
    overtimeIncidents,
  ] = await Promise.all([
    prisma.incident.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.incident.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        incidentType: {
          name: "TURNOVER",
        },
      },
    }),
    prisma.incident.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        incidentType: {
          name: "ABSENTEEISM",
        },
      },
    }),
    prisma.incident.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        incidentType: {
          name: "TARDINESS",
        },
      },
    }),
    prisma.incident.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        incidentType: {
          name: "OVERTIME",
        },
      },
    }),
  ])

  return {
    totalIncidents,
    turnoverIncidents,
    absenteeismIncidents,
    tardinessIncidents,
    overtimeIncidents,
  }
}

export default async function IncidentsPage() {
  const [incidents, stats] = await Promise.all([
    getIncidents(),
    getMonthlyStats(),
  ])

  // Serializar datos para componentes cliente
  const serializedIncidents = incidents.map(incident => ({
    ...incident,
    date: incident.date.toISOString(),
    value: incident.value.toString(),
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
    employee: incident.employee ? {
      ...incident.employee,
      dateOfBirth: incident.employee.dateOfBirth?.toISOString() || null,
      hireDate: incident.employee.hireDate.toISOString(),
      createdAt: incident.employee.createdAt.toISOString(),
      updatedAt: incident.employee.updatedAt.toISOString(),
    } : null,
    department: incident.department ? {
      ...incident.department,
      createdAt: incident.department.createdAt.toISOString(),
      updatedAt: incident.department.updatedAt.toISOString(),
    } : null,
    incidentType: {
      ...incident.incidentType,
      createdAt: incident.incidentType.createdAt.toISOString(),
      updatedAt: incident.incidentType.updatedAt.toISOString(),
    },
  }))

  return (
    <div className="space-y-8">
      {/* Header con t\u00edtulo y bot\u00f3n de acci\u00f3n */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Gesti\u00f3n de Incidencias
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra y monitorea las incidencias del sistema
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
            <Link href="/admin/incidents/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Incidencia
            </Link>
          </Button>
        </div>

        {/* Estad\u00edsticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Card: Total Incidencias */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Total Incidencias
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{stats.totalIncidents}</div>
              <p className="text-xs text-red-700 mt-1">
                En el mes actual
              </p>
            </CardContent>
          </Card>

          {/* Card: Rotaci\u00f3n */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Rotaci\u00f3n
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.turnoverIncidents}</div>
              <p className="text-xs text-purple-700 mt-1">
                Casos registrados
              </p>
            </CardContent>
          </Card>

          {/* Card: Ausentismo */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Ausentismo
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.absenteeismIncidents}</div>
              <p className="text-xs text-orange-700 mt-1">
                Casos registrados
              </p>
            </CardContent>
          </Card>

          {/* Card: Impuntualidad */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-yellow-700">
                Impuntualidad
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{stats.tardinessIncidents}</div>
              <p className="text-xs text-yellow-700 mt-1">
                Casos registrados
              </p>
            </CardContent>
          </Card>

          {/* Card: Horas Extra */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Horas Extra
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.overtimeIncidents}</div>
              <p className="text-xs text-blue-700 mt-1">
                Casos registrados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de incidencias con b\u00fasqueda y filtros */}
      <IncidentsTable incidents={serializedIncidents} />
    </div>
  )
}
