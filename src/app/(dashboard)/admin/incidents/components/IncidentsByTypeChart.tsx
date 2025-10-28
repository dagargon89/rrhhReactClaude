"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface IncidentsByTypeChartProps {
  data: any[]
}

const typeColors: Record<string, string> = {
  TURNOVER: "#9333ea",
  ABSENTEEISM: "#f97316",
  TARDINESS: "#eab308",
  OVERTIME: "#3b82f6",
}

const typeNames: Record<string, string> = {
  TURNOVER: "Rotación",
  ABSENTEEISM: "Ausentismo",
  TARDINESS: "Impuntualidad",
  OVERTIME: "Horas Extra",
}

export function IncidentsByTypeChart({ data }: IncidentsByTypeChartProps) {
  // Transformar datos para Recharts
  const chartData = data.map(item => ({
    name: typeNames[item.type.name] || item.type.name,
    cantidad: item._count,
    promedio: parseFloat(item._avg.value || "0"),
    total: parseFloat(item._sum.value || "0"),
    color: typeColors[item.type.name] || "#6b7280",
  }))

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Incidencias por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "cantidad") return [value, "Cantidad"]
                if (name === "promedio") return [value.toFixed(2), "Promedio"]
                if (name === "total") return [value.toFixed(2), "Total"]
                return [value, name]
              }}
            />
            <Legend />
            <Bar dataKey="cantidad" fill="#8b5cf6" name="Cantidad" />
            <Bar dataKey="promedio" fill="#f97316" name="Promedio" />
          </BarChart>
        </ResponsiveContainer>

        {/* Leyenda de colores */}
        <div className="mt-4 flex flex-wrap gap-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
