"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  User, 
  UserPlus, 
  Search, 
  Filter,
  Shield,
  ShieldCheck,
  UserCheck,
  Clock,
  Mail,
  Building2,
  X
} from "lucide-react"
import { UserActions } from "./UserActions"

interface UsersTableProps {
  users: any[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [employeeFilter, setEmployeeFilter] = useState("all")

  // Filtrar usuarios según los criterios de búsqueda y filtros
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.username && user.username.toLowerCase().includes(searchLower))

      // Filtro de rol
      const matchesRole = 
        roleFilter === "all" ||
        (roleFilter === "superuser" && user.isSuperuser) ||
        (roleFilter === "staff" && user.isStaff && !user.isSuperuser) ||
        (roleFilter === "user" && !user.isStaff && !user.isSuperuser)

      // Filtro de estado
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive)

      // Filtro de empleado
      const matchesEmployee = 
        employeeFilter === "all" ||
        (employeeFilter === "with" && user.employee) ||
        (employeeFilter === "without" && !user.employee)

      return matchesSearch && matchesRole && matchesStatus && matchesEmployee
    })
  }, [users, searchTerm, roleFilter, statusFilter, employeeFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
    setEmployeeFilter("all")
  }

  const hasActiveFilters = searchTerm || roleFilter !== "all" || statusFilter !== "all" || employeeFilter !== "all"

  // Función para renderizar la tabla
  const renderTable = (usersToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Empleado</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Registrado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usersToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <User className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron usuarios con los filtros aplicados" : "No hay usuarios registrados"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          usersToShow.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {user.employee ? (
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
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.isActive ? "default" : "destructive"}
                  className={user.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
                >
                  {user.isActive ? (
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
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <UserActions user={user} />
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
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="active">Activos</TabsTrigger>
        <TabsTrigger value="admins">Administradores</TabsTrigger>
        <TabsTrigger value="employees">Con Empleado</TabsTrigger>
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

              {/* Barra de búsqueda y filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro de Rol */}
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

                {/* Filtro de Estado */}
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

                {/* Filtro de Empleado */}
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

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredUsers.length} de {users.length} usuarios
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
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
