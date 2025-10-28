"use client"

import { useState } from "react"
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
  Save,
  Loader2,
  FileText,
  Info,
  AlertCircle,
  Palette,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación
const createLeaveTypeSchema = z.object({
  name: z.enum(["VACATION", "SICK_LEAVE", "PERSONAL", "MATERNITY", "PATERNITY", "UNPAID"]),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(10),
  description: z.string().optional(),
  requiresApproval: z.boolean().default(true),
  maxDaysPerYear: z.string().optional(),
  isPaid: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Debe ser un color hexadecimal válido"),
  isActive: z.boolean().default(true),
})

type CreateLeaveTypeFormData = z.infer<typeof createLeaveTypeSchema>

const leaveTypeNames = {
  VACATION: "Vacaciones",
  SICK_LEAVE: "Incapacidad médica",
  PERSONAL: "Personal",
  MATERNITY: "Maternidad",
  PATERNITY: "Paternidad",
  UNPAID: "Sin goce de sueldo",
}

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

export default function NewLeaveTypePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateLeaveTypeFormData>({
    resolver: zodResolver(createLeaveTypeSchema),
    defaultValues: {
      requiresApproval: true,
      isPaid: true,
      isActive: true,
      color: "#3B82F6",
    },
  })

  const watchedColor = watch("color")
  const watchedIsPaid = watch("isPaid")
  const watchedRequiresApproval = watch("requiresApproval")
  const watchedIsActive = watch("isActive")

  const onSubmit = async (data: CreateLeaveTypeFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        maxDaysPerYear: data.maxDaysPerYear ? parseInt(data.maxDaysPerYear) : null,
      }

      const response = await fetch("/api/leave-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Tipo de permiso creado exitosamente")
        router.push("/admin/leave-types")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear tipo de permiso")
      }
    } catch (error) {
      console.error("Error creating leave type:", error)
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
          <Link href="/admin/leave-types">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Crear Tipo de Permiso
          </h1>
          <p className="text-lg text-muted-foreground">
            Configura un nuevo tipo de permiso para el sistema
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-1">Información importante:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>El tipo de permiso definirá las reglas para solicitudes</li>
            <li>El código debe ser único y no se podrá cambiar después</li>
            <li>Los días máximos por año son opcionales</li>
          </ul>
        </AlertDescription>
      </Alert>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Permiso */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Tipo de Permiso *
                </Label>
                <Select
                  onValueChange={(value) => setValue("name", value as any)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(leaveTypeNames).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
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
                      borderColor: watchedColor === preset.value ? preset.value : "transparent",
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
                  onCheckedChange={(checked) => setValue("isPaid", checked as boolean)}
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
                  onCheckedChange={(checked) => setValue("requiresApproval", checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="requiresApproval" className="text-sm font-medium cursor-pointer">
                  Requiere aprobación
                </Label>
              </div>

              {/* Activo */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watchedIsActive}
                  onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
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
                  {watchedIsPaid ? "Permiso con goce de sueldo" : "Permiso sin goce de sueldo"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  {watchedRequiresApproval ? "Requiere aprobación" : "No requiere aprobación"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  {watchedIsActive ? "Disponible para solicitudes" : "No disponible"}
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
            <Link href="/admin/leave-types">
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
                Creando tipo...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crear Tipo de Permiso
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
