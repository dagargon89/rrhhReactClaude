"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Clock,
  Users,
  TrendingUp,
  ArrowLeft,
  Download,
  Calendar,
  Timer,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { exportWorkedHoursReportToPDF } from "@/lib/exportToPDF"

interface WorkedHoursStats {
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  totalDays: number
  totalHours: number
  overtimeHours: number
  avgHoursPerDay: number
  expectedHours: number
  difference: number
  completionRate: number
}

export default function WorkedHoursReport() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
  const [stats, setStats] = useState<WorkedHoursStats[]>([])
  const [loading, setLoading] = useState(false)

  // Generar reporte
  const generateReport = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/attendance?startDate=${startDate}&endDate=${endDate}`
      )

      if (res.ok) {
        const data = await res.json()

        // Agrupar por empleado y calcular horas
        const employeeStats: { [key: string]: WorkedHoursStats } = {}

        data.forEach((attendance: any) => {
          const empId = attendance.employee.id
          if (!employeeStats[empId]) {
            employeeStats[empId] = {
              employeeId: empId,
              employeeName: `${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`,
              employeeCode: attendance.employee.employeeCode,
              department: attendance.employee.department?.name || "Sin Departamento",
              totalDays: 0,
              totalHours: 0,
              overtimeHours: 0,
              avgHoursPerDay: 0,
              expectedHours: 0,
              difference: 0,
              completionRate: 0,
            }
          }

          const stat = employeeStats[empId]
          if (attendance.checkInTime && attendance.status !== "ABSENT") {
            stat.totalDays++
            stat.totalHours += Number(attendance.workedHours) || 0
            stat.overtimeHours += Number(attendance.overtimeHours) || 0
          }
        })

        // Calcular promedios y diferencias (asumiendo 8 horas estándar)
        Object.values(employeeStats).forEach(stat => {
          stat.avgHoursPerDay = stat.totalDays > 0 ? stat.totalHours / stat.totalDays : 0
          stat.expectedHours = stat.totalDays * 8 // 8 horas esperadas por día
          stat.difference = stat.totalHours - stat.expectedHours
          stat.completionRate = stat.expectedHours > 0
            ? (stat.totalHours / stat.expectedHours) * 100
            : 0
        })

        setStats(
          Object.values(employeeStats).sort((a, b) => b.totalHours - a.totalHours)
        )
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular totales
  const totalHours = stats.reduce((acc, curr) => acc + curr.totalHours, 0)
  const totalOvertime = stats.reduce((acc, curr) => acc + curr.overtimeHours, 0)
  const avgCompletionRate = stats.length > 0
    ? stats.reduce((acc, curr) => acc + curr.completionRate, 0) / stats.length
    : 0
  const totalEmployees = stats.length

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Reporte de Horas Trabajadas
          </h1>
          <p className="text-muted-foreground">
            Análisis de horas regulares, extras y cumplimiento
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => exportWorkedHoursReportToPDF(stats, { startDate, endDate })}
          disabled={stats.length === 0}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
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
                  Total Horas
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">
                  {totalHours.toFixed(1)}h
                </div>
                <p className="text-xs text-blue-700 mt-1">Horas trabajadas</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-700">
                  Horas Extra
                </CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">
                  {totalOvertime.toFixed(1)}h
                </div>
                <p className="text-xs text-green-700 mt-1">Tiempo adicional</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-700">
                  Empleados
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{totalEmployees}</div>
                <p className="text-xs text-purple-700 mt-1">Con registro</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-orange-700">
                  Cumplimiento
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">
                  {avgCompletionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-orange-700 mt-1">Promedio general</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla Detallada */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-purple-600" />
                Estadísticas Detalladas por Empleado
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
                      <th className="text-center p-3 font-semibold">Días</th>
                      <th className="text-center p-3 font-semibold">Hrs Totales</th>
                      <th className="text-center p-3 font-semibold">Hrs Extra</th>
                      <th className="text-center p-3 font-semibold">Prom/Día</th>
                      <th className="text-center p-3 font-semibold">Esperadas</th>
                      <th className="text-center p-3 font-semibold">Diferencia</th>
                      <th className="text-center p-3 font-semibold">Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
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
                        <td className="text-center p-3">{stat.totalDays}</td>
                        <td className="text-center p-3 font-mono font-bold text-blue-600">
                          {stat.totalHours.toFixed(1)}h
                        </td>
                        <td className="text-center p-3 font-mono text-green-600">
                          {stat.overtimeHours.toFixed(1)}h
                        </td>
                        <td className="text-center p-3 font-mono">
                          {stat.avgHoursPerDay.toFixed(1)}h
                        </td>
                        <td className="text-center p-3 font-mono text-muted-foreground">
                          {stat.expectedHours.toFixed(1)}h
                        </td>
                        <td className="text-center p-3">
                          <span className={`font-mono font-semibold ${
                            stat.difference >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {stat.difference >= 0 ? "+" : ""}
                            {stat.difference.toFixed(1)}h
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <Badge className={`
                            ${stat.completionRate >= 100
                              ? "bg-green-100 text-green-700 border-green-200"
                              : stat.completionRate >= 90
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-red-100 text-red-700 border-red-200"}
                          `}>
                            {stat.completionRate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Horas por Empleado */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-purple-600" />
                Horas Trabajadas por Empleado (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={stats.slice(0, 10)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
                >
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOvertime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="employeeName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Area
                    type="monotone"
                    dataKey="totalHours"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorHours)"
                    name="Horas Totales"
                  />
                  <Area
                    type="monotone"
                    dataKey="overtimeHours"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorOvertime)"
                    name="Horas Extra"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Análisis de Cumplimiento con Gráfico de Pastel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Distribución de Cumplimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "100%+ Cumplimiento",
                          value: stats.filter((s) => s.completionRate >= 100).length,
                          fill: "#10b981",
                        },
                        {
                          name: "90-99% Cumplimiento",
                          value: stats.filter(
                            (s) => s.completionRate >= 90 && s.completionRate < 100
                          ).length,
                          fill: "#fbbf24",
                        },
                        {
                          name: "Menos del 90%",
                          value: stats.filter((s) => s.completionRate < 90).length,
                          fill: "#ef4444",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#fbbf24" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Análisis de Cumplimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.filter((s) => s.completionRate >= 100).length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cumplieron 100%+
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-3xl font-bold text-yellow-600">
                      {stats.filter((s) => s.completionRate >= 90 && s.completionRate < 100)
                        .length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      90-99% Cumplimiento
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-3xl font-bold text-red-600">
                      {stats.filter((s) => s.completionRate < 90).length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Menos del 90%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Empty State */}
      {stats.length === 0 && !loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay datos para mostrar</h3>
            <p className="text-muted-foreground mb-4">
              Selecciona el período y genera el reporte para ver las horas trabajadas
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
