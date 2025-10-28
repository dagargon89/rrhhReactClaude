"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Clock, ToggleLeft } from "lucide-react"
import { WorkShiftActions } from "./WorkShiftActions"

interface WorkShiftsTableProps {
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

export function WorkShiftsTable({ workShifts }: WorkShiftsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [flexibleFilter, setFlexibleFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredShifts = useMemo(() => {
    return workShifts.filter((shift) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        shift.name.toLowerCase().includes(searchLower) ||
        shift.code.toLowerCase().includes(searchLower)

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && shift.isActive) ||
        (statusFilter === "inactive" && !shift.isActive)

      // Filtro de flexibilidad
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

  // Función para parsear workingHours si es necesario
  const parseWorkingHours = (workingHours: any): any[] => {
    if (!workingHours) return []
    if (Array.isArray(workingHours)) return workingHours
    if (typeof workingHours === 'string') {
      try {
        return JSON.parse(workingHours)
      } catch {
        return []
      }
    }
    return []
  }

  // Función para obtener días habilitados
  const getEnabledDays = (workingHours: any) => {
    const hours = parseWorkingHours(workingHours)
    return hours
      .filter(day => day.enabled)
      .map(day => day.day)
      .sort((a, b) => a - b)
  }

  // Función para obtener resumen de horarios
  const getScheduleSummary = (workingHours: any) => {
    const hours = parseWorkingHours(workingHours)
    const enabled = hours.filter(d => d.enabled)
    if (enabled.length === 0) return "Sin horarios"
    
    // Si todos tienen el mismo horario, mostrar uno solo
    const firstDay = enabled[0]
    const allSame = enabled.every(d => d.startTime === firstDay.startTime && d.endTime === firstDay.endTime)
    
    if (allSame) {
      return `${firstDay.startTime} - ${firstDay.endTime}`
    }
    
    return "Horarios variables"
  }

  const renderTable = (shiftsToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Horas/Semana</TableHead>
          <TableHead>Horario</TableHead>
          <TableHead>Días</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Horarios</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shiftsToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron turnos con los filtros aplicados" : "No hay turnos registrados"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          shiftsToShow.map((shift) => {
            const enabledDays = getEnabledDays(shift.workingHours)
            const scheduleSummary = getScheduleSummary(shift.workingHours)
            
            return (
              <TableRow key={shift.id} className="hover:bg-muted/50">
                {/* Nombre */}
                <TableCell>
                  <div className="font-medium">{shift.name}</div>
                  {shift.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {shift.description}
                    </div>
                  )}
                </TableCell>

                {/* Código */}
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {shift.code}
                  </Badge>
                </TableCell>

                {/* Horas Semanales */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono font-medium">
                      {Number(shift.weeklyHours).toFixed(1)} hrs
                    </span>
                  </div>
                </TableCell>

                {/* Horario */}
                <TableCell>
                  <span className="text-sm font-mono">
                    {scheduleSummary}
                  </span>
                </TableCell>

                {/* Días */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {enabledDays.map((day: number) => (
                      <Badge key={day} variant="secondary" className="text-xs">
                        {DAYS_LABELS[day]}
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                {/* Tipo */}
                <TableCell>
                  {shift.isFlexible ? (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      <ToggleLeft className="h-3 w-3 mr-1" />
                      Flexible
                    </Badge>
                  ) : (
                    <Badge variant="outline">Fijo</Badge>
                  )}
                </TableCell>

                {/* Horarios asignados */}
                <TableCell>
                  <Badge variant="secondary">
                    {shift._count.schedules}
                  </Badge>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  {shift.isActive ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <WorkShiftActions workShift={shift} />
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )

  // Vistas predefinidas
  const activeShifts = filteredShifts.filter(s => s.isActive)
  const flexibleShifts = filteredShifts.filter(s => s.isFlexible)

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">Todos ({filteredShifts.length})</TabsTrigger>
        <TabsTrigger value="active">Activos ({activeShifts.length})</TabsTrigger>
        <TabsTrigger value="flexible">Flexibles ({flexibleShifts.length})</TabsTrigger>
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

              {/* Barra de búsqueda y filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, código..."
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
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Flexibilidad */}
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

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredShifts.length} de {workShifts.length} turnos
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredShifts)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Turnos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(activeShifts)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="flexible">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5 text-purple-600" />
              Turnos Flexibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(flexibleShifts)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
