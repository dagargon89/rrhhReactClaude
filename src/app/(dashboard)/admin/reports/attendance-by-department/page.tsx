"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { exportAttendanceReportToPDF } from "@/lib/exportToPDF"

interface DepartmentStats {
  departmentId: string
  departmentName: string
  totalEmployees: number
  totalDays: number
  present: number
  late: number
  absent: number
  halfDay: number
  onLeave: number
  punctualityRate: number
  attendanceRate: number
}

export default function AttendanceByDepartmentReport() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
  const [stats, setStats] = useState<DepartmentStats[]>([])
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

        // Agrupar por departamento
        const deptStats: { [key: string]: DepartmentStats } = {}
        const employeesByDept: { [key: string]: Set<string> } = {}

        data.forEach((attendance: any) => {
          const deptId = attendance.employee.department?.id || "no-department"
          const deptName = attendance.employee.department?.name || "Sin Departamento"
          const empId = attendance.employee.id

          if (!deptStats[deptId]) {
            deptStats[deptId] = {
              departmentId: deptId,
              departmentName: deptName,
              totalEmployees: 0,
              totalDays: 0,
              present: 0,
              late: 0,
              absent: 0,
              halfDay: 0,
              onLeave: 0,
              punctualityRate: 0,
              attendanceRate: 0,
            }
            employeesByDept[deptId] = new Set()
          }

          const stat = deptStats[deptId]
          employeesByDept[deptId].add(empId)
          stat.totalDays++

          switch (attendance.status) {
            case "PRESENT":
              stat.present++
              break
            case "LATE":
              stat.late++
              break
            case "ABSENT":
              stat.absent++
              break
            case "HALF_DAY":
              stat.halfDay++
              break
            case "ON_LEAVE":
              stat.onLeave++
              break
          }
        })

        // Calcular tasas y número de empleados
        Object.keys(deptStats).forEach(deptId => {
          const stat = deptStats[deptId]
          stat.totalEmployees = employeesByDept[deptId].size
          stat.punctualityRate = stat.totalDays > 0
            ? ((stat.present + stat.halfDay) / stat.totalDays) * 100
            : 0
          stat.attendanceRate = stat.totalDays > 0
            ? ((stat.present + stat.late + stat.halfDay) / stat.totalDays) * 100
            : 0
        })

        setStats(Object.values(deptStats).sort((a, b) => b.punctualityRate - a.punctualityRate))
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular totales generales
  const totalStats = stats.reduce(
    (acc, curr) => ({
      totalEmployees: acc.totalEmployees + curr.totalEmployees,
      totalDays: acc.totalDays + curr.totalDays,
      present: acc.present + curr.present,
      late: acc.late + curr.late,
      absent: acc.absent + curr.absent,
    }),
    { totalEmployees: 0, totalDays: 0, present: 0, late: 0, absent: 0 }
  )

  // Mejor departamento (mayor tasa de puntualidad)
  const bestDept = stats.length > 0 ? stats[0] : null

  // Departamento con más ausencias
  const worstDept = stats.length > 0
    ? stats.reduce((prev, curr) => (curr.absent > prev.absent ? curr : prev))
    : null

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Reporte de Asistencia por Departamento
          </h1>
          <p className="text-muted-foreground">
            Análisis comparativo por área organizacional
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportAttendanceReportToPDF(stats, { startDate, endDate }, "department")
          }
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
            <Calendar className="h-5 w-5 text-green-600" />
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
                  Departamentos
                </CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats.length}</div>
                <p className="text-xs text-blue-700 mt-1">Total analizados</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-700">
                  Total Empleados
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">
                  {totalStats.totalEmployees}
                </div>
                <p className="text-xs text-purple-700 mt-1">En todos los departamentos</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-700">
                  Mejor Departamento
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-900">
                  {bestDept?.departmentName || "N/A"}
                </div>
                <p className="text-xs text-green-700 mt-1">
                  {bestDept?.punctualityRate.toFixed(1)}% puntualidad
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-orange-700">
                  Más Ausencias
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-900">
                  {worstDept?.departmentName || "N/A"}
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  {worstDept?.absent} ausencias totales
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Barras con Recharts */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Comparación de Asistencia por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={stats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="departmentName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="present" fill="#10b981" name="Presentes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="#f59e0b" name="Tardanzas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" name="Ausentes" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabla Detallada */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Estadísticas Detalladas por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Departamento</th>
                      <th className="text-center p-3 font-semibold">Empleados</th>
                      <th className="text-center p-3 font-semibold">Total Días</th>
                      <th className="text-center p-3 font-semibold">Presente</th>
                      <th className="text-center p-3 font-semibold">Tarde</th>
                      <th className="text-center p-3 font-semibold">Ausente</th>
                      <th className="text-center p-3 font-semibold">Puntualidad</th>
                      <th className="text-center p-3 font-semibold">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <tr key={stat.departmentId} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{stat.departmentName}</span>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline">{stat.totalEmployees}</Badge>
                        </td>
                        <td className="text-center p-3">{stat.totalDays}</td>
                        <td className="text-center p-3">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {stat.present}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {stat.late}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            {stat.absent}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <div className={`font-semibold ${
                            stat.punctualityRate >= 95
                              ? "text-green-600"
                              : stat.punctualityRate >= 85
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}>
                            {stat.punctualityRate.toFixed(1)}%
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <div className="font-semibold text-blue-600">
                            {stat.attendanceRate.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {stats.length === 0 && !loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay datos para mostrar</h3>
            <p className="text-muted-foreground mb-4">
              Selecciona el período y genera el reporte para ver las estadísticas por departamento
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
