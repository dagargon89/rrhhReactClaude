import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { format, startOfMonth, endOfMonth, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { redirect } from "next/navigation"

async function getEmployeeAttendance(employeeId: string) {
  const today = new Date()
  const startMonth = startOfMonth(today)
  const endMonth = endOfMonth(today)

  const [attendances, stats] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        shiftOverride: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    }),
    prisma.attendance.aggregate({
      where: {
        employeeId,
        date: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      _count: true,
    }),
  ])

  // Calcular estadísticas
  const onTime = attendances.filter(a => a.status === 'PRESENT' && !a.isLate).length
  const late = attendances.filter(a => a.isLate).length
  const absent = attendances.filter(a => a.status === 'ABSENT').length

  return {
    attendances,
    stats: {
      total: stats._count,
      onTime,
      late,
      absent,
    },
  }
}

export default async function MyAttendancePage() {
  const session = await auth()

  if (!session?.user?.employeeId) {
    redirect('/login')
  }

  const { attendances, stats } = await getEmployeeAttendance(session.user.employeeId)

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (status === 'ABSENT') {
      return <Badge variant="destructive">Ausente</Badge>
    }
    if (isLate) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Tardanza</Badge>
    }
    return <Badge variant="outline" className="border-green-500 text-green-700">A Tiempo</Badge>
  }

  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A'
    return format(new Date(date), 'HH:mm', { locale: es })
  }

  const calculateWorkHours = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) return 'N/A'
    const minutes = differenceInMinutes(new Date(checkOut), new Date(checkIn))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mi Asistencia</h1>
        <p className="text-muted-foreground">
          Historial de asistencias del mes actual
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Días registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Tiempo</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTime}</div>
            <p className="text-xs text-muted-foreground">Días puntuales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tardanzas</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">Llegadas tarde</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausencias</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">Días ausente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de asistencias */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Asistencias</CardTitle>
          <CardDescription>
            Registro detallado de tus asistencias del mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendances.length > 0 ? (
            <div className="space-y-4">
              {attendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {format(new Date(attendance.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                      {getStatusBadge(attendance.status, attendance.isLate)}
                    </div>
                    {attendance.shiftOverride && (
                      <p className="text-sm text-muted-foreground">
                        Turno: {attendance.shiftOverride.name}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 md:mt-0 flex flex-col md:flex-row md:items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Entrada</p>
                        <p className="font-medium">{formatTime(attendance.checkIn)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Salida</p>
                        <p className="font-medium">{formatTime(attendance.checkOut)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Horas</p>
                        <p className="font-medium">
                          {calculateWorkHours(attendance.checkIn, attendance.checkOut)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay registros de asistencia este mes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
