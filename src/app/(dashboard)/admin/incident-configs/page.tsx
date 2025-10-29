import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Shield, Bell, Calendar } from "lucide-react"
import Link from "next/link"
import { IncidentConfigsTableEnhanced } from "./components/IncidentConfigsTableEnhanced"

// Función Server-Side para obtener configuraciones
async function getConfigs() {
  const configs = await prisma.incidentConfig.findMany({
    include: {
      incidentType: true,
      department: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return configs
}

export default async function IncidentConfigsPage() {
  const configs = await getConfigs()

  // Cálculo de estadísticas
  const totalConfigs = configs.length
  const activeConfigs = configs.filter(config => config.isActive).length
  const withNotifications = configs.filter(config => config.notificationEnabled).length
  const byPeriod = {
    daily: configs.filter(c => c.periodType === "DAILY").length,
    weekly: configs.filter(c => c.periodType === "WEEKLY").length,
    monthly: configs.filter(c => c.periodType === "MONTHLY").length,
    yearly: configs.filter(c => c.periodType === "YEARLY").length,
  }

  // Serialización de datos para componentes cliente
  const serializedConfigs = configs.map(config => ({
    ...config,
    thresholdValue: config.thresholdValue.toString(),
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Configuración de Umbrales
            </h1>
            <p className="text-lg text-muted-foreground">
              Gestiona umbrales y alertas automáticas para incidencias
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <Link href="/admin/incident-configs/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Configuración
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Configuraciones */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Total Configuraciones
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{totalConfigs}</div>
              <p className="text-xs text-purple-700 mt-1">
                Umbrales configurados
              </p>
            </CardContent>
          </Card>

          {/* Card: Configuraciones Activas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Activas
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{activeConfigs}</div>
              <p className="text-xs text-green-700 mt-1">
                {totalConfigs > 0 ? ((activeConfigs / totalConfigs) * 100).toFixed(1) : 0}% del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Con Notificaciones */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Con Notificaciones
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{withNotifications}</div>
              <p className="text-xs text-orange-700 mt-1">
                Alertas automáticas activas
              </p>
            </CardContent>
          </Card>

          {/* Card: Por Período */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Por Período
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Diarias:</span>
                  <Badge variant="outline" className="text-blue-900">{byPeriod.daily}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Mensuales:</span>
                  <Badge variant="outline" className="text-blue-900">{byPeriod.monthly}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de configuraciones */}
      <IncidentConfigsTableEnhanced configs={serializedConfigs} />
    </div>
  )
}
