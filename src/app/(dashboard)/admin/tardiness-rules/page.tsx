import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock, AlertCircle, CheckCircle2, Activity } from "lucide-react"
import Link from "next/link"
import { TardinessRulesTableEnhanced } from "./components/TardinessRulesTableEnhanced"

// Función Server-Side para obtener reglas de tardanzas
async function getTardinessRules() {
  const rules = await prisma.tardinessRule.findMany({
    orderBy: {
      startMinutesLate: "asc",
    },
  })

  return rules
}

export default async function TardinessRulesPage() {
  const rules = await getTardinessRules()

  // Cálculo de estadísticas
  const totalRules = rules.length
  const activeRules = rules.filter(rule => rule.isActive).length
  const lateArrivalRules = rules.filter(rule => rule.type === "LATE_ARRIVAL").length
  const directTardinessRules = rules.filter(rule => rule.type === "DIRECT_TARDINESS").length

  // Serialización de datos para componentes cliente
  const serializedRules = rules.map(rule => ({
    ...rule,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Reglas de Tardanzas
            </h1>
            <p className="text-lg text-muted-foreground">
              Configura las reglas para el procesamiento automático de tardanzas
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
            <Link href="/admin/tardiness-rules/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Regla
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Reglas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Total Reglas
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{totalRules}</div>
              <p className="text-xs text-orange-700 mt-1">
                Reglas configuradas
              </p>
            </CardContent>
          </Card>

          {/* Card: Reglas Activas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Reglas Activas
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{activeRules}</div>
              <p className="text-xs text-green-700 mt-1">
                {totalRules > 0 ? `${((activeRules / totalRules) * 100).toFixed(0)}% del total` : "Sin reglas"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Llegadas Tardías Leves */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-yellow-700">
                Llegadas Tardías
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{lateArrivalRules}</div>
              <p className="text-xs text-yellow-700 mt-1">
                Reglas acumulativas
              </p>
            </CardContent>
          </Card>

          {/* Card: Retardos Directos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Retardos Directos
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{directTardinessRules}</div>
              <p className="text-xs text-red-700 mt-1">
                Retardo formal inmediato
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de reglas con búsqueda y filtros */}
      <TardinessRulesTableEnhanced rules={serializedRules} />
    </div>
  )
}
