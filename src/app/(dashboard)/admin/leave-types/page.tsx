import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

async function getLeaveTypes() {
  const leaveTypes = await prisma.leaveType.findMany({
    include: {
      _count: {
        select: {
          leaveRequests: true,
          leaveBalances: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return leaveTypes
}

export default async function LeaveTypesPage() {
  const leaveTypes = await getLeaveTypes()

  const totalTypes = leaveTypes.length
  const activeTypes = leaveTypes.filter((type) => type.isActive).length
  const paidTypes = leaveTypes.filter((type) => type.isPaid).length

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tipos de Permisos
            </h1>
            <p className="text-lg text-muted-foreground">
              Configura los tipos de permisos disponibles en el sistema
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/leaves">Volver a Solicitudes</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Link href="/admin/leave-types/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Tipo
              </Link>
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total de Tipos
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {totalTypes}
              </div>
              <p className="text-xs text-blue-700 mt-1">Tipos configurados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Tipos Activos
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {activeTypes}
              </div>
              <p className="text-xs text-green-700 mt-1">Disponibles para uso</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Tipos Pagados
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {paidTypes}
              </div>
              <p className="text-xs text-purple-700 mt-1">Con goce de sueldo</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grid de Cards de Tipos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {leaveTypes.map((type) => (
          <Card
            key={type.id}
            className="border-0 shadow-lg border-l-4 hover:shadow-xl transition-shadow"
            style={{ borderLeftColor: type.color }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle
                    className="text-xl mb-2"
                    style={{ color: type.color }}
                  >
                    {getLeaveTypeName(type.name)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {type.description || "Sin descripción"}
                  </p>
                </div>
                {type.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactivo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Código</p>
                  <p className="font-medium font-mono">{type.code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">¿Es pagado?</p>
                  <p className="font-medium">
                    {type.isPaid ? (
                      <span className="text-green-600">Sí</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </p>
                </div>
                {type.maxDaysPerYear && (
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Máximo anual
                    </p>
                    <p className="font-medium">{type.maxDaysPerYear} días</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">
                    Requiere aprobación
                  </p>
                  <p className="font-medium">
                    {type.requiresApproval ? "Sí" : "No"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  <div>
                    <p>Solicitudes:</p>
                    <p className="font-semibold text-foreground">
                      {type._count.leaveRequests}
                    </p>
                  </div>
                  <div>
                    <p>Saldos:</p>
                    <p className="font-semibold text-foreground">
                      {type._count.leaveBalances}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/admin/leave-types/${type.id}`}>Ver</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link href={`/admin/leave-types/${type.id}/edit`}>
                      Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaveTypes.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay tipos de permisos configurados
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Comienza creando el primer tipo de permiso para tu organización
            </p>
            <Button asChild>
              <Link href="/admin/leave-types/new">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Tipo
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
