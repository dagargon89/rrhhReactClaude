"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Clock, AlertCircle } from "lucide-react"
import { TardinessRuleActions } from "./TardinessRuleActions"

interface TardinessRulesTableProps {
  rules: any[]
}

export function TardinessRulesTable({ rules }: TardinessRulesTableProps) {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      // Filtro de búsqueda (nombre, descripción)
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        rule.name.toLowerCase().includes(searchLower) ||
        (rule.description && rule.description.toLowerCase().includes(searchLower))

      // Filtro de tipo
      const matchesType =
        typeFilter === "all" ||
        rule.type === typeFilter

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rule.isActive) ||
        (statusFilter === "inactive" && !rule.isActive)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [rules, searchTerm, typeFilter, statusFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
  }

  const hasActiveFilters = searchTerm || typeFilter !== "all" || statusFilter !== "all"

  // Función para formatear el rango de minutos
  const formatMinutesRange = (start: number, end: number | null) => {
    if (end === null) {
      return `${start}+ minutos`
    }
    return `${start}-${end} minutos`
  }

  // Función para renderizar la tabla
  const renderTable = (rulesToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Rango (minutos tarde)</TableHead>
          <TableHead>Acumulación</TableHead>
          <TableHead>Conversión</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rulesToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron reglas con los filtros aplicados" : "No hay reglas configuradas"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          rulesToShow.map((rule) => (
            <TableRow key={rule.id} className="hover:bg-muted/50">
              {/* Nombre y descripción */}
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

              {/* Tipo */}
              <TableCell>
                {rule.type === "LATE_ARRIVAL" ? (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Llegada Tardía
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Retardo Directo
                  </Badge>
                )}
              </TableCell>

              {/* Rango de minutos */}
              <TableCell>
                <span className="font-mono text-sm">
                  {formatMinutesRange(rule.startMinutesLate, rule.endMinutesLate)}
                </span>
              </TableCell>

              {/* Acumulación */}
              <TableCell>
                <Badge variant="outline">
                  {rule.accumulationCount} {rule.accumulationCount === 1 ? "vez" : "veces"}
                </Badge>
              </TableCell>

              {/* Conversión */}
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  → {rule.equivalentFormalTardies} {rule.equivalentFormalTardies === 1 ? "retardo" : "retardos"}
                </Badge>
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
                <TardinessRuleActions rule={rule} />
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
        <TabsTrigger value="late-arrival">Llegadas Tardías</TabsTrigger>
        <TabsTrigger value="direct">Retardos Directos</TabsTrigger>
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

                {/* Filtro de Tipo */}
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
              <Clock className="h-5 w-5 text-green-600" />
              Reglas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.isActive))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Llegadas Tardías */}
      <TabsContent value="late-arrival" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Reglas de Llegadas Tardías (Acumulativas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.type === "LATE_ARRIVAL"))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Retardos Directos */}
      <TabsContent value="direct" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Reglas de Retardos Directos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(rules.filter(r => r.type === "DIRECT_TARDINESS"))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
