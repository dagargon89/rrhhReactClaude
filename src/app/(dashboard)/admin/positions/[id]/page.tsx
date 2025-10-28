import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Briefcase, FileText, Users, Building2, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

const LEVEL_LABELS: Record<string, string> = {
  ENTRY: "Inicial / Entry Level",
  MID: "Intermedio / Mid Level",
  SENIOR: "Senior",
  MANAGER: "Gerente / Manager",
  DIRECTOR: "Director",
}

const LEVEL_COLORS: Record<string, string> = {
  ENTRY: "bg-gray-100 text-gray-700 border-gray-200",
  MID: "bg-blue-100 text-blue-700 border-blue-200",
  SENIOR: "bg-purple-100 text-purple-700 border-purple-200",
  MANAGER: "bg-orange-100 text-orange-700 border-orange-200",
  DIRECTOR: "bg-red-100 text-red-700 border-red-200",
}

async function getPosition(id: string) {
  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      department: true,
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
      _count: {
        select: {
          employees: true,
        },
      },
    },
  })

  return position
}

export default async function PositionDetailPage({ params }: { params: { id: string } }) {
  const position = await getPosition(params.id)

  if (!position) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/positions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {position.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground font-mono">{position.code}</p>
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href={`/admin/positions/${position.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Posición
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {position.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">Inactivo</Badge>
        )}
        <Badge className={LEVEL_COLORS[position.level]}>{LEVEL_LABELS[position.level]}</Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {position._count.employees} empleados
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Título de la Posición
              </p>
              <p className="font-medium">{position.title}</p>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Código
              </p>
              <Badge className="font-mono mt-1">{position.code}</Badge>
            </div>
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descripción
              </p>
              <p className="font-medium text-sm mt-1">{position.description || "Sin descripción"}</p>
            </div>
            <div className="py-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Creación
              </p>
              <p className="font-medium">{formatDate(position.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Departamento y Nivel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-3 border-b">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departamento
              </p>
              <div className="mt-1">
                <p className="font-medium">{position.department.name}</p>
                <Badge variant="outline" className="font-mono mt-1">{position.department.code}</Badge>
              </div>
            </div>
            <div className="py-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Nivel
              </p>
              <Badge className={`${LEVEL_COLORS[position.level]} mt-1`}>
                {LEVEL_LABELS[position.level]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Empleados ({position._count.employees})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {position.employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {position.employees.map((emp) => (
                  <Link
                    key={emp.id}
                    href={`/admin/employees/${emp.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">
                          {emp.user.firstName} {emp.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{emp.employeeCode}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{emp.status}</Badge>
                  </Link>
                ))}
                {position._count.employees > 10 && (
                  <div className="col-span-full text-center text-sm text-blue-600 py-2">
                    Ver todos los {position._count.employees} empleados
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay empleados asignados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
