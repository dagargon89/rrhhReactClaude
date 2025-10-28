import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Building2,
  FileText,
  Users,
  GitBranch,
  UserCheck,
  Calendar,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getDepartment(id: string) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      manager: {
        select: {
          id: true,
          employeeCode: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      parentDepartment: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      subDepartments: {
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      },
      employees: {
        select: {
          id: true,
          employeeCode: true,
          status: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        take: 10,
      },
      positions: {
        select: {
          id: true,
          title: true,
          code: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          employees: true,
          subDepartments: true,
          positions: true,
        },
      },
    },
  })

  return department
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const department = await getDepartment(params.id)

  if (!department) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/departments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {department.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground font-mono">{department.code}</p>
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href={`/admin/departments/${department.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Departamento
          </Link>
        </Button>
      </div>

      {/* Badges de estado */}
      <div className="flex flex-wrap gap-3">
        {department.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Inactivo
          </Badge>
        )}

        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {department._count.employees} empleados
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          {department._count.subDepartments} subdepartamentos
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          {department._count.positions} posiciones
        </Badge>
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Información Básica */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Nombre */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Nombre del Departamento
                  </p>
                  <p className="font-medium">{department.name}</p>
                </div>
              </div>

              {/* Código */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Código
                  </p>
                  <Badge className="font-mono">{department.code}</Badge>
                </div>
              </div>

              {/* Descripción */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </p>
                  <p className="font-medium text-sm">
                    {department.description || "Sin descripción"}
                  </p>
                </div>
              </div>

              {/* Fecha de creación */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Creación
                  </p>
                  <p className="font-medium">{formatDate(department.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Jerarquía */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600" />
              Jerarquía Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Manager */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Manager
                  </p>
                  {department.manager ? (
                    <div>
                      <p className="font-medium">
                        {department.manager.user.firstName} {department.manager.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {department.manager.employeeCode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {department.manager.user.email}
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-muted-foreground">Sin manager asignado</p>
                  )}
                </div>
              </div>

              {/* Departamento Padre */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Departamento Padre
                  </p>
                  {department.parentDepartment ? (
                    <div>
                      <p className="font-medium">{department.parentDepartment.name}</p>
                      <Badge variant="outline" className="font-mono mt-1">
                        {department.parentDepartment.code}
                      </Badge>
                    </div>
                  ) : (
                    <p className="font-medium text-muted-foreground">Nivel superior</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Subdepartamentos */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-orange-600" />
              Subdepartamentos ({department._count.subDepartments})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {department.subDepartments.length > 0 ? (
              <div className="space-y-3">
                {department.subDepartments.map((subDept) => (
                  <Link
                    key={subDept.id}
                    href={`/admin/departments/${subDept.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{subDept.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {subDept.code}
                        </p>
                      </div>
                    </div>
                    {subDept.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay subdepartamentos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Empleados */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Empleados ({department._count.employees})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {department.employees.length > 0 ? (
              <div className="space-y-3">
                {department.employees.map((emp) => (
                  <Link
                    key={emp.id}
                    href={`/admin/employees/${emp.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {emp.user.firstName} {emp.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {emp.employeeCode}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{emp.status}</Badge>
                  </Link>
                ))}
                {department._count.employees > 10 && (
                  <Link
                    href={`/admin/employees?departmentId=${department.id}`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                  >
                    Ver todos los {department._count.employees} empleados
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay empleados asignados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card 5: Posiciones */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Posiciones ({department._count.positions})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {department.positions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {department.positions.map((position) => (
                  <Link
                    key={position.id}
                    href={`/admin/positions/${position.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{position.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {position.code}
                        </p>
                      </div>
                    </div>
                    {position.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay posiciones asignadas
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
