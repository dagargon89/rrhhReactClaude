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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  AlertTriangle,
  Settings,
  Bell
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"

// Esquema de validación
const updateDisciplinaryRuleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  triggerType: z.string().min(1, "El tipo de disparador es requerido"),
  triggerCount: z.number().min(1, "El conteo debe ser al menos 1"),
  periodDays: z.number().min(1, "El período debe ser al menos 1 día"),
  actionType: z.enum(["WARNING", "WRITTEN_WARNING", "ADMINISTRATIVE_ACT", "SUSPENSION", "TERMINATION"]),
  suspensionDays: z.number().min(0).optional().nullable(),
  affectsSalary: z.boolean().default(false),
  requiresApproval: z.boolean().default(true),
  autoApply: z.boolean().default(false),
  notificationEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.actionType === "SUSPENSION") {
      return data.suspensionDays !== null && data.suspensionDays !== undefined && data.suspensionDays > 0
    }
    return true
  },
  {
    message: "Las suspensiones deben tener días de suspensión especificados",
    path: ["suspensionDays"],
  }
)

type UpdateDisciplinaryRuleFormData = z.infer<typeof updateDisciplinaryRuleSchema>

interface EditDisciplinaryRuleFormProps {
  rule: {
    id: string
    name: string
    description: string | null
    triggerType: string
    triggerCount: number
    periodDays: number
    actionType: "WARNING" | "WRITTEN_WARNING" | "ADMINISTRATIVE_ACT" | "SUSPENSION" | "TERMINATION"
    suspensionDays: number | null
    affectsSalary: boolean
    requiresApproval: boolean
    autoApply: boolean
    notificationEnabled: boolean
    isActive: boolean
  }
}

const ACTION_TYPE_OPTIONS = [
  { value: "WARNING", label: "Advertencia", description: "Advertencia verbal" },
  { value: "WRITTEN_WARNING", label: "Advertencia Escrita", description: "Advertencia por escrito" },
  { value: "ADMINISTRATIVE_ACT", label: "Acta Administrativa", description: "Acta formal con posible suspensión" },
  { value: "SUSPENSION", label: "Suspensión", description: "Suspensión sin goce de sueldo" },
  { value: "TERMINATION", label: "Terminación", description: "Rescisión de contrato" },
]

const TRIGGER_TYPE_OPTIONS = [
  { value: "FORMAL_TARDIES", label: "Retardos Formales" },
  { value: "ADMINISTRATIVE_ACTS", label: "Actas Administrativas" },
  { value: "UNJUSTIFIED_ABSENCES", label: "Faltas Injustificadas" },
  { value: "POLICY_VIOLATIONS", label: "Violaciones de Política" },
  { value: "PERFORMANCE_ISSUES", label: "Problemas de Desempeño" },
]

export function EditDisciplinaryRuleForm({ rule }: EditDisciplinaryRuleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UpdateDisciplinaryRuleFormData>({
    resolver: zodResolver(updateDisciplinaryRuleSchema),
    defaultValues: {
      name: rule.name,
      description: rule.description || "",
      triggerType: rule.triggerType,
      triggerCount: rule.triggerCount,
      periodDays: rule.periodDays,
      actionType: rule.actionType,
      suspensionDays: rule.suspensionDays,
      affectsSalary: rule.affectsSalary,
      requiresApproval: rule.requiresApproval,
      autoApply: rule.autoApply,
      notificationEnabled: rule.notificationEnabled,
      isActive: rule.isActive,
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: UpdateDisciplinaryRuleFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/disciplinary-rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Regla actualizada exitosamente")
        router.push("/admin/disciplinary-rules")
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
            <Settings className="h-5 w-5 text-purple-600" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre de la Regla *
            </Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              disabled={isLoading}
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción (Opcional)
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Disparador */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Disparador de la Regla
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="triggerType" className="text-sm font-medium">
              Tipo de Disparador *
            </Label>
            <Select
              value={watchedValues.triggerType}
              onValueChange={(value) => setValue("triggerType", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.triggerType && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.triggerType.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="triggerCount" className="text-sm font-medium">
                Conteo de Disparador *
              </Label>
              <Input
                id="triggerCount"
                type="number"
                min="1"
                {...register("triggerCount", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
              {errors.triggerCount && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.triggerCount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodDays" className="text-sm font-medium">
                Período (días) *
              </Label>
              <Input
                id="periodDays"
                type="number"
                min="1"
                {...register("periodDays", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
              {errors.periodDays && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.periodDays.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Acción Disciplinaria */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Acción Disciplinaria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Acción *</Label>
            <RadioGroup
              value={watchedValues.actionType}
              onValueChange={(value) => setValue("actionType", value as any)}
              disabled={isLoading}
              className="space-y-3"
            >
              {ACTION_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {watchedValues.actionType === "SUSPENSION" && (
            <div className="space-y-2">
              <Label htmlFor="suspensionDays" className="text-sm font-medium">
                Días de Suspensión *
              </Label>
              <Input
                id="suspensionDays"
                type="number"
                min="1"
                {...register("suspensionDays", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
              {errors.suspensionDays && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.suspensionDays.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="affectsSalary"
                checked={watchedValues.affectsSalary}
                onCheckedChange={(checked) => setValue("affectsSalary", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="affectsSalary" className="text-sm font-medium cursor-pointer">
                Afecta salario
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresApproval"
                checked={watchedValues.requiresApproval}
                onCheckedChange={(checked) => setValue("requiresApproval", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="requiresApproval" className="text-sm font-medium cursor-pointer">
                Requiere aprobación manual
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoApply"
                checked={watchedValues.autoApply}
                onCheckedChange={(checked) => setValue("autoApply", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="autoApply" className="text-sm font-medium cursor-pointer">
                Aplicar automáticamente
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Notificaciones y Estado */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notificaciones y Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notificationEnabled"
              checked={watchedValues.notificationEnabled}
              onCheckedChange={(checked) => setValue("notificationEnabled", checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="notificationEnabled" className="text-sm font-medium cursor-pointer">
              Enviar notificaciones
            </Label>
          </div>

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
          <Link href="/admin/disciplinary-rules">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
