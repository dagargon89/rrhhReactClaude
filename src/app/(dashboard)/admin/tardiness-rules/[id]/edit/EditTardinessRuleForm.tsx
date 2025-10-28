"use client"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ArrowLeft,
  Save,
  Loader2,
  Clock,
  AlertCircle,
  Settings
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"

// Esquema de validación
const updateTardinessRuleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  type: z.enum(["LATE_ARRIVAL", "DIRECT_TARDINESS"]),
  startMinutesLate: z.number().min(0, "Los minutos deben ser mayores o iguales a 0"),
  endMinutesLate: z.number().min(0).optional().nullable(),
  accumulationCount: z.number().min(1, "La acumulación debe ser al menos 1"),
  equivalentFormalTardies: z.number().min(1, "La conversión debe ser al menos 1"),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.endMinutesLate !== null && data.endMinutesLate !== undefined) {
      return data.endMinutesLate > data.startMinutesLate
    }
    return true
  },
  {
    message: "Los minutos de fin deben ser mayores que los minutos de inicio",
    path: ["endMinutesLate"],
  }
)

type UpdateTardinessRuleFormData = z.infer<typeof updateTardinessRuleSchema>

interface EditTardinessRuleFormProps {
  rule: {
    id: string
    name: string
    description: string | null
    type: "LATE_ARRIVAL" | "DIRECT_TARDINESS"
    startMinutesLate: number
    endMinutesLate: number | null
    accumulationCount: number
    equivalentFormalTardies: number
    isActive: boolean
  }
}

export function EditTardinessRuleForm({ rule }: EditTardinessRuleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UpdateTardinessRuleFormData>({
    resolver: zodResolver(updateTardinessRuleSchema),
    defaultValues: {
      name: rule.name,
      description: rule.description || "",
      type: rule.type,
      startMinutesLate: rule.startMinutesLate,
      endMinutesLate: rule.endMinutesLate,
      accumulationCount: rule.accumulationCount,
      equivalentFormalTardies: rule.equivalentFormalTardies,
      isActive: rule.isActive,
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: UpdateTardinessRuleFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tardiness-rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Regla actualizada exitosamente")
        router.push("/admin/tardiness-rules")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar regla")
      }
    } catch (error) {
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Card 1: Información básica */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre de la Regla *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Llegada tardía leve 8:31-8:45"
              {...register("name")}
              disabled={isLoading}
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
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
              placeholder="Descripción detallada de la regla..."
              {...register("description")}
              disabled={isLoading}
              rows={3}
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

      {/* Card 2: Tipo y Rango */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Tipo y Rango de Minutos Tarde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de regla */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Regla *</Label>
            <RadioGroup
              value={watchedValues.type}
              onValueChange={(value) => setValue("type", value as any)}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="LATE_ARRIVAL" id="late-arrival" />
                <Label htmlFor="late-arrival" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium">Llegada Tardía (Acumulativa)</p>
                      <p className="text-xs text-muted-foreground">
                        Se acumulan hasta convertirse en retardos formales
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="DIRECT_TARDINESS" id="direct-tardiness" />
                <Label htmlFor="direct-tardiness" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium">Retardo Directo</p>
                      <p className="text-xs text-muted-foreground">
                        Se convierten inmediatamente en retardos formales
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Rango de minutos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inicio */}
            <div className="space-y-2">
              <Label htmlFor="startMinutesLate" className="text-sm font-medium">
                Minutos Tarde (Inicio) *
              </Label>
              <Input
                id="startMinutesLate"
                type="number"
                min="0"
                {...register("startMinutesLate", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
              {errors.startMinutesLate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.startMinutesLate.message}
                </p>
              )}
            </div>

            {/* Fin (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="endMinutesLate" className="text-sm font-medium">
                Minutos Tarde (Fin) - Opcional
              </Label>
              <Input
                id="endMinutesLate"
                type="number"
                min="0"
                placeholder="Dejar vacío para sin límite"
                {...register("endMinutesLate", {
                  valueAsNumber: true,
                  setValueAs: (v) => v === "" || v === undefined ? null : Number(v)
                })}
                disabled={isLoading}
                className="h-11"
              />
              {errors.endMinutesLate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.endMinutesLate.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Acumulación y Conversión */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Acumulación y Conversión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conteo de acumulación */}
            <div className="space-y-2">
              <Label htmlFor="accumulationCount" className="text-sm font-medium">
                Conteo de Acumulación *
              </Label>
              <Input
                id="accumulationCount"
                type="number"
                min="1"
                {...register("accumulationCount", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Número de veces que debe ocurrir para convertirse
              </p>
              {errors.accumulationCount && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.accumulationCount.message}
                </p>
              )}
            </div>

            {/* Retardos formales equivalentes */}
            <div className="space-y-2">
              <Label htmlFor="equivalentFormalTardies" className="text-sm font-medium">
                Retardos Formales Equivalentes *
              </Label>
              <Input
                id="equivalentFormalTardies"
                type="number"
                min="1"
                {...register("equivalentFormalTardies", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Número de retardos formales que genera la conversión
              </p>
              {errors.equivalentFormalTardies && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.equivalentFormalTardies.message}
                </p>
              )}
            </div>
          </div>

          {/* Resumen dinámico */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Vista previa de la regla:</h4>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Tipo:</strong>{" "}
                {watchedValues.type === "LATE_ARRIVAL" ? "Llegada Tardía (Acumulativa)" : "Retardo Directo"}
              </p>
              <p>
                <strong>Rango:</strong>{" "}
                {watchedValues.startMinutesLate} - {watchedValues.endMinutesLate || "∞"} minutos tarde
              </p>
              <p>
                <strong>Conversión:</strong>{" "}
                {watchedValues.accumulationCount} {watchedValues.accumulationCount === 1 ? "vez" : "veces"} → {" "}
                {watchedValues.equivalentFormalTardies} {watchedValues.equivalentFormalTardies === 1 ? "retardo" : "retardos"} {watchedValues.equivalentFormalTardies === 1 ? "formal" : "formales"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Estado */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={watchedValues.isActive}
              onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
              Regla activa
            </Label>
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
          <Link href="/admin/tardiness-rules">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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
  )
}
