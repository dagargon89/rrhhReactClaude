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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  Calendar,
  Building2,
  Bell,
  Settings,
  Plus,
  X
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación
const createConfigSchema = z.object({
  incidentTypeId: z.string().cuid("ID de tipo de incidencia inválido"),
  departmentId: z.string().cuid("ID de departamento inválido").optional().or(z.literal("")),
  thresholdValue: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  thresholdOperator: z.enum(["GT", "LT", "GTE", "LTE", "EQ"]),
  periodType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  notificationEnabled: z.boolean().default(false),
  notificationEmails: z.array(z.string().email()).default([]),
  isActive: z.boolean().default(true),
})

type CreateConfigFormData = z.infer<typeof createConfigSchema>

const OPERATOR_OPTIONS = [
  { value: "GT", label: "> Mayor que", description: "Alerta cuando el valor supera el umbral" },
  { value: "GTE", label: "≥ Mayor o igual que", description: "Alerta cuando el valor es mayor o igual al umbral" },
  { value: "LT", label: "< Menor que", description: "Alerta cuando el valor es menor al umbral" },
  { value: "LTE", label: "≤ Menor o igual que", description: "Alerta cuando el valor es menor o igual al umbral" },
  { value: "EQ", label: "= Igual a", description: "Alerta cuando el valor es exactamente igual al umbral" },
]

const PERIOD_OPTIONS = [
  { value: "DAILY", label: "Diario", description: "Evaluación diaria" },
  { value: "WEEKLY", label: "Semanal", description: "Evaluación semanal" },
  { value: "MONTHLY", label: "Mensual", description: "Evaluación mensual" },
  { value: "YEARLY", label: "Anual", description: "Evaluación anual" },
]

export default function NewConfigPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [incidentTypes, setIncidentTypes] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [emails, setEmails] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateConfigFormData>({
    resolver: zodResolver(createConfigSchema),
    defaultValues: {
      thresholdOperator: "GT",
      periodType: "MONTHLY",
      notificationEnabled: false,
      isActive: true,
    },
  })

  const watchedValues = watch()

  // Cargar tipos de incidencia y departamentos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesRes, deptsRes] = await Promise.all([
          fetch("/api/incident-types"),
          fetch("/api/departments"),
        ])

        if (typesRes.ok && deptsRes.ok) {
          const typesData = await typesRes.json()
          const deptsData = await deptsRes.json()
          setIncidentTypes(typesData.filter((t: any) => t.isActive))
          setDepartments(deptsData.filter((d: any) => d.isActive))
        }
      } catch (error) {
        toast.error("Error al cargar datos")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const onSubmit = async (data: CreateConfigFormData) => {
    setIsLoading(true)
    try {
      // Agregar los emails acumulados
      const submitData = {
        ...data,
        notificationEmails: emails,
        departmentId: data.departmentId || null,
      }

      const response = await fetch("/api/incident-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast.success("Configuración creada exitosamente")
        router.push("/admin/incident-configs")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear configuración")
      }
    } catch (error) {
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const addEmail = () => {
    const trimmedEmail = emailInput.trim()
    if (trimmedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      if (!emails.includes(trimmedEmail)) {
        setEmails([...emails, trimmedEmail])
        setEmailInput("")
      } else {
        toast.error("Este email ya está agregado")
      }
    } else {
      toast.error("Email inválido")
    }
  }

  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email))
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/incident-configs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Nueva Configuración de Umbral
          </h1>
          <p className="text-lg text-muted-foreground">
            Configura alertas automáticas para incidencias
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Tipo y Alcance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Tipo de Incidencia y Alcance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de Incidencia */}
            <div className="space-y-2">
              <Label htmlFor="incidentTypeId" className="text-sm font-medium">
                Tipo de Incidencia *
              </Label>
              <Select
                value={watchedValues.incidentTypeId}
                onValueChange={(value) => setValue("incidentTypeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name === "TURNOVER" && "Rotación"}
                      {type.name === "ABSENTEEISM" && "Ausentismo"}
                      {type.name === "TARDINESS" && "Impuntualidad"}
                      {type.name === "OVERTIME" && "Horas Extra"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.incidentTypeId && (
                <p className="text-sm text-destructive">{errors.incidentTypeId.message}</p>
              )}
            </div>

            {/* Departamento (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="departmentId" className="text-sm font-medium">
                Departamento (Opcional)
              </Label>
              <Select
                value={watchedValues.departmentId || ""}
                onValueChange={(value) => setValue("departmentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Global (todos los departamentos)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Global (todos los departamentos)</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Deja vacío para aplicar a todos los departamentos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Configuración del Umbral */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Configuración del Umbral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Operador */}
              <div className="space-y-2">
                <Label htmlFor="thresholdOperator" className="text-sm font-medium">
                  Operador *
                </Label>
                <Select
                  value={watchedValues.thresholdOperator}
                  onValueChange={(value: any) => setValue("thresholdOperator", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        <div>
                          <p className="font-medium">{op.label}</p>
                          <p className="text-xs text-muted-foreground">{op.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="thresholdValue" className="text-sm font-medium">
                  Valor del Umbral *
                </Label>
                <Input
                  id="thresholdValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("thresholdValue", { valueAsNumber: true })}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.thresholdValue && (
                  <p className="text-sm text-destructive">{errors.thresholdValue.message}</p>
                )}
              </div>
            </div>

            {/* Preview del umbral */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-900 mb-2">Vista previa de la regla:</p>
              <p className="text-sm text-orange-800">
                Se generará una alerta cuando el valor{" "}
                <span className="font-bold">
                  {watchedValues.thresholdOperator === "GT" && "sea mayor que"}
                  {watchedValues.thresholdOperator === "GTE" && "sea mayor o igual que"}
                  {watchedValues.thresholdOperator === "LT" && "sea menor que"}
                  {watchedValues.thresholdOperator === "LTE" && "sea menor o igual que"}
                  {watchedValues.thresholdOperator === "EQ" && "sea igual a"}
                </span>{" "}
                <span className="font-bold">{watchedValues.thresholdValue || "0"}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Período de Evaluación */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Período de Evaluación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="periodType" className="text-sm font-medium">
                Frecuencia de Evaluación *
              </Label>
              <Select
                value={watchedValues.periodType}
                onValueChange={(value: any) => setValue("periodType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      <div>
                        <p className="font-medium">{period.label}</p>
                        <p className="text-xs text-muted-foreground">{period.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Notificaciones */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle de notificaciones */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificationEnabled"
                checked={watchedValues.notificationEnabled}
                onCheckedChange={(checked) => setValue("notificationEnabled", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="notificationEnabled" className="text-sm font-medium">
                Activar notificaciones automáticas por email
              </Label>
            </div>

            {watchedValues.notificationEnabled && (
              <>
                <Separator />

                {/* Input para agregar emails */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Destinatarios de notificaciones
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addEmail()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addEmail} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Presiona Enter o haz clic en + para agregar
                  </p>
                </div>

                {/* Lista de emails agregados */}
                {emails.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Emails agregados ({emails.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {emails.map((email) => (
                        <Badge key={email} variant="secondary" className="gap-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => removeEmail(email)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 5: Estado */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
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
              <Label htmlFor="isActive" className="text-sm font-medium">
                Configuración activa
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
            <Link href="/admin/incident-configs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando configuración...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crear Configuración
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
