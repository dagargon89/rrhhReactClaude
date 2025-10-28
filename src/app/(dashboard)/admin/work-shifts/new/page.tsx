"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Clock, Loader2, Info, ToggleLeft, Timer } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createWorkShiftSchema, type CreateWorkShiftInput, type WorkDay } from "@/lib/validations/workShift"

const DAYS_LABELS = [
  { value: 0, label: "Lunes", short: "L" },
  { value: 1, label: "Martes", short: "M" },
  { value: 2, label: "Miércoles", short: "X" },
  { value: 3, label: "Jueves", short: "J" },
  { value: 4, label: "Viernes", short: "V" },
  { value: 5, label: "Sábado", short: "S" },
  { value: 6, label: "Domingo", short: "D" },
]

// Configuración por defecto: Lunes a Viernes 8:00-17:00 (9 horas diarias, 45 semanales)
const DEFAULT_WORKING_HOURS: WorkDay[] = [
  { day: 0, enabled: true, startTime: "08:00", endTime: "17:00", duration: 9 },
  { day: 1, enabled: true, startTime: "08:00", endTime: "17:00", duration: 9 },
  { day: 2, enabled: true, startTime: "08:00", endTime: "17:00", duration: 9 },
  { day: 3, enabled: true, startTime: "08:00", endTime: "17:00", duration: 9 },
  { day: 4, enabled: true, startTime: "08:00", endTime: "17:00", duration: 9 },
  { day: 5, enabled: false, startTime: "08:00", endTime: "17:00", duration: 0 },
  { day: 6, enabled: false, startTime: "08:00", endTime: "17:00", duration: 0 },
]

export default function NewWorkShiftPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [workingHours, setWorkingHours] = useState<WorkDay[]>(DEFAULT_WORKING_HOURS)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateWorkShiftInput>({
    resolver: zodResolver(createWorkShiftSchema),
    defaultValues: {
      isActive: true,
      isFlexible: false,
      autoCheckoutEnabled: false,
      gracePeriodMinutes: 15,
      timezone: "America/Ciudad_Juarez",
      weeklyHours: 45,
      workingHours: DEFAULT_WORKING_HOURS,
    },
  })

  const watchedValues = watch()

  // Calcular duración de horas cuando cambian los tiempos
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    return Math.max(0, durationMinutes / 60)
  }

  // Calcular total de horas semanales
  const calculateWeeklyHours = (hours: WorkDay[]): number => {
    return hours
      .filter(day => day.enabled)
      .reduce((sum, day) => sum + day.duration, 0)
  }

  // Actualizar horas semanales cuando cambian los días
  useEffect(() => {
    const total = calculateWeeklyHours(workingHours)
    setValue("weeklyHours", total)
  }, [workingHours, setValue])

  const handleDayToggle = (dayIndex: number) => {
    const newHours = [...workingHours]
    newHours[dayIndex].enabled = !newHours[dayIndex].enabled
    
    // Si se desactiva, poner duración en 0
    if (!newHours[dayIndex].enabled) {
      newHours[dayIndex].duration = 0
    } else {
      // Si se activa, calcular duración
      const duration = calculateDuration(
        newHours[dayIndex].startTime,
        newHours[dayIndex].endTime
      )
      newHours[dayIndex].duration = duration
    }
    
    setWorkingHours(newHours)
    setValue("workingHours", newHours)
  }

  const handleTimeChange = (dayIndex: number, field: "startTime" | "endTime", value: string) => {
    const newHours = [...workingHours]
    newHours[dayIndex][field] = value
    
    // Recalcular duración si el día está habilitado
    if (newHours[dayIndex].enabled) {
      const duration = calculateDuration(
        newHours[dayIndex].startTime,
        newHours[dayIndex].endTime
      )
      newHours[dayIndex].duration = duration
    }
    
    setWorkingHours(newHours)
    setValue("workingHours", newHours)
  }

  const onSubmit = async (data: CreateWorkShiftInput) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/work-shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Turno creado exitosamente")
        router.push("/admin/work-shifts")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear turno")
      }
    } catch (error) {
      console.error("Error creating work shift:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const totalWeeklyHours = calculateWeeklyHours(workingHours)
  const avgDailyHours = workingHours.filter(d => d.enabled).length > 0 
    ? totalWeeklyHours / workingHours.filter(d => d.enabled).length 
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/work-shifts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear Nuevo Turno
          </h1>
          <p className="text-lg text-muted-foreground">
            Configura los horarios de trabajo para cada día de la semana
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-2">Nueva configuración de horarios:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Configura horarios específicos para cada día de la semana</li>
            <li>Habilita o deshabilita días según necesites</li>
            <li>El sistema calcula automáticamente las horas semanales totales</li>
            <li>Similar al sistema de horarios de Odoo</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Información Básica */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Turno *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isLoading}
                  placeholder="Estándar 48 horas/semana"
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  {...register("code")}
                  disabled={isLoading}
                  placeholder="STD48"
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
                placeholder="Describe las características de este turno..."
                rows={3}
              />
            </div>

            {/* Zona horaria */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Input
                id="timezone"
                {...register("timezone")}
                disabled={isLoading}
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Horarios por Día (Similar a Odoo) */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-green-600" />
              Horas Laborales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Encabezado de la tabla */}
              <div className="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-muted-foreground">
                <div className="col-span-1"></div>
                <div className="col-span-3">Día de la semana</div>
                <div className="col-span-3">Trabajar desde</div>
                <div className="col-span-3">Trabajar hasta</div>
                <div className="col-span-2 text-right">Duración (hrs)</div>
              </div>

              {/* Filas de cada día */}
              {workingHours.map((day, index) => (
                <div
                  key={day.day}
                  className={`grid grid-cols-12 gap-4 items-center py-2 px-2 rounded-lg transition-colors ${
                    day.enabled ? "bg-muted/30" : "bg-muted/10 opacity-60"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <Checkbox
                      checked={day.enabled}
                      onCheckedChange={() => handleDayToggle(index)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Día */}
                  <div className="col-span-3">
                    <Label className={day.enabled ? "font-medium" : ""}>
                      {DAYS_LABELS[index].label}
                    </Label>
                  </div>

                  {/* Hora inicio */}
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
                      disabled={isLoading || !day.enabled}
                      className="h-10"
                    />
                  </div>

                  {/* Hora fin */}
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
                      disabled={isLoading || !day.enabled}
                      className="h-10"
                    />
                  </div>

                  {/* Duración */}
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-mono ${day.enabled ? "font-medium" : "text-muted-foreground"}`}>
                      {day.duration.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {errors.workingHours && (
                <p className="text-sm text-destructive">{errors.workingHours.message}</p>
              )}
            </div>

            {/* Resumen de horas */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Horas semanales</p>
                  <p className="text-2xl font-bold text-blue-600">{totalWeeklyHours.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Promedio diario</p>
                  <p className="text-2xl font-bold text-green-600">{avgDailyHours.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Días laborales</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {workingHours.filter(d => d.enabled).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Configuración */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5 text-purple-600" />
              Configuración Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Turno Flexible */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFlexible"
                {...register("isFlexible")}
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="isFlexible" className="cursor-pointer">Turno flexible</Label>
                <p className="text-xs text-muted-foreground">
                  Los empleados pueden tener variaciones en sus horarios de entrada/salida
                </p>
              </div>
            </div>

            {/* Período de Gracia */}
            <div className="space-y-2">
              <Label htmlFor="gracePeriodMinutes">Período de Gracia (minutos)</Label>
              <Input
                id="gracePeriodMinutes"
                type="number"
                min="0"
                max="120"
                {...register("gracePeriodMinutes", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Minutos de tolerancia antes de marcar como llegada tarde
              </p>
              {errors.gracePeriodMinutes && (
                <p className="text-sm text-destructive">{errors.gracePeriodMinutes.message}</p>
              )}
            </div>

            {/* Auto-Checkout */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoCheckoutEnabled"
                {...register("autoCheckoutEnabled")}
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="autoCheckoutEnabled" className="cursor-pointer">
                  Habilitar auto-checkout
                </Label>
                <p className="text-xs text-muted-foreground">
                  Las asistencias se cerrarán automáticamente al final del turno
                </p>
              </div>
            </div>

            {/* Estado Activo */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                {...register("isActive")}
                disabled={isLoading}
              />
              <Label htmlFor="isActive" className="cursor-pointer">Turno activo</Label>
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg">Resumen del Turno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Nombre: <span className="font-medium">{watchedValues.name || "Sin definir"}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-green-600" />
              <span>Horas semanales: <span className="font-medium">{totalWeeklyHours.toFixed(2)} hrs</span></span>
            </div>
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-purple-600" />
              <span>Tipo: <span className="font-medium">{watchedValues.isFlexible ? "Flexible" : "Fijo"}</span></span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Días laborales:</span>
              <div className="flex flex-wrap gap-2 ml-6">
                {workingHours
                  .filter(d => d.enabled)
                  .map((day, idx) => (
                    <span key={idx} className="text-xs bg-white px-2 py-1 rounded border">
                      {DAYS_LABELS[day.day].label}: {day.startTime} - {day.endTime}
                    </span>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/admin/work-shifts">
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
                Creando turno...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Crear Turno
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
