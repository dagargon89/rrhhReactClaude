"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface IncidentsTrendChartProps {
  data: any[]
}

const typeColors: Record<string, string> = {
  TURNOVER: "#9333ea",
  ABSENTEEISM: "#f97316",
  TARDINESS: "#eab308",
  OVERTIME: "#3b82f6",
}

export function IncidentsTrendChart({ data }: IncidentsTrendChartProps) {
  // Agrupar datos por mes y tipo
  const monthlyData: Record<string, any> = {}

  data.forEach(incident => {
    const date = parseISO(incident.date)
    const monthKey = format(date, "yyyy-MM")
    const monthLabel = format(date, "MMM yyyy", { locale: es })

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthLabel,
        monthKey,
        TURNOVER: 0,
        ABSENTEEISM: 0,
        TARDINESS: 0,
        OVERTIME: 0,
        count: {
          TURNOVER: 0,
          ABSENTEEISM: 0,
          TARDINESS: 0,
          OVERTIME: 0,
        },
      }
    }

    const typeName = incident.incidentType.name
    monthlyData[monthKey][typeName] += parseFloat(incident.value)
    monthlyData[monthKey].count[typeName] += 1
  })

  // Convertir a array y calcular promedios
  const chartData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.monthKey.localeCompare(b.monthKey))
    .map((month: any) => ({
      month: month.month,
      "Rotación": month.count.TURNOVER > 0 ? month.TURNOVER / month.count.TURNOVER : 0,
      "Ausentismo": month.count.ABSENTEEISM > 0 ? month.ABSENTEEISM / month.count.ABSENTEEISM : 0,
      "Impuntualidad": month.count.TARDINESS > 0 ? month.TARDINESS / month.count.TARDINESS : 0,
      "Horas Extra": month.count.OVERTIME > 0 ? month.OVERTIME / month.count.OVERTIME : 0,
    }))

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Tendencia de Incidencias (Últimos 6 Meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => value.toFixed(2)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Rotación"
              stroke={typeColors.TURNOVER}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Ausentismo"
              stroke={typeColors.ABSENTEEISM}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Impuntualidad"
              stroke={typeColors.TARDINESS}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Horas Extra"
              stroke={typeColors.OVERTIME}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Insights */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Insights del Período:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Total Puntos de Datos</p>
              <p className="font-bold text-lg">{data.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Meses Analizados</p>
              <p className="font-bold text-lg">{chartData.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipos de Incidencia</p>
              <p className="font-bold text-lg">4</p>
            </div>
            <div>
              <p className="text-muted-foreground">Promedio Mensual</p>
              <p className="font-bold text-lg">{chartData.length > 0 ? (data.length / chartData.length).toFixed(1) : 0}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
