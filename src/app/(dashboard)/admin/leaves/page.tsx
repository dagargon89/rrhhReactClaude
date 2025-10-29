import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { LeaveRequestsTableEnhanced } from "./components/LeaveRequestsTableEnhanced"

async function getLeaveRequests() {
  const leaveRequests = await prisma.leaveRequest.findMany({
    include: {
      employee: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          department: true,
          position: true,
        },
      },
      leaveType: true,
      approvedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      requestedAt: "desc",
    },
    take: 100,
  })

  return leaveRequests
}

export default async function LeavesPage() {
  const leaveRequests = await getLeaveRequests()

  // Calcular estadísticas
  const totalRequests = leaveRequests.length
  const pendingRequests = leaveRequests.filter((req) => req.status === "PENDING")
    .length
  const approvedRequests = leaveRequests.filter(
    (req) => req.status === "APPROVED"
  ).length
  const rejectedRequests = leaveRequests.filter(
    (req) => req.status === "REJECTED"
  ).length

  // Serializar datos para componentes cliente
  const serializedRequests = leaveRequests.map((request) => ({
    ...request,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
    requestedAt: request.requestedAt.toISOString(),
    approvedAt: request.approvedAt?.toISOString() || null,
    totalDays: request.totalDays.toString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botones de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestión de Vacaciones y Permisos
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra solicitudes, tipos y saldos de permisos
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/leave-types">
                <FileText className="mr-2 h-4 w-4" />
                Tipos de Permisos
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/leave-balances">
                <Calendar className="mr-2 h-4 w-4" />
                Saldos
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/admin/leaves/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Solicitud
              </Link>
            </Button>
          </div>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Solicitudes */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Solicitudes
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {totalRequests}
              </div>
              <p className="text-xs text-blue-700 mt-1">
                En los últimos meses
              </p>
            </CardContent>
          </Card>

          {/* Card: Pendientes */}
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
              <div className="text-3xl font-bold text-yellow-900">
                {pendingRequests}
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Esperando aprobación
              </p>
            </CardContent>
          </Card>

          {/* Card: Aprobadas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Aprobadas
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {approvedRequests}
              </div>
              <p className="text-xs text-green-700 mt-1">
                {totalRequests > 0
                  ? ((approvedRequests / totalRequests) * 100).toFixed(1)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Rechazadas */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700">
                Rechazadas
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                {rejectedRequests}
              </div>
              <p className="text-xs text-red-700 mt-1">
                {totalRequests > 0
                  ? ((rejectedRequests / totalRequests) * 100).toFixed(1)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de solicitudes con búsqueda y filtros */}
      <LeaveRequestsTableEnhanced leaveRequests={serializedRequests} />
    </div>
  )
}
