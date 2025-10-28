"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { IncidentActions } from "./IncidentActions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface IncidentsTableProps {
  incidents: any[]
}

// Mapeo de nombres de tipos de incidencia
const incidentTypeNames: Record<string, { label: string; icon: any; color: string }> = {
  TURNOVER: {
    label: "Rotaci\u00f3n",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  ABSENTEEISM: {
    label: "Ausentismo",
    icon: TrendingDown,
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
  TARDINESS: {
    label: "Impuntualidad",
    icon: Activity,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  OVERTIME: {
    label: "Horas Extra",
    icon: Activity,
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
}

export function IncidentsTable({ incidents }: IncidentsTableProps) {
  // Estados para b\u00fasqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [scopeFilter, setScopeFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Filtro de b\u00fasqueda (empleado, departamento, notas)
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        (incident.employee &&
          `${incident.employee.firstName} ${incident.employee.lastName}`.toLowerCase().includes(searchLower)) ||
        (incident.employee?.employeeCode && incident.employee.employeeCode.toLowerCase().includes(searchLower)) ||
        (incident.department && incident.department.name.toLowerCase().includes(searchLower)) ||
        (incident.notes && incident.notes.toLowerCase().includes(searchLower))

      // Filtro de tipo
      const matchesType =
        typeFilter === "all" ||
        incident.incidentType.name === typeFilter

      // Filtro de alcance (empleado vs departamento)
      const matchesScope =
        scopeFilter === "all" ||
        (scopeFilter === "employee" && incident.employeeId) ||
        (scopeFilter === "department" && incident.departmentId && !incident.employeeId)

      return matchesSearch && matchesType && matchesScope
    })
  }, [incidents, searchTerm, typeFilter, scopeFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setScopeFilter("all")
  }

  const hasActiveFilters = searchTerm || typeFilter !== "all" || scopeFilter !== "all"

  // Agrupar incidencias por tipo para tabs
  const turnoverIncidents = filteredIncidents.filter(i => i.incidentType.name === "TURNOVER")
  const absenteeismIncidents = filteredIncidents.filter(i => i.incidentType.name === "ABSENTEEISM")
  const tardinessIncidents = filteredIncidents.filter(i => i.incidentType.name === "TARDINESS")
  const overtimeIncidents = filteredIncidents.filter(i => i.incidentType.name === "OVERTIME")

  // Funci\u00f3n para renderizar la tabla
  const renderTable = (incidentsToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Alcance</TableHead>
          <TableHead>Empleado/Departamento</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Notas</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidentsToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron incidencias con los filtros aplicados" : "No hay incidencias registradas"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          incidentsToShow.map((incident) => {
            const typeInfo = incidentTypeNames[incident.incidentType.name]
            const Icon = typeInfo?.icon || AlertTriangle

            return (
              <TableRow key={incident.id} className="hover:bg-muted/50">
                {/* Tipo */}
                <TableCell>
                  <Badge className={typeInfo?.color || "bg-gray-100 text-gray-700"}>
                    <Icon className="h-3 w-3 mr-1" />
                    {typeInfo?.label || incident.incidentType.name}
                  </Badge>
                </TableCell>

                {/* Fecha */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(new Date(incident.date), "dd MMM yyyy", { locale: es })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(incident.date), "EEEE", { locale: es })}
                    </span>
                  </div>
                </TableCell>

                {/* Alcance */}
                <TableCell>
                  {incident.employeeId ? (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Empleado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Departamento
                    </Badge>
                  )}
                </TableCell>

                {/* Empleado/Departamento */}
                <TableCell>
                  {incident.employee ? (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {incident.employee.firstName} {incident.employee.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {incident.employee.employeeCode}
                      </span>
                      {incident.employee.department && (
                        <span className="text-xs text-muted-foreground">
                          {incident.employee.department.name}
                        </span>
                      )}
                    </div>
                  ) : incident.department ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{incident.department.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {incident.department.code}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>

                {/* Valor */}
                <TableCell>
                  <span className="font-semibold text-lg">
                    {parseFloat(incident.value).toFixed(2)}
                  </span>
                </TableCell>

                {/* Notas */}
                <TableCell>
                  {incident.notes ? (
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {incident.notes}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Sin notas</span>
                  )}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <IncidentActions incident={incident} />
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all">
          Todas ({filteredIncidents.length})
        </TabsTrigger>
        <TabsTrigger value="turnover">
          Rotaci\u00f3n ({turnoverIncidents.length})
        </TabsTrigger>
        <TabsTrigger value="absenteeism">
          Ausentismo ({absenteeismIncidents.length})
        </TabsTrigger>
        <TabsTrigger value="tardiness">
          Impuntualidad ({tardinessIncidents.length})
        </TabsTrigger>
        <TabsTrigger value="overtime">
          Horas Extra ({overtimeIncidents.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Lista de Incidencias
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

              {/* Barra de b\u00fasqueda y filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* B\u00fasqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por empleado, departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro de Tipo */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo de incidencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="TURNOVER">Rotaci\u00f3n</SelectItem>
                    <SelectItem value="ABSENTEEISM">Ausentismo</SelectItem>
                    <SelectItem value="TARDINESS">Impuntualidad</SelectItem>
                    <SelectItem value="OVERTIME">Horas Extra</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Alcance */}
                <Select value={scopeFilter} onValueChange={setScopeFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Alcance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="employee">Empleado</SelectItem>
                    <SelectItem value="department">Departamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredIncidents.length} de {incidents.length} incidencias
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredIncidents)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="turnover">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Incidencias de Rotaci\u00f3n
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(turnoverIncidents)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="absenteeism">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Incidencias de Ausentismo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(absenteeismIncidents)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tardiness">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              Incidencias de Impuntualidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(tardinessIncidents)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="overtime">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Incidencias de Horas Extra
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(overtimeIncidents)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
