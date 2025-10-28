"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Building2,
  Loader2,
  Info,
  Users,
  GitBranch,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const createDepartmentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20),
  description: z.string().optional(),
  managerId: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  isActive: z.boolean().default(true),
})

type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>

export default function NewDepartmentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      isActive: true,
    },
  })

  const watchedValues = watch()

  // Cargar empleados y departamentos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesRes, departmentsRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/departments"),
        ])

        if (employeesRes.ok && departmentsRes.ok) {
          const employeesData = await employeesRes.json()
          const departmentsData = await departmentsRes.json()

          setEmployees(employeesData.employees || employeesData)
          setDepartments(Array.isArray(departmentsData) ? departmentsData : departmentsData.departments || [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar datos")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const onSubmit = async (data: CreateDepartmentFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        managerId: data.managerId || null,
        parentDepartmentId: data.parentDepartmentId || null,
      }

      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Departamento creado exitosamente")
        router.push("/admin/departments")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear departamento")
      }
    } catch (error) {
      console.error("Error creating department:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
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
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear Nuevo Departamento
          </h1>
          <p className="text-lg text-muted-foreground">
            Agrega un nuevo departamento a la estructura organizacional
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-2">Información sobre departamentos:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>El código debe ser único y se usa para identificación interna</li>
            <li>Puedes asignar un manager (empleado) responsable del departamento</li>
            <li>Los departamentos pueden tener un departamento padre para crear jerarquías</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Información Básica */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre del Departamento *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Recursos Humanos"
                  {...register("name")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Código *
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="RRHH"
                  {...register("code")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.code && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Descripción del departamento y sus responsabilidades..."
                {...register("description")}
                disabled={isLoading}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manager */}
              <div className="space-y-2">
                <Label htmlFor="managerId" className="text-sm font-medium">
                  Manager (Opcional)
                </Label>
                <Select
                  onValueChange={(value) => setValue("managerId", value === "none" ? undefined : value)}
                  disabled={isLoading || loadingData}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar empleado"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin manager</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.user.firstName} {emp.user.lastName} - {emp.employeeCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Departamento Padre */}
              <div className="space-y-2">
                <Label htmlFor="parentDepartmentId" className="text-sm font-medium">
                  Departamento Padre (Opcional)
                </Label>
                <Select
                  onValueChange={(value) => setValue("parentDepartmentId", value === "none" ? undefined : value)}
                  disabled={isLoading || loadingData}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Nivel superior"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nivel superior</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Estado */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Estado del Departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                {...register("isActive")}
                disabled={isLoading}
              />
              <Label htmlFor="isActive" className="text-sm font-medium">
                Departamento activo
              </Label>
            </div>

            {/* Resumen */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Resumen:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>
                    Nombre: <span className="font-medium">{watchedValues.name || "Sin definir"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>
                    Código: <span className="font-medium">{watchedValues.code || "Sin definir"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>
                    Estado: <span className="font-medium">{watchedValues.isActive ? "Activo" : "Inactivo"}</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={isLoading}
          >
            <Link href="/admin/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading || loadingData}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando departamento...
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Crear Departamento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
