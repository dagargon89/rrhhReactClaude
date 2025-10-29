"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Clock, Loader2, Info, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createAttendanceSchema, type CreateAttendanceInput } from "@/lib/validations/attendance"

export default function NewAttendancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateAttendanceInput>({
    resolver: zodResolver(createAttendanceSchema),
    defaultValues: {
      status: "PRESENT",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const watchedValues = watch()

  // Cargar empleados
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch("/api/employees")
        if (response.ok) {
          const data = await response.json()
          setEmployees(Array.isArray(data) ? data : data.employees || [])
        }
      } catch (error) {
        console.error("Error:", error)
        toast.error("Error al cargar empleados")
      } finally {
        setLoadingData(false)
      }
    }

    loadEmployees()
  }, [])

  const onSubmit = async (data: CreateAttendanceInput) => {
    setIsLoading(true)
    try {
      // Construir timestamps completos
      const date = data.date
      const checkInTime = data.checkInTime ? `${date}T${data.checkInTime}:00` : null
      const checkOutTime = data.checkOutTime ? `${date}T${data.checkOutTime}:00` : null

      const payload = {
        ...data,
        checkInTime,
        checkOutTime,
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Asistencia registrada exitosamente")
        router.push("/admin/attendance")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al registrar asistencia")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedEmployee = employees.find(e => e.id === watchedValues.employeeId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Registrar Asistencia
          </h1>
          <p className="text-lg text-muted-foreground">
            Crear un nuevo registro de asistencia manual
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-2">Información sobre registro manual:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Usa este formulario para registros manuales o correcciones</li>
            <li>Los empleados pueden registrar su entrada/salida desde su dashboard</li>
            <li>Las horas trabajadas se calcularán automáticamente</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Empleado y Fecha */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Información del Empleado
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
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Horarios */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Registro de Horarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hora de Entrada */}
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Hora de Entrada</Label>
                <Input
                  id="checkInTime"
                  type="time"
                  {...register("checkInTime")}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {/* Hora de Salida */}
              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Hora de Salida</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  {...register("checkOutTime")}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                onValueChange={(value: any) => setValue("status", value)}
                defaultValue="PRESENT"
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Presente</SelectItem>
                  <SelectItem value="LATE">Tarde</SelectItem>
                  <SelectItem value="ABSENT">Ausente</SelectItem>
                  <SelectItem value="HALF_DAY">Medio Día</SelectItem>
                  <SelectItem value="ON_LEAVE">Permiso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                disabled={isLoading}
                placeholder="Observaciones o comentarios adicionales..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        {selectedEmployee && (
          <Card className="border-0 shadow-lg bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>
                  Empleado:{" "}
                  <span className="font-medium">
                    {selectedEmployee.user.firstName} {selectedEmployee.user.lastName}
                  </span>
                </span>
              </div>
              {watchedValues.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
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
              {watchedValues.checkInTime && watchedValues.checkOutTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>
                    Horario:{" "}
                    <span className="font-medium font-mono">
                      {watchedValues.checkInTime} - {watchedValues.checkOutTime}
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
            <Link href="/admin/attendance">
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
                Registrando...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Registrar Asistencia
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}




