import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Shield, AlertTriangle, Ban, FileWarning, Activity } from "lucide-react"
import Link from "next/link"
import { DisciplinaryRulesTable } from "./components/DisciplinaryRulesTable"

// Función Server-Side para obtener reglas disciplinarias
async function getDisciplinaryRules() {
  const rules = await prisma.disciplinaryActionRule.findMany({
    orderBy: {
      triggerCount: "asc",
    },
  })

  return rules
}

export default async function DisciplinaryRulesPage() {
  const rules = await getDisciplinaryRules()

  // Cálculo de estadísticas
  const totalRules = rules.length
  const activeRules = rules.filter(rule => rule.isActive).length
  const autoApplyRules = rules.filter(rule => rule.autoApply).length
  const suspensionRules = rules.filter(rule => rule.actionType === "SUSPENSION").length

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Reglas Disciplinarias
            </h1>
            <p className="text-lg text-muted-foreground">
              Configura acciones disciplinarias automáticas basadas en acumulaciones
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/admin/disciplinary-rules/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Regla
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Reglas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Total Reglas
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{totalRules}</div>
              <p className="text-xs text-purple-700 mt-1">
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
                <Shield className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{activeRules}</div>
              <p className="text-xs text-green-700 mt-1">
                {totalRules > 0 ? `${((activeRules / totalRules) * 100).toFixed(0)}% del total` : "Sin reglas"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Auto-aplicables */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Auto-aplicables
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{autoApplyRules}</div>
              <p className="text-xs text-blue-700 mt-1">
                Aplicación automática
              </p>
            </CardContent>
          </Card>

          {/* Card: Suspensiones */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Suspensiones
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{suspensionRules}</div>
              <p className="text-xs text-red-700 mt-1">
                Reglas de suspensión
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de reglas con búsqueda y filtros */}
      <DisciplinaryRulesTable rules={serializedRules} />
    </div>
  )
}
