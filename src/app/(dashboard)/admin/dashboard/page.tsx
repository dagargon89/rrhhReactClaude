import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, FileText, AlertTriangle, TrendingUp, UserCheck, Calendar, Activity } from "lucide-react"

async function getStats() {
  const [
    totalEmployees,
    activeEmployees,
    totalAttendancesToday,
    pendingLeaveRequests,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
  ])

  return {
    totalEmployees,
    activeEmployees,
    totalAttendancesToday,
    pendingLeaveRequests,
  }
}

export default async function AdminDashboard() {
  const session = await auth()
  const stats = await getStats()

  const attendanceRate = stats.totalEmployees > 0 ? (stats.totalAttendancesToday / stats.totalEmployees) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard Administrativo
        </h1>
        <p className="text-lg text-muted-foreground">
          Bienvenido de vuelta, <span className="font-semibold text-foreground">{session?.user?.name}</span>
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700">
              Total Empleados
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-blue-900">{stats.totalEmployees}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <UserCheck className="h-3 w-3 mr-1" />
                {stats.activeEmployees} activos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700">
              Asistencias Hoy
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-green-900">{stats.totalAttendancesToday}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-green-700">
                <span>Tasa de asistencia</span>
                <span>{attendanceRate.toFixed(1)}%</span>
              </div>
              <Progress value={attendanceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700">
              Vacaciones Pendientes
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-orange-900">{stats.pendingLeaveRequests}</div>
            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
              <Calendar className="h-3 w-3 mr-1" />
              Solicitudes por aprobar
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-red-700">
              Incidencias
            </CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-red-900">0</div>
            <Badge variant="outline" className="text-xs border-green-200 text-green-700">
              <Activity className="h-3 w-3 mr-1" />
              Sin alertas activas
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con contenido adicional */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Resumen de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Empleados activos</span>
                    <span className="font-semibold">{stats.activeEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Asistencias hoy</span>
                    <span className="font-semibold">{stats.totalAttendancesToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Solicitudes pendientes</span>
                    <span className="font-semibold">{stats.pendingLeaveRequests}</span>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    Sistema funcionando correctamente
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Base de datos</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Conectada
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Autenticación</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Activa
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sistema</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Operativo
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Gestión de Empleados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Próximamente: Lista de empleados recientes, estadísticas detalladas y acciones rápidas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Próximamente: Registro de actividades, logs del sistema y notificaciones en tiempo real.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
