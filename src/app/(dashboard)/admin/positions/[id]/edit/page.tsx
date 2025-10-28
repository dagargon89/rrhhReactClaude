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
import { ArrowLeft, Save, Loader2, Briefcase, Building2, TrendingUp, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const updatePositionSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20),
  description: z.string().optional(),
  departmentId: z.string().cuid("Departamento inválido"),
  level: z.enum(["ENTRY", "MID", "SENIOR", "MANAGER", "DIRECTOR"]),
  isActive: z.boolean().default(true),
})

type UpdatePositionFormData = z.infer<typeof updatePositionSchema>

const LEVEL_LABELS: Record<string, string> = {
  ENTRY: "Inicial / Entry Level",
  MID: "Intermedio / Mid Level",
  SENIOR: "Senior",
  MANAGER: "Gerente / Manager",
  DIRECTOR: "Director",
}

export default function EditPositionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [positionData, setPositionData] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UpdatePositionFormData>({
    resolver: zodResolver(updatePositionSchema),
  })

  const watchedValues = watch()

  // Cargar datos de la posición y departamentos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar posición
        const posResponse = await fetch(`/api/positions/${params.id}`)

        if (!posResponse.ok) {
          toast.error("Error al cargar los datos de la posición")
          router.push("/admin/positions")
          return
        }

        const position = await posResponse.json()
        setPositionData(position)

        // Cargar departamentos
        const deptResponse = await fetch("/api/departments")
        if (deptResponse.ok) {
          const deptData = await deptResponse.json()
          setDepartments(Array.isArray(deptData) ? deptData : deptData.departments || [])
        }

        // Reset form con datos de la posición
        reset({
          title: position.title,
          code: position.code,
          description: position.description || "",
          departmentId: position.departmentId,
          level: position.level,
          isActive: position.isActive,
        })
      } catch (error) {
        console.error("Error:", error)
        toast.error("Error al cargar los datos")
        router.push("/admin/positions")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdatePositionFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/positions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Posición actualizada exitosamente")
        router.push(`/admin/positions/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar posición")
      }
    } catch (error) {
      console.error("Error updating position:", error)
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
  if (!positionData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Posición no encontrada</h3>
            <p className="text-sm text-muted-foreground">
              La posición que buscas no existe o ha sido eliminada
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/positions">
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
          <Link href={`/admin/positions/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Editar Posición
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar información de {positionData.title}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Información Básica */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Posición *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  disabled={isLoading}
                  placeholder="Desarrollador Full Stack"
                  className="h-11"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  {...register("code")}
                  disabled={isLoading}
                  placeholder="DEV-FS"
                  className="h-11"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                disabled={isLoading}
                placeholder="Descripción de las responsabilidades y requisitos del puesto..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Departamento y Nivel */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Departamento y Nivel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Departamento */}
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departamento *</Label>
                <Select
                  onValueChange={(value) => setValue("departmentId", value)}
                  disabled={isLoading || departments.length === 0}
                  defaultValue={positionData.departmentId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={departments.length === 0 ? "Cargando..." : "Seleccionar departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-destructive">{errors.departmentId.message}</p>
                )}
              </div>

              {/* Nivel */}
              <div className="space-y-2">
                <Label htmlFor="level">Nivel *</Label>
                <Select
                  onValueChange={(value: any) => setValue("level", value)}
                  disabled={isLoading}
                  defaultValue={positionData.level}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
              <TrendingUp className="h-5 w-5 text-green-600" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                {...register("isActive")}
                disabled={isLoading}
              />
              <Label htmlFor="isActive">Posición activa</Label>
            </div>

            {/* Resumen dinámico */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Resumen:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span>Título: <span className="font-medium">{watchedValues.title || positionData.title}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Código: <span className="font-medium">{watchedValues.code || positionData.code}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span>Nivel: <span className="font-medium">
                    {watchedValues.level ? LEVEL_LABELS[watchedValues.level] : LEVEL_LABELS[positionData.level]}
                  </span></span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Estado: <span className="font-medium">
                    {watchedValues.isActive !== undefined ? (watchedValues.isActive ? "Activo" : "Inactivo") : (positionData.isActive ? "Activo" : "Inactivo")}
                  </span></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del departamento actual */}
        {positionData.department && (
          <Card className="border-0 shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Building2 className="h-5 w-5" />
                Departamento Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nombre:</span>
                  <span className="font-medium">{positionData.department.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Código:</span>
                  <span className="font-mono text-sm">{positionData.department.code}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={isLoading}
          >
            <Link href={`/admin/positions/${params.id}`}>
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
