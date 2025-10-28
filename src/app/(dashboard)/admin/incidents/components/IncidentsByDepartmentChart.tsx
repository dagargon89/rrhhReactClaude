"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Building2 } from "lucide-react"

interface IncidentsByDepartmentChartProps {
  data: any[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#f97316", "#eab308", "#10b981", "#ef4444", "#06b6d4", "#f59e0b"]

export function IncidentsByDepartmentChart({ data }: IncidentsByDepartmentChartProps) {
  // Transformar datos para Recharts
  const chartData = data.map((item, index) => ({
    name: item.department?.name || "Sin departamento",
    value: item._count,
    promedio: parseFloat(item._avg.value || "0"),
    color: COLORS[index % COLORS.length],
  }))

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Incidencias por Departamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "value") return [value, "Cantidad"]
                return [value, name]
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Lista de departamentos */}
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.value} incidencias (Prom: {item.promedio.toFixed(2)})
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
