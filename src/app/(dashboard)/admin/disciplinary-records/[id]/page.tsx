import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Calendar, Clock, FileText, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

async function getDisciplinaryRecord(id: string) {
  const record = await prisma.employeeDisciplinaryRecord.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          user: true,
          department: true,
          position: true,
        },
      },
      rule: true,
      approvedBy: true,
    },
  })

  return record
}

const ACTION_TYPE_LABELS = {
  WARNING: "Advertencia",
  WRITTEN_WARNING: "Advertencia Escrita",
  ADMINISTRATIVE_ACT: "Acta Administrativa",
  SUSPENSION: "Suspensión",
  TERMINATION: "Terminación",
}

const ACTION_TYPE_COLORS = {
  WARNING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  WRITTEN_WARNING: "bg-orange-100 text-orange-700 border-orange-200",
  ADMINISTRATIVE_ACT: "bg-red-100 text-red-700 border-red-200",
  SUSPENSION: "bg-purple-100 text-purple-700 border-purple-200",
  TERMINATION: "bg-gray-100 text-gray-700 border-gray-200",
}

const STATUS_LABELS = {
  PENDING: "Pendiente",
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ACTIVE: "bg-red-100 text-red-700 border-red-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
}

export default async function DisciplinaryRecordDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const record = await getDisciplinaryRecord(params.id)

  if (!record) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/disciplinary-records">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Acta Disciplinaria
            </h1>
            <p className="text-lg text-muted-foreground">
              {record.employee.user.firstName} {record.employee.user.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS]}>
            {STATUS_LABELS[record.status as keyof typeof STATUS_LABELS]}
          </Badge>
          <Badge className={ACTION_TYPE_COLORS[record.actionType as keyof typeof ACTION_TYPE_COLORS]}>
            {ACTION_TYPE_LABELS[record.actionType as keyof typeof ACTION_TYPE_LABELS]}
          </Badge>
        </div>
      </div>

      {/* Alerta para estados especiales */}
      {record.status === "PENDING" && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800 font-medium">
              Esta acta está pendiente de aprobación. Revisa los detalles y aprueba o rechaza según corresponda.
            </p>
          </div>
        </div>
      )}

      {record.status === "CANCELLED" && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-600" />
            <p className="text-sm text-gray-800">
              Esta acta fue <strong>cancelada/rechazada</strong> y no se aplicó ninguna sanción.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Card: Información del Empleado */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Código</p>
              <p className="font-mono font-medium">{record.employee.employeeCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">
                {record.employee.user.firstName} {record.employee.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{record.employee.user.email}</p>
            </div>
            {record.employee.department && (
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="text-sm">{record.employee.department.name}</p>
              </div>
            )}
            {record.employee.position && (
              <div>
                <p className="text-sm text-muted-foreground">Posición</p>
                <p className="text-sm">{record.employee.position.title}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Detalles del Acta */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Detalles del Acta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Acción</p>
              <Badge className={ACTION_TYPE_COLORS[record.actionType as keyof typeof ACTION_TYPE_COLORS]}>
                {ACTION_TYPE_LABELS[record.actionType as keyof typeof ACTION_TYPE_LABELS]}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge className={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS]}>
                {STATUS_LABELS[record.status as keyof typeof STATUS_LABELS]}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disparador</p>
              <p className="text-sm">{record.triggerType}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Conteo: {record.triggerCount}
              </p>
            </div>
            {record.suspensionDays !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Días de Suspensión</p>
                <p className="font-medium text-red-600">{record.suspensionDays} días</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Fechas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Fechas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Aplicación</p>
              <p className="text-sm">
                {new Date(record.appliedDate).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {record.effectiveDate && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha Efectiva</p>
                <p className="text-sm">
                  {new Date(record.effectiveDate).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {record.expirationDate && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Expiración</p>
                <p className="text-sm">
                  {new Date(record.expirationDate).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {record.approvedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Aprobación</p>
                <p className="text-sm">
                  {new Date(record.approvedAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Aprobación */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Información de Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.approvedBy ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Aprobado por</p>
                  <p className="font-medium">
                    {record.approvedBy.firstName} {record.approvedBy.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Acta aprobada</span>
                </div>
              </>
            ) : record.status === "PENDING" ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600 font-medium">Pendiente de aprobación</span>
              </div>
            ) : record.status === "CANCELLED" ? (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">Acta cancelada</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Card: Descripción Completa */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{record.description}</p>
        </CardContent>
      </Card>

      {/* Card: Notas */}
      {record.notes && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Card: Regla Aplicada */}
      {record.rule && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-purple-900">Regla Disciplinaria Aplicada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium text-purple-900">{record.rule.name}</p>
              {record.rule.description && (
                <p className="text-sm text-purple-800">{record.rule.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-purple-800 mt-4">
                <span>Disparador: <strong>{record.rule.triggerCount} {record.rule.triggerType}</strong></span>
                <span>Período: <strong>{record.rule.periodDays} días</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
