"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Timer,
  Search,
  X,
} from "lucide-react"
import { AttendanceActions } from "./AttendanceActions"
import { format } from "date-fns"
import { formatDateUTC, toISODateUTC } from "@/lib/date-utils"

interface AttendancesTableEnhancedProps {
  attendances: any[]
}

export function AttendancesTableEnhanced({ attendances }: AttendancesTableEnhancedProps) {
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
        !dateFilter || toISODateUTC(attendance.date) === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [attendances, searchTerm, statusFilter, dateFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter("")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFilter

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "employee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empleado" />
      ),
      cell: ({ row }) => {
        const attendance = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {attendance.employee.user.firstName[0]}{attendance.employee.user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {attendance.employee.user.firstName} {attendance.employee.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {attendance.employee.employeeCode}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "department",
      header: "Departamento",
      cell: ({ row }) => {
        const attendance = row.original
        return attendance.employee.department ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{attendance.employee.department.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDateUTC(row.getValue("date"), { includeWeekday: true, short: true })}
          </div>
        )
      },
    },
    {
      accessorKey: "shift",
      header: "Turno",
      cell: ({ row }) => {
        const attendance = row.original
        // Usar shiftOverride si existe, sino usar el turno por defecto del empleado
        const shift = attendance.shiftOverride || attendance.employee?.defaultShift
        return shift ? (
          <div className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{shift.name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "checkInTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entrada" />
      ),
      cell: ({ row }) => {
        const checkIn = row.getValue("checkInTime") as string | null
        return checkIn ? (
          <div className="flex items-center gap-1 text-sm">
            <LogIn className="h-3 w-3 text-green-600" />
            {new Date(checkIn).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "checkOutTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Salida" />
      ),
      cell: ({ row }) => {
        const checkOut = row.getValue("checkOutTime") as string | null
        return checkOut ? (
          <div className="flex items-center gap-1 text-sm">
            <LogOut className="h-3 w-3 text-red-600" />
            {new Date(checkOut).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        ) : (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Pendiente
          </Badge>
        )
      },
    },
    {
      accessorKey: "workedHours",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Horas" />
      ),
      cell: ({ row }) => {
        const hours = row.getValue("workedHours") as number | null
        return hours ? (
          <div className="flex items-center gap-1 text-sm font-mono">
            <Timer className="h-3 w-3 text-muted-foreground" />
            {Number(hours).toFixed(2)}h
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => {
        const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
          PRESENT: { label: "Presente", icon: CheckCircle2, className: "bg-green-100 text-green-700 border-green-200" },
          ABSENT: { label: "Ausente", icon: XCircle, className: "bg-red-100 text-red-700 border-red-200" },
          LATE: { label: "Tarde", icon: AlertCircle, className: "bg-orange-100 text-orange-700 border-orange-200" },
          ON_LEAVE: { label: "Permiso", icon: Clock, className: "bg-blue-100 text-blue-700 border-blue-200" },
          HOLIDAY: { label: "Feriado", icon: Calendar, className: "bg-purple-100 text-purple-700 border-purple-200" },
        }

        const status = row.getValue("status") as string
        const config = statusConfig[status] || statusConfig.ABSENT
        const Icon = config.icon

        return (
          <Badge variant="outline" className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "lateMinutes",
      header: "Tardanza",
      cell: ({ row }) => {
        const lateMinutes = row.getValue("lateMinutes") as number | null
        if (!lateMinutes || lateMinutes <= 0) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            {lateMinutes} min
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Registrado" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(row.getValue("createdAt")).toLocaleDateString('es-ES')}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return <AttendanceActions attendance={row.original} />
      },
    },
  ]

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
        <DataTable
          columns={columns}
          data={filteredAttendances}
          deleteEndpoint="/api/attendance/bulk-delete"
          itemName="asistencia"
        />
      </CardContent>
    </Card>
  )
}
