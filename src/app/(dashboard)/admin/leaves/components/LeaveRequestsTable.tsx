"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  X,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react"
import { LeaveRequestActions } from "./LeaveRequestActions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface LeaveRequestsTableProps {
  leaveRequests: any[]
}

export function LeaveRequestsTable({
  leaveRequests,
}: LeaveRequestsTableProps) {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((request) => {
      // Filtro de búsqueda (nombre del empleado)
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        request.employee.user.firstName.toLowerCase().includes(searchLower) ||
        request.employee.user.lastName.toLowerCase().includes(searchLower) ||
        request.employee.employeeCode.toLowerCase().includes(searchLower)

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter

      // Filtro de tipo de permiso
      const matchesLeaveType =
        leaveTypeFilter === "all" ||
        request.leaveType.id === leaveTypeFilter

      return matchesSearch && matchesStatus && matchesLeaveType
    })
  }, [leaveRequests, searchTerm, statusFilter, leaveTypeFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setLeaveTypeFilter("all")
  }

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all"

  // Obtener tipos de permisos únicos
  const leaveTypes = useMemo(() => {
    const types = new Map()
    leaveRequests.forEach((request) => {
      if (!types.has(request.leaveType.id)) {
        types.set(request.leaveType.id, request.leaveType)
      }
    })
    return Array.from(types.values())
  }, [leaveRequests])

  // Función para obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprobada
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazada
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Solicitudes de Permisos
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
                placeholder="Buscar por empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro de Estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="APPROVED">Aprobada</SelectItem>
                <SelectItem value="REJECTED">Rechazada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Tipo de Permiso */}
            <Select
              value={leaveTypeFilter}
              onValueChange={setLeaveTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de permiso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name === "VACATION"
                      ? "Vacaciones"
                      : type.name === "SICK_LEAVE"
                        ? "Incapacidad médica"
                        : type.name === "PERSONAL"
                          ? "Personal"
                          : type.name === "MATERNITY"
                            ? "Maternidad"
                            : type.name === "PATERNITY"
                              ? "Paternidad"
                              : type.name === "UNPAID"
                                ? "Sin goce de sueldo"
                                : type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Indicador de resultados */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {filteredRequests.length} de {leaveRequests.length} solicitudes
            </Badge>
            {hasActiveFilters && (
              <span className="text-xs">Filtros aplicados</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Tipo de Permiso</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Solicitado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {hasActiveFilters
                        ? "No se encontraron solicitudes con los filtros aplicados"
                        : "No hay solicitudes de permisos registradas"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {request.employee.user.firstName} {request.employee.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.employee.employeeCode}
                      </div>
                      {request.employee.department && (
                        <div className="text-xs text-muted-foreground">
                          {request.employee.department.name}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: `${request.leaveType.color}20`,
                        color: request.leaveType.color,
                        borderColor: `${request.leaveType.color}40`,
                      }}
                    >
                      {request.leaveType.name === "VACATION"
                        ? "Vacaciones"
                        : request.leaveType.name === "SICK_LEAVE"
                          ? "Incapacidad"
                          : request.leaveType.name === "PERSONAL"
                            ? "Personal"
                            : request.leaveType.name === "MATERNITY"
                              ? "Maternidad"
                              : request.leaveType.name === "PATERNITY"
                                ? "Paternidad"
                                : "Sin goce"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">
                          {format(new Date(request.startDate), "dd/MM/yyyy")} -{" "}
                          {format(new Date(request.endDate), "dd/MM/yyyy")}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-purple-700">
                      {request.totalDays} días
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(request.status)}</TableCell>

                  <TableCell>
                    <div className="text-sm">
                      {format(
                        new Date(request.requestedAt),
                        "dd MMM yyyy",
                        { locale: es }
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <LeaveRequestActions request={request} />
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
