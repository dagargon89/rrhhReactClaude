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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Calendar,
  TrendingUp,
  User,
  Building2,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validaci\u00f3n (similar al de creaci\u00f3n)
const updateIncidentSchema = z.object({
  incidentTypeId: z.string().min(1, "Debe seleccionar un tipo de incidencia"),
  date: z.string().min(1, "La fecha es requerida"),
  value: z.string().min(1, "El valor es requerido").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "El valor debe ser un n\u00famero mayor o igual a 0"
  }),
  scope: z.enum(["employee", "department"]),
  employeeId: z.string().optional(),
  departmentId: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => {
  if (data.scope === "employee" && !data.employeeId) {
    return false
  }
  if (data.scope === "department" && !data.departmentId) {
    return false
  }
  return true
}, {
  message: "Debe seleccionar un empleado o departamento seg\u00fan el alcance",
  path: ["scope"]
})

type UpdateIncidentFormData = z.infer<typeof updateIncidentSchema>

export default function EditIncidentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [incidentData, setIncidentData] = useState<any>(null)
  const [incidentTypes, setIncidentTypes] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UpdateIncidentFormData>({
    resolver: zodResolver(updateIncidentSchema),
  })

  const watchedValues = watch()
  const selectedScope = watch("scope")
  const selectedTypeId = watch("incidentTypeId")

  // Obtener tipo seleccionado
  const selectedType = incidentTypes.find(t => t.id === selectedTypeId)

  // Cargar datos de la incidencia y listas
  useEffect(() => {
    const loadData = async () => {
      try {
        const [incidentRes, typesRes, employeesRes, departmentsRes] = await Promise.all([
          fetch(`/api/incidents/${params.id}`),
          fetch("/api/incident-types"),
          fetch("/api/employees"),
          fetch("/api/departments"),
        ])

        if (incidentRes.ok) {
          const incident = await incidentRes.json()
          setIncidentData(incident)

          // Reset form con datos de la incidencia
          const dateStr = new Date(incident.date).toISOString().split('T')[0]
          reset({
            incidentTypeId: incident.incidentTypeId,
            date: dateStr,
            value: incident.value.toString(),
            scope: incident.employeeId ? "employee" : "department",
            employeeId: incident.employeeId || "",
            departmentId: incident.departmentId || "",
            notes: incident.notes || "",
          })
        } else {
          toast.error("Error al cargar los datos de la incidencia")
          router.push("/admin/incidents")
        }

        if (typesRes.ok) {
          const typesData = await typesRes.json()
          setIncidentTypes(typesData.filter((t: any) => t.isActive))
        }

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json()
          setEmployees(employeesData.employees || employeesData)
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json()
          setDepartments(departmentsData.departments || departmentsData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos")
        router.push("/admin/incidents")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdateIncidentFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        incidentTypeId: data.incidentTypeId,
        date: new Date(data.date).toISOString(),
        value: parseFloat(data.value),
        employeeId: data.scope === "employee" ? data.employeeId : undefined,
        departmentId: data.scope === "department" ? data.departmentId : undefined,
        notes: data.notes || undefined,
      }

      const response = await fetch(`/api/incidents/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Incidencia actualizada exitosamente")
        router.push(`/admin/incidents/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar incidencia")
      }
    } catch (error) {
      console.error("Error updating incident:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  // Skeleton mientras carga
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

  // Estado de no encontrado
  if (!incidentData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Incidencia no encontrada</h3>
            <p className="text-sm text-muted-foreground">
              La incidencia que buscas no existe o ha sido eliminada
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/incidents">
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/incidents/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Editar Incidencia
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar informaci\u00f3n de la incidencia
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Tipo y Fecha */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Informaci\u00f3n B\u00e1sica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Incidencia */}
              <div className="space-y-2">
                <Label htmlFor="incidentTypeId" className="text-sm font-medium">
                  Tipo de Incidencia *
                </Label>
                <Select
                  value={watchedValues.incidentTypeId}
                  onValueChange={(value) => setValue("incidentTypeId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {type.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.incidentTypeId && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.incidentTypeId.message}
                  </p>
                )}
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Fecha *
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.date && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {errors.date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm font-medium">
                Valor *
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("value")}
                disabled={isLoading}
                className="h-11"
              />
              {errors.value && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {errors.value.message}
                </p>
              )}
              {selectedType && (
                <p className="text-xs text-muted-foreground">
                  M\u00e9todo de c\u00e1lculo: <span className="font-semibold">{selectedType.calculationMethod}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Alcance (Empleado o Departamento) */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Alcance de la Incidencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selector de alcance */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Alcance *</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-employee"
                    value="employee"
                    {...register("scope")}
                    disabled={isLoading}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="scope-employee" className="font-normal cursor-pointer">
                    Empleado espec\u00edfico
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-department"
                    value="department"
                    {...register("scope")}
                    disabled={isLoading}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="scope-department" className="font-normal cursor-pointer">
                    Departamento completo
                  </Label>
                </div>
              </div>
            </div>

            {/* Campo condicional: Empleado */}
            {selectedScope === "employee" && (
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-sm font-medium">
                  Empleado *
                </Label>
                <Select
                  value={watchedValues.employeeId}
                  onValueChange={(value) => setValue("employeeId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.employeeCode} - {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {errors.employeeId.message}
                  </p>
                )}
              </div>
            )}

            {/* Campo condicional: Departamento */}
            {selectedScope === "department" && (
              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-sm font-medium">
                  Departamento *
                </Label>
                <Select
                  value={watchedValues.departmentId}
                  onValueChange={(value) => setValue("departmentId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.code} - {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {errors.departmentId.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Notas adicionales */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Notas Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notas (Opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Detalles adicionales sobre la incidencia..."
                {...register("notes")}
                disabled={isLoading}
                rows={4}
                maxLength={500}
              />
              {errors.notes && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {errors.notes.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {watchedValues.notes?.length || 0}/500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informaci\u00f3n de la incidencia original */}
        <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-sm text-orange-700">Informaci\u00f3n Original</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Creado</p>
                <p className="font-semibold text-xs">
                  {new Date(incidentData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">\u00daltima Actualizaci\u00f3n</p>
                <p className="font-semibold text-xs">
                  {new Date(incidentData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acci\u00f3n */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={isLoading}
          >
            <Link href={`/admin/incidents/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
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
