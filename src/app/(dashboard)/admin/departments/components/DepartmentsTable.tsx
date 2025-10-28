"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Building2, Users, GitBranch } from "lucide-react"
import { DepartmentActions } from "./DepartmentActions"

interface DepartmentsTableProps {
  departments: any[]
}

export function DepartmentsTable({ departments }: DepartmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [managerFilter, setManagerFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        dept.name.toLowerCase().includes(searchLower) ||
        dept.code.toLowerCase().includes(searchLower) ||
        (dept.description && dept.description.toLowerCase().includes(searchLower))

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && dept.isActive) ||
        (statusFilter === "inactive" && !dept.isActive)

      // Filtro de manager
      const matchesManager =
        managerFilter === "all" ||
        (managerFilter === "with" && dept.managerId) ||
        (managerFilter === "without" && !dept.managerId)

      return matchesSearch && matchesStatus && matchesManager
    })
  }, [departments, searchTerm, statusFilter, managerFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setManagerFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || managerFilter !== "all"

  const renderTable = (depsToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Departamento</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Manager</TableHead>
          <TableHead>Empleados</TableHead>
          <TableHead>Sub-Deptos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {depsToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron departamentos con los filtros aplicados" : "No hay departamentos registrados"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          depsToShow.map((dept) => (
            <TableRow key={dept.id} className="hover:bg-muted/50">
              {/* Departamento */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{dept.name}</div>
                  {dept.parentDepartment && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {dept.parentDepartment.name}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Código */}
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {dept.code}
                </Badge>
              </TableCell>

              {/* Manager */}
              <TableCell>
                {dept.manager ? (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {dept.manager.user.firstName} {dept.manager.user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dept.manager.employeeCode}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin manager</span>
                )}
              </TableCell>

              {/* Empleados */}
              <TableCell>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <Users className="h-3 w-3" />
                  {dept._count.employees}
                </Badge>
              </TableCell>

              {/* Sub-departamentos */}
              <TableCell>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <GitBranch className="h-3 w-3" />
                  {dept._count.subDepartments}
                </Badge>
              </TableCell>

              {/* Estado */}
              <TableCell>
                {dept.isActive ? (
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
                <DepartmentActions department={dept} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  // Vistas predefinidas
  const activeDepartments = filteredDepartments.filter(d => d.isActive)
  const withManager = filteredDepartments.filter(d => d.managerId)
  const topLevel = filteredDepartments.filter(d => !d.parentDepartmentId)

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todos ({filteredDepartments.length})</TabsTrigger>
        <TabsTrigger value="active">Activos ({activeDepartments.length})</TabsTrigger>
        <TabsTrigger value="managers">Con Manager ({withManager.length})</TabsTrigger>
        <TabsTrigger value="top">Nivel Superior ({topLevel.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Lista de Departamentos
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

                {/* Filtro de Manager */}
                <Select value={managerFilter} onValueChange={setManagerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with">Con manager</SelectItem>
                    <SelectItem value="without">Sin manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredDepartments.length} de {departments.length} departamentos
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredDepartments)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Departamentos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(activeDepartments)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="managers">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Con Manager Asignado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(withManager)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="top">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Departamentos de Nivel Superior
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable(topLevel)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
