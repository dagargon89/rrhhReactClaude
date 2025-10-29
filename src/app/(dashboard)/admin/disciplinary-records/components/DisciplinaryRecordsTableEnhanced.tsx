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
import { FileText, Calendar, User, Search, X } from "lucide-react"
import { DisciplinaryRecordActions } from "./DisciplinaryRecordActions"
import { DataTable } from "@/components/ui/data-table"

interface DisciplinaryRecordsTableEnhancedProps {
  records: any[]
}

export function DisciplinaryRecordsTableEnhanced({ records }: DisciplinaryRecordsTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionTypeFilter, setActionTypeFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pendiente" },
      ACTIVE: { color: "bg-red-100 text-red-700 border-red-200", label: "Activa" },
      COMPLETED: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Completada" },
      CANCELLED: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Cancelada" },
    }
    const config = variants[status] || { color: "bg-gray-100 text-gray-700", label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getActionTypeBadge = (actionType: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      ADMINISTRATIVE_ACT: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Acta Admin." },
      SUSPENSION: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Suspensión" },
      TERMINATION: { color: "bg-red-100 text-red-700 border-red-200", label: "Rescisión" },
      WARNING: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Advertencia" },
      WRITTEN_WARNING: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Advertencia Escrita" },
    }
    const config = variants[actionType] || { color: "bg-gray-100 text-gray-700", label: actionType }
    return <Badge className={config.color}>{config.label}</Badge>
  }

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
    // Código de empleado
    {
      accessorKey: "employee.employeeCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Código" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.original.employee.employeeCode}
        </div>
      ),
    },
    // Empleado
    {
      accessorKey: "employee.user.firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empleado" />
      ),
      cell: ({ row }) => {
        const { firstName, lastName } = row.original.employee.user
        return (
          <div>
            <div className="font-medium">{firstName} {lastName}</div>
            {row.original.employee.department && (
              <div className="text-xs text-muted-foreground">
                {row.original.employee.department.name}
              </div>
            )}
          </div>
        )
      },
    },
    // Tipo de acción
    {
      accessorKey: "actionType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => getActionTypeBadge(row.getValue("actionType")),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Causa
    {
      accessorKey: "triggerType",
      header: "Causa",
      cell: ({ row }) => {
        const triggerType = row.getValue("triggerType") as string
        const triggerCount = row.original.triggerCount
        const labels: Record<string, string> = {
          FORMAL_TARDIES: "Retardos formales",
          ADMINISTRATIVE_ACTS: "Actas administrativas",
          UNJUSTIFIED_ABSENCES: "Faltas injustificadas",
        }
        return (
          <div className="text-sm">
            <div className="font-medium">{labels[triggerType] || triggerType}</div>
            <div className="text-xs text-muted-foreground">
              Cantidad: {triggerCount}
            </div>
          </div>
        )
      },
    },
    // Fecha de aplicación
    {
      accessorKey: "appliedDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha Aplicación" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("appliedDate"))
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )
      },
    },
    // Días de suspensión
    {
      accessorKey: "suspensionDays",
      header: "Días Susp.",
      cell: ({ row }) => {
        const days = row.getValue("suspensionDays") as number | null
        if (!days) return <span className="text-muted-foreground">-</span>
        return (
          <div className="text-center font-medium text-red-600">
            {days} {days === 1 ? "día" : "días"}
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
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <DisciplinaryRecordActions record={row.original} />
      },
    },
  ]

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        record.employee.user.firstName.toLowerCase().includes(searchLower) ||
        record.employee.user.lastName.toLowerCase().includes(searchLower) ||
        record.employee.employeeCode.toLowerCase().includes(searchLower) ||
        (record.employee.department && record.employee.department.name.toLowerCase().includes(searchLower))

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter

      const matchesActionType =
        actionTypeFilter === "all" || record.actionType === actionTypeFilter

      return matchesSearch && matchesStatus && matchesActionType
    })
  }, [records, searchTerm, statusFilter, actionTypeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setActionTypeFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || actionTypeFilter !== "all"

  const renderTable = (data: any[]) => (
    <DataTable
      columns={columns}
      data={data}
      deleteEndpoint="/api/disciplinary-records/bulk-delete"
      itemName="registro disciplinario"
    />
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todos ({records.length})</TabsTrigger>
        <TabsTrigger value="pending">Pendientes ({records.filter(r => r.status === "PENDING").length})</TabsTrigger>
        <TabsTrigger value="active">Activas ({records.filter(r => r.status === "ACTIVE").length})</TabsTrigger>
        <TabsTrigger value="suspension">Suspensiones ({records.filter(r => r.actionType === "SUSPENSION").length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  Registros Disciplinarios
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
                    placeholder="Buscar por empleado, código..."
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
                    <SelectItem value="ACTIVE">Activa</SelectItem>
                    <SelectItem value="COMPLETED">Completada</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="WARNING">Advertencia</SelectItem>
                    <SelectItem value="WRITTEN_WARNING">Advertencia Escrita</SelectItem>
                    <SelectItem value="ADMINISTRATIVE_ACT">Acta Admin.</SelectItem>
                    <SelectItem value="SUSPENSION">Suspensión</SelectItem>
                    <SelectItem value="TERMINATION">Rescisión</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredRecords.length} de {records.length} registros
                </Badge>
                {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredRecords)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                Registros Pendientes
              </CardTitle>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                {records.filter(r => r.status === "PENDING").length} registros
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(records.filter(r => r.status === "PENDING"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Registros Activos
              </CardTitle>
              <Badge variant="outline" className="text-red-600 border-red-200">
                {records.filter(r => r.status === "ACTIVE").length} registros
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(records.filter(r => r.status === "ACTIVE"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="suspension" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Suspensiones
              </CardTitle>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {records.filter(r => r.actionType === "SUSPENSION").length} registros
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(records.filter(r => r.actionType === "SUSPENSION"))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
