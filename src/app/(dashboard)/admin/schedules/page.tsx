import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Clock, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { SchedulesTable } from "./components/SchedulesTable"
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from "date-fns"

async function getSchedules() {
  const schedules = await prisma.schedule.findMany({
    include: {
      employee: {
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
      },
      shift: {
        select: {
          id: true,
          name: true,
          code: true,
          startTime: true,
          endTime: true,
          isFlexible: true,
        },
      },
      _count: {
        select: {
          attendances: true,
        },
      },
    },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
    take: 200,
  })

  return schedules
}

async function getScheduleStats() {
  const today = new Date()
  const startToday = startOfDay(today)
  const endToday = endOfDay(today)
  const next7Days = addDays(today, 7)
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Lunes
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }) // Domingo

  const [
    totalSchedules,
    todaySchedules,
    next7DaysSchedules,
    thisWeekSchedules,
  ] = await Promise.all([
    prisma.schedule.count(),
    prisma.schedule.count({
      where: {
        date: {
          gte: startToday,
          lte: endToday,
        },
      },
    }),
    prisma.schedule.count({
      where: {
        date: {
          gte: startToday,
          lte: next7Days,
        },
      },
    }),
    prisma.schedule.count({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),
  ])

  // Empleados únicos con horarios
  const employeesWithSchedules = await prisma.schedule.groupBy({
    by: ['employeeId'],
  })

  return {
    totalSchedules,
    todaySchedules,
    next7DaysSchedules,
    thisWeekSchedules,
    uniqueEmployees: employeesWithSchedules.length,
  }
}

export default async function SchedulesPage() {
  const schedules = await getSchedules()
  const stats = await getScheduleStats()

  // Serialización de datos para componentes cliente
  const serializedSchedules = schedules.map(schedule => ({
    ...schedule,
    date: schedule.date.toISOString(),
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Horarios
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra horarios de trabajo y asignación de turnos a empleados
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/schedules/bulk">
                <Calendar className="mr-2 h-4 w-4" />
                Asignación Masiva
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link href="/admin/schedules/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Horario
              </Link>
            </Button>
          </div>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Horarios */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Horarios
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalSchedules}</div>
              <p className="text-xs text-blue-700 mt-1">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          {/* Card: Horarios de Hoy */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Horarios de Hoy
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.todaySchedules}</div>
              <p className="text-xs text-green-700 mt-1">
                {stats.thisWeekSchedules} esta semana
              </p>
            </CardContent>
          </Card>

          {/* Card: Próximos 7 Días */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Próximos 7 Días
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.next7DaysSchedules}</div>
              <p className="text-xs text-purple-700 mt-1">
                Horarios programados
              </p>
            </CardContent>
          </Card>

          {/* Card: Empleados */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Empleados
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.uniqueEmployees}</div>
              <p className="text-xs text-orange-700 mt-1">
                Con horarios asignados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de horarios con búsqueda y filtros */}
      <SchedulesTable schedules={serializedSchedules} />
    </div>
  )
}
