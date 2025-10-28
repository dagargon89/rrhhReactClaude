import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock, Calendar, ToggleLeft, Users } from "lucide-react"
import Link from "next/link"
import { WorkShiftsTable } from "./components/WorkShiftsTable"

async function getWorkShifts() {
  const workShifts = await prisma.workShift.findMany({
    include: {
      _count: {
        select: {
          schedules: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return workShifts
}

export default async function WorkShiftsPage() {
  const workShifts = await getWorkShifts()

  // Cálculo de estadísticas
  const totalShifts = workShifts.length
  const activeShifts = workShifts.filter(shift => shift.isActive).length
  const flexibleShifts = workShifts.filter(shift => shift.isFlexible).length
  const autoCheckoutShifts = workShifts.filter(shift => shift.autoCheckoutEnabled).length
  const totalSchedules = workShifts.reduce((sum, shift) => sum + shift._count.schedules, 0)

  // Serialización de datos para componentes cliente
  const serializedShifts = workShifts.map(shift => ({
    ...shift,
    createdAt: shift.createdAt.toISOString(),
    updatedAt: shift.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Turnos
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra turnos de trabajo, horarios y configuraciones
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/work-shifts/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Turno
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Turnos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Turnos
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalShifts}</div>
              <p className="text-xs text-blue-700 mt-1">
                {activeShifts} activos
              </p>
            </CardContent>
          </Card>

          {/* Card: Turnos Flexibles */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Turnos Flexibles
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <ToggleLeft className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{flexibleShifts}</div>
              <p className="text-xs text-purple-700 mt-1">
                {((flexibleShifts / totalShifts) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Auto Checkout */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Auto-Checkout
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{autoCheckoutShifts}</div>
              <p className="text-xs text-green-700 mt-1">
                Con salida automática
              </p>
            </CardContent>
          </Card>

          {/* Card: Total Horarios */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Horarios Asignados
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{totalSchedules}</div>
              <p className="text-xs text-orange-700 mt-1">
                En todos los turnos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de turnos con búsqueda y filtros */}
      <WorkShiftsTable workShifts={serializedShifts} />
    </div>
  )
}
