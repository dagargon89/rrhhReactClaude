import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { DisciplinaryRecordsTable } from "./components/DisciplinaryRecordsTable"

// Función Server-Side para obtener actas disciplinarias
async function getDisciplinaryRecords() {
  const records = await prisma.employeeDisciplinaryRecord.findMany({
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
          department: {
            select: {
              name: true,
            },
          },
          position: {
            select: {
              title: true,
            },
          },
        },
      },
      rule: true,
      approvedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      appliedDate: "desc",
    },
  })

  return records
}

export default async function DisciplinaryRecordsPage() {
  const records = await getDisciplinaryRecords()

  // Cálculo de estadísticas
  const totalRecords = records.length
  const pendingRecords = records.filter(r => r.status === "PENDING").length
  const activeRecords = records.filter(r => r.status === "ACTIVE").length
  const completedRecords = records.filter(r => r.status === "COMPLETED").length
  const cancelledRecords = records.filter(r => r.status === "CANCELLED").length

  // Estadísticas por tipo
  const administrativeActs = records.filter(r => r.actionType === "ADMINISTRATIVE_ACT").length
  const suspensions = records.filter(r => r.actionType === "SUSPENSION").length
  const terminations = records.filter(r => r.actionType === "TERMINATION").length

  // Serialización de datos para componentes cliente
  const serializedRecords = records.map(record => ({
    ...record,
    appliedDate: record.appliedDate.toISOString(),
    effectiveDate: record.effectiveDate?.toISOString() || null,
    expirationDate: record.expirationDate?.toISOString() || null,
    approvedAt: record.approvedAt?.toISOString() || null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    employee: {
      ...record.employee,
      dateOfBirth: record.employee.dateOfBirth?.toISOString() || null,
      hireDate: record.employee.hireDate.toISOString(),
      createdAt: record.employee.createdAt.toISOString(),
      updatedAt: record.employee.updatedAt.toISOString(),
    },
    rule: record.rule ? {
      ...record.rule,
      createdAt: record.rule.createdAt.toISOString(),
      updatedAt: record.rule.updatedAt.toISOString(),
    } : null,
  }))

  return (
    <div className="space-y-8">
      {/* Header con título */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Actas y Registros Disciplinarios
            </h1>
            <p className="text-lg text-muted-foreground">
              Gestión de actas administrativas, suspensiones y sanciones
            </p>
          </div>
        </div>

        {/* Estadísticas por Estado */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Pendientes de Aprobación */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-yellow-700">
                Pendientes
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{pendingRecords}</div>
              <p className="text-xs text-yellow-700 mt-1">
                Requieren aprobación
              </p>
            </CardContent>
          </Card>

          {/* Card: Activas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Activas
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{activeRecords}</div>
              <p className="text-xs text-red-700 mt-1">
                En vigor actualmente
              </p>
            </CardContent>
          </Card>

          {/* Card: Completadas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Completadas
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{completedRecords}</div>
              <p className="text-xs text-green-700 mt-1">
                Cumplidas y cerradas
              </p>
            </CardContent>
          </Card>

          {/* Card: Canceladas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Canceladas
              </CardTitle>
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{cancelledRecords}</div>
              <p className="text-xs text-gray-700 mt-1">
                Rechazadas o anuladas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas por Tipo de Acción */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card: Actas Administrativas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Actas Administrativas
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{administrativeActs}</div>
              <p className="text-xs text-orange-700 mt-1">
                Por 5+ retardos formales
              </p>
            </CardContent>
          </Card>

          {/* Card: Suspensiones */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Suspensiones
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{suspensions}</div>
              <p className="text-xs text-purple-700 mt-1">
                Sin goce de sueldo
              </p>
            </CardContent>
          </Card>

          {/* Card: Rescisiones */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Rescisiones
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{terminations}</div>
              <p className="text-xs text-red-700 mt-1">
                Bajas por acumulación
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de registros con búsqueda y filtros */}
      <DisciplinaryRecordsTable records={serializedRecords} />
    </div>
  )
}
