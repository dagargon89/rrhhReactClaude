"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Calendar, Clock, Users, AlertCircle } from "lucide-react"
import { ScheduleActions } from "./ScheduleActions"
import { format, isToday, isTomorrow, isPast, isFuture, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface SchedulesTableProps {
  schedules: any[]
}

export function SchedulesTable({ schedules }: SchedulesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [employeeFilter, setEmployeeFilter] = useState("all")

  // Obtener empleados únicos
  const uniqueEmployees = useMemo(() => {
    const empMap = new Map()
    schedules.forEach(schedule => {
      if (schedule.employee && !empMap.has(schedule.employee.id)) {
        empMap.set(schedule.employee.id, {
          id: schedule.employee.id,
          name: `${schedule.employee.user.firstName} ${schedule.employee.user.lastName}`,
          code: schedule.employee.employeeCode,
        })
      }
    })
    return Array.from(empMap.values())
  }, [schedules])

  // Filtrado optimizado con useMemo
  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        schedule.employee.user.firstName.toLowerCase().includes(searchLower) ||
        schedule.employee.user.lastName.toLowerCase().includes(searchLower) ||
        schedule.employee.employeeCode.toLowerCase().includes(searchLower) ||
        schedule.shift.name.toLowerCase().includes(searchLower) ||
        schedule.shift.code.toLowerCase().includes(searchLower)

      // Filtro de fecha
      const scheduleDate = parseISO(schedule.date)
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && isToday(scheduleDate)) ||
        (dateFilter === "tomorrow" && isTomorrow(scheduleDate)) ||
        (dateFilter === "past" && isPast(scheduleDate) && !isToday(scheduleDate)) ||
        (dateFilter === "future" && isFuture(scheduleDate) && !isToday(scheduleDate))

      // Filtro de empleado
      const matchesEmployee =
        employeeFilter === "all" ||
        schedule.employee.id === employeeFilter

      return matchesSearch && matchesDate && matchesEmployee
    })
  }, [schedules, searchTerm, dateFilter, employeeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setDateFilter("all")
    setEmployeeFilter("all")
  }

  const hasActiveFilters = searchTerm || dateFilter !== "all" || employeeFilter !== "all"

  const getDateBadge = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Hoy</Badge>
    }
    if (isTomorrow(date)) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Mañana</Badge>
    }
    if (isPast(date)) {
      return <Badge variant="outline" className="text-muted-foreground">Pasado</Badge>
    }
    return <Badge variant="outline">Próximo</Badge>
  }

  const renderTable = (schedulesToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empleado</TableHead>
          <TableHead>Turno</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Horario</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Asistencias</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedulesToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron horarios con los filtros aplicados" : "No hay horarios registrados"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          schedulesToShow.map((schedule) => (
            <TableRow key={schedule.id} className="hover:bg-muted/50">
              {/* Empleado */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      {schedule.employee.user.firstName} {schedule.employee.user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {schedule.employee.employeeCode}
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* Turno */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{schedule.shift.name}</div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {schedule.shift.code}
                  </Badge>
                </div>
              </TableCell>

              {/* Fecha */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {format(parseISO(schedule.date), "dd MMMM yyyy", { locale: es })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(schedule.date), "EEEE", { locale: es })}
                  </div>
                  {getDateBadge(schedule.date)}
                </div>
              </TableCell>

              {/* Horario */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    {schedule.shift.startTime} - {schedule.shift.endTime}
                  </span>
                </div>
              </TableCell>

              {/* Tipo */}
              <TableCell>
                {schedule.isOverride ? (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Override
                  </Badge>
                ) : (
                  <Badge variant="outline">Regular</Badge>
                )}
              </TableCell>

              {/* Asistencias */}
              <TableCell>
                <Badge variant={schedule._count.attendances > 0 ? "default" : "secondary"}>
                  {schedule._count.attendances}
                </Badge>
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-right">
                <ScheduleActions schedule={schedule} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  // Vistas predefinidas
  const todaySchedules = filteredSchedules.filter(s => isToday(parseISO(s.date)))
  const tomorrowSchedules = filteredSchedules.filter(s => isTomorrow(parseISO(s.date)))
  const futureSchedules = filteredSchedules.filter(s => isFuture(parseISO(s.date)) && !isToday(parseISO(s.date)))

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todos ({filteredSchedules.length})</TabsTrigger>
        <TabsTrigger value="today">Hoy ({todaySchedules.length})</TabsTrigger>
        <TabsTrigger value="tomorrow">Mañana ({tomorrowSchedules.length})</TabsTrigger>
        <TabsTrigger value="upcoming">Próximos ({futureSchedules.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Lista de Horarios
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Barra de búsqueda y filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por empleado, turno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro de Fecha */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="tomorrow">Mañana</SelectItem>
                    <SelectItem value="future">Futuros</SelectItem>
                    <SelectItem value="past">Pasados</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Empleado */}
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los empleados</SelectItem>
                    {uniqueEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredSchedules.length} de {schedules.length} horarios
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredSchedules)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="today">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Horarios de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(todaySchedules)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tomorrow">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Horarios de Mañana
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(tomorrowSchedules)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="upcoming">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Horarios Próximos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(futureSchedules)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
