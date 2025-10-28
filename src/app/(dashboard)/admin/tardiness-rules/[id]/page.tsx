import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Clock, AlertCircle, FileText, Calendar, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import Link from "next/link"

async function getTardinessRule(id: string) {
  const rule = await prisma.tardinessRule.findUnique({
    where: { id },
  })

  return rule
}

const TYPE_LABELS = {
  LATE_ARRIVAL: "Llegada Tardía (Acumulativa)",
  DIRECT_TARDINESS: "Retardo Directo",
}

const TYPE_COLORS = {
  LATE_ARRIVAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DIRECT_TARDINESS: "bg-red-100 text-red-700 border-red-200",
}

export default async function TardinessRuleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const rule = await getTardinessRule(params.id)

  if (!rule) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/tardiness-rules">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Detalle de Regla de Tardanzas
            </h1>
            <p className="text-lg text-muted-foreground">
              {rule.name}
            </p>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
          <Link href={`/admin/tardiness-rules/${rule.id}/edit`}>
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
              </div>
            </div>
            <div className="text-right">
              <Badge className={TYPE_COLORS[rule.type as keyof typeof TYPE_COLORS]}>
                {rule.type === "LATE_ARRIVAL" ? (
                  <Clock className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {TYPE_LABELS[rule.type as keyof typeof TYPE_LABELS]}
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
              <FileText className="h-5 w-5 text-orange-600" />
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
              <p className="text-sm text-muted-foreground">Tipo de Regla</p>
              <Badge className={TYPE_COLORS[rule.type as keyof typeof TYPE_COLORS]}>
                {rule.type === "LATE_ARRIVAL" ? (
                  <Clock className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {TYPE_LABELS[rule.type as keyof typeof TYPE_LABELS]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card: Rango de Minutos */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Rango de Minutos Tarde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Inicio</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-lg">
                  {rule.startMinutesLate}
                </Badge>
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fin</p>
              <div className="flex items-center gap-2">
                {rule.endMinutesLate !== null ? (
                  <>
                    <Badge variant="outline" className="font-mono text-lg">
                      {rule.endMinutesLate}
                    </Badge>
                    <span className="text-sm text-muted-foreground">minutos</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin límite (∞)</span>
                )}
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Rango completo:</p>
              <p className="text-lg font-mono font-bold text-orange-600">
                {rule.startMinutesLate} - {rule.endMinutesLate || "∞"} minutos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card: Acumulación y Conversión */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Acumulación y Conversión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Conteo de Acumulación</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-lg">
                  {rule.accumulationCount}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {rule.accumulationCount === 1 ? "vez" : "veces"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Retardos Formales Equivalentes</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-lg text-red-600">
                  {rule.equivalentFormalTardies}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {rule.equivalentFormalTardies === 1 ? "retardo" : "retardos"}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Fórmula:</p>
              <p className="text-sm text-blue-600">
                {rule.accumulationCount} {rule.accumulationCount === 1 ? "vez" : "veces"} → {" "}
                {rule.equivalentFormalTardies} {rule.equivalentFormalTardies === 1 ? "retardo formal" : "retardos formales"}
              </p>
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
      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Resumen de la Regla</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-900">
            {rule.type === "LATE_ARRIVAL" ? (
              <>
                Cuando un empleado llega entre <strong>{rule.startMinutesLate}</strong> y{" "}
                <strong>{rule.endMinutesLate || "∞"} minutos tarde</strong>, se acumula como llegada tardía.{" "}
                Al acumular <strong>{rule.accumulationCount}</strong>{" "}
                {rule.accumulationCount === 1 ? "llegada tardía" : "llegadas tardías"},{" "}
                se convierte en <strong>{rule.equivalentFormalTardies}</strong>{" "}
                {rule.equivalentFormalTardies === 1 ? "retardo formal" : "retardos formales"}.
              </>
            ) : (
              <>
                Cuando un empleado llega <strong>{rule.startMinutesLate}</strong> o más minutos tarde,{" "}
                se registra <strong>inmediatamente</strong> como{" "}
                <strong>{rule.equivalentFormalTardies}</strong>{" "}
                {rule.equivalentFormalTardies === 1 ? "retardo formal" : "retardos formales"}.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Cómo funciona esta regla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Aplicación de la regla:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                La regla se aplica automáticamente cuando un empleado hace check-in
              </li>
              <li>
                Los minutos tarde se calculan desde la hora programada del turno
              </li>
              <li>
                Las acumulaciones se resetean cada mes
              </li>
              <li>
                Los retardos formales se contabilizan en el período de 30 días
              </li>
              <li>
                Al alcanzar 5 retardos formales, se genera un acta administrativa automáticamente
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
