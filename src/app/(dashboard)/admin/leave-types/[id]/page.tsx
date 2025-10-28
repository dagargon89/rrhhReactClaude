import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  FileText,
  CheckCircle2,
  XCircle,
  DollarSign,
  Shield,
  Palette,
  Calendar,
  Users,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getLeaveType(id: string) {
  const leaveType = await prisma.leaveType.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          leaveRequests: true,
          leaveBalances: true,
        },
      },
      leaveRequests: {
        select: {
          status: true,
        },
      },
    },
  })

  return leaveType
}

export default async function LeaveTypeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const leaveType = await getLeaveType(params.id)

  if (!leaveType) {
    notFound()
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

  // Calcular estadísticas de solicitudes
  const pendingRequests = leaveType.leaveRequests.filter((r) => r.status === "PENDING").length
  const approvedRequests = leaveType.leaveRequests.filter((r) => r.status === "APPROVED").length
  const rejectedRequests = leaveType.leaveRequests.filter((r) => r.status === "REJECTED").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/leave-types">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-lg border-4 border-white shadow-lg"
              style={{ backgroundColor: leaveType.color }}
            />
            <div>
              <h1
                className="text-4xl font-bold"
                style={{ color: leaveType.color }}
              >
                {getLeaveTypeName(leaveType.name)}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Código: <span className="font-mono font-semibold">{leaveType.code}</span>
              </p>
            </div>
          </div>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Link href={`/admin/leave-types/${leaveType.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Tipo
          </Link>
        </Button>
      </div>

      {/* Badges de estado */}
      <div className="flex flex-wrap gap-3">
        {/* Estado activo */}
        {leaveType.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Inactivo
          </Badge>
        )}

        {/* Es pagado */}
        {leaveType.isPaid ? (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <DollarSign className="h-3 w-3 mr-1" />
            Con goce de sueldo
          </Badge>
        ) : (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Sin goce de sueldo
          </Badge>
        )}

        {/* Requiere aprobación */}
        {leaveType.requiresApproval && (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Shield className="h-3 w-3 mr-1" />
            Requiere aprobación
          </Badge>
        )}

        {/* Días máximos */}
        {leaveType.maxDaysPerYear && (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <Calendar className="h-3 w-3 mr-1" />
            Máx. {leaveType.maxDaysPerYear} días/año
          </Badge>
        )}
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Información General */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Tipo */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo de Permiso</p>
                  <p className="font-medium">{getLeaveTypeName(leaveType.name)}</p>
                </div>
              </div>

              {/* Código */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium font-mono">{leaveType.code}</p>
                </div>
              </div>

              {/* Descripción */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">
                    {leaveType.description || "Sin descripción"}
                  </p>
                </div>
              </div>

              {/* Color */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded border-2 border-white shadow"
                      style={{ backgroundColor: leaveType.color }}
                    />
                    <p className="font-medium font-mono">{leaveType.color}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Configuración */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Es pagado */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    ¿Es pagado?
                  </p>
                  <p className="font-medium">
                    {leaveType.isPaid ? (
                      <span className="text-green-600">Sí - Con goce de sueldo</span>
                    ) : (
                      <span className="text-red-600">No - Sin goce de sueldo</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Requiere aprobación */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    ¿Requiere aprobación?
                  </p>
                  <p className="font-medium">
                    {leaveType.requiresApproval ? "Sí" : "No"}
                  </p>
                </div>
              </div>

              {/* Días máximos por año */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Días máximos por año
                  </p>
                  <p className="font-medium">
                    {leaveType.maxDaysPerYear
                      ? `${leaveType.maxDaysPerYear} días`
                      : "Ilimitado"}
                  </p>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">
                    {leaveType.isActive ? (
                      <span className="text-green-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen de configuración */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Resumen</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {leaveType.isPaid && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Los empleados reciben salario durante este permiso
                  </li>
                )}
                {leaveType.requiresApproval && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Las solicitudes deben ser aprobadas
                  </li>
                )}
                {leaveType.maxDaysPerYear && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    Limitado a {leaveType.maxDaysPerYear} días por año
                  </li>
                )}
                {leaveType.isActive && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Disponible para nuevas solicitudes
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Estadísticas de Uso */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Estadísticas de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total de solicitudes */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-700">
                    Total de Solicitudes
                  </p>
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {leaveType._count.leaveRequests}
                </p>
              </div>

              {/* Pendientes */}
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-yellow-700">Pendientes</p>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-900">
                  {pendingRequests}
                </p>
              </div>

              {/* Aprobadas */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-700">Aprobadas</p>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {approvedRequests}
                </p>
              </div>

              {/* Rechazadas */}
              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-red-700">Rechazadas</p>
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-900">
                  {rejectedRequests}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Saldos activos */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Saldos Activos
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {leaveType._count.leaveBalances}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Empleados con saldo asignado para este tipo de permiso
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón para ver solicitudes */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ver todas las solicitudes</h3>
              <p className="text-sm text-muted-foreground">
                Revisa todas las solicitudes de este tipo de permiso
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/leaves">
                Ver Solicitudes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
