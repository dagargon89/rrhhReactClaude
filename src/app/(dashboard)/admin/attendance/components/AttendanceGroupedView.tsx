"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Calendar,
  Clock,
  Users,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface Employee {
  id: string
  employeeCode: string
  user: {
    firstName: string
    lastName: string
  }
  department?: {
    name: string
  } | null
}

interface Attendance {
  id: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  workedHours: string
  status: string
  employee: Employee
}

interface AttendanceGroupedViewProps {
  attendances: Attendance[]
}

export function AttendanceGroupedView({ attendances }: AttendanceGroupedViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date())

  // Agrupar asistencias por mes y día
  const groupedData = useMemo(() => {
    const groups: Record<string, Record<string, Attendance[]>> = {}

    attendances.forEach((attendance) => {
      // Manejar tanto strings como objetos Date
      const date = typeof attendance.date === 'string'
        ? parseISO(attendance.date)
        : new Date(attendance.date)

      const monthKey = format(date, "yyyy-MM")
      const dayKey = format(date, "yyyy-MM-dd")

      if (!groups[monthKey]) {
        groups[monthKey] = {}
      }

      if (!groups[monthKey][dayKey]) {
        groups[monthKey][dayKey] = []
      }

      groups[monthKey][dayKey].push(attendance)
    })

    return groups
  }, [attendances])

  // Obtener meses disponibles
  const availableMonths = useMemo(() => {
    return Object.keys(groupedData).sort().reverse()
  }, [groupedData])

  // Datos del mes seleccionado
  const selectedMonthKey = format(selectedMonth, "yyyy-MM")
  const monthData = groupedData[selectedMonthKey] || {}

  // Días del mes seleccionado ordenados descendente
  const daysInMonth = useMemo(() => {
    return Object.keys(monthData).sort().reverse()
  }, [monthData])

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any; label: string }> = {
      PRESENT: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Presente" },
      LATE: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertCircle, label: "Tarde" },
      ABSENT: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Ausente" },
      HALF_DAY: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Timer, label: "Medio día" },
      ON_LEAVE: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Calendar, label: "Permiso" },
    }

    const variant = variants[status] || variants.PRESENT
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    )
  }

  // Calcular estadísticas del día
  const getDayStats = (dayAttendances: Attendance[]) => {
    const total = dayAttendances.length
    const present = dayAttendances.filter(a => a.status === "PRESENT").length
    const late = dayAttendances.filter(a => a.status === "LATE").length
    const absent = dayAttendances.filter(a => a.status === "ABSENT").length

    return { total, present, late, absent }
  }

  return (
    <div className="space-y-6">
      {/* Selector de mes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Seleccionar Mes
            </div>
            <Badge variant="outline" className="text-lg">
              {format(selectedMonth, "MMMM yyyy", { locale: es })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableMonths.map((monthKey) => {
              const monthDate = parseISO(monthKey + "-01")
              const isSelected = monthKey === selectedMonthKey

              return (
                <button
                  key={monthKey}
                  onClick={() => setSelectedMonth(monthDate)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-blue-50 border-gray-200"
                  }`}
                >
                  {format(monthDate, "MMMM yyyy", { locale: es })}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vista agrupada por días */}
      {daysInMonth.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">
              No hay registros de asistencia para este mes
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {daysInMonth.map((dayKey) => {
            const dayAttendances = monthData[dayKey]
            const dayDate = parseISO(dayKey)
            const stats = getDayStats(dayAttendances)

            return (
              <AccordionItem
                key={dayKey}
                value={dayKey}
                className="border-0 shadow-lg rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    {/* Fecha */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {format(dayDate, "dd")}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {format(dayDate, "EEE", { locale: es })}
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-left">
                          {format(dayDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {stats.total} empleados
                          </span>
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {stats.present} presentes
                          </span>
                          {stats.late > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <AlertCircle className="h-4 w-4" />
                              {stats.late} tarde
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge con total */}
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                      <Users className="h-3 w-3 mr-1" />
                      {stats.total}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-3 mt-3">
                    {dayAttendances.map((attendance) => (
                      <Card key={attendance.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            {/* Info del empleado */}
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {attendance.employee.user.firstName[0]}
                                  {attendance.employee.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <p className="font-medium">
                                  {attendance.employee.user.firstName}{" "}
                                  {attendance.employee.user.lastName}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span className="font-mono">
                                    {attendance.employee.employeeCode}
                                  </span>
                                  {attendance.employee.department && (
                                    <span className="flex items-center gap-1">
                                      • {attendance.employee.department.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Horarios */}
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <LogIn className="h-3 w-3" />
                                  Entrada
                                </p>
                                <p className="font-mono font-semibold text-green-600">
                                  {attendance.checkInTime
                                    ? format(
                                        typeof attendance.checkInTime === 'string'
                                          ? parseISO(attendance.checkInTime)
                                          : new Date(attendance.checkInTime),
                                        "HH:mm"
                                      )
                                    : "-"}
                                </p>
                              </div>

                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <LogOut className="h-3 w-3" />
                                  Salida
                                </p>
                                <p className="font-mono font-semibold text-orange-600">
                                  {attendance.checkOutTime
                                    ? format(
                                        typeof attendance.checkOutTime === 'string'
                                          ? parseISO(attendance.checkOutTime)
                                          : new Date(attendance.checkOutTime),
                                        "HH:mm"
                                      )
                                    : "-"}
                                </p>
                              </div>

                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Horas
                                </p>
                                <p className="font-mono font-semibold text-blue-600">
                                  {Number(attendance.workedHours).toFixed(2)}h
                                </p>
                              </div>

                              {/* Estado */}
                              <div>
                                {getStatusBadge(attendance.status)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}
