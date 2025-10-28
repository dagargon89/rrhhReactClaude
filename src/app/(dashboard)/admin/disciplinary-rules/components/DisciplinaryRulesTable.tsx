"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Shield, AlertTriangle, Ban, FileText } from "lucide-react"
import { DisciplinaryRuleActions } from "./DisciplinaryRuleActions"

interface DisciplinaryRulesTableProps {
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

export function DisciplinaryRulesTable({ rules }: DisciplinaryRulesTableProps) {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [actionTypeFilter, setActionTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        rule.name.toLowerCase().includes(searchLower) ||
        (rule.description && rule.description.toLowerCase().includes(searchLower)) ||
        rule.triggerType.toLowerCase().includes(searchLower)

      // Filtro de tipo de acción
      const matchesActionType =
        actionTypeFilter === "all" ||
        rule.actionType === actionTypeFilter

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rule.isActive) ||
        (statusFilter === "inactive" && !rule.isActive)

      return matchesSearch && matchesActionType && matchesStatus
    })
  }, [rules, searchTerm, actionTypeFilter, statusFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setActionTypeFilter("all")
    setStatusFilter("all")
  }

  const hasActiveFilters = searchTerm || actionTypeFilter !== "all" || statusFilter !== "all"

  // Función para renderizar la tabla
  const renderTable = (rulesToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo de Acción</TableHead>
          <TableHead>Disparador</TableHead>
          <TableHead>Conteo</TableHead>
          <TableHead>Período</TableHead>
          <TableHead>Auto-aplicar</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rulesToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron reglas con los filtros aplicados" : "No hay reglas configuradas"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          rulesToShow.map((rule) => (
            <TableRow key={rule.id} className="hover:bg-muted/50">
              {/* Nombre */}
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{rule.name}</p>
                  {rule.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {rule.description}
                    </p>
                  )}
                </div>
              </TableCell>

              {/* Tipo de acción */}
              <TableCell>
                <Badge className={ACTION_TYPE_COLORS[rule.actionType as keyof typeof ACTION_TYPE_COLORS]}>
                  {ACTION_TYPE_LABELS[rule.actionType as keyof typeof ACTION_TYPE_LABELS]}
                </Badge>
              </TableCell>

              {/* Disparador */}
              <TableCell>
                <span className="text-sm">{rule.triggerType}</span>
              </TableCell>

              {/* Conteo */}
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {rule.triggerCount}
                </Badge>
              </TableCell>

              {/* Período */}
              <TableCell>
                <span className="text-sm">{rule.periodDays} días</span>
              </TableCell>

              {/* Auto-aplicar */}
              <TableCell>
                {rule.autoApply ? (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Sí
                  </Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </TableCell>

              {/* Estado */}
              <TableCell>
                {rule.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Inactiva
                  </Badge>
                )}
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-right">
                <DisciplinaryRuleActions rule={rule} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todas</TabsTrigger>
        <TabsTrigger value="active">Activas</TabsTrigger>
        <TabsTrigger value="auto-apply">Auto-aplicar</TabsTrigger>
        <TabsTrigger value="suspension">Suspensiones</TabsTrigger>
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

              {/* Barra de búsqueda y filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro de Tipo de Acción */}
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

                {/* Filtro de Estado */}
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

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredRules.length} de {rules.length} reglas
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredRules)}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Activas */}
      <TabsContent value="active" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Reglas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.isActive))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Auto-aplicar */}
      <TabsContent value="auto-apply" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              Reglas con Aplicación Automática
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.autoApply))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Suspensiones */}
      <TabsContent value="suspension" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              Reglas de Suspensión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.actionType === "SUSPENSION"))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
