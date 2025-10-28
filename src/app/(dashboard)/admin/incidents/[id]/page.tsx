import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  AlertTriangle,
  Calendar,
  TrendingUp,
  User,
  Building2,
  FileText,
  Hash,
  Activity,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

async function getIncident(id: string) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      incidentType: true,
      employee: {
        include: {
          department: true,
          position: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      department: {
        include: {
          manager: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return incident
}

// Mapeo de tipos de incidencia
const incidentTypeInfo: Record<string, { label: string; icon: any; color: string }> = {
  TURNOVER: {
    label: "Rotaci\u00f3n",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  ABSENTEEISM: {
    label: "Ausentismo",
    icon: TrendingDown,
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
  TARDINESS: {
    label: "Impuntualidad",
    icon: Activity,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  OVERTIME: {
    label: "Horas Extra",
    icon: Activity,
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
}

export default async function IncidentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const incident = await getIncident(params.id)

  if (!incident) {
    notFound()
  }

  const typeInfo = incidentTypeInfo[incident.incidentType.name]
  const TypeIcon = typeInfo?.icon || AlertTriangle

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/incidents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TypeIcon className="h-8 w-8 text-red-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Detalle de Incidencia
              </h1>
              <p className="text-lg text-muted-foreground">
                {typeInfo?.label || incident.incidentType.name} - {format(new Date(incident.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
          <Link href={`/admin/incidents/${incident.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Incidencia
          </Link>
        </Button>
      </div>

      {/* Badges de informaci\u00f3n r\u00e1pida */}
      <div className="flex flex-wrap gap-3">
        <Badge className={typeInfo?.color || "bg-gray-100 text-gray-700"}>
          <TypeIcon className="h-3 w-3 mr-1" />
          {typeInfo?.label || incident.incidentType.name}
        </Badge>

        {incident.employeeId ? (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <User className="h-3 w-3 mr-1" />
            Alcance: Empleado
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Building2 className="h-3 w-3 mr-1" />
            Alcance: Departamento
          </Badge>
        )}

        <Badge variant="outline">
          <Hash className="h-3 w-3 mr-1" />
          Valor: {parseFloat(incident.value.toString()).toFixed(2)}
        </Badge>
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Informaci\u00f3n del Tipo de Incidencia */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Tipo de Incidencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Nombre */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{typeInfo?.label || incident.incidentType.name}</p>
                </div>
              </div>

              {/* C\u00f3digo */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">C\u00f3digo</p>
                  <p className="font-medium font-mono">{incident.incidentType.code}</p>
                </div>
              </div>

              {/* M\u00e9todo de C\u00e1lculo */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">M\u00e9todo de C\u00e1lculo</p>
                  <Badge variant="outline">{incident.incidentType.calculationMethod}</Badge>
                </div>
              </div>

              {/* Descripci\u00f3n */}
              {incident.incidentType.description && (
                <div className="flex items-start justify-between py-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Descripci\u00f3n</p>
                    <p className="font-medium text-sm">{incident.incidentType.description}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Detalles de la Incidencia */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Detalles de la Incidencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Fecha */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha
                  </p>
                  <p className="font-medium">
                    {format(new Date(incident.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(incident.date), "EEEE", { locale: es })}
                  </p>
                </div>
              </div>

              {/* Valor */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Valor
                  </p>
                  <p className="font-bold text-2xl text-red-700">
                    {parseFloat(incident.value.toString()).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Fecha de Registro */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                  <p className="font-medium text-sm">
                    {format(new Date(incident.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Informaci\u00f3n del Empleado (si aplica) */}
        {incident.employee && (
          <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informaci\u00f3n del Empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Nombre Completo */}
                <div className="flex items-start justify-between py-3 border-b">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nombre Completo</p>
                    <p className="font-medium">
                      {incident.employee.firstName} {incident.employee.lastName}
                    </p>
                  </div>
                </div>

                {/* C\u00f3digo de Empleado */}
                <div className="flex items-start justify-between py-3 border-b">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">C\u00f3digo de Empleado</p>
                    <p className="font-medium font-mono">{incident.employee.employeeCode}</p>
                  </div>
                </div>

                {/* Departamento */}
                {incident.employee.department && (
                  <div className="flex items-start justify-between py-3 border-b">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Departamento</p>
                      <p className="font-medium">{incident.employee.department.name}</p>
                    </div>
                  </div>
                )}

                {/* Posici\u00f3n */}
                {incident.employee.position && (
                  <div className="flex items-start justify-between py-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Posici\u00f3n</p>
                      <p className="font-medium">{incident.employee.position.title}</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Bot\u00f3n ver empleado */}
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/admin/employees/${incident.employee.id}`}>
                    Ver Detalles del Empleado
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 4: Informaci\u00f3n del Departamento (si aplica) */}
        {incident.department && !incident.employee && (
          <Card className="border-0 shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Informaci\u00f3n del Departamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Nombre */}
                <div className="flex items-start justify-between py-3 border-b">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{incident.department.name}</p>
                  </div>
                </div>

                {/* C\u00f3digo */}
                <div className="flex items-start justify-between py-3 border-b">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">C\u00f3digo</p>
                    <p className="font-medium font-mono">{incident.department.code}</p>
                  </div>
                </div>

                {/* Manager */}
                {incident.department.manager && (
                  <div className="flex items-start justify-between py-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Manager</p>
                      <p className="font-medium">
                        {incident.department.manager.user.firstName} {incident.department.manager.user.lastName}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Bot\u00f3n ver departamento */}
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/admin/departments/${incident.department.id}`}>
                    Ver Detalles del Departamento
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 5: Notas (si existen) */}
        {incident.notes && (
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Notas Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{incident.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 6: Metadata (si existe) */}
        {incident.metadata && Object.keys(incident.metadata as any).length > 0 && (
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-purple-600" />
                Metadatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(incident.metadata, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
