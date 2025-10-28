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
import { ArrowLeft, Calendar, Loader2, Info, Users, Clock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const createScheduleSchema = z.object({
  employeeId: z.string().cuid("Empleado inválido"),
  shiftId: z.string().cuid("Turno inválido"),
  date: z.string().min(1, "La fecha es requerida"),
  isOverride: z.boolean().default(false),
  notes: z.string().optional(),
})

type CreateScheduleFormData = z.infer<typeof createScheduleSchema>

export default function NewSchedulePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [workShifts, setWorkShifts] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateScheduleFormData>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      isOverride: false,
    },
  })

  const watchedValues = watch()

  // Cargar empleados y turnos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [empResponse, shiftsResponse] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/work-shifts"),
        ])

        if (empResponse.ok) {
          const empData = await empResponse.json()
          setEmployees(Array.isArray(empData) ? empData : empData.employees || [])
        }

        if (shiftsResponse.ok) {
          const shiftsData = await shiftsResponse.json()
          setWorkShifts(Array.isArray(shiftsData) ? shiftsData : shiftsData.workShifts || [])
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

  const onSubmit = async (data: CreateScheduleFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Horario creado exitosamente")
        router.push("/admin/schedules")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear horario")
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedEmployee = employees.find(e => e.id === watchedValues.employeeId)
  const selectedShift = workShifts.find(s => s.id === watchedValues.shiftId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/schedules">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear Nuevo Horario
          </h1>
          <p className="text-lg text-muted-foreground">
            Asigna un turno a un empleado en una fecha específica
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-2">Información sobre horarios:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Cada empleado puede tener solo un horario por fecha</li>
            <li>Los horarios marcados como "Override" sobrescriben el horario regular</li>
            <li>Puedes usar la función de asignación masiva para crear múltiples horarios</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Selección de Empleado y Turno */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Empleado y Turno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empleado */}
              <div className="space-y-2">
                <Label htmlFor="employeeId">Empleado *</Label>
                <Select
                  onValueChange={(value) => setValue("employeeId", value)}
                  disabled={isLoading || loadingData}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar empleado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.status === "ACTIVE")
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.user.firstName} {emp.user.lastName} ({emp.employeeCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-destructive">{errors.employeeId.message}</p>
                )}
              </div>

              {/* Turno */}
              <div className="space-y-2">
                <Label htmlFor="shiftId">Turno *</Label>
                <Select
                  onValueChange={(value) => setValue("shiftId", value)}
                  disabled={isLoading || loadingData}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar turno"} />
                  </SelectTrigger>
                  <SelectContent>
                    {workShifts
                      .filter(shift => shift.isActive)
                      .map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name} ({shift.code}) - {shift.startTime} a {shift.endTime}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.shiftId && (
                  <p className="text-sm text-destructive">{errors.shiftId.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Fecha y Configuración */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Fecha y Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                disabled={isLoading}
                className="h-11"
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Override */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOverride"
                {...register("isOverride")}
                disabled={isLoading}
              />
              <Label htmlFor="isOverride">Marcar como override</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Los horarios override sobrescriben el horario regular del empleado
            </p>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                disabled={isLoading}
                placeholder="Agregar notas adicionales sobre este horario..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        {(selectedEmployee || selectedShift || watchedValues.date) && (
          <Card className="border-0 shadow-lg bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Horario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {selectedEmployee && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>
                    Empleado:{" "}
                    <span className="font-medium">
                      {selectedEmployee.user.firstName} {selectedEmployee.user.lastName}
                    </span>
                    {" "}
                    <span className="text-muted-foreground">({selectedEmployee.employeeCode})</span>
                  </span>
                </div>
              )}
              {selectedShift && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>
                    Turno: <span className="font-medium">{selectedShift.name}</span>
                    {" "}
                    <span className="text-muted-foreground font-mono">
                      ({selectedShift.startTime} - {selectedShift.endTime})
                    </span>
                  </span>
                </div>
              )}
              {watchedValues.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>
                    Fecha:{" "}
                    <span className="font-medium">
                      {new Date(watchedValues.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/admin/schedules">
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
                Creando horario...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Crear Horario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
