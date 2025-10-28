"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Briefcase, Users, Building2 } from "lucide-react"
import { PositionActions } from "./PositionActions"

interface PositionsTableProps {
  positions: any[]
}

const LEVEL_LABELS: Record<string, string> = {
  ENTRY: "Inicial",
  MID: "Medio",
  SENIOR: "Senior",
  MANAGER: "Gerente",
  DIRECTOR: "Director",
}

const LEVEL_COLORS: Record<string, string> = {
  ENTRY: "bg-gray-100 text-gray-700 border-gray-200",
  MID: "bg-blue-100 text-blue-700 border-blue-200",
  SENIOR: "bg-purple-100 text-purple-700 border-purple-200",
  MANAGER: "bg-orange-100 text-orange-700 border-orange-200",
  DIRECTOR: "bg-red-100 text-red-700 border-red-200",
}

export function PositionsTable({ positions }: PositionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Obtener departamentos únicos
  const uniqueDepartments = useMemo(() => {
    const depts = new Map()
    positions.forEach(pos => {
      if (pos.department && !depts.has(pos.department.id)) {
        depts.set(pos.department.id, pos.department)
      }
    })
    return Array.from(depts.values())
  }, [positions])

  // Filtrado optimizado con useMemo
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        pos.title.toLowerCase().includes(searchLower) ||
        pos.code.toLowerCase().includes(searchLower) ||
        (pos.description && pos.description.toLowerCase().includes(searchLower)) ||
        pos.department.name.toLowerCase().includes(searchLower)

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && pos.isActive) ||
        (statusFilter === "inactive" && !pos.isActive)

      // Filtro de nivel
      const matchesLevel =
        levelFilter === "all" ||
        pos.level === levelFilter

      // Filtro de departamento
      const matchesDepartment =
        departmentFilter === "all" ||
        pos.departmentId === departmentFilter

      return matchesSearch && matchesStatus && matchesLevel && matchesDepartment
    })
  }, [positions, searchTerm, statusFilter, levelFilter, departmentFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setLevelFilter("all")
    setDepartmentFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || levelFilter !== "all" || departmentFilter !== "all"

  const renderTable = (positionsToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Posición</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Empleados</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positionsToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron posiciones con los filtros aplicados" : "No hay posiciones registradas"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          positionsToShow.map((pos) => (
            <TableRow key={pos.id} className="hover:bg-muted/50">
              {/* Posición */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{pos.title}</div>
                  {pos.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {pos.description}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Código */}
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {pos.code}
                </Badge>
              </TableCell>

              {/* Departamento */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{pos.department.name}</span>
                </div>
              </TableCell>

              {/* Nivel */}
              <TableCell>
                <Badge className={LEVEL_COLORS[pos.level]}>
                  {LEVEL_LABELS[pos.level]}
                </Badge>
              </TableCell>

              {/* Empleados */}
              <TableCell>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <Users className="h-3 w-3" />
                  {pos._count.employees}
                </Badge>
              </TableCell>

              {/* Estado */}
              <TableCell>
                {pos.isActive ? (
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
                <PositionActions position={pos} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  // Vistas predefinidas
  const activePositions = filteredPositions.filter(p => p.isActive)
  const managerialPositions = filteredPositions.filter(p => p.level === "MANAGER" || p.level === "DIRECTOR")
  const withEmployees = filteredPositions.filter(p => p._count.employees > 0)

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todos ({filteredPositions.length})</TabsTrigger>
        <TabsTrigger value="active">Activos ({activePositions.length})</TabsTrigger>
        <TabsTrigger value="managerial">Gerenciales ({managerialPositions.length})</TabsTrigger>
        <TabsTrigger value="with-employees">Con Empleados ({withEmployees.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Lista de Posiciones
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, código..."
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

                {/* Filtro de Nivel */}
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los niveles</SelectItem>
                    <SelectItem value="ENTRY">Inicial</SelectItem>
                    <SelectItem value="MID">Medio</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="DIRECTOR">Director</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Departamento */}
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los departamentos</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredPositions.length} de {positions.length} posiciones
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredPositions)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Posiciones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(activePositions)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="managerial">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-600" />
              Posiciones Gerenciales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(managerialPositions)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="with-employees">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Con Empleados Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(withEmployees)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
