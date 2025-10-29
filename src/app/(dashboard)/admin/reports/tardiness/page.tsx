"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowLeft,
  Download,
  Calendar,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { exportTardinessReportToPDF } from "@/lib/exportToPDF"

interface TardinessRecord {
  id: string
  date: string
  checkInTime: string
  minutesLate: number
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
}

interface EmployeeTardinessStats {
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  totalTardinesses: number
  totalMinutesLate: number
  avgMinutesLate: number
  maxMinutesLate: number
  lastTardinessDate: string
}

export default function TardinessReport() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
  const [tardinesses, setTardinesses] = useState<TardinessRecord[]>([])
  const [stats, setStats] = useState<EmployeeTardinessStats[]>([])
  const [loading, setLoading] = useState(false)

  // Generar reporte
  const generateReport = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/reports/tardiness?startDate=${startDate}&endDate=${endDate}`
      )

      if (res.ok) {
        const data = await res.json()

        if (data.success) {
          // Extraer datos del nuevo formato de API
          const employeeStats = data.employeeStats.map((stat: any) => ({
            employeeId: stat.employeeId,
            employeeName: stat.employeeName,
            employeeCode: stat.employeeCode,
            department: stat.department,
            totalTardinesses: stat.totalTardinesses,
            totalMinutesLate: stat.totalMinutesLate,
            avgMinutesLate: stat.avgMinutesLate,
            maxMinutesLate: stat.maxMinutesLate,
            lastTardinessDate: stat.lastTardinessDate,
          }))

          setStats(employeeStats)

          // Construir array de tardanzas individuales para la vista
          const allTardinesses: TardinessRecord[] = []
          data.employeeStats.forEach((empStat: any) => {
            empStat.tardinesses.forEach((tardiness: any) => {
              allTardinesses.push({
                id: tardiness.id,
                date: tardiness.date,
                checkInTime: tardiness.checkInTime,
                minutesLate: tardiness.minutesLate,
                employee: {
                  id: empStat.employeeId,
                  employeeCode: empStat.employeeCode,
                  user: {
                    firstName: empStat.employeeName.split(' ')[0],
                    lastName: empStat.employeeName.split(' ').slice(1).join(' '),
                  },
                  department: {
                    name: empStat.department,
                  },
                },
              })
            })
          })

          setTardinesses(allTardinesses)
        }
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular totales
  const totalTardinesses = tardinesses.length
  const totalMinutesLate = stats.reduce((acc, curr) => acc + curr.totalMinutesLate, 0)
  const avgMinutesLate = totalTardinesses > 0 ? totalMinutesLate / totalTardinesses : 0
  const uniqueEmployees = stats.length

  // Top 5 empleados con más tardanzas
  const top5Tardy = stats.slice(0, 5)

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Reporte de Tardanzas
          </h1>
          <p className="text-muted-foreground">
            Análisis de llegadas tarde y patrones de puntualidad
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => exportTardinessReportToPDF(stats, { startDate, endDate })}
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
            <Calendar className="h-5 w-5 text-orange-600" />
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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-orange-700">
                  Total Tardanzas
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{totalTardinesses}</div>
                <p className="text-xs text-orange-700 mt-1">Llegadas tarde registradas</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-red-700">
                  Empleados Afectados
                </CardTitle>
                <Users className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900">{uniqueEmployees}</div>
                <p className="text-xs text-red-700 mt-1">Con al menos una tardanza</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-700">
                  Minutos Perdidos
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{totalMinutesLate}</div>
                <p className="text-xs text-purple-700 mt-1">Minutos acumulados</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-700">
                  Promedio
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">
                  {avgMinutesLate.toFixed(0)} min
                </div>
                <p className="text-xs text-blue-700 mt-1">Por tardanza</p>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 Empleados */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                Top 5 Empleados con Más Tardanzas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {top5Tardy.map((emp, index) => (
                  <div
                    key={emp.employeeId}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                        ${index === 0 ? "bg-red-500" : index === 1 ? "bg-orange-500" : "bg-yellow-500"}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{emp.employeeName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="font-mono">
                            {emp.employeeCode}
                          </Badge>
                          <span>{emp.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{emp.totalTardinesses}</p>
                      <p className="text-xs text-muted-foreground">tardanzas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabla Completa */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
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
                      <th className="text-center p-3 font-semibold">Total Tardanzas</th>
                      <th className="text-center p-3 font-semibold">Min. Totales</th>
                      <th className="text-center p-3 font-semibold">Promedio</th>
                      <th className="text-center p-3 font-semibold">Máximo</th>
                      <th className="text-center p-3 font-semibold">Última</th>
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
                        <td className="text-center p-3">
                          <Badge className={`
                            ${stat.totalTardinesses >= 10
                              ? "bg-red-100 text-red-700 border-red-200"
                              : stat.totalTardinesses >= 5
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"}
                          `}>
                            {stat.totalTardinesses}
                          </Badge>
                        </td>
                        <td className="text-center p-3 font-mono">
                          {stat.totalMinutesLate} min
                        </td>
                        <td className="text-center p-3 font-mono">
                          {stat.avgMinutesLate.toFixed(0)} min
                        </td>
                        <td className="text-center p-3 font-mono text-red-600">
                          {stat.maxMinutesLate} min
                        </td>
                        <td className="text-center p-3 text-xs">
                          {format(parseISO(stat.lastTardinessDate), "dd/MM/yyyy", { locale: es })}
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
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Excelente! No hay tardanzas</h3>
            <p className="text-muted-foreground mb-4">
              No se registraron llegadas tarde en el período seleccionado
            </p>
            <Button onClick={generateReport} disabled={loading}>
              Actualizar Reporte
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
