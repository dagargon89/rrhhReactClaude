import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Clock,
  Users,
  Building2,
  AlertCircle,
  Calendar,
  TrendingUp,
  FileText,
  Download,
  Timer,
  Palmtree,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"

interface ReportCard {
  id: string
  title: string
  description: string
  icon: any
  href: string
  color: string
  bgColor: string
  stats?: string
}

const reportCards: ReportCard[] = [
  {
    id: "attendance-by-employee",
    title: "Asistencia por Empleado",
    description: "Reporte detallado de asistencia individual con estadísticas de puntualidad y ausencias",
    icon: Users,
    href: "/admin/reports/attendance-by-employee",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    stats: "Individual"
  },
  {
    id: "attendance-by-department",
    title: "Asistencia por Departamento",
    description: "Análisis de asistencia agrupado por departamento con métricas comparativas",
    icon: Building2,
    href: "/admin/reports/attendance-by-department",
    color: "text-green-700",
    bgColor: "bg-green-50",
    stats: "Grupal"
  },
  {
    id: "worked-hours",
    title: "Horas Trabajadas",
    description: "Resumen de horas trabajadas, extras y promedios por empleado y periodo",
    icon: Clock,
    href: "/admin/reports/worked-hours",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    stats: "Tiempo"
  },
  {
    id: "tardiness",
    title: "Reporte de Tardanzas",
    description: "Análisis de llegadas tarde, frecuencia y acumulación de minutos perdidos",
    icon: AlertCircle,
    href: "/admin/reports/tardiness",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    stats: "Disciplina"
  },
  {
    id: "leaves",
    title: "Vacaciones y Permisos",
    description: "Estado de solicitudes de vacaciones, días disponibles y histórico de permisos",
    icon: Palmtree,
    href: "/admin/reports/leaves",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    stats: "Ausencias"
  },
  {
    id: "disciplinary",
    title: "Actas Disciplinarias",
    description: "Registro de actas disciplinarias, tipos de falta y seguimiento de sanciones",
    icon: ShieldAlert,
    href: "/admin/reports/disciplinary",
    color: "text-red-700",
    bgColor: "bg-red-50",
    stats: "Sanciones"
  },
  {
    id: "monthly-summary",
    title: "Resumen Mensual",
    description: "Consolidado mensual con todas las métricas clave de recursos humanos",
    icon: Calendar,
    href: "/admin/reports/monthly-summary",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    stats: "General"
  },
  {
    id: "productivity",
    title: "Productividad",
    description: "Métricas de productividad basadas en asistencia, puntualidad y cumplimiento",
    icon: TrendingUp,
    href: "/admin/reports/productivity",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    stats: "KPIs"
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Centro de Reportes
            </h1>
            <p className="text-lg text-muted-foreground">
              Análisis y reportes detallados del sistema de recursos humanos
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Todo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Reportes Disponibles
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{reportCards.length}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Última Actualización
              </CardTitle>
              <Timer className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-900">Tiempo Real</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Categorías
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">5</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Formato
              </CardTitle>
              <Download className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-orange-900">PDF / Excel</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reports Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Reportes Disponibles
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportCards.map((report) => {
            const Icon = report.icon
            return (
              <Card
                key={report.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${report.bgColor}`}>
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {report.stats}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={report.href}>
                      Ver Reporte
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start gap-2">
              <Download className="h-4 w-4" />
              Exportar Reporte Mensual
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Calendar className="h-4 w-4" />
              Programar Reporte
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <FileText className="h-4 w-4" />
              Reporte Personalizado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
