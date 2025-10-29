"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Users,
  Search,
  Building2,
  Briefcase,
  UserCheck,
  UserX,
  Clock,
  Mail,
  X,
  Calendar,
} from "lucide-react"
import { EmployeeActions } from "./EmployeeActions"
import { DataTable } from "@/components/ui/data-table"

interface EmployeesTableEnhancedProps {
  employees: any[]
}

export function EmployeesTableEnhanced({ employees }: EmployeesTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("all")

  // Obtener departamentos únicos para el filtro
  const departments = useMemo(() => {
    const uniqueDepts = new Set(
      employees
        .filter(emp => emp.department)
        .map(emp => emp.department.name)
    )
    return Array.from(uniqueDepts).sort()
  }, [employees])

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
    // Empleado
    {
      accessorKey: "user",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empleado" />
      ),
      cell: ({ row }) => {
        const employee = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee.profilePicture || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {employee.user?.firstName?.[0] || "E"}{employee.user?.lastName?.[0] || "E"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {employee.user?.firstName || "N/A"} {employee.user?.lastName || "N/A"}
              </p>
            </div>
          </div>
        )
      },
    },
    // Código
    {
      accessorKey: "employeeCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Código" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="font-mono">
            {row.getValue("employeeCode")}
          </Badge>
        )
      },
    },
    // Email
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const employee = row.original
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{employee.user?.email || "N/A"}</span>
          </div>
        )
      },
    },
    // Departamento
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Departamento" />
      ),
      cell: ({ row }) => {
        const employee = row.original
        return employee.department ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{employee.department.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Sin departamento</span>
        )
      },
    },
    // Posición
    {
      accessorKey: "position",
      header: "Posición",
      cell: ({ row }) => {
        const employee = row.original
        return employee.position ? (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{employee.position.title}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Sin posición</span>
        )
      },
    },
    // Turno
    {
      accessorKey: "defaultShift",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Turno" />
      ),
      cell: ({ row }) => {
        const employee = row.original
        return employee.defaultShift ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{employee.defaultShift.name}</span>
              <Badge variant="outline" className="text-xs w-fit">
                {employee.defaultShift.code}
              </Badge>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Sin turno</span>
        )
      },
    },
    // Tipo de empleo
    {
      accessorKey: "employmentType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        const typeConfig: Record<string, { label: string; className: string }> = {
          FULL_TIME: { label: "Tiempo Completo", className: "bg-blue-100 text-blue-700 border-blue-200" },
          PART_TIME: { label: "Medio Tiempo", className: "bg-purple-100 text-purple-700 border-purple-200" },
          CONTRACT: { label: "Contrato", className: "bg-orange-100 text-orange-700 border-orange-200" },
          INTERN: { label: "Pasante", className: "bg-pink-100 text-pink-700 border-pink-200" },
        }

        const type = row.getValue("employmentType") as string
        const config = typeConfig[type] || typeConfig.FULL_TIME

        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    // Estado
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => {
        const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
          ACTIVE: { label: "Activo", icon: UserCheck, className: "bg-green-100 text-green-700 border-green-200" },
          INACTIVE: { label: "Inactivo", icon: UserX, className: "bg-gray-100 text-gray-700 border-gray-200" },
          ON_LEAVE: { label: "De Permiso", icon: Clock, className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
          TERMINATED: { label: "Terminado", icon: UserX, className: "bg-red-100 text-red-700 border-red-200" },
        }

        const status = row.getValue("status") as string
        const config = statusConfig[status] || statusConfig.INACTIVE
        const Icon = config.icon

        return (
          <Badge variant="outline" className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        )
      },
    },
    // Fecha de ingreso
    {
      accessorKey: "hireDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha de Ingreso" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(row.getValue("hireDate")).toLocaleDateString('es-ES')}
          </div>
        )
      },
    },
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <EmployeeActions employee={row.original} />
      },
    },
  ]

  // Filtrar empleados según los criterios de búsqueda y filtros
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        employee.employeeCode.toLowerCase().includes(searchLower) ||
        (employee.user?.firstName && employee.user.firstName.toLowerCase().includes(searchLower)) ||
        (employee.user?.lastName && employee.user.lastName.toLowerCase().includes(searchLower)) ||
        (employee.user?.email && employee.user.email.toLowerCase().includes(searchLower)) ||
        (employee.department?.name && employee.department.name.toLowerCase().includes(searchLower)) ||
        (employee.position?.title && employee.position.title.toLowerCase().includes(searchLower)) ||
        (employee.defaultShift?.name && employee.defaultShift.name.toLowerCase().includes(searchLower)) ||
        (employee.defaultShift?.code && employee.defaultShift.code.toLowerCase().includes(searchLower))

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" ||
        employee.status === statusFilter

      // Filtro de departamento
      const matchesDepartment =
        departmentFilter === "all" ||
        (employee.department && employee.department.name === departmentFilter)

      // Filtro de tipo de empleo
      const matchesEmploymentType =
        employmentTypeFilter === "all" ||
        employee.employmentType === employmentTypeFilter

      return matchesSearch && matchesStatus && matchesDepartment && matchesEmploymentType
    })
  }, [employees, searchTerm, statusFilter, departmentFilter, employmentTypeFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDepartmentFilter("all")
    setEmploymentTypeFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || departmentFilter !== "all" || employmentTypeFilter !== "all"

  const renderTable = (data: any[]) => (
    <DataTable
      columns={columns}
      data={data}
      deleteEndpoint="/api/employees/bulk-delete"
      itemName="empleado"
    />
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todos ({employees.length})</TabsTrigger>
        <TabsTrigger value="active">Activos ({employees.filter(emp => emp.status === "ACTIVE").length})</TabsTrigger>
        <TabsTrigger value="fulltime">Tiempo Completo ({employees.filter(emp => emp.employmentType === "FULL_TIME").length})</TabsTrigger>
        <TabsTrigger value="withdept">Con Departamento ({employees.filter(emp => emp.department).length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Lista de Empleados
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, código, email, turno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <UserCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    <SelectItem value="ON_LEAVE">De Permiso</SelectItem>
                    <SelectItem value="TERMINATED">Terminado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                  <SelectTrigger>
                    <Briefcase className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo de Empleo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="FULL_TIME">Tiempo Completo</SelectItem>
                    <SelectItem value="PART_TIME">Medio Tiempo</SelectItem>
                    <SelectItem value="CONTRACT">Contrato</SelectItem>
                    <SelectItem value="INTERN">Pasante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredEmployees.length} de {employees.length} empleados
                </Badge>
                {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredEmployees)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Empleados Activos
              </CardTitle>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {employees.filter(emp => emp.status === "ACTIVE").length} empleados
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(employees.filter(emp => emp.status === "ACTIVE"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fulltime" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Tiempo Completo
              </CardTitle>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {employees.filter(emp => emp.employmentType === "FULL_TIME").length} empleados
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(employees.filter(emp => emp.employmentType === "FULL_TIME"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="withdept" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Con Departamento
              </CardTitle>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {employees.filter(emp => emp.department).length} empleados
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(employees.filter(emp => emp.department))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
