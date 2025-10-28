"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Settings, Bell, BellOff, Calendar } from "lucide-react"
import { ConfigActions } from "./ConfigActions"

interface ConfigsTableProps {
  configs: any[]
}

const INCIDENT_TYPE_NAMES: Record<string, string> = {
  TURNOVER: "Rotación",
  ABSENTEEISM: "Ausentismo",
  TARDINESS: "Impuntualidad",
  OVERTIME: "Horas Extra",
}

const PERIOD_TYPE_NAMES: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
}

const OPERATOR_NAMES: Record<string, string> = {
  GT: ">",
  LT: "<",
  GTE: "≥",
  LTE: "≤",
  EQ: "=",
}

export function ConfigsTable({ configs }: ConfigsTableProps) {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [notificationFilter, setNotificationFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredConfigs = useMemo(() => {
    return configs.filter((config) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const typeName = INCIDENT_TYPE_NAMES[config.incidentType.name] || config.incidentType.name
      const deptName = config.department?.name || ""
      const matchesSearch =
        typeName.toLowerCase().includes(searchLower) ||
        deptName.toLowerCase().includes(searchLower)

      // Filtro de tipo de incidencia
      const matchesType =
        typeFilter === "all" || config.incidentType.name === typeFilter

      // Filtro de período
      const matchesPeriod =
        periodFilter === "all" || config.periodType === periodFilter

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && config.isActive) ||
        (statusFilter === "inactive" && !config.isActive)

      // Filtro de notificaciones
      const matchesNotification =
        notificationFilter === "all" ||
        (notificationFilter === "enabled" && config.notificationEnabled) ||
        (notificationFilter === "disabled" && !config.notificationEnabled)

      return matchesSearch && matchesType && matchesPeriod && matchesStatus && matchesNotification
    })
  }, [configs, searchTerm, typeFilter, periodFilter, statusFilter, notificationFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setPeriodFilter("all")
    setStatusFilter("all")
    setNotificationFilter("all")
  }

  const hasActiveFilters = searchTerm || typeFilter !== "all" || periodFilter !== "all" || statusFilter !== "all" || notificationFilter !== "all"

  // Función para renderizar la tabla
  const renderTable = (configsToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo de Incidencia</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Umbral</TableHead>
          <TableHead>Período</TableHead>
          <TableHead>Notificaciones</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configsToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <Settings className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron configuraciones con los filtros aplicados" : "No hay configuraciones registradas"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          configsToShow.map((config) => (
            <TableRow key={config.id} className="hover:bg-muted/50">
              {/* Tipo de Incidencia */}
              <TableCell>
                <Badge className={`
                  ${config.incidentType.name === "TURNOVER" ? "bg-purple-100 text-purple-700 border-purple-200" : ""}
                  ${config.incidentType.name === "ABSENTEEISM" ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                  ${config.incidentType.name === "TARDINESS" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : ""}
                  ${config.incidentType.name === "OVERTIME" ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
                `}>
                  {INCIDENT_TYPE_NAMES[config.incidentType.name] || config.incidentType.name}
                </Badge>
              </TableCell>

              {/* Departamento */}
              <TableCell>
                {config.department ? (
                  <div>
                    <p className="font-medium">{config.department.name}</p>
                    <p className="text-xs text-muted-foreground">{config.department.code}</p>
                  </div>
                ) : (
                  <Badge variant="outline">Global</Badge>
                )}
              </TableCell>

              {/* Umbral */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {OPERATOR_NAMES[config.thresholdOperator]} {parseFloat(config.thresholdValue).toFixed(2)}
                  </Badge>
                </div>
              </TableCell>

              {/* Período */}
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Calendar className="h-3 w-3" />
                  {PERIOD_TYPE_NAMES[config.periodType]}
                </Badge>
              </TableCell>

              {/* Notificaciones */}
              <TableCell>
                {config.notificationEnabled ? (
                  <div className="space-y-1">
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 w-fit">
                      <Bell className="h-3 w-3" />
                      Activas
                    </Badge>
                    {config.notificationEmails.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {config.notificationEmails.length} destinatario(s)
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <BellOff className="h-3 w-3" />
                    Desactivadas
                  </Badge>
                )}
              </TableCell>

              {/* Estado */}
              <TableCell>
                {config.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Inactiva
                  </Badge>
                )}
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-right">
                <ConfigActions config={config} />
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
        <TabsTrigger value="notifications">Con Notificaciones</TabsTrigger>
        <TabsTrigger value="monthly">Mensuales</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Lista de Configuraciones
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Búsqueda */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por tipo o departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro de Tipo */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="TURNOVER">Rotación</SelectItem>
                    <SelectItem value="ABSENTEEISM">Ausentismo</SelectItem>
                    <SelectItem value="TARDINESS">Impuntualidad</SelectItem>
                    <SelectItem value="OVERTIME">Horas Extra</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Período */}
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los períodos</SelectItem>
                    <SelectItem value="DAILY">Diario</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
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
                  {filteredConfigs.length} de {configs.length} configuraciones
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredConfigs)}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Activas */}
      <TabsContent value="active" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Configuraciones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(configs.filter(c => c.isActive))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Con Notificaciones */}
      <TabsContent value="notifications" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Con Notificaciones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(configs.filter(c => c.notificationEnabled))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Mensuales */}
      <TabsContent value="monthly" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Configuraciones Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(configs.filter(c => c.periodType === "MONTHLY"))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
