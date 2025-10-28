import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getEmployee(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          username: true,
          createdAt: true,
          lastLogin: true,
        },
      },
      department: true,
      position: true,
    },
  })

  return employee
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const employee = await getEmployee(params.id)

  if (!employee) {
    notFound()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700"
      case "INACTIVE":
        return "bg-gray-100 text-gray-700"
      case "ON_LEAVE":
        return "bg-yellow-100 text-yellow-700"
      case "TERMINATED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getEmploymentType = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Tiempo Completo"
      case "PART_TIME":
        return "Medio Tiempo"
      case "CONTRACT":
        return "Contrato"
      case "INTERN":
        return "Practicante"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/employees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {employee.user?.firstName || "N/A"} {employee.user?.lastName || "N/A"}
          </h1>
          <p className="text-muted-foreground">
            Código: {employee.employeeCode}
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/employees/${employee.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">
                  {employee.user?.firstName || "N/A"} {employee.user?.lastName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-medium">{employee.employeeCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                <p className="font-medium">
                  {formatDate(employee.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{employee.phone || "N/A"}</p>
              </div>
            </div>
            {employee.address && (
              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{employee.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información Laboral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium">
                  {employee.department?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posición</p>
                <p className="font-medium">
                  {employee.position?.title || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Empleo</p>
                <p className="font-medium">
                  {getEmploymentType(employee.employmentType)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Contratación</p>
                <p className="font-medium">
                  {formatDate(employee.hireDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    employee.status
                  )}`}
                >
                  {employee.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Usuario</p>
                <p className="font-medium">
                  {employee.user.username || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado de Cuenta</p>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    employee.user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {employee.user.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                <p className="font-medium">
                  {formatDate(employee.user.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Acceso</p>
                <p className="font-medium">
                  {formatDate(employee.user.lastLogin)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
