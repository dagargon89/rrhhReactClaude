import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Settings,
  AlertTriangle,
  Calendar,
  Building2,
  Bell,
  Shield,
  Clock
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getConfig(id: string) {
  const config = await prisma.incidentConfig.findUnique({
    where: { id },
    include: {
      incidentType: true,
      department: true,
    },
  })

  return config
}

const INCIDENT_TYPE_NAMES: Record<string, string> = {
  TURNOVER: "Rotación",
  ABSENTEEISM: "Ausentismo",
  TARDINESS: "Impuntualidad",
  OVERTIME: "Horas Extra",
}

const PERIOD_TYPE_NAMES: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
}

const OPERATOR_NAMES: Record<string, string> = {
  GT: "Mayor que (>)",
  LT: "Menor que (<)",
  GTE: "Mayor o igual que (≥)",
  LTE: "Menor o igual que (≤)",
  EQ: "Igual a (=)",
}

export default async function ConfigDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const config = await getConfig(params.id)

  if (!config) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const typeName = INCIDENT_TYPE_NAMES[config.incidentType.name] || config.incidentType.name
  const periodName = PERIOD_TYPE_NAMES[config.periodType]
  const operatorName = OPERATOR_NAMES[config.thresholdOperator]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/incident-configs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {typeName}
              </h1>
              <p className="text-lg text-muted-foreground">
                Configuración de umbral • {periodName}
              </p>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          <Link href={`/admin/incident-configs/${config.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Configuración
          </Link>
        </Button>
      </div>

      {/* Badges de estado */}
      <div className="flex flex-wrap gap-3">
        {config.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Activa
          </Badge>
        ) : (
          <Badge variant="outline">
            Inactiva
          </Badge>
        )}

        {config.notificationEnabled ? (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <Bell className="h-3 w-3 mr-1" />
            Notificaciones Activas
          </Badge>
        ) : (
          <Badge variant="outline">
            Sin Notificaciones
          </Badge>
        )}

        <Badge variant="outline">
          <Calendar className="h-3 w-3 mr-1" />
          {periodName}
        </Badge>

        {config.department && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Building2 className="h-3 w-3 mr-1" />
            {config.department.name}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Tipo y Alcance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Tipo y Alcance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Tipo de Incidencia */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo de Incidencia</p>
                  <p className="font-medium">{typeName}</p>
                  <Badge variant="outline" className="text-xs">
                    {config.incidentType.code}
                  </Badge>
                </div>
              </div>

              {/* Departamento */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Alcance
                  </p>
                  {config.department ? (
                    <div>
                      <p className="font-medium">{config.department.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {config.department.code}
                      </Badge>
                    </div>
                  ) : (
                    <Badge>Global (Todos los departamentos)</Badge>
                  )}
                </div>
              </div>

              {/* Método de Cálculo */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Método de Cálculo</p>
                  <Badge variant="secondary">
                    {config.incidentType.calculationMethod}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Configuración del Umbral */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Configuración del Umbral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Operador */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Operador de Comparación</p>
                  <p className="font-medium">{operatorName}</p>
                </div>
              </div>

              {/* Valor del Umbral */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor del Umbral</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {parseFloat(config.thresholdValue.toString()).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Período */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Frecuencia de Evaluación
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {periodName}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Resumen de la regla */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-900 mb-2">Regla de Alerta:</p>
              <p className="text-sm text-orange-800">
                Se generará una alerta cuando el valor de <span className="font-bold">{typeName}</span>{" "}
                {operatorName.toLowerCase()}{" "}
                <span className="font-bold">{parseFloat(config.thresholdValue.toString()).toFixed(2)}</span>{" "}
                en el período <span className="font-bold">{periodName.toLowerCase()}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Notificaciones */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Estado de notificaciones */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {config.notificationEnabled ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Bell className="h-3 w-3 mr-1" />
                      Activas
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Desactivadas
                    </Badge>
                  )}
                </div>
              </div>

              {/* Emails de notificación */}
              {config.notificationEnabled && (
                <div className="py-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    Destinatarios ({config.notificationEmails.length})
                  </p>
                  {config.notificationEmails.length > 0 ? (
                    <div className="space-y-2">
                      {config.notificationEmails.map((email, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No hay emails configurados
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Información del Sistema */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Estado */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {config.isActive ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Activa
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Inactiva
                    </Badge>
                  )}
                </div>
              </div>

              {/* Fecha de creación */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">{formatDate(config.createdAt)}</p>
                </div>
              </div>

              {/* Última actualización */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="font-medium">{formatDate(config.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
