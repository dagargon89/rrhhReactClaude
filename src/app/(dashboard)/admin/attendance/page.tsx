import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, CheckCircle2, AlertCircle, Timer } from "lucide-react"
import Link from "next/link"
import { AttendancesTable } from "./components/AttendancesTable"

async function getAttendances() {
  const attendances = await prisma.attendance.findMany({
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          department: {
            select: {
              name: true,
            },
          },
        },
      },
      schedule: {
        select: {
          shift: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 100, // Últimos 100 registros
  })

  return attendances
}

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalToday, presentToday, lateToday, avgWorkedHours] = await Promise.all([
    prisma.attendance.count({
      where: { date: today },
    }),
    prisma.attendance.count({
      where: { date: today, status: "PRESENT" },
    }),
    prisma.attendance.count({
      where: { date: today, status: "LATE" },
    }),
    prisma.attendance.aggregate({
      where: { date: today },
      _avg: {
        workedHours: true,
      },
    }),
  ])

  return {
    totalToday,
    presentToday,
    lateToday,
    avgWorkedHours: avgWorkedHours._avg.workedHours || 0,
  }
}

export default async function AttendancePage() {
  const [attendances, stats] = await Promise.all([
    getAttendances(),
    getStats(),
  ])

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Asistencias
            </h1>
            <p className="text-lg text-muted-foreground">
              Control de asistencias, horarios y registro de entrada/salida
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/attendance/new">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Asistencia
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total de Registros */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Hoy
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalToday}</div>
              <p className="text-xs text-blue-700 mt-1">
                Registros de asistencia
              </p>
            </CardContent>
          </Card>

          {/* Card: Llegadas Puntuales */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Llegadas Puntuales
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.presentToday}</div>
              <p className="text-xs text-green-700 mt-1">
                {stats.totalToday > 0
                  ? ((stats.presentToday / stats.totalToday) * 100).toFixed(1)
                  : 0}% del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Tardanzas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Tardanzas
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.lateToday}</div>
              <p className="text-xs text-orange-700 mt-1">
                Llegadas tarde hoy
              </p>
            </CardContent>
          </Card>

          {/* Card: Promedio de Horas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Promedio de Horas
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Timer className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {Number(stats.avgWorkedHours).toFixed(1)}h
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Horas trabajadas promedio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de asistencias con búsqueda y filtros */}
      <AttendancesTable attendances={attendances} />
    </div>
  )
}



