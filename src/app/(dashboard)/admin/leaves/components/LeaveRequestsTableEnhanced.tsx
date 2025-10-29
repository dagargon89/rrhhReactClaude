"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Calendar, CheckCircle2, XCircle, Clock, Search, X } from "lucide-react"
import { LeaveRequestActions } from "./LeaveRequestActions"
import { DataTable } from "@/components/ui/data-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface LeaveRequestsTableEnhancedProps {
  leaveRequests: any[]
}

export function LeaveRequestsTableEnhanced({ leaveRequests }: LeaveRequestsTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all")

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

  const getLeaveTypeName = (name: string) => {
    const names: Record<string, string> = {
      VACATION: "Vacaciones",
      SICK_LEAVE: "Incapacidad",
      PERSONAL: "Personal",
      MATERNITY: "Maternidad",
      PATERNITY: "Paternidad",
      UNPAID: "Sin goce",
    }
    return names[name] || name
  }

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

  const columns: ColumnDef<any>[] = [
    // Columna de selección
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
    // Empleado
    {
      accessorKey: "employee.user.firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empleado" />
      ),
      cell: ({ row }) => {
        const request = row.original
        return (
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
        )
      },
    },
    // Tipo de permiso
    {
      accessorKey: "leaveType.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        const request = row.original
        return (
          <Badge
            style={{
              backgroundColor: `${request.leaveType.color}20`,
              color: request.leaveType.color,
              borderColor: `${request.leaveType.color}40`,
            }}
          >
            {getLeaveTypeName(request.leaveType.name)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Fechas
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fechas" />
      ),
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">
                {format(new Date(request.startDate), "dd/MM/yyyy")} -{" "}
                {format(new Date(request.endDate), "dd/MM/yyyy")}
              </div>
            </div>
          </div>
        )
      },
    },
    // Días
    {
      accessorKey: "totalDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Días" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-semibold text-purple-700">
            {row.getValue("totalDays")} días
          </div>
        )
      },
    },
    // Estado
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Solicitado
    {
      accessorKey: "requestedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Solicitado" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {format(new Date(row.getValue("requestedAt")), "dd MMM yyyy", { locale: es })}
          </div>
        )
      },
    },
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <LeaveRequestActions request={row.original} />
      },
    },
  ]

  // Filtrar solicitudes
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((request) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        request.employee.user.firstName.toLowerCase().includes(searchLower) ||
        request.employee.user.lastName.toLowerCase().includes(searchLower) ||
        request.employee.employeeCode.toLowerCase().includes(searchLower)

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter

      const matchesLeaveType =
        leaveTypeFilter === "all" ||
        request.leaveType.id === leaveTypeFilter

      return matchesSearch && matchesStatus && matchesLeaveType
    })
  }, [leaveRequests, searchTerm, statusFilter, leaveTypeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setLeaveTypeFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all"

  const renderTable = (data: any[]) => (
    <DataTable
      columns={columns}
      data={data}
      deleteEndpoint="/api/leaves/bulk-delete"
      itemName="solicitud de permiso"
    />
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todas ({leaveRequests.length})</TabsTrigger>
        <TabsTrigger value="pending">Pendientes ({leaveRequests.filter(r => r.status === "PENDING").length})</TabsTrigger>
        <TabsTrigger value="approved">Aprobadas ({leaveRequests.filter(r => r.status === "APPROVED").length})</TabsTrigger>
        <TabsTrigger value="rejected">Rechazadas ({leaveRequests.filter(r => r.status === "REJECTED").length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
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
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="APPROVED">Aprobada</SelectItem>
                    <SelectItem value="REJECTED">Rechazada</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de permiso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {getLeaveTypeName(type.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredRequests.length} de {leaveRequests.length} solicitudes
                </Badge>
                {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredRequests)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Solicitudes Pendientes
              </CardTitle>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                {leaveRequests.filter(r => r.status === "PENDING").length} solicitudes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(leaveRequests.filter(r => r.status === "PENDING"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="approved" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Solicitudes Aprobadas
              </CardTitle>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {leaveRequests.filter(r => r.status === "APPROVED").length} solicitudes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(leaveRequests.filter(r => r.status === "APPROVED"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rejected" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Solicitudes Rechazadas
              </CardTitle>
              <Badge variant="outline" className="text-red-600 border-red-200">
                {leaveRequests.filter(r => r.status === "REJECTED").length} solicitudes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(leaveRequests.filter(r => r.status === "REJECTED"))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
