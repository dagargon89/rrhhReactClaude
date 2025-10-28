import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Shield, AlertTriangle, Calendar, Clock, FileText, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

async function getDisciplinaryRule(id: string) {
  const rule = await prisma.disciplinaryActionRule.findUnique({
    where: { id },
  })

  return rule
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

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  FORMAL_TARDIES: "Retardos Formales",
  ADMINISTRATIVE_ACTS: "Actas Administrativas",
  UNJUSTIFIED_ABSENCES: "Faltas Injustificadas",
  POLICY_VIOLATIONS: "Violaciones de Política",
  PERFORMANCE_ISSUES: "Problemas de Desempeño",
}

export default async function DisciplinaryRuleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const rule = await getDisciplinaryRule(params.id)

  if (!rule) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/disciplinary-rules">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Detalle de Regla Disciplinaria
            </h1>
            <p className="text-lg text-muted-foreground">
              {rule.name}
            </p>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Link href={`/admin/disciplinary-rules/${rule.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Regla
          </Link>
        </Button>
      </div>

      {/* Estado de la regla */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Estado de la regla</p>
              <div className="flex items-center gap-2">
                {rule.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactiva
                  </Badge>
                )}
                {rule.autoApply && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Auto-aplicable
                  </Badge>
                )}
                {rule.requiresApproval && (
                  <Badge variant="outline">
                    Requiere aprobación
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge className={ACTION_TYPE_COLORS[rule.actionType as keyof typeof ACTION_TYPE_COLORS]}>
                {ACTION_TYPE_LABELS[rule.actionType as keyof typeof ACTION_TYPE_LABELS]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Card: Información General */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{rule.name}</p>
            </div>
            {rule.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-sm">{rule.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Acción</p>
              <Badge className={ACTION_TYPE_COLORS[rule.actionType as keyof typeof ACTION_TYPE_COLORS]}>
                {ACTION_TYPE_LABELS[rule.actionType as keyof typeof ACTION_TYPE_LABELS]}
              </Badge>
            </div>
            {rule.suspensionDays !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Días de Suspensión</p>
                <p className="font-medium text-red-600">{rule.suspensionDays} días</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Disparador */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Configuración del Disparador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Disparador</p>
              <p className="font-medium">{TRIGGER_TYPE_LABELS[rule.triggerType] || rule.triggerType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conteo de Disparador</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-lg">
                  {rule.triggerCount}
                </Badge>
                <span className="text-sm text-muted-foreground">ocurrencias</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período de Evaluación</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{rule.periodDays} días</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Configuración de Aplicación */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Configuración de Aplicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Aplicación automática</span>
              {rule.autoApply ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sí
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="h-3 w-3 mr-1" />
                  No
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Requiere aprobación</span>
              {rule.requiresApproval ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sí
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="h-3 w-3 mr-1" />
                  No
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Afecta salario</span>
              {rule.affectsSalary ? (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sí
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="h-3 w-3 mr-1" />
                  No
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones habilitadas</span>
              {rule.notificationEnabled ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sí
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="h-3 w-3 mr-1" />
                  No
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card: Metadatos */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de creación</p>
              <p className="text-sm">
                {new Date(rule.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última actualización</p>
              <p className="text-sm">
                {new Date(rule.updatedAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID de la regla</p>
              <p className="text-xs font-mono text-muted-foreground">{rule.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen visual */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-purple-900">Resumen de la Regla</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-900">
            Cuando un empleado acumule <strong>{rule.triggerCount}</strong>{" "}
            <strong>{TRIGGER_TYPE_LABELS[rule.triggerType] || rule.triggerType}</strong>{" "}
            en un período de <strong>{rule.periodDays} días</strong>, se aplicará una acción de tipo{" "}
            <strong>{ACTION_TYPE_LABELS[rule.actionType as keyof typeof ACTION_TYPE_LABELS]}</strong>
            {rule.suspensionDays !== null ? (
              <> de <strong>{rule.suspensionDays} días</strong></>
            ) : null}
            {rule.autoApply ? (
              <> de forma <strong>automática</strong></>
            ) : rule.requiresApproval ? (
              <>, pero requerirá <strong>aprobación manual</strong></>
            ) : null}
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
