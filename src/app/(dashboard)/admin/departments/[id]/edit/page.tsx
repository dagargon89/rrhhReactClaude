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
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  GitBranch,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const updateDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  description: z.string().optional(),
  managerId: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  isActive: z.boolean().default(true),
})

type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>

export default function EditDepartmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [departmentData, setDepartmentData] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<UpdateDepartmentFormData>({
    resolver: zodResolver(updateDepartmentSchema),
  })

  const watchedValues = watch()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptRes, employeesRes, departmentsRes] = await Promise.all([
          fetch(`/api/departments/${params.id}`),
          fetch("/api/employees"),
          fetch("/api/departments"),
        ])

        if (deptRes.ok && employeesRes.ok && departmentsRes.ok) {
          const dept = await deptRes.json()
          const employeesData = await employeesRes.json()
          const departmentsData = await departmentsRes.json()

          setDepartmentData(dept)
          setEmployees(employeesData.employees || employeesData)
          const allDepartments = Array.isArray(departmentsData) ? departmentsData : departmentsData.departments || []
          // Filtrar el departamento actual de la lista de padres posibles
          setDepartments(allDepartments.filter((d: any) => d.id !== params.id))

          reset({
            name: dept.name,
            code: dept.code,
            description: dept.description || "",
            managerId: dept.managerId || "",
            parentDepartmentId: dept.parentDepartmentId || "",
            isActive: dept.isActive,
          })
        } else {
          toast.error("Error al cargar los datos del departamento")
          router.push("/admin/departments")
        }
      } catch (error) {
        toast.error("Error al cargar los datos")
        router.push("/admin/departments")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdateDepartmentFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        managerId: data.managerId || null,
        parentDepartmentId: data.parentDepartmentId || null,
      }

      const response = await fetch(`/api/departments/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Departamento actualizado exitosamente")
        router.push(`/admin/departments/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar departamento")
      }
    } catch (error) {
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!departmentData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Departamento no encontrado</h3>
            <p className="text-sm text-muted-foreground">
              El departamento que buscas no existe o ha sido eliminado
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/departments/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Editar Departamento
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar información de {departmentData.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Departamento *</Label>
                <Input id="name" {...register("name")} disabled={isLoading} className="h-11" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input id="code" {...register("code")} disabled={isLoading} className="h-11" />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea id="description" {...register("description")} disabled={isLoading} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600" />
              Jerarquía Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="managerId">Manager (Opcional)</Label>
                <Select
                  onValueChange={(value) => setValue("managerId", value === "none" ? undefined : value)}
                  defaultValue={departmentData.managerId || "none"}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar empleado" />
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

              <div className="space-y-2">
                <Label htmlFor="parentDepartmentId">Departamento Padre (Opcional)</Label>
                <Select
                  onValueChange={(value) => setValue("parentDepartmentId", value === "none" ? undefined : value)}
                  defaultValue={departmentData.parentDepartmentId || "none"}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Nivel superior" />
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

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Estado del Departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" {...register("isActive")} disabled={isLoading} />
              <Label htmlFor="isActive">Departamento activo</Label>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Resumen:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Nombre: <span className="font-medium">{watchedValues.name}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Código: <span className="font-medium">{watchedValues.code}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Estado: <span className="font-medium">{watchedValues.isActive ? "Activo" : "Inactivo"}</span></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href={`/admin/departments/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando cambios...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
