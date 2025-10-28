"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Clock, Calendar } from "lucide-react"
import { AttendanceActions } from "./AttendanceActions"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface AttendancesTableProps {
  attendances: any[]
}

const STATUS_MAP = {
  PRESENT: { label: "Presente", color: "bg-green-100 text-green-700 border-green-200" },
  LATE: { label: "Tarde", color: "bg-orange-100 text-orange-700 border-orange-200" },
  ABSENT: { label: "Ausente", color: "bg-red-100 text-red-700 border-red-200" },
  HALF_DAY: { label: "Medio Día", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ON_LEAVE: { label: "Permiso", color: "bg-purple-100 text-purple-700 border-purple-200" },
}

export function AttendancesTable({ attendances }: AttendancesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")

  const filteredAttendances = useMemo(() => {
    return attendances.filter((attendance) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        attendance.employee.user.firstName.toLowerCase().includes(searchLower) ||
        attendance.employee.user.lastName.toLowerCase().includes(searchLower) ||
        attendance.employee.employeeCode.toLowerCase().includes(searchLower)

      const matchesStatus =
        statusFilter === "all" || attendance.status === statusFilter

      const matchesDate =
        !dateFilter || format(parseISO(attendance.date), "yyyy-MM-dd") === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [attendances, searchTerm, statusFilter, dateFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter("")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFilter

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Registro de Asistencias
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

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PRESENT">Presente</SelectItem>
                <SelectItem value="LATE">Tarde</SelectItem>
                <SelectItem value="ABSENT">Ausente</SelectItem>
                <SelectItem value="HALF_DAY">Medio Día</SelectItem>
                <SelectItem value="ON_LEAVE">Permiso</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filtrar por fecha"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {filteredAttendances.length} de {attendances.length} registros
            </Badge>
            {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {hasActiveFilters
                        ? "No se encontraron asistencias con los filtros aplicados"
                        : "No hay asistencias registradas"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendances.map((attendance) => (
                <TableRow key={attendance.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {attendance.employee.user.firstName}{" "}
                        {attendance.employee.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {attendance.employee.employeeCode}
                      </div>
                      {attendance.employee.department && (
                        <div className="text-xs text-muted-foreground">
                          {attendance.employee.department.name}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(attendance.date), "dd/MM/yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(attendance.date), "EEEE", { locale: es })}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {attendance.checkInTime ? (
                      <div className="font-mono text-sm">
                        {format(new Date(attendance.checkInTime), "HH:mm")}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin registro</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {attendance.checkOutTime ? (
                      <div className="font-mono text-sm">
                        {format(new Date(attendance.checkOutTime), "HH:mm")}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin registro</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className="font-mono text-sm font-medium">
                        {Number(attendance.workedHours).toFixed(2)}h
                      </div>
                      {Number(attendance.overtimeHours) > 0 && (
                        <div className="text-xs text-orange-600">
                          +{Number(attendance.overtimeHours).toFixed(2)}h extra
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {attendance.schedule?.shift ? (
                      <div>
                        <div className="text-sm">{attendance.schedule.shift.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {attendance.schedule.shift.code}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin turno</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge className={STATUS_MAP[attendance.status as keyof typeof STATUS_MAP].color}>
                      {STATUS_MAP[attendance.status as keyof typeof STATUS_MAP].label}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <AttendanceActions attendance={attendance} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}



