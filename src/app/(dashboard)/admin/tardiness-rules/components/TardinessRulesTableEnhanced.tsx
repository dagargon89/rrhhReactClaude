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
import { Clock, AlertCircle, Search, X } from "lucide-react"
import { TardinessRuleActions } from "./TardinessRuleActions"
import { DataTable } from "@/components/ui/data-table"

interface TardinessRulesTableEnhancedProps {
  rules: any[]
}

export function TardinessRulesTableEnhanced({ rules }: TardinessRulesTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Función para formatear el rango de minutos
  const formatMinutesRange = (start: number, end: number | null) => {
    if (end === null) {
      return `${start}+ minutos`
    }
    return `${start}-${end} minutos`
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
    // Nombre
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => {
        const rule = row.original
        return (
          <div className="space-y-1">
            <p className="font-medium">{rule.name}</p>
            {rule.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {rule.description}
              </p>
            )}
          </div>
        )
      },
    },
    // Tipo
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        const rule = row.original
        return rule.type === "LATE_ARRIVAL" ? (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Llegada Tardía
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Retardo Directo
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Rango de minutos
    {
      accessorKey: "startMinutesLate",
      header: "Rango (minutos tarde)",
      cell: ({ row }) => {
        const rule = row.original
        return (
          <span className="font-mono text-sm">
            {formatMinutesRange(rule.startMinutesLate, rule.endMinutesLate)}
          </span>
        )
      },
    },
    // Acumulación
    {
      accessorKey: "accumulationCount",
      header: "Acumulación",
      cell: ({ row }) => {
        const rule = row.original
        return (
          <Badge variant="outline">
            {rule.accumulationCount} {rule.accumulationCount === 1 ? "vez" : "veces"}
          </Badge>
        )
      },
    },
    // Conversión
    {
      accessorKey: "equivalentFormalTardies",
      header: "Conversión",
      cell: ({ row }) => {
        const rule = row.original
        return (
          <Badge variant="outline" className="font-mono">
            → {rule.equivalentFormalTardies} {rule.equivalentFormalTardies === 1 ? "retardo" : "retardos"}
          </Badge>
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
        const rule = row.original
        return rule.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Activa
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Inactiva
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <TardinessRuleActions rule={row.original} />
      },
    },
  ]

  // Filtrar reglas
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        rule.name.toLowerCase().includes(searchLower) ||
        (rule.description && rule.description.toLowerCase().includes(searchLower))

      const matchesType =
        typeFilter === "all" ||
        rule.type === typeFilter

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rule.isActive) ||
        (statusFilter === "inactive" && !rule.isActive)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [rules, searchTerm, typeFilter, statusFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
  }

  const hasActiveFilters = searchTerm || typeFilter !== "all" || statusFilter !== "all"

  const renderTable = (data: any[]) => (
    <DataTable
      columns={columns}
      data={data}
      deleteEndpoint="/api/tardiness-rules/bulk-delete"
      itemName="regla de tardanza"
    />
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todas ({rules.length})</TabsTrigger>
        <TabsTrigger value="active">Activas ({rules.filter(r => r.isActive).length})</TabsTrigger>
        <TabsTrigger value="late-arrival">Llegadas Tardías ({rules.filter(r => r.type === "LATE_ARRIVAL").length})</TabsTrigger>
        <TabsTrigger value="direct">Retardos Directos ({rules.filter(r => r.type === "DIRECT_TARDINESS").length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Lista de Reglas de Tardanzas
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
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de regla" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="LATE_ARRIVAL">Llegada Tardía</SelectItem>
                    <SelectItem value="DIRECT_TARDINESS">Retardo Directo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="inactive">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredRules.length} de {rules.length} reglas
                </Badge>
                {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredRules)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Reglas Activas
              </CardTitle>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {rules.filter(r => r.isActive).length} reglas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.isActive))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="late-arrival" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Reglas de Llegadas Tardías (Acumulativas)
              </CardTitle>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                {rules.filter(r => r.type === "LATE_ARRIVAL").length} reglas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.type === "LATE_ARRIVAL"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="direct" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Reglas de Retardos Directos
              </CardTitle>
              <Badge variant="outline" className="text-red-600 border-red-200">
                {rules.filter(r => r.type === "DIRECT_TARDINESS").length} reglas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.type === "DIRECT_TARDINESS"))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
