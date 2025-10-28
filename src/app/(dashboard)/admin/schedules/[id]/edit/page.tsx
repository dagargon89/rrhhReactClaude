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
import { ArrowLeft, Save, Loader2, Calendar, Users, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const updateScheduleSchema = z.object({
  employeeId: z.string().cuid("Empleado inválido"),
  shiftId: z.string().cuid("Turno inválido"),
  date: z.string().min(1, "La fecha es requerida"),
  isOverride: z.boolean().default(false),
  notes: z.string().optional(),
})

type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>

export default function EditSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [workShifts, setWorkShifts] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UpdateScheduleFormData>({
    resolver: zodResolver(updateScheduleSchema),
  })

  const watchedValues = watch()

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [scheduleResponse, empResponse, shiftsResponse] = await Promise.all([
          fetch(`/api/schedules/${params.id}`),
          fetch("/api/employees"),
          fetch("/api/work-shifts"),
        ])

        if (!scheduleResponse.ok) {
          toast.error("Error al cargar los datos del horario")
          router.push("/admin/schedules")
          return
        }

        const schedule = await scheduleResponse.json()
        setScheduleData(schedule)

        if (empResponse.ok) {
          const empData = await empResponse.json()
          setEmployees(Array.isArray(empData) ? empData : empData.employees || [])
        }

        if (shiftsResponse.ok) {
          const shiftsData = await shiftsResponse.json()
          setWorkShifts(Array.isArray(shiftsData) ? shiftsData : shiftsData.workShifts || [])
        }

        // Formatear fecha para input type="date"
        const dateString = new Date(schedule.date).toISOString().split('T')[0]

        reset({
          employeeId: schedule.employeeId,
          shiftId: schedule.shiftId,
          date: dateString,
          isOverride: schedule.isOverride,
          notes: schedule.notes || "",
        })
      } catch (error) {
        console.error("Error:", error)
        toast.error("Error al cargar los datos")
        router.push("/admin/schedules")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdateScheduleFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/schedules/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Horario actualizado exitosamente")
        router.push(`/admin/schedules/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar horario")
      }
    } catch (error) {
      console.error("Error updating schedule:", error)
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
  if (!scheduleData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Horario no encontrado</h3>
            <p className="text-sm text-muted-foreground">
              El horario que buscas no existe o ha sido eliminado
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/schedules">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedEmployee = employees.find(e => e.id === watchedValues.employeeId)
  const selectedShift = workShifts.find(s => s.id === watchedValues.shiftId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/schedules/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Editar Horario
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar información del horario
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Empleado y Turno */}
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
                  disabled={isLoading}
                  defaultValue={scheduleData.employeeId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar empleado" />
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
                  disabled={isLoading}
                  defaultValue={scheduleData.shiftId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar turno" />
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
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={isLoading}
          >
            <Link href={`/admin/schedules/${params.id}`}>
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
