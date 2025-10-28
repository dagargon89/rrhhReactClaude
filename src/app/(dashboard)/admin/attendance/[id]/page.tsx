import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Timer,
  FileText,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getAttendance(id: string) {
  const attendance = await prisma.attendance.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          user: {
            select: {
              email: true,
              image: true,
              firstName: true,
              lastName: true,
            },
          },
          department: true,
          position: true,
        },
      },
      schedule: {
        include: {
          shift: true,
        },
      },
    },
  })

  return attendance
}

export default async function AttendanceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const attendance = await getAttendance(params.id)

  if (!attendance) {
    notFound()
  }

  // Funciones de formato
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  const formatTime = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date))
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  // Función para obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Presente
          </Badge>
        )
      case "LATE":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Tarde
          </Badge>
        )
      case "ABSENT":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Ausente
          </Badge>
        )
      case "HALF_DAY":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Timer className="h-3 w-3 mr-1" />
            Medio Día
          </Badge>
        )
      case "ON_LEAVE":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Calendar className="h-3 w-3 mr-1" />
            Con Permiso
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Función para obtener badge de método
  const getMethodBadge = (method: string | null) => {
    if (!method) return <Badge variant="outline">N/A</Badge>

    switch (method) {
      case "MANUAL":
        return <Badge variant="outline">Manual</Badge>
      case "AUTO":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Automático</Badge>
      case "BIOMETRIC":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Biométrico</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={attendance.employee.user?.image || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                {attendance.employee.user?.firstName?.[0] || "E"}
                {attendance.employee.user?.lastName?.[0] || "E"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Asistencia - {attendance.employee.user?.firstName || "Empleado"} {attendance.employee.user?.lastName || ""}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  {formatDate(attendance.date)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Link href={`/admin/attendance/${attendance.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Asistencia
          </Link>
        </Button>
      </div>

      {/* Badges de estado */}
      <div className="flex flex-wrap gap-3">
        {getStatusBadge(attendance.status)}
        {attendance.isAutoCheckout && (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Auto Check-out
          </Badge>
        )}
        {attendance.schedule && (
          <Badge variant="outline">
            <Briefcase className="h-3 w-3 mr-1" />
            Turno: {attendance.schedule.shift.name}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Información del Empleado */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre Completo
                </p>
                <p className="font-medium">
                  {attendance.employee.user?.firstName || "Empleado"} {attendance.employee.user?.lastName || ""}
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Código de Empleado
                </p>
                <p className="font-medium font-mono">
                  {attendance.employee.employeeCode}
                </p>
              </div>
            </div>

            {attendance.employee.department && (
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Departamento
                  </p>
                  <p className="font-medium">{attendance.employee.department.name}</p>
                </div>
              </div>
            )}

            {attendance.employee.position && (
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Posición
                  </p>
                  <p className="font-medium">{attendance.employee.position.title}</p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button variant="outline" asChild className="w-full">
                <Link href={`/admin/employees/${attendance.employee.id}`}>
                  Ver Perfil del Empleado
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Información de Entrada */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Información de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hora de Entrada
                </p>
                <p className="font-medium text-lg">
                  {attendance.checkInTime ? (
                    <span className="text-green-700">
                      {formatTime(attendance.checkInTime)}
                    </span>
                  ) : (
                    <span className="text-red-600">Sin registro</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Método de Registro
                </p>
                <div>{getMethodBadge(attendance.checkInMethod)}</div>
              </div>
            </div>

            {attendance.checkInLocation && (
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación de Entrada
                  </p>
                  <p className="font-medium text-sm">
                    {typeof attendance.checkInLocation === "object" &&
                    attendance.checkInLocation !== null &&
                    "lat" in attendance.checkInLocation &&
                    "lng" in attendance.checkInLocation
                      ? `${attendance.checkInLocation.lat}, ${attendance.checkInLocation.lng}`
                      : "No disponible"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between py-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha Completa
                </p>
                <p className="font-medium text-sm">
                  {formatDateTime(attendance.checkInTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Información de Salida */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Información de Salida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hora de Salida
                </p>
                <p className="font-medium text-lg">
                  {attendance.checkOutTime ? (
                    <span className="text-red-700">
                      {formatTime(attendance.checkOutTime)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sin registro</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Método de Registro
                </p>
                <div>{getMethodBadge(attendance.checkOutMethod)}</div>
              </div>
            </div>

            {attendance.checkOutLocation && (
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación de Salida
                  </p>
                  <p className="font-medium text-sm">
                    {typeof attendance.checkOutLocation === "object" &&
                    attendance.checkOutLocation !== null &&
                    "lat" in attendance.checkOutLocation &&
                    "lng" in attendance.checkOutLocation
                      ? `${attendance.checkOutLocation.lat}, ${attendance.checkOutLocation.lng}`
                      : "No disponible"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between py-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha Completa
                </p>
                <p className="font-medium text-sm">
                  {formatDateTime(attendance.checkOutTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Resumen de Horas */}
        <Card className="border-0 shadow-lg border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Timer className="h-5 w-5" />
              Resumen de Horas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Horas Trabajadas</p>
                <p className="font-bold text-2xl text-purple-700">
                  {attendance.workedHours.toString()} hrs
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Horas Extra</p>
                <p className="font-bold text-2xl text-orange-600">
                  {attendance.overtimeHours.toString()} hrs
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estado</p>
                <div>{getStatusBadge(attendance.status)}</div>
              </div>
            </div>

            {attendance.isAutoCheckout && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Esta salida se registró automáticamente
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 5: Información del Turno (si existe) */}
        {attendance.schedule && (
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Información del Turno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nombre del Turno</p>
                  <p className="font-medium">{attendance.schedule.shift.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium font-mono">
                    {attendance.schedule.shift.code}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  {attendance.schedule.shift.isFlexible ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Flexible
                    </Badge>
                  ) : (
                    <Badge variant="outline">Fijo</Badge>
                  )}
                </div>
              </div>

              {attendance.schedule.shift.gracePeriodMinutes > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Período de gracia: {attendance.schedule.shift.gracePeriodMinutes}{" "}
                    minutos
                  </p>
                </div>
              )}

              {attendance.schedule.notes && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">Notas del horario:</p>
                  <p className="text-sm">{attendance.schedule.notes}</p>
                </div>
              )}

              <Button variant="outline" asChild>
                <Link href={`/admin/work-shifts/${attendance.schedule.shift.id}`}>
                  Ver Detalles del Turno
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card 6: Notas Adicionales (si existen) */}
        {attendance.notes && (
          <Card className="border-0 shadow-lg lg:col-span-2 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <FileText className="h-5 w-5" />
                Notas Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{attendance.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
