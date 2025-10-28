import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Wallet,
  User,
  Calendar,
  FileText,
  TrendingDown,
  Clock,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getLeaveBalance(id: string) {
  const balance = await prisma.leaveBalance.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          department: true,
          position: true,
        },
      },
      leaveType: true,
    },
  })

  return balance
}

export default async function LeaveBalanceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const balance = await getLeaveBalance(params.id)

  if (!balance) {
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

  const totalDays = Number(balance.totalDays)
  const usedDays = Number(balance.usedDays)
  const pendingDays = Number(balance.pendingDays)
  const availableDays = totalDays - usedDays - pendingDays
  const usagePercentage = totalDays > 0 ? (usedDays / totalDays) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/leave-balances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Saldo de Permiso
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {balance.employee.user.firstName} {balance.employee.user.lastName} -{" "}
            {getLeaveTypeName(balance.leaveType.name)} {balance.year}
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Link href={`/admin/leave-balances/${balance.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Saldo
          </Link>
        </Button>
      </div>

      {/* Badges de información */}
      <div className="flex flex-wrap gap-3">
        {/* Año */}
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Calendar className="h-3 w-3 mr-1" />
          Año {balance.year}
        </Badge>

        {/* Tipo de permiso */}
        <Badge
          variant="outline"
          style={{
            borderColor: balance.leaveType.color,
            color: balance.leaveType.color,
          }}
        >
          {getLeaveTypeName(balance.leaveType.name)}
        </Badge>

        {/* Estado del saldo */}
        {availableDays > 0 ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {availableDays} días disponibles
          </Badge>
        ) : availableDays === 0 ? (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Sin días disponibles
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <TrendingDown className="h-3 w-3 mr-1" />
            Sobregiro ({Math.abs(availableDays)} días)
          </Badge>
        )}
      </div>

      <Separator />

      {/* Grid de visualización de saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Total de Días */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-700">Total Asignado</p>
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-blue-900">{totalDays}</p>
            <p className="text-xs text-blue-700 mt-1">Días totales</p>
          </CardContent>
        </Card>

        {/* Card: Días Usados */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-red-700">Días Usados</p>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-4xl font-bold text-red-900">{usedDays}</p>
            <p className="text-xs text-red-700 mt-1">
              {usagePercentage.toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        {/* Card: Días Pendientes */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-700">Pendientes</p>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-4xl font-bold text-yellow-900">{pendingDays}</p>
            <p className="text-xs text-yellow-700 mt-1">En solicitudes pendientes</p>
          </CardContent>
        </Card>

        {/* Card: Días Disponibles */}
        <Card
          className={`border-0 shadow-lg ${
            availableDays > 0
              ? "bg-gradient-to-br from-green-50 to-green-100/50"
              : "bg-gradient-to-br from-gray-50 to-gray-100/50"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p
                className={`text-sm font-medium ${
                  availableDays > 0 ? "text-green-700" : "text-gray-700"
                }`}
              >
                Disponibles
              </p>
              <CheckCircle2
                className={`h-5 w-5 ${
                  availableDays > 0 ? "text-green-600" : "text-gray-600"
                }`}
              />
            </div>
            <p
              className={`text-4xl font-bold ${
                availableDays > 0 ? "text-green-900" : "text-gray-900"
              }`}
            >
              {availableDays}
            </p>
            <p
              className={`text-xs mt-1 ${
                availableDays > 0 ? "text-green-700" : "text-gray-700"
              }`}
            >
              Para nuevas solicitudes
            </p>
          </CardContent>
        </Card>
      </div>

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
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Nombre */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">
                    {balance.employee.user.firstName}{" "}
                    {balance.employee.user.lastName}
                  </p>
                </div>
              </div>

              {/* Código */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Código de Empleado</p>
                  <p className="font-medium font-mono">
                    {balance.employee.employeeCode}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                  <p className="font-medium">{balance.employee.user.email}</p>
                </div>
              </div>

              {/* Departamento */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Departamento</p>
                  <p className="font-medium">
                    {balance.employee.department?.name || "Sin asignar"}
                  </p>
                </div>
              </div>

              {/* Posición */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Posición</p>
                  <p className="font-medium">
                    {balance.employee.position?.title || "Sin asignar"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Información del Tipo de Permiso */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Información del Tipo de Permiso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Tipo */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p
                    className="font-medium"
                    style={{ color: balance.leaveType.color }}
                  >
                    {getLeaveTypeName(balance.leaveType.name)}
                  </p>
                </div>
              </div>

              {/* Código */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium font-mono">{balance.leaveType.code}</p>
                </div>
              </div>

              {/* Es pagado */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">¿Es pagado?</p>
                  <p className="font-medium">
                    {balance.leaveType.isPaid ? (
                      <span className="text-green-600">
                        Sí - Con goce de sueldo
                      </span>
                    ) : (
                      <span className="text-red-600">No - Sin goce de sueldo</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Máximo anual */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Máximo anual del tipo
                  </p>
                  <p className="font-medium">
                    {balance.leaveType.maxDaysPerYear
                      ? `${balance.leaveType.maxDaysPerYear} días`
                      : "Ilimitado"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón para ver empleado */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ver información del empleado</h3>
              <p className="text-sm text-muted-foreground">
                Accede a todos los detalles del empleado
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/admin/employees/${balance.employee.id}`}>
                Ver Empleado
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
