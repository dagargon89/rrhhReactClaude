import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  User, 
  UserPlus, 
  Shield,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import { UsersTable } from "./components/UsersTable"

async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  return users
}

export default async function UsersPage() {
  const users = await getUsers()

  // Estadísticas
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.isActive).length
  const adminUsers = users.filter(user => user.isSuperuser || user.isStaff).length
  const usersWithEmployee = users.filter(user => user.employee).length

  // Serializar los datos para pasarlos al componente cliente
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null,
    lastLogin: user.lastLogin?.toISOString() || null,
    employee: user.employee ? {
      ...user.employee,
      dateOfBirth: user.employee.dateOfBirth?.toISOString() || null,
      hireDate: user.employee.hireDate.toISOString(),
      createdAt: user.employee.createdAt.toISOString(),
      updatedAt: user.employee.updatedAt.toISOString(),
    } : null,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Usuarios
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Usuarios
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalUsers}</div>
              <p className="text-xs text-blue-700 mt-1">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Usuarios Activos
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{activeUsers}</div>
              <p className="text-xs text-green-700 mt-1">
                {((activeUsers / totalUsers) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Administradores
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{adminUsers}</div>
              <p className="text-xs text-purple-700 mt-1">
                Con permisos administrativos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Con Empleado
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserPlus className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{usersWithEmployee}</div>
              <p className="text-xs text-orange-700 mt-1">
                Tienen empleado asociado
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de usuarios con búsqueda y filtros */}
      <UsersTable users={serializedUsers} />
    </div>
  )
}
