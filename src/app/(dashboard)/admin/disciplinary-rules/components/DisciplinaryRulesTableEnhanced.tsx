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
import { Shield, AlertTriangle, Ban, Search, X, Zap } from "lucide-react"
import { DisciplinaryRuleActions } from "./DisciplinaryRuleActions"
import { DataTable } from "@/components/ui/data-table"

interface DisciplinaryRulesTableEnhancedProps {
  rules: any[]
}

const ACTION_TYPE_LABELS = {
  WARNING: "Advertencia",
  WRITTEN_WARNING: "Advertencia Escrita",
  ADMINISTRATIVE_ACT: "Acta Administrativa",
  SUSPENSION: "Suspensión",
  TERMINATION: "Terminación",
}

const ACTION_TYPE_COLORS = {
  WARNING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  WRITTEN_WARNING: "bg-orange-100 text-orange-700 border-orange-200",
  ADMINISTRATIVE_ACT: "bg-red-100 text-red-700 border-red-200",
  SUSPENSION: "bg-purple-100 text-purple-700 border-purple-200",
  TERMINATION: "bg-gray-100 text-gray-700 border-gray-200",
}

export function DisciplinaryRulesTableEnhanced({ rules }: DisciplinaryRulesTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionTypeFilter, setActionTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

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
    // Tipo de acción
    {
      accessorKey: "actionType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo de Acción" />
      ),
      cell: ({ row }) => {
        const actionType = row.getValue("actionType") as keyof typeof ACTION_TYPE_LABELS
        return (
          <Badge className={ACTION_TYPE_COLORS[actionType]}>
            {ACTION_TYPE_LABELS[actionType]}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Disparador
    {
      accessorKey: "triggerType",
      header: "Disparador",
      cell: ({ row }) => {
        return <span className="text-sm">{row.getValue("triggerType")}</span>
      },
    },
    // Conteo
    {
      accessorKey: "triggerCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Conteo" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="font-mono">
            {row.getValue("triggerCount")}
          </Badge>
        )
      },
    },
    // Período
    {
      accessorKey: "periodDays",
      header: "Período",
      cell: ({ row }) => {
        const days = row.getValue("periodDays") as number
        return <span className="text-sm">{days} días</span>
      },
    },
    // Auto-aplicar
    {
      accessorKey: "autoApply",
      header: "Auto-aplicar",
      cell: ({ row }) => {
        const autoApply = row.getValue("autoApply")
        return autoApply ? (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            Sí
          </Badge>
        ) : (
          <Badge variant="outline">No</Badge>
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
        return <DisciplinaryRuleActions rule={row.original} />
      },
    },
  ]

  // Filtrar reglas
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        rule.name.toLowerCase().includes(searchLower) ||
        (rule.description && rule.description.toLowerCase().includes(searchLower)) ||
        rule.triggerType.toLowerCase().includes(searchLower)

      const matchesActionType =
        actionTypeFilter === "all" ||
        rule.actionType === actionTypeFilter

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rule.isActive) ||
        (statusFilter === "inactive" && !rule.isActive)

      return matchesSearch && matchesActionType && matchesStatus
    })
  }, [rules, searchTerm, actionTypeFilter, statusFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setActionTypeFilter("all")
    setStatusFilter("all")
  }

  const hasActiveFilters = searchTerm || actionTypeFilter !== "all" || statusFilter !== "all"

  const renderTable = (data: any[]) => (
    <DataTable
      columns={columns}
      data={data}
      deleteEndpoint="/api/disciplinary-rules/bulk-delete"
      itemName="regla disciplinaria"
    />
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todas ({rules.length})</TabsTrigger>
        <TabsTrigger value="active">Activas ({rules.filter(r => r.isActive).length})</TabsTrigger>
        <TabsTrigger value="auto-apply">Auto-aplicar ({rules.filter(r => r.autoApply).length})</TabsTrigger>
        <TabsTrigger value="suspension">Suspensiones ({rules.filter(r => r.actionType === "SUSPENSION").length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Lista de Reglas Disciplinarias
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

                <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="WARNING">Advertencia</SelectItem>
                    <SelectItem value="WRITTEN_WARNING">Advertencia Escrita</SelectItem>
                    <SelectItem value="ADMINISTRATIVE_ACT">Acta Administrativa</SelectItem>
                    <SelectItem value="SUSPENSION">Suspensión</SelectItem>
                    <SelectItem value="TERMINATION">Terminación</SelectItem>
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
                <Shield className="h-5 w-5 text-green-600" />
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

      <TabsContent value="auto-apply" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                Reglas con Aplicación Automática
              </CardTitle>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {rules.filter(r => r.autoApply).length} reglas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.autoApply))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="suspension" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                Reglas de Suspensión
              </CardTitle>
              <Badge variant="outline" className="text-red-600 border-red-200">
                {rules.filter(r => r.actionType === "SUSPENSION").length} reglas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.actionType === "SUSPENSION"))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
