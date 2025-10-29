"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Palmtree,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  days: number
  status: string
  reason: string | null
  employee: {
    id: string
    employeeCode: string
    user: {
      firstName: string
      lastName: string
    }
    department?: {
      name: string
    }
  }
  leaveType: {
    name: string
    color: string
  }
}

interface EmployeeLeaveStats {
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  totalRequests: number
  approved: number
  pending: number
  rejected: number
  totalDaysUsed: number
  availableDays: number
}

export default function LeavesReport() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [stats, setStats] = useState<EmployeeLeaveStats[]>([])
  const [loading, setLoading] = useState(false)

  // Generar reporte
  const generateReport = async () => {
    setLoading(true)
    try {
      // En producción, esto vendría de un endpoint API específico
      const res = await fetch(`/api/leaves?startDate=${startDate}&endDate=${endDate}`)

      if (res.ok) {
        const data = await res.json()
        setRequests(data)

        // Agrupar por empleado
        const employeeStats: any = {}

        data.forEach((leave: LeaveRequest) => {
          const empId = leave.employee.id
          if (!employeeStats[empId]) {
            employeeStats[empId] = {
              employeeId: empId,
              employeeName: `${leave.employee.user.firstName} ${leave.employee.user.lastName}`,
              employeeCode: leave.employee.employeeCode,
              department: leave.employee.department?.name || "Sin Departamento",
              totalRequests: 0,
              approved: 0,
              pending: 0,
              rejected: 0,
              totalDaysUsed: 0,
              availableDays: 15, // Default - debería venir de la BD
            }
          }

          const stat = employeeStats[empId]
          stat.totalRequests++

          switch (leave.status) {
            case "APPROVED":
              stat.approved++
              stat.totalDaysUsed += leave.days
              break
            case "PENDING":
              stat.pending++
              break
            case "REJECTED":
              stat.rejected++
              break
          }
        })

        setStats(Object.values(employeeStats))
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular totales
  const totalRequests = requests.length
  const totalApproved = requests.filter((r) => r.status === "APPROVED").length
  const totalPending = requests.filter((r) => r.status === "PENDING").length
  const totalDaysUsed = stats.reduce((acc, curr) => acc + curr.totalDaysUsed, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Reporte de Vacaciones y Permisos
          </h1>
          <p className="text-muted-foreground">
            Estado de solicitudes y balance de días disponibles
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            Período del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? "Generando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen General */}
      {stats.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-700">
                  Total Solicitudes
                </CardTitle>
                <Palmtree className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{totalRequests}</div>
                <p className="text-xs text-blue-700 mt-1">En el período</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-700">
                  Aprobadas
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{totalApproved}</div>
                <p className="text-xs text-green-700 mt-1">
                  {totalRequests > 0 ? ((totalApproved / totalRequests) * 100).toFixed(1) : 0}%
                  del total
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-orange-700">
                  Pendientes
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{totalPending}</div>
                <p className="text-xs text-orange-700 mt-1">Requieren revisión</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-700">
                  Días Utilizados
                </CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{totalDaysUsed}</div>
                <p className="text-xs text-purple-700 mt-1">Días de vacaciones</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Estadísticas por Empleado */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Balance de Vacaciones por Empleado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Empleado</th>
                      <th className="text-left p-3 font-semibold">Código</th>
                      <th className="text-left p-3 font-semibold">Departamento</th>
                      <th className="text-center p-3 font-semibold">Solicitudes</th>
                      <th className="text-center p-3 font-semibold">Aprobadas</th>
                      <th className="text-center p-3 font-semibold">Pendientes</th>
                      <th className="text-center p-3 font-semibold">Días Usados</th>
                      <th className="text-center p-3 font-semibold">Disponibles</th>
                      <th className="text-center p-3 font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => {
                      const remaining = stat.availableDays - stat.totalDaysUsed
                      const usagePercentage = (stat.totalDaysUsed / stat.availableDays) * 100

                      return (
                        <tr key={stat.employeeId} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <span className="font-medium">{stat.employeeName}</span>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="font-mono">
                              {stat.employeeCode}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {stat.department}
                          </td>
                          <td className="text-center p-3">{stat.totalRequests}</td>
                          <td className="text-center p-3">
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              {stat.approved}
                            </Badge>
                          </td>
                          <td className="text-center p-3">
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              {stat.pending}
                            </Badge>
                          </td>
                          <td className="text-center p-3 font-mono">{stat.totalDaysUsed}</td>
                          <td className="text-center p-3 font-mono">{stat.availableDays}</td>
                          <td className="text-center p-3">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`font-bold ${
                                  remaining < 3
                                    ? "text-red-600"
                                    : remaining < 7
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {remaining} días
                              </span>
                              <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                                <div
                                  className={`h-2 rounded-full ${
                                    usagePercentage >= 90
                                      ? "bg-red-500"
                                      : usagePercentage >= 70
                                      ? "bg-orange-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Solicitudes Recientes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palmtree className="h-5 w-5 text-teal-600" />
                Solicitudes del Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requests.slice(0, 10).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <p className="font-semibold">
                          {request.employee.user.firstName} {request.employee.user.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline" className="font-mono">
                            {request.employee.employeeCode}
                          </Badge>
                          <span>{request.employee.department?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Período</p>
                        <p className="text-sm font-medium">
                          {format(parseISO(request.startDate), "dd/MM", { locale: es })} -{" "}
                          {format(parseISO(request.endDate), "dd/MM", { locale: es })}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Días</p>
                        <p className="text-2xl font-bold text-blue-600">{request.days}</p>
                      </div>

                      <Badge
                        className={
                          request.status === "APPROVED"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : request.status === "PENDING"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {request.status === "APPROVED"
                          ? "Aprobada"
                          : request.status === "PENDING"
                          ? "Pendiente"
                          : "Rechazada"}
                      </Badge>
                    </div>
                  </div>
                ))}

                {requests.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    Mostrando 10 de {requests.length} solicitudes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {stats.length === 0 && !loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <Palmtree className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay solicitudes para mostrar</h3>
            <p className="text-muted-foreground mb-4">
              Selecciona el período y genera el reporte para ver las solicitudes de vacaciones
            </p>
            <Button onClick={generateReport} disabled={loading}>
              Generar Reporte
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
