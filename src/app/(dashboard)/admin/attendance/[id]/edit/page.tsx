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
import { Skeleton } from "@/components/ui/skeleton"
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
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  FileText,
  AlertCircle,
  User,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación
const updateAttendanceSchema = z.object({
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"]),
  notes: z.string().optional(),
})

type UpdateAttendanceFormData = z.infer<typeof updateAttendanceSchema>

export default function EditAttendancePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [attendanceData, setAttendanceData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateAttendanceFormData>({
    resolver: zodResolver(updateAttendanceSchema),
  })

  const watchedStatus = watch("status")

  // Cargar datos de la asistencia
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const response = await fetch(`/api/attendance/${params.id}`)

        if (response.ok) {
          const attendance = await response.json()
          setAttendanceData(attendance)

          // Formatear fechas para inputs datetime-local
          const formatDateTimeLocal = (date: string | null) => {
            if (!date) return ""
            const d = new Date(date)
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, "0")
            const day = String(d.getDate()).padStart(2, "0")
            const hours = String(d.getHours()).padStart(2, "0")
            const minutes = String(d.getMinutes()).padStart(2, "0")
            return `${year}-${month}-${day}T${hours}:${minutes}`
          }

          // Establecer valores del formulario
          setValue("status", attendance.status)
          if (attendance.checkInTime) {
            setValue("checkInTime", formatDateTimeLocal(attendance.checkInTime))
          }
          if (attendance.checkOutTime) {
            setValue("checkOutTime", formatDateTimeLocal(attendance.checkOutTime))
          }
          if (attendance.notes) {
            setValue("notes", attendance.notes)
          }
        } else {
          toast.error("Error al cargar los datos de la asistencia")
          router.push("/admin/attendance")
        }
      } catch (error) {
        toast.error("Error al cargar los datos de la asistencia")
        router.push("/admin/attendance")
      } finally {
        setLoadingData(false)
      }
    }

    loadAttendance()
  }, [params.id, setValue, router])

  const onSubmit = async (data: UpdateAttendanceFormData) => {
    setIsLoading(true)
    try {
      // Convertir strings de datetime-local a ISO
      const payload = {
        ...data,
        checkInTime: data.checkInTime ? new Date(data.checkInTime).toISOString() : null,
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime).toISOString() : null,
      }

      const response = await fetch(`/api/attendance/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Asistencia actualizada exitosamente")
        router.push(`/admin/attendance/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar asistencia")
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
  if (!attendanceData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Asistencia no encontrada</h3>
            <p className="text-sm text-muted-foreground">
              La asistencia que buscas no existe o ha sido eliminada
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/attendance">
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
          <Link href={`/admin/attendance/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Editar Asistencia
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar registro de asistencia de {attendanceData.employee.firstName}{" "}
            {attendanceData.employee.lastName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card: Información del Empleado (Solo lectura) */}
        <Card className="border-0 shadow-lg bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Empleado (Solo lectura)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Nombre Completo</Label>
                <p className="font-medium">
                  {attendanceData.employee.firstName}{" "}
                  {attendanceData.employee.lastName}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Código de Empleado</Label>
                <p className="font-medium font-mono">
                  {attendanceData.employee.employeeCode}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Fecha</Label>
                <p className="font-medium">
                  {new Intl.DateTimeFormat("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(attendanceData.date))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Horarios */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Horarios de Entrada y Salida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hora de Entrada */}
              <div className="space-y-2">
                <Label htmlFor="checkInTime" className="text-sm font-medium">
                  Hora de Entrada
                </Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="checkInTime"
                    type="datetime-local"
                    {...register("checkInTime")}
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
                {errors.checkInTime && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.checkInTime.message}
                  </p>
                )}
              </div>

              {/* Hora de Salida */}
              <div className="space-y-2">
                <Label htmlFor="checkOutTime" className="text-sm font-medium">
                  Hora de Salida
                </Label>
                <div className="relative">
                  <XCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="checkOutTime"
                    type="datetime-local"
                    {...register("checkOutTime")}
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
                {errors.checkOutTime && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.checkOutTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Las horas trabajadas y horas extra se
                calcularán automáticamente al guardar los cambios.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card: Estado */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-600" />
              Estado de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Estado *
              </Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) =>
                  setValue("status", value as any, { shouldValidate: true })
                }
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Presente
                    </div>
                  </SelectItem>
                  <SelectItem value="LATE">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Tarde
                    </div>
                  </SelectItem>
                  <SelectItem value="ABSENT">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Ausente
                    </div>
                  </SelectItem>
                  <SelectItem value="HALF_DAY">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-blue-600" />
                      Medio Día
                    </div>
                  </SelectItem>
                  <SelectItem value="ON_LEAVE">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Con Permiso
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Resumen de estado seleccionado */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Estado seleccionado:</h4>
              <div className="flex items-center gap-2">
                {watchedStatus === "PRESENT" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      El empleado estuvo presente
                    </span>
                  </>
                )}
                {watchedStatus === "LATE" && (
                  <>
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700 font-medium">
                      El empleado llegó tarde
                    </span>
                  </>
                )}
                {watchedStatus === "ABSENT" && (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">
                      El empleado estuvo ausente
                    </span>
                  </>
                )}
                {watchedStatus === "HALF_DAY" && (
                  <>
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      El empleado trabajó medio día
                    </span>
                  </>
                )}
                {watchedStatus === "ON_LEAVE" && (
                  <>
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">
                      El empleado tenía permiso aprobado
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Notas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Notas Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Observaciones (Opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Agregar notas o comentarios sobre esta asistencia..."
                {...register("notes")}
                disabled={isLoading}
                className="min-h-[120px]"
              />
              {errors.notes && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.notes.message}
                </p>
              )}
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
            <Link href={`/admin/attendance/${params.id}`}>
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
