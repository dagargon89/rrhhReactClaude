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
import {
  Clock,
  Calendar,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Zap,
  Search,
  X,
} from "lucide-react"
import { WorkShiftActions } from "./WorkShiftActions"
import { DataTable } from "@/components/ui/data-table"

interface WorkShiftsTableEnhancedProps {
  workShifts: any[]
}

const DAYS_LABELS: Record<number, string> = {
  0: "Lun",
  1: "Mar",
  2: "Mié",
  3: "Jue",
  4: "Vie",
  5: "Sáb",
  6: "Dom",
}

export function WorkShiftsTableEnhanced({ workShifts }: WorkShiftsTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [flexibleFilter, setFlexibleFilter] = useState("all")

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
    // Turno
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Turno" />
      ),
      cell: ({ row }) => {
        const shift = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{shift.name}</p>
              <p className="text-sm text-muted-foreground">
                {shift.code}
              </p>
            </div>
          </div>
        )
      },
    },
    // Horario
    {
      accessorKey: "startTime",
      header: "Horario",
      cell: ({ row }) => {
        const shift = row.original
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">
              {shift.startTime} - {shift.endTime}
            </span>
          </div>
        )
      },
    },
    // Horas Semanales
    {
      accessorKey: "weeklyHours",
      header: "Horas/Semana",
      cell: ({ row }) => {
        const shift = row.original
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono font-medium">
              {Number(shift.weeklyHours).toFixed(1)} hrs
            </span>
          </div>
        )
      },
    },
    // Tipo
    {
      accessorKey: "isFlexible",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        const isFlexible = row.getValue("isFlexible")
        return (
          <Badge
            variant="outline"
            className={isFlexible ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"}
          >
            {isFlexible ? (
              <>
                <ToggleLeft className="h-3 w-3 mr-1" />
                Flexible
              </>
            ) : (
              <>
                <ToggleRight className="h-3 w-3 mr-1" />
                Fijo
              </>
            )}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Tolerancia
    {
      accessorKey: "gracePeriodMinutes",
      header: "Tolerancia",
      cell: ({ row }) => {
        const minutes = row.getValue("gracePeriodMinutes") as number
        return (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {minutes} min
          </div>
        )
      },
    },
    // Auto-Checkout
    {
      accessorKey: "autoCheckoutEnabled",
      header: "Auto-Checkout",
      cell: ({ row }) => {
        const enabled = row.getValue("autoCheckoutEnabled")
        return enabled ? (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            <Zap className="h-3 w-3 mr-1" />
            Habilitado
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Deshabilitado
          </Badge>
        )
      },
    },
    // Horarios
    {
      accessorKey: "schedules",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Horarios" />
      ),
      cell: ({ row }) => {
        const shift = row.original
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{shift._count.schedules}</span>
          </div>
        )
      },
    },
    // Estado
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive")
        return (
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Activo
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactivo
              </>
            )}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Fecha de creación
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Creado" />
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
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <WorkShiftActions workShift={row.original} />
      },
    },
  ]

  // Filtrar turnos
  const filteredShifts = useMemo(() => {
    return workShifts.filter((shift) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        shift.name.toLowerCase().includes(searchLower) ||
        shift.code.toLowerCase().includes(searchLower)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && shift.isActive) ||
        (statusFilter === "inactive" && !shift.isActive)

      const matchesFlexible =
        flexibleFilter === "all" ||
        (flexibleFilter === "flexible" && shift.isFlexible) ||
        (flexibleFilter === "fixed" && !shift.isFlexible)

      return matchesSearch && matchesStatus && matchesFlexible
    })
  }, [workShifts, searchTerm, statusFilter, flexibleFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setFlexibleFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || flexibleFilter !== "all"

  const renderTable = (data: any[]) => (
    <DataTable
      columns={columns}
      data={data}
      deleteEndpoint="/api/work-shifts/bulk-delete"
      itemName="turno"
    />
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">Todos ({workShifts.length})</TabsTrigger>
        <TabsTrigger value="active">Activos ({workShifts.filter(s => s.isActive).length})</TabsTrigger>
        <TabsTrigger value="flexible">Flexibles ({workShifts.filter(s => s.isFlexible).length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Lista de Turnos
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
                    placeholder="Buscar por nombre, código..."
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
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={flexibleFilter} onValueChange={setFlexibleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="fixed">Fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredShifts.length} de {workShifts.length} turnos
                </Badge>
                {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredShifts)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Turnos Activos
              </CardTitle>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {workShifts.filter(s => s.isActive).length} turnos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(workShifts.filter(s => s.isActive))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="flexible" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5 text-purple-600" />
                Turnos Flexibles
              </CardTitle>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {workShifts.filter(s => s.isFlexible).length} turnos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(workShifts.filter(s => s.isFlexible))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
