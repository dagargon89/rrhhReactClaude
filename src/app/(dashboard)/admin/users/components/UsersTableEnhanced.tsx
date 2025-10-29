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
  User,
  Mail,
  Shield,
  ShieldCheck,
  UserCheck,
  Clock,
  UserPlus,
  Building2,
  Search,
  X,
} from "lucide-react"
import { UserActions } from "./UserActions"
import { DataTable } from "@/components/ui/data-table"

interface UsersTableEnhancedProps {
  users: any[]
}

export function UsersTableEnhanced({ users }: UsersTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [employeeFilter, setEmployeeFilter] = useState("all")

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
    // Usuario
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usuario" />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">
                @{user.username || "sin-usuario"}
              </p>
            </div>
          </div>
        )
      },
    },
    // Email
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{row.getValue("email")}</span>
          </div>
        )
      },
    },
    // Rol
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rol" />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <Badge
            variant={user.isSuperuser ? "default" : user.isStaff ? "secondary" : "outline"}
            className={
              user.isSuperuser
                ? "bg-purple-100 text-purple-700 border-purple-200"
                : user.isStaff
                ? "bg-blue-100 text-blue-700 border-blue-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }
          >
            {user.isSuperuser ? (
              <>
                <ShieldCheck className="h-3 w-3 mr-1" />
                Super Admin
              </>
            ) : user.isStaff ? (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Staff
              </>
            ) : (
              <>
                <User className="h-3 w-3 mr-1" />
                Usuario
              </>
            )}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Empleado
    {
      accessorKey: "employee",
      header: "Empleado",
      cell: ({ row }) => {
        const user = row.original
        return user.employee ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <UserPlus className="h-3 w-3 mr-1" />
              {user.employee.employeeCode}
            </Badge>
            {user.employee.department && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {user.employee.department.name}
              </div>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Sin empleado
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
        const isActive = row.getValue("isActive")
        return (
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
          >
            {isActive ? (
              <>
                <UserCheck className="h-3 w-3 mr-1" />
                Activo
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Inactivo
              </>
            )}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Fecha de registro
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Registrado" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(row.getValue("createdAt")).toLocaleDateString('es-ES')}
          </div>
        )
      },
    },
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <UserActions user={row.original} />
      },
    },
  ]

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.username && user.username.toLowerCase().includes(searchLower))

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "superuser" && user.isSuperuser) ||
        (roleFilter === "staff" && user.isStaff && !user.isSuperuser) ||
        (roleFilter === "user" && !user.isStaff && !user.isSuperuser)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive)

      const matchesEmployee =
        employeeFilter === "all" ||
        (employeeFilter === "with" && user.employee) ||
        (employeeFilter === "without" && !user.employee)

      return matchesSearch && matchesRole && matchesStatus && matchesEmployee
    })
  }, [users, searchTerm, roleFilter, statusFilter, employeeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
    setEmployeeFilter("all")
  }

  const hasActiveFilters = searchTerm || roleFilter !== "all" || statusFilter !== "all" || employeeFilter !== "all"

  const renderTable = (data: any[]) => (
    <DataTable
      columns={columns}
      data={data}
      deleteEndpoint="/api/users/bulk-delete"
      itemName="usuario"
    />
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todos ({users.length})</TabsTrigger>
        <TabsTrigger value="active">Activos ({users.filter(u => u.isActive).length})</TabsTrigger>
        <TabsTrigger value="admins">Administradores ({users.filter(u => u.isSuperuser || u.isStaff).length})</TabsTrigger>
        <TabsTrigger value="employees">Con Empleado ({users.filter(u => u.employee).length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Lista de Usuarios
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
                    placeholder="Buscar por nombre, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <Shield className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="superuser">Super Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <UserCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger>
                    <UserPlus className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with">Con empleado</SelectItem>
                    <SelectItem value="without">Sin empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredUsers.length} de {users.length} usuarios
                </Badge>
                {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredUsers)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="active" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Usuarios Activos
              </CardTitle>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {users.filter(user => user.isActive).length} usuarios
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(users.filter(user => user.isActive))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="admins" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Administradores
              </CardTitle>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {users.filter(user => user.isSuperuser || user.isStaff).length} administradores
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(users.filter(user => user.isSuperuser || user.isStaff))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="employees" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-orange-600" />
                Usuarios con Empleado
              </CardTitle>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {users.filter(user => user.employee).length} usuarios
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(users.filter(user => user.employee))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
