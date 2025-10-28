import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, Clock, Users, Building2, Briefcase, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

async function getSchedule(id: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
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
              email: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          position: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      },
      shift: true,
      attendances: {
        select: {
          id: true,
          checkInTime: true,
          checkOutTime: true,
          workedHours: true,
          status: true,
          isAutoCheckout: true,
        },
      },
    },
  })

  return schedule
}

export default async function ScheduleDetailPage({ params }: { params: { id: string } }) {
  const schedule = await getSchedule(params.id)

  if (!schedule) {
    notFound()
  }

  const formatDateTime = (date: Date) => {
    return format(new Date(date), "dd MMMM yyyy 'a las' HH:mm", { locale: es })
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: es })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/schedules">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Horario de {schedule.employee.user.firstName} {schedule.employee.user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  {formatDate(schedule.date)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href={`/admin/schedules/${schedule.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Horario
          </Link>
        </Button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-3">
        {schedule.isOverride ? (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Override
          </Badge>
        ) : (
          <Badge variant="outline">Regular</Badge>
        )}
        <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {schedule.attendances.length} asistencias
        </Badge>
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Información del Empleado */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Información del Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Nombre
              </p>
              <p className="font-medium">
                {schedule.employee.user.firstName} {schedule.employee.user.lastName}
              </p>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Código de Empleado
              </p>
              <Badge className="font-mono mt-1">{schedule.employee.employeeCode}</Badge>
            </div>
            {schedule.employee.department && (
              <div className="py-3 border-b">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Departamento
                </p>
                <div className="mt-1">
                  <p className="font-medium">{schedule.employee.department.name}</p>
                  <Badge variant="outline" className="font-mono mt-1">
                    {schedule.employee.department.code}
                  </Badge>
                </div>
              </div>
            )}
            {schedule.employee.position && (
              <div className="py-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Posición
                </p>
                <div className="mt-1">
                  <p className="font-medium">{schedule.employee.position.title}</p>
                  <Badge variant="outline" className="font-mono mt-1">
                    {schedule.employee.position.code}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Información del Turno */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Información del Turno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Nombre del Turno
              </p>
              <p className="font-medium">{schedule.shift.name}</p>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Código
              </p>
              <Badge className="font-mono mt-1">{schedule.shift.code}</Badge>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground">Horario</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Entrada:</span>
                  <span className="font-mono font-medium text-lg">{schedule.shift.startTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Salida:</span>
                  <span className="font-mono font-medium text-lg">{schedule.shift.endTime}</span>
                </div>
              </div>
            </div>
            <div className="py-3">
              <p className="text-sm text-muted-foreground">Tipo</p>
              {schedule.shift.isFlexible ? (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 mt-1">
                  Flexible
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-1">Fijo</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Detalles del Horario */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Detalles del Horario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha
              </p>
              <p className="font-medium text-lg">{formatDate(schedule.date)}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {format(schedule.date, "EEEE", { locale: es })}
              </p>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground">Tipo de Horario</p>
              {schedule.isOverride ? (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Override
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-1">Regular</Badge>
              )}
            </div>
            <div className="py-3">
              <p className="text-sm text-muted-foreground">Fecha de Creación</p>
              <p className="text-sm mt-1">{formatDateTime(schedule.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Notas */}
        {schedule.notes && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{schedule.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Card 5: Asistencias Registradas */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Asistencias Registradas ({schedule.attendances.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schedule.attendances.length > 0 ? (
              <div className="space-y-3">
                {schedule.attendances.map((attendance) => (
                  <Link
                    key={attendance.id}
                    href={`/admin/attendance/${attendance.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          attendance.status === "PRESENT" ? "default" :
                          attendance.status === "LATE" ? "secondary" :
                          "outline"
                        }>
                          {attendance.status}
                        </Badge>
                        {attendance.isAutoCheckout && (
                          <Badge variant="outline" className="text-xs">
                            Auto-Checkout
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Entrada: </span>
                          <span className="font-mono">
                            {attendance.checkInTime ? format(attendance.checkInTime, "HH:mm") : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Salida: </span>
                          <span className="font-mono">
                            {attendance.checkOutTime ? format(attendance.checkOutTime, "HH:mm") : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{attendance.workedHours.toString()}h</div>
                      <div className="text-xs text-muted-foreground">Horas trabajadas</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay asistencias registradas para este horario</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
