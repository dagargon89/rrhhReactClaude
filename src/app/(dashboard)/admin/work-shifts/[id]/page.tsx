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
      periods: {
        orderBy: [
          { dayOfWeek: "asc" },
          { hourFrom: "asc" },
        ],
      },
      employeesWithDefault: {
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
        take: 10,
      },
      _count: {
        select: {
          employeesWithDefault: true,
          periods: true,
        },
      },
    },
  })

  return workShift
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
        {workShift.autoCheckoutEnabled && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Calendar className="h-3 w-3 mr-1" />
            Auto-Checkout
          </Badge>
        )}
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {workShift._count.employeesWithDefault} empleados
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {workShift._count.periods} períodos
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
                {(() => {
                  // Calcular días únicos
                  const uniqueDays = new Set(workShift.periods.map(p => p.dayOfWeek)).size
                  return uniqueDays > 0 ? (Number(workShift.weeklyHours) / uniqueDays).toFixed(1) : '0.0'
                })()} hrs
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
              <p className="text-sm text-muted-foreground">Auto-Checkout</p>
              {workShift.autoCheckoutEnabled ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 mt-1">
                  Habilitado
                </Badge>
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
              {(() => {
                // Agrupar períodos por día
                const periodsByDay: Record<number, typeof workShift.periods> = {}
                workShift.periods.forEach(period => {
                  if (!periodsByDay[period.dayOfWeek]) {
                    periodsByDay[period.dayOfWeek] = []
                  }
                  periodsByDay[period.dayOfWeek].push(period)
                })

                // Crear array de todos los días (0-6)
                return [0, 1, 2, 3, 4, 5, 6].map(dayNum => {
                  const dayPeriods = periodsByDay[dayNum] || []
                  const hasWork = dayPeriods.length > 0

                  return (
                    <div
                      key={dayNum}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        hasWork ? "bg-muted/30 border-blue-200" : "bg-muted/10 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-24">
                          <Badge
                            variant={hasWork ? "default" : "outline"}
                            className={hasWork ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                          >
                            {DAYS_LABELS[dayNum]}
                          </Badge>
                        </div>
                        {hasWork ? (
                          <div className="flex flex-wrap items-center gap-3 flex-1">
                            {dayPeriods.map((period, idx) => {
                              const hourFrom = Number(period.hourFrom)
                              const hourTo = Number(period.hourTo)
                              const startHour = Math.floor(hourFrom)
                              const startMin = Math.round((hourFrom - startHour) * 60)
                              const endHour = Math.floor(hourTo)
                              const endMin = Math.round((hourTo - endHour) * 60)
                              const duration = hourTo - hourFrom

                              return (
                                <div key={period.id} className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono font-medium">
                                    {`${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`}
                                    {" - "}
                                    {`${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`}
                                  </span>
                                  <Badge variant="secondary" className="font-mono text-xs">
                                    {duration.toFixed(1)}h
                                  </Badge>
                                  {period.name && (
                                    <span className="text-xs text-muted-foreground">({period.name})</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No laboral</span>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {(() => {
                const uniqueDays = new Set(workShift.periods.map(p => p.dayOfWeek)).size
                return `Este turno aplica para ${uniqueDays} día${uniqueDays !== 1 ? 's' : ''} de la semana con ${workShift.periods.length} período${workShift.periods.length !== 1 ? 's' : ''}`
              })()}
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Empleados Asignados */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Empleados Asignados ({workShift._count.employeesWithDefault})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workShift.employeesWithDefault.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workShift.employeesWithDefault.map((employee) => (
                  <Link
                    key={employee.id}
                    href={`/admin/employees/${employee.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {employee.user.firstName} {employee.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {employee.employeeCode}
                      </p>
                    </div>
                  </Link>
                ))}
                {workShift._count.employeesWithDefault > 10 && (
                  <div className="col-span-full text-center text-sm text-blue-600 py-2">
                    +{workShift._count.employeesWithDefault - 10} empleados más
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay empleados asignados a este turno</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
