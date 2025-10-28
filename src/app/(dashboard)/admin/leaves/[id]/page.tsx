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
  User,
  Building2,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

async function getLeaveRequest(id: string) {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
          department: true,
          position: true,
        },
      },
      leaveType: true,
      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  return leaveRequest
}

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const leaveRequest = await getLeaveRequest(params.id)

  if (!leaveRequest) {
    notFound()
  }

  // Función para obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprobada
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazada
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLeaveTypeName = (name: string) => {
    switch (name) {
      case "VACATION":
        return "Vacaciones"
      case "SICK_LEAVE":
        return "Incapacidad médica"
      case "PERSONAL":
        return "Personal"
      case "MATERNITY":
        return "Maternidad"
      case "PATERNITY":
        return "Paternidad"
      case "UNPAID":
        return "Sin goce de sueldo"
      default:
        return name
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/leaves">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={leaveRequest.employee.user?.image || ""} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xl">
                {leaveRequest.employee.user.firstName[0]}
                {leaveRequest.employee.user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Solicitud de Permiso
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  {leaveRequest.employee.user.firstName}{" "}
                  {leaveRequest.employee.user.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
        {leaveRequest.status === "PENDING" && (
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Link href={`/admin/leaves/${leaveRequest.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Solicitud
            </Link>
          </Button>
        )}
      </div>

      {/* Badges de estado */}
      <div className="flex flex-wrap gap-3">
        {getStatusBadge(leaveRequest.status)}
        <Badge
          style={{
            backgroundColor: `${leaveRequest.leaveType.color}20`,
            color: leaveRequest.leaveType.color,
            borderColor: `${leaveRequest.leaveType.color}40`,
          }}
        >
          <FileText className="h-3 w-3 mr-1" />
          {getLeaveTypeName(leaveRequest.leaveType.name)}
        </Badge>
        {leaveRequest.leaveType.isPaid && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Permiso Pagado
          </Badge>
        )}
        <Badge variant="outline">
          <Calendar className="h-3 w-3 mr-1" />
          {leaveRequest.totalDays.toString()} días
        </Badge>
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Información del Empleado */}
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
                  {leaveRequest.employee.user.firstName}{" "}
                  {leaveRequest.employee.user.lastName}
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
                  {leaveRequest.employee.employeeCode}
                </p>
              </div>
            </div>

            {leaveRequest.employee.department && (
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Departamento
                  </p>
                  <p className="font-medium">
                    {leaveRequest.employee.department.name}
                  </p>
                </div>
              </div>
            )}

            {leaveRequest.employee.position && (
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Posición
                  </p>
                  <p className="font-medium">
                    {leaveRequest.employee.position.title}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button variant="outline" asChild className="w-full">
                <Link href={`/admin/employees/${leaveRequest.employee.id}`}>
                  Ver Perfil del Empleado
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card: Detalles de la Solicitud */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Detalles de la Solicitud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Inicio
                </p>
                <p className="font-medium text-lg">
                  {format(leaveRequest.startDate, "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Fin
                </p>
                <p className="font-medium text-lg">
                  {format(leaveRequest.endDate, "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Días Solicitados
                </p>
                <p className="font-bold text-2xl text-purple-700">
                  {leaveRequest.totalDays.toString()} días
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Fecha de Solicitud
                </p>
                <p className="font-medium">
                  {format(
                    leaveRequest.requestedAt,
                    "dd 'de' MMMM 'de' yyyy, HH:mm",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Tipo de Permiso */}
        <Card className="border-0 shadow-lg border-l-4" style={{ borderLeftColor: leaveRequest.leaveType.color }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: leaveRequest.leaveType.color }}>
              <FileText className="h-5 w-5" />
              Tipo de Permiso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium text-lg">
                  {getLeaveTypeName(leaveRequest.leaveType.name)}
                </p>
              </div>

              {leaveRequest.leaveType.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-sm">{leaveRequest.leaveType.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">¿Es pagado?</p>
                  <p className="font-medium">
                    {leaveRequest.leaveType.isPaid ? "Sí" : "No"}
                  </p>
                </div>

                {leaveRequest.leaveType.maxDaysPerYear && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Máximo por año
                    </p>
                    <p className="font-medium">
                      {leaveRequest.leaveType.maxDaysPerYear} días
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Estado y Aprobación */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Estado y Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estado Actual</p>
                <div>{getStatusBadge(leaveRequest.status)}</div>
              </div>
            </div>

            {leaveRequest.approvedBy && (
              <>
                <div className="flex items-start justify-between py-3 border-b">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Aprobado/Rechazado por</p>
                    <p className="font-medium">
                      {leaveRequest.approvedBy.employee
                        ? `${leaveRequest.approvedBy.firstName} ${leaveRequest.approvedBy.lastName}`
                        : leaveRequest.approvedBy.email}
                    </p>
                  </div>
                </div>

                {leaveRequest.approvedAt && (
                  <div className="flex items-start justify-between py-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fecha de Aprobación/Rechazo</p>
                      <p className="font-medium">
                        {format(
                          leaveRequest.approvedAt,
                          "dd 'de' MMMM 'de' yyyy, HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {leaveRequest.status === "PENDING" && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Esta solicitud está pendiente de aprobación
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Motivo (full width) */}
        <Card className="border-0 shadow-lg lg:col-span-2 border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <FileText className="h-5 w-5" />
              Motivo de la Solicitud
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{leaveRequest.reason}</p>
          </CardContent>
        </Card>

        {/* Card: Motivo de Rechazo (si existe) */}
        {leaveRequest.rejectionReason && (
          <Card className="border-0 shadow-lg lg:col-span-2 border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Motivo de Rechazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {leaveRequest.rejectionReason}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
