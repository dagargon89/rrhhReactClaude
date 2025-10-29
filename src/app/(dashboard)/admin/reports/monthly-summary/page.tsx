"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Building2,
  Palmtree,
  XCircle,
  Timer,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"

interface MonthlySummary {
  period: {
    month: string
    year: number
  }
  attendance: {
    totalRecords: number
    present: number
    late: number
    absent: number
    punctualityRate: number
    attendanceRate: number
  }
  hours: {
    totalHours: number
    overtimeHours: number
    avgHoursPerDay: number
  }
  leaves: {
    totalRequests: number
    approved: number
    pending: number
    rejected: number
    daysUsed: number
  }
  tardiness: {
    total: number
    affectedEmployees: number
    totalMinutes: number
    avgMinutes: number
  }
  employees: {
    total: number
    active: number
    inactive: number
  }
  departments: {
    best: { name: string; rate: number }
    worst: { name: string; rate: number }
  }
}

export default function MonthlySummaryReport() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(false)

  // Generar reporte
  const generateReport = async () => {
    setLoading(true)
    try {
      const [year, month] = selectedMonth.split("-")
      const startDate = format(
        startOfMonth(new Date(parseInt(year), parseInt(month) - 1)),
        "yyyy-MM-dd"
      )
      const endDate = format(
        endOfMonth(new Date(parseInt(year), parseInt(month) - 1)),
        "yyyy-MM-dd"
      )

      // En producción, esto vendría de un endpoint consolidado
      const [attendanceRes, employeesRes] = await Promise.all([
        fetch(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}&type=general`),
        fetch("/api/employees"),
      ])

      if (attendanceRes.ok && employeesRes.ok) {
        const attendanceData = await attendanceRes.json()
        const employeesData = await employeesRes.json()

        // Construir resumen (simulado)
        const mockSummary: MonthlySummary = {
          period: {
            month: format(new Date(parseInt(year), parseInt(month) - 1), "MMMM", { locale: es }),
            year: parseInt(year),
          },
          attendance: {
            totalRecords: attendanceData.data.totalRecords || 0,
            present: attendanceData.data.present || 0,
            late: attendanceData.data.late || 0,
            absent: attendanceData.data.absent || 0,
            punctualityRate:
              attendanceData.data.totalRecords > 0
                ? ((attendanceData.data.present / attendanceData.data.totalRecords) * 100).toFixed(
                    1
                  )
                : 0,
            attendanceRate:
              attendanceData.data.totalRecords > 0
                ? (((attendanceData.data.present + attendanceData.data.late) /
                    attendanceData.data.totalRecords) *
                    100).toFixed(1)
                : 0,
          },
          hours: {
            totalHours: attendanceData.data.totalHours || 0,
            overtimeHours: attendanceData.data.overtimeHours || 0,
            avgHoursPerDay:
              attendanceData.data.totalRecords > 0
                ? (attendanceData.data.totalHours / attendanceData.data.totalRecords).toFixed(1)
                : 0,
          },
          leaves: {
            totalRequests: 12,
            approved: 10,
            pending: 2,
            rejected: 0,
            daysUsed: 45,
          },
          tardiness: {
            total: attendanceData.data.late || 0,
            affectedEmployees: Math.floor((attendanceData.data.late || 0) / 2),
            totalMinutes: (attendanceData.data.late || 0) * 15,
            avgMinutes: 15,
          },
          employees: {
            total: employeesData.pagination?.total || 0,
            active:
              employeesData.employees?.filter((e: any) => e.status === "ACTIVE").length || 0,
            inactive:
              employeesData.employees?.filter((e: any) => e.status !== "ACTIVE").length || 0,
          },
          departments: {
            best: { name: "Tecnología", rate: 98.5 },
            worst: { name: "Producción", rate: 87.2 },
          },
        }

        setSummary(mockSummary)
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Resumen Mensual Consolidado
          </h1>
          <p className="text-muted-foreground">Todas las métricas clave del mes en un solo lugar</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Selector de Mes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Seleccionar Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Mes y Año</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? "Generando..." : "Generar Resumen"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {summary && (
        <>
          {/* Header del período */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-indigo-900 mb-2">
                  {summary.period.month} {summary.period.year}
                </h2>
                <p className="text-muted-foreground">Resumen Ejecutivo del Mes</p>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Asistencia */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Asistencia
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Total Registros</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary.attendance.totalRecords}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Presentes</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {summary.attendance.present}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.attendance.punctualityRate}% puntualidad
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Tardanzas</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{summary.attendance.late}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Ausencias</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{summary.attendance.absent}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Métricas de Horas */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Horas Trabajadas
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Total Horas</CardTitle>
                  <Timer className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {summary.hours.totalHours.toFixed(0)}h
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Horas Extra</CardTitle>
                  <Zap className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {summary.hours.overtimeHours.toFixed(0)}h
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Promedio/Día</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {summary.hours.avgHoursPerDay}h
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Métricas de Vacaciones */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Palmtree className="h-5 w-5 text-teal-600" />
              Vacaciones y Permisos
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Solicitudes</CardTitle>
                  <Palmtree className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary.leaves.totalRequests}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Aprobadas</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{summary.leaves.approved}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{summary.leaves.pending}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">Días Usados</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{summary.leaves.daysUsed}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Comparativa de Departamentos */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Desempeño por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <h4 className="font-semibold text-green-900">Mejor Departamento</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {summary.departments.best.name}
                  </p>
                  <p className="text-sm text-green-700">
                    {summary.departments.best.rate}% de puntualidad
                  </p>
                </div>

                <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingDown className="h-6 w-6 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">Requiere Atención</h4>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 mb-1">
                    {summary.departments.worst.name}
                  </p>
                  <p className="text-sm text-orange-700">
                    {summary.departments.worst.rate}% de puntualidad
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de Empleados */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Estado del Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {summary.employees.total}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Empleados</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {summary.employees.active}
                  </div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-bold text-gray-600 mb-2">
                    {summary.employees.inactive}
                  </div>
                  <p className="text-sm text-muted-foreground">Inactivos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!summary && !loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Selecciona un mes</h3>
            <p className="text-muted-foreground mb-4">
              Elige el mes y genera el resumen consolidado con todas las métricas
            </p>
            <Button onClick={generateReport} disabled={loading}>
              Generar Resumen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
