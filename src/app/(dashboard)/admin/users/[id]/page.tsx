import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  User, 
  Calendar, 
  Shield, 
  UserCheck, 
  ShieldCheck,
  Clock,
  Building2,
  Briefcase,
  UserX
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    },
  })

  return user
}

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatDateShort = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href={`/admin/users/${user.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Usuario
          </Link>
        </Button>
      </div>

      {/* Badges de estado y rol */}
      <div className="flex flex-wrap gap-3">
        {/* Estado */}
        {user.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <UserX className="h-3 w-3 mr-1" />
            Inactivo
          </Badge>
        )}

        {/* Rol */}
        {user.isSuperuser ? (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        ) : user.isStaff ? (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Staff
          </Badge>
        ) : (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            Usuario
          </Badge>
        )}

        {/* Empleado */}
        {user.employee && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Empleado: {user.employee.employeeCode}
          </Badge>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de la Cuenta */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Información de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre de Usuario
                  </p>
                  <p className="font-medium">{user.username || "No configurado"}</p>
                </div>
              </div>

              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Registro
                  </p>
                  <p className="font-medium">{formatDateShort(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Último Acceso
                  </p>
                  <p className="font-medium">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Personal */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{user.firstName}</p>
                </div>
              </div>

              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Apellido</p>
                  <p className="font-medium">{user.lastName}</p>
                </div>
              </div>

              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Verificación de Email</p>
                  <p className="font-medium">
                    {user.emailVerified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        No verificado
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles y Permisos */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Roles y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Estado de la Cuenta</span>
                </div>
                <div>
                  {user.isActive ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Activo
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Acceso Administrativo (Staff)</span>
                </div>
                <div>
                  {user.isStaff ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Habilitado
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Deshabilitado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Super Administrador</span>
                </div>
                <div>
                  {user.isSuperuser ? (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      Habilitado
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Deshabilitado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de permisos */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Resumen de Permisos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {user.isSuperuser && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Acceso total al sistema
                  </li>
                )}
                {user.isStaff && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Acceso a paneles administrativos
                  </li>
                )}
                {!user.isStaff && !user.isSuperuser && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                    Acceso básico de usuario
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Información del Empleado (si existe) */}
        {user.employee ? (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-600" />
                Información del Empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Código de Empleado</p>
                    <Badge className="font-mono text-lg">
                      {user.employee.employeeCode}
                    </Badge>
                  </div>
                </div>

                {user.employee.department && (
                  <div className="flex items-start justify-between py-3 border-b">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Departamento
                      </p>
                      <p className="font-medium">{user.employee.department.name}</p>
                    </div>
                  </div>
                )}

                {user.employee.position && (
                  <div className="flex items-start justify-between py-3 border-b">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Posición
                      </p>
                      <p className="font-medium">{user.employee.position.title}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between py-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Estado del Empleado</p>
                    <div>
                      {user.employee.status === "ACTIVE" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <UserX className="h-3 w-3 mr-1" />
                          {user.employee.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href={`/admin/employees/${user.employee.id}`}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Ver Detalles del Empleado
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <UserCheck className="h-5 w-5" />
                Sin Empleado Asociado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Este usuario no tiene un perfil de empleado asociado. Puedes crear uno desde la lista de usuarios.
              </p>
              <Button variant="outline" asChild>
                <Link href="/admin/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a la Lista
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
