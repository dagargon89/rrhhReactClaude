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
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  AlertCircle,
  Palette,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación (sin name, ya que no se puede cambiar)
const updateLeaveTypeSchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(10),
  description: z.string().optional(),
  requiresApproval: z.boolean().default(true),
  maxDaysPerYear: z.string().optional(),
  isPaid: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Debe ser un color hexadecimal válido"),
  isActive: z.boolean().default(true),
})

type UpdateLeaveTypeFormData = z.infer<typeof updateLeaveTypeSchema>

const colorPresets = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Púrpura", value: "#8B5CF6" },
  { name: "Naranja", value: "#F59E0B" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Índigo", value: "#6366F1" },
]

const getLeaveTypeName = (name: string) => {
  switch (name) {
    case "VACATION":
      return "Vacaciones"
    case "SICK_LEAVE":
      return "Incapacidad médica"
    case "PERSONAL":
      return "Personal"
    case "MATERNITY":
      return "Maternidad"
    case "PATERNITY":
      return "Paternidad"
    case "UNPAID":
      return "Sin goce de sueldo"
    default:
      return name
  }
}

export default function EditLeaveTypePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [leaveTypeData, setLeaveTypeData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateLeaveTypeFormData>({
    resolver: zodResolver(updateLeaveTypeSchema),
  })

  const watchedColor = watch("color")
  const watchedIsPaid = watch("isPaid")
  const watchedRequiresApproval = watch("requiresApproval")
  const watchedIsActive = watch("isActive")

  // Cargar datos del tipo de permiso
  useEffect(() => {
    const loadLeaveType = async () => {
      try {
        const response = await fetch(`/api/leave-types/${params.id}`)

        if (response.ok) {
          const leaveType = await response.json()
          setLeaveTypeData(leaveType)

          // Reset form con datos del tipo de permiso
          reset({
            code: leaveType.code,
            description: leaveType.description || "",
            requiresApproval: leaveType.requiresApproval,
            maxDaysPerYear: leaveType.maxDaysPerYear?.toString() || "",
            isPaid: leaveType.isPaid,
            color: leaveType.color,
            isActive: leaveType.isActive,
          })
        } else {
          toast.error("Error al cargar los datos del tipo de permiso")
          router.push("/admin/leave-types")
        }
      } catch (error) {
        toast.error("Error al cargar los datos del tipo de permiso")
        router.push("/admin/leave-types")
      } finally {
        setLoadingData(false)
      }
    }

    loadLeaveType()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdateLeaveTypeFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        maxDaysPerYear: data.maxDaysPerYear ? parseInt(data.maxDaysPerYear) : null,
      }

      const response = await fetch(`/api/leave-types/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Tipo de permiso actualizado exitosamente")
        router.push(`/admin/leave-types/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar tipo de permiso")
      }
    } catch (error) {
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
  if (!leaveTypeData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Tipo de permiso no encontrado</h3>
            <p className="text-sm text-muted-foreground">
              El tipo de permiso que buscas no existe o ha sido eliminado
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/leave-types">
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
          <Link href={`/admin/leave-types/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Editar Tipo de Permiso
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar {getLeaveTypeName(leaveTypeData.name)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Información Básica */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de permiso (solo lectura) */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium text-muted-foreground">
                Tipo de Permiso (No editable)
              </Label>
              <p className="text-lg font-semibold mt-1">
                {getLeaveTypeName(leaveTypeData.name)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                El tipo de permiso no se puede cambiar una vez creado
              </p>
            </div>

            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Código *
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="VAC, SICK, etc."
                {...register("code")}
                disabled={isLoading}
                className="h-11"
              />
              {errors.code && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Describe el propósito y uso de este tipo de permiso..."
                {...register("description")}
                disabled={isLoading}
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Configuración */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Configuración y Límites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Días máximos por año */}
              <div className="space-y-2">
                <Label htmlFor="maxDaysPerYear" className="text-sm font-medium">
                  Días Máximos por Año (Opcional)
                </Label>
                <Input
                  id="maxDaysPerYear"
                  type="number"
                  placeholder="15"
                  {...register("maxDaysPerYear")}
                  disabled={isLoading}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Deja vacío para ilimitado
                </p>
                {errors.maxDaysPerYear && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.maxDaysPerYear.message}
                  </p>
                )}
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-medium">
                  Color *
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="color"
                      type="text"
                      placeholder="#3B82F6"
                      {...register("color")}
                      disabled={isLoading}
                      className="h-11"
                    />
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded border-2 border-white shadow"
                      style={{ backgroundColor: watchedColor }}
                    />
                  </div>
                </div>
                {errors.color && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.color.message}
                  </p>
                )}
              </div>
            </div>

            {/* Presets de colores */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colores Predefinidos
              </Label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setValue("color", preset.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 hover:border-primary transition-colors"
                    style={{
                      borderColor:
                        watchedColor === preset.value ? preset.value : "transparent",
                    }}
                  >
                    <div
                      className="h-5 w-5 rounded border-2 border-white shadow"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span className="text-sm">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 pt-4 border-t">
              {/* Es pagado */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPaid"
                  checked={watchedIsPaid}
                  onCheckedChange={(checked) =>
                    setValue("isPaid", checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="isPaid" className="text-sm font-medium cursor-pointer">
                  Es pagado (Con goce de sueldo)
                </Label>
              </div>

              {/* Requiere aprobación */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={watchedRequiresApproval}
                  onCheckedChange={(checked) =>
                    setValue("requiresApproval", checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="requiresApproval"
                  className="text-sm font-medium cursor-pointer"
                >
                  Requiere aprobación
                </Label>
              </div>

              {/* Activo */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watchedIsActive}
                  onCheckedChange={(checked) =>
                    setValue("isActive", checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Activo (Disponible para uso)
                </Label>
              </div>
            </div>

            {/* Resumen de configuración */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Resumen de Configuración:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  {watchedIsPaid
                    ? "Permiso con goce de sueldo"
                    : "Permiso sin goce de sueldo"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  {watchedRequiresApproval
                    ? "Requiere aprobación"
                    : "No requiere aprobación"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  {watchedIsActive
                    ? "Disponible para solicitudes"
                    : "No disponible"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href={`/admin/leave-types/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
