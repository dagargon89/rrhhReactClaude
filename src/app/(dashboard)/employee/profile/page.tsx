import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Clock,
  Hash,
  UserCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { redirect } from "next/navigation"

async function getEmployeeProfile(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          createdAt: true,
          lastLogin: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      position: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      defaultShift: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
        },
      },
    },
  })

  if (!employee) {
    throw new Error("Empleado no encontrado")
  }

  return employee
}

export default async function MyProfilePage() {
  const session = await auth()

  if (!session?.user?.employeeId) {
    redirect('/login')
  }

  const employee = await getEmployeeProfile(session.user.employeeId)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="border-green-500 text-green-700">Activo</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inactivo</Badge>
      case 'ON_LEAVE':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">De Permiso</Badge>
      case 'TERMINATED':
        return <Badge variant="destructive">Terminado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Información personal y detalles del empleado
        </p>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {employee.user.firstName} {employee.user.lastName}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {employee.position?.title || "Sin posición asignada"}
              </CardDescription>
            </div>
            {getStatusBadge(employee.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Código de Empleado */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Hash className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Código de Empleado</p>
                <p className="text-base font-medium">{employee.employeeCode}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                <p className="text-base font-medium">{employee.user.email}</p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-base font-medium">{employee.phone || "No registrado"}</p>
              </div>
            </div>

            {/* Dirección */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                <p className="text-base font-medium">{employee.address || "No registrada"}</p>
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
                <p className="text-base font-medium">
                  {employee.dateOfBirth
                    ? format(new Date(employee.dateOfBirth), "d 'de' MMMM 'de' yyyy", { locale: es })
                    : "No registrada"}
                </p>
              </div>
            </div>

            {/* Fecha de Contratación */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fecha de Contratación</p>
                <p className="text-base font-medium">
                  {employee.hireDate
                    ? format(new Date(employee.hireDate), "d 'de' MMMM 'de' yyyy", { locale: es })
                    : "No registrada"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Organizacional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Organizacional</CardTitle>
          <CardDescription>
            Detalles de tu posición en la organización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Departamento */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                <p className="text-base font-medium">
                  {employee.department?.name || "Sin departamento"}
                </p>
                {employee.department?.code && (
                  <p className="text-sm text-muted-foreground">
                    Código: {employee.department.code}
                  </p>
                )}
              </div>
            </div>

            {/* Posición */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Posición</p>
                <p className="text-base font-medium">
                  {employee.position?.title || "Sin posición"}
                </p>
                {employee.position?.description && (
                  <p className="text-sm text-muted-foreground">
                    {employee.position.description}
                  </p>
                )}
              </div>
            </div>

            {/* Turno Predeterminado */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Turno Predeterminado</p>
                <p className="text-base font-medium">
                  {employee.defaultShift?.name || "Sin turno asignado"}
                </p>
                {employee.defaultShift?.code && (
                  <p className="text-sm text-muted-foreground">
                    Código: {employee.defaultShift.code}
                  </p>
                )}
              </div>
            </div>

            {/* Tipo de Empleado */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tipo de Empleado</p>
                <p className="text-base font-medium">
                  {employee.employmentType === 'FULL_TIME' && 'Tiempo Completo'}
                  {employee.employmentType === 'PART_TIME' && 'Medio Tiempo'}
                  {employee.employmentType === 'CONTRACT' && 'Contrato'}
                  {employee.employmentType === 'TEMPORARY' && 'Temporal'}
                  {!employee.employmentType && 'No especificado'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de la Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
          <CardDescription>
            Detalles de tu cuenta de usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Nombre de Usuario */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nombre de Usuario</p>
                <p className="text-base font-medium">
                  {employee.user.username || "No asignado"}
                </p>
              </div>
            </div>

            {/* Fecha de Creación */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cuenta Creada</p>
                <p className="text-base font-medium">
                  {format(new Date(employee.user.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
            </div>

            {/* Último Inicio de Sesión */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Último Inicio de Sesión</p>
                <p className="text-base font-medium">
                  {employee.user.lastLogin
                    ? format(new Date(employee.user.lastLogin), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
                    : "Nunca"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota informativa */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Actualización de Datos
              </p>
              <p className="text-sm text-blue-800">
                Si necesitas actualizar algún dato de tu perfil, por favor contacta con el departamento de Recursos Humanos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
