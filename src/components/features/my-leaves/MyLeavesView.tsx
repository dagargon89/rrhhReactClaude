import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Palmtree,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { redirect } from "next/navigation"
import Link from "next/link"

async function getEmployeeLeaves(employeeId: string) {
  const currentYear = new Date().getFullYear()

  const [leaveRequests, leaveBalances] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        leaveType: {
          select: {
            name: true,
            code: true,
            description: true,
          },
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
      include: {
        leaveType: {
          select: {
            name: true,
            code: true,
            description: true,
            color: true,
          },
        },
      },
    }),
  ])

  // Calcular estadísticas
  const pending = leaveRequests.filter(r => r.status === 'PENDING').length
  const approved = leaveRequests.filter(r => r.status === 'APPROVED').length
  const rejected = leaveRequests.filter(r => r.status === 'REJECTED').length

  return {
    leaveRequests,
    leaveBalances,
    stats: {
      pending,
      approved,
      rejected,
      total: leaveRequests.length,
    },
  }
}

interface MyLeavesViewProps {
  newRequestPath?: string
}

export default async function MyLeavesView({ newRequestPath }: MyLeavesViewProps) {
  const session = await auth()

  if (!session?.user?.employeeId) {
    redirect('/login')
  }

  const { leaveRequests, leaveBalances, stats } = await getEmployeeLeaves(session.user.employeeId)

  // Determinar la ruta para nueva solicitud basada en el contexto
  const newLeaveRequestPath = newRequestPath || '/employee/leaves/new'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pendiente</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="border-green-500 text-green-700">Aprobada</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rechazada</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mis Vacaciones y Permisos</h1>
          <p className="text-muted-foreground">
            Gestiona tus solicitudes de vacaciones y permisos
          </p>
        </div>
        <Link href={newLeaveRequestPath}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </Link>
      </div>

      {/* Balance de Vacaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Balance de Días Disponibles</CardTitle>
          <CardDescription>
            Tu balance actual de días de vacaciones y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaveBalances.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leaveBalances.map((balance) => {
                const available = Number(balance.totalDays) - Number(balance.usedDays)
                const percentage = (available / Number(balance.totalDays)) * 100

                return (
                  <Card key={balance.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Palmtree className="h-5 w-5 text-primary" />
                            <p className="font-semibold">{balance.leaveType.code}</p>
                          </div>
                          <Badge variant="outline">{balance.year}</Badge>
                        </div>

                        <div className="text-center py-4">
                          <p className="text-4xl font-bold text-primary">
                            {available}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            de {Number(balance.totalDays)} días disponibles
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Usados:</span>
                            <span className="font-medium">{Number(balance.usedDays)} días</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palmtree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay balance de días configurado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Solicitudes totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">En revisión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Solicitudes aprobadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Solicitudes rechazadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
          <CardDescription>
            Todas tus solicitudes de vacaciones y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length > 0 ? (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <p className="font-medium">{request.leaveType.code}</p>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(request.startDate), "d MMM", { locale: es })} -{" "}
                          {format(new Date(request.endDate), "d MMM yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{Number(request.daysRequested)} días</span>
                      </div>
                    </div>

                    {request.reason && (
                      <p className="text-sm text-muted-foreground max-w-2xl">
                        {request.reason}
                      </p>
                    )}

                    {request.status === 'APPROVED' && request.approvedBy && (
                      <p className="text-xs text-muted-foreground">
                        Aprobado por: {request.approvedBy.firstName} {request.approvedBy.lastName}
                      </p>
                    )}

                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Motivo de rechazo:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 md:mt-0 text-sm text-muted-foreground">
                    <p>Solicitado el:</p>
                    <p className="font-medium">
                      {format(new Date(request.createdAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palmtree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No has realizado ninguna solicitud aún
              </p>
              <Link href={newLeaveRequestPath}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Solicitud
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
