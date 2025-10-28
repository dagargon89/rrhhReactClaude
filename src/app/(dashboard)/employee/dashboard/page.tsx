import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, FileText } from "lucide-react"
import { startOfMonth, endOfMonth } from "date-fns"

async function getEmployeeStats(employeeId: string) {
  const today = new Date()
  const startMonth = startOfMonth(today)
  const endMonth = endOfMonth(today)

  const [employee, attendanceThisMonth, leaveBalance, pendingLeaves] =
    await Promise.all([
      prisma.employee.findUnique({
        where: { id: employeeId },
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
      }),
      prisma.attendance.count({
        where: {
          employeeId,
          date: {
            gte: startMonth,
            lte: endMonth,
          },
        },
      }),
      prisma.leaveBalance.findMany({
        where: {
          employeeId,
          year: today.getFullYear(),
        },
        include: {
          leaveType: true,
        },
      }),
      prisma.leaveRequest.count({
        where: {
          employeeId,
          status: "PENDING",
        },
      }),
    ])

  return {
    employee,
    attendanceThisMonth,
    leaveBalance,
    pendingLeaves,
  }
}

export default async function EmployeeDashboard() {
  const session = await auth()

  if (!session?.user?.employeeId) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Error</h1>
        <p>No se encontró información del empleado.</p>
      </div>
    )
  }

  const stats = await getEmployeeStats(session.user.employeeId)

  const totalVacationDays =
    stats.leaveBalance
      .filter((lb) => lb.leaveType.name === "VACATION")
      .reduce((sum, lb) => sum + Number(lb.totalDays) - Number(lb.usedDays), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {session?.user?.name}
        </p>
      </div>

      {stats.employee && (
        <Card>
          <CardHeader>
            <CardTitle>Mi Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-medium">{stats.employee.employeeCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium">
                  {stats.employee.department?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posición</p>
                <p className="font-medium">
                  {stats.employee.position?.title || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium">
                  {stats.employee.status === "ACTIVE" ? "Activo" : stats.employee.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Asistencias Este Mes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceThisMonth}</div>
            <p className="text-xs text-muted-foreground">Días registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Días de Vacaciones
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVacationDays}</div>
            <p className="text-xs text-muted-foreground">Días disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solicitudes Pendientes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">En revisión</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Balance de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.leaveBalance.length > 0 ? (
            <div className="space-y-4">
              {stats.leaveBalance.map((balance) => (
                <div
                  key={balance.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{balance.leaveType.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {balance.leaveType.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {Number(balance.totalDays) - Number(balance.usedDays)}/{Number(balance.totalDays)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      días disponibles
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay balance de permisos configurado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
