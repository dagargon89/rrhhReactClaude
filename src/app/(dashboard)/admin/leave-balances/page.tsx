import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, Users, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { LeaveBalancesTable } from "./components/LeaveBalancesTable"

async function getLeaveBalances() {
  const balances = await prisma.leaveBalance.findMany({
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
        },
      },
      leaveType: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return balances
}

async function getStats() {
  const currentYear = new Date().getFullYear()

  const [totalBalances, employeesWithBalance, avgUsageRate] = await Promise.all([
    prisma.leaveBalance.count({
      where: { year: currentYear },
    }),
    prisma.leaveBalance.groupBy({
      by: ["employeeId"],
      where: { year: currentYear },
    }).then((result) => result.length),
    prisma.leaveBalance.aggregate({
      where: { year: currentYear },
      _avg: {
        usedDays: true,
        totalDays: true,
      },
    }),
  ])

  const avgUsed = avgUsageRate._avg.usedDays || 0
  const avgTotal = avgUsageRate._avg.totalDays || 0
  const usagePercentage = avgTotal > 0 ? (Number(avgUsed) / Number(avgTotal)) * 100 : 0

  return {
    totalBalances,
    employeesWithBalance,
    usagePercentage,
    currentYear,
  }
}

export default async function LeaveBalancesPage() {
  const [balances, stats] = await Promise.all([getLeaveBalances(), getStats()])

  // Serializar datos para el componente cliente
  const serializedBalances = balances.map((balance) => ({
    ...balance,
    totalDays: Number(balance.totalDays),
    usedDays: Number(balance.usedDays),
    pendingDays: Number(balance.pendingDays),
    createdAt: balance.createdAt.toISOString(),
    updatedAt: balance.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Saldos de Permisos
            </h1>
            <p className="text-lg text-muted-foreground">
              Gestiona los saldos de vacaciones y permisos de los empleados
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Link href="/admin/leave-balances/new">
              <Plus className="mr-2 h-4 w-4" />
              Asignar Saldo
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total de Saldos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total de Saldos
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {stats.totalBalances}
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Saldos del año {stats.currentYear}
              </p>
            </CardContent>
          </Card>

          {/* Card: Empleados con Saldo */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Empleados con Saldo
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {stats.employeesWithBalance}
              </div>
              <p className="text-xs text-green-700 mt-1">
                Tienen al menos un saldo asignado
              </p>
            </CardContent>
          </Card>

          {/* Card: Promedio de Uso */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Promedio de Uso
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {stats.usagePercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-purple-700 mt-1">De días asignados</p>
            </CardContent>
          </Card>

          {/* Card: Año Actual */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Año Actual
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {stats.currentYear}
              </div>
              <p className="text-xs text-orange-700 mt-1">Período de saldos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de saldos con búsqueda y filtros */}
      <LeaveBalancesTable balances={serializedBalances} />
    </div>
  )
}
