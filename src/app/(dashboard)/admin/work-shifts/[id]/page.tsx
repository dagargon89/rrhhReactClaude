import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Clock, Calendar, ToggleLeft, Timer, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

const DAYS_LABELS: Record<number, string> = {
  0: "Lunes",
  1: "Martes",
  2: "Miércoles",
  3: "Jueves",
  4: "Viernes",
  5: "Sábado",
  6: "Domingo",
}

async function getWorkShift(id: string) {
  const workShift = await prisma.workShift.findUnique({
    where: { id },
    include: {
      schedules: {
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
            },
          },
        },
        take: 10,
        orderBy: {
          date: "desc",
        },
      },
      _count: {
        select: {
          schedules: true,
        },
      },
    },
  })

  if (!workShift) return null

  // Parsear workingHours de JSON string a objeto
  return {
    ...workShift,
    workingHours: JSON.parse(workShift.workingHours),
  }
}

export default async function WorkShiftDetailPage({ params }: { params: { id: string } }) {
  const workShift = await getWorkShift(params.id)

  if (!workShift) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/work-shifts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {workShift.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground font-mono">
                  {workShift.code}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href={`/admin/work-shifts/${workShift.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Turno
          </Link>
        </Button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-3">
        {workShift.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">Inactivo</Badge>
        )}
        {workShift.isFlexible ? (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <ToggleLeft className="h-3 w-3 mr-1" />
            Flexible
          </Badge>
        ) : (
          <Badge variant="outline">Fijo</Badge>
        )}
        {workShift.autoCheckoutEnabled && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Calendar className="h-3 w-3 mr-1" />
            Auto-Checkout
          </Badge>
        )}
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {workShift._count.schedules} horarios
        </Badge>
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Información Básica */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Nombre del Turno
              </p>
              <p className="font-medium">{workShift.name}</p>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Código
              </p>
              <Badge className="font-mono mt-1">{workShift.code}</Badge>
            </div>
            <div className="py-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Creación
              </p>
              <p className="font-medium">{formatDate(workShift.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Horas Semanales */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-green-600" />
              Información de Horas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horas Semanales
              </p>
              <p className="font-medium font-mono text-2xl">{Number(workShift.weeklyHours).toFixed(1)} hrs</p>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Promedio Diario
              </p>
              <p className="font-medium font-mono text-2xl">
                {(Number(workShift.weeklyHours) / workShift.workingHours.filter((d: any) => d.enabled).length).toFixed(1)} hrs
              </p>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Período de Gracia
              </p>
              <p className="font-medium">{workShift.gracePeriodMinutes} minutos</p>
            </div>
            <div className="py-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Zona Horaria
              </p>
              <p className="font-medium">{workShift.timezone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Configuración */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5 text-purple-600" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground">Tipo de Turno</p>
              {workShift.isFlexible ? (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 mt-1">
                  <ToggleLeft className="h-3 w-3 mr-1" />
                  Flexible
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-1">Fijo</Badge>
              )}
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground">Auto-Checkout</p>
              {workShift.autoCheckoutEnabled ? (
                <div className="mt-1 space-y-1">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Habilitado
                  </Badge>
                  {workShift.autoCheckoutTime && (
                    <p className="text-lg font-mono font-medium">{workShift.autoCheckoutTime}</p>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="mt-1">Deshabilitado</Badge>
              )}
            </div>
            <div className="py-3">
              <p className="text-sm text-muted-foreground">Estado</p>
              {workShift.isActive ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 mt-1">
                  Activo
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-1">Inactivo</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Horarios por Día */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Horarios por Día de la Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workShift.workingHours.map((day: any) => (
                <div
                  key={day.day}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    day.enabled ? "bg-muted/30 border-blue-200" : "bg-muted/10 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <Badge
                        variant={day.enabled ? "default" : "outline"}
                        className={day.enabled ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                      >
                        {DAYS_LABELS[day.day]}
                      </Badge>
                    </div>
                    {day.enabled ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-medium">
                            {day.startTime} - {day.endTime}
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          {day.duration.toFixed(2)} hrs
                        </Badge>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No laboral</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Este turno aplica para {workShift.workingHours.filter((d: any) => d.enabled).length} día
              {workShift.workingHours.filter((d: any) => d.enabled).length !== 1 ? "s" : ""} de la semana
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Horarios Asignados */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Horarios Asignados ({workShift._count.schedules})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workShift.schedules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workShift.schedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/admin/employees/${schedule.employee.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">
                          {schedule.employee.user.firstName} {schedule.employee.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {schedule.employee.employeeCode}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(schedule.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </Badge>
                  </Link>
                ))}
                {workShift._count.schedules > 10 && (
                  <div className="col-span-full text-center text-sm text-blue-600 py-2">
                    Ver todos los {workShift._count.schedules} horarios
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay horarios asignados a este turno</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
