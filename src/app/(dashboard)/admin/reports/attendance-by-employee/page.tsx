"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"

interface Employee {
  id: string
  employeeCode: string
  user: {
    firstName: string
    lastName: string
  }
}

interface AttendanceStats {
  employeeId: string
  employeeName: string
  employeeCode: string
  totalDays: number
  present: number
  late: number
  absent: number
  halfDay: number
  onLeave: number
  totalHours: number
  avgHours: number
  punctualityRate: number
}

export default function AttendanceByEmployeeReport() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
  const [stats, setStats] = useState<AttendanceStats[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar empleados
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch("/api/employees")
        if (res.ok) {
          const data = await res.json()
          setEmployees(data.employees || [])
        }
      } catch (error) {
        console.error("Error loading employees:", error)
      }
    }
    loadEmployees()
  }, [])

  // Generar reporte
  const generateReport = async () => {
    setLoading(true)
    try {
      // Simular carga de datos - en producción esto vendría del API
      const res = await fetch(
        `/api/attendance?startDate=${startDate}&endDate=${endDate}${
          selectedEmployee !== "all" ? `&employeeId=${selectedEmployee}` : ""
        }`
      )

      if (res.ok) {
        const data = await res.json()

        // Agrupar por empleado y calcular estadísticas
        const employeeStats: { [key: string]: AttendanceStats } = {}

        data.forEach((attendance: any) => {
          const empId = attendance.employee.id
          if (!employeeStats[empId]) {
            employeeStats[empId] = {
              employeeId: empId,
              employeeName: `${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`,
              employeeCode: attendance.employee.employeeCode,
              totalDays: 0,
              present: 0,
              late: 0,
              absent: 0,
              halfDay: 0,
              onLeave: 0,
              totalHours: 0,
              avgHours: 0,
              punctualityRate: 0,
            }
          }

          const stat = employeeStats[empId]
          stat.totalDays++
          stat.totalHours += Number(attendance.workedHours) || 0

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

        // Calcular promedios y tasas
        Object.values(employeeStats).forEach(stat => {
          stat.avgHours = stat.totalDays > 0 ? stat.totalHours / stat.totalDays : 0
          stat.punctualityRate = stat.totalDays > 0
            ? ((stat.present + stat.halfDay) / stat.totalDays) * 100
            : 0
        })

        setStats(Object.values(employeeStats))
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
      totalDays: acc.totalDays + curr.totalDays,
      present: acc.present + curr.present,
      late: acc.late + curr.late,
      absent: acc.absent + curr.absent,
      totalHours: acc.totalHours + curr.totalHours,
    }),
    { totalDays: 0, present: 0, late: 0, absent: 0, totalHours: 0 }
  )

  const avgPunctualityRate = stats.length > 0
    ? stats.reduce((acc, curr) => acc + curr.punctualityRate, 0) / stats.length
    : 0

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Reporte de Asistencia por Empleado
          </h1>
          <p className="text-muted-foreground">
            Análisis detallado de asistencia individual
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Filtros del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Empleado</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.user.firstName} {emp.user.lastName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-700">
                  Presentes
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{totalStats.present}</div>
                <p className="text-xs text-green-700 mt-1">
                  {totalStats.totalDays > 0
                    ? ((totalStats.present / totalStats.totalDays) * 100).toFixed(1)
                    : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-orange-700">
                  Tardanzas
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{totalStats.late}</div>
                <p className="text-xs text-orange-700 mt-1">
                  {totalStats.totalDays > 0
                    ? ((totalStats.late / totalStats.totalDays) * 100).toFixed(1)
                    : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-red-700">
                  Ausencias
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900">{totalStats.absent}</div>
                <p className="text-xs text-red-700 mt-1">
                  {totalStats.totalDays > 0
                    ? ((totalStats.absent / totalStats.totalDays) * 100).toFixed(1)
                    : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-700">
                  Tasa Puntualidad
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">
                  {avgPunctualityRate.toFixed(1)}%
                </div>
                <p className="text-xs text-blue-700 mt-1">Promedio general</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Empleados */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Estadísticas por Empleado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Empleado</th>
                      <th className="text-left p-3 font-semibold">Código</th>
                      <th className="text-center p-3 font-semibold">Total Días</th>
                      <th className="text-center p-3 font-semibold">Presente</th>
                      <th className="text-center p-3 font-semibold">Tarde</th>
                      <th className="text-center p-3 font-semibold">Ausente</th>
                      <th className="text-center p-3 font-semibold">Total Hrs</th>
                      <th className="text-center p-3 font-semibold">Prom Hrs</th>
                      <th className="text-center p-3 font-semibold">Puntualidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <tr key={stat.employeeId} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="font-medium">{stat.employeeName}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono">
                            {stat.employeeCode}
                          </Badge>
                        </td>
                        <td className="text-center p-3">{stat.totalDays}</td>
                        <td className="text-center p-3">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {stat.present}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                            {stat.late}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            {stat.absent}
                          </Badge>
                        </td>
                        <td className="text-center p-3 font-mono">
                          {stat.totalHours.toFixed(1)}h
                        </td>
                        <td className="text-center p-3 font-mono">
                          {stat.avgHours.toFixed(1)}h
                        </td>
                        <td className="text-center p-3">
                          <div className="flex items-center justify-center gap-1">
                            {stat.punctualityRate >= 95 && (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            )}
                            {stat.punctualityRate < 95 && stat.punctualityRate >= 85 && (
                              <Minus className="h-4 w-4 text-orange-600" />
                            )}
                            {stat.punctualityRate < 85 && (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-semibold">
                              {stat.punctualityRate.toFixed(1)}%
                            </span>
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
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay datos para mostrar</h3>
            <p className="text-muted-foreground mb-4">
              Selecciona los filtros y genera el reporte para ver las estadísticas
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
