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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación
const updateLeaveRequestSchema = z.object({
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  reason: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
})

type UpdateLeaveRequestFormData = z.infer<typeof updateLeaveRequestSchema>

export default function EditLeaveRequestPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [leaveRequestData, setLeaveRequestData] = useState<any>(null)
  const [calculatedDays, setCalculatedDays] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateLeaveRequestFormData>({
    resolver: zodResolver(updateLeaveRequestSchema),
  })

  const watchedStartDate = watch("startDate")
  const watchedEndDate = watch("endDate")

  // Cargar datos de la solicitud
  useEffect(() => {
    const loadLeaveRequest = async () => {
      try {
        const response = await fetch(`/api/leave-requests/${params.id}`)

        if (response.ok) {
          const leaveRequest = await response.json()

          if (leaveRequest.status !== "PENDING") {
            toast.error("Solo se pueden editar solicitudes pendientes")
            router.push(`/admin/leaves/${params.id}`)
            return
          }

          setLeaveRequestData(leaveRequest)

          // Formatear fechas para inputs date
          const formatDateForInput = (date: string) => {
            const d = new Date(date)
            return d.toISOString().split("T")[0]
          }

          setValue("startDate", formatDateForInput(leaveRequest.startDate))
          setValue("endDate", formatDateForInput(leaveRequest.endDate))
          setValue("reason", leaveRequest.reason)
        } else {
          toast.error("Error al cargar los datos de la solicitud")
          router.push("/admin/leaves")
        }
      } catch (error) {
        toast.error("Error al cargar los datos de la solicitud")
        router.push("/admin/leaves")
      } finally {
        setLoadingData(false)
      }
    }

    loadLeaveRequest()
  }, [params.id, setValue, router])

  // Calcular días laborables
  useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const start = new Date(watchedStartDate)
      const end = new Date(watchedEndDate)

      if (end >= start) {
        let count = 0
        const current = new Date(start)

        while (current <= end) {
          const dayOfWeek = current.getDay()
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++
          }
          current.setDate(current.getDate() + 1)
        }

        setCalculatedDays(count)
      } else {
        setCalculatedDays(0)
      }
    } else {
      setCalculatedDays(0)
    }
  }, [watchedStartDate, watchedEndDate])

  const onSubmit = async (data: UpdateLeaveRequestFormData) => {
    if (calculatedDays === 0) {
      toast.error("El rango de fechas es inválido")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/leave-requests/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Solicitud actualizada exitosamente")
        router.push(`/admin/leaves/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar solicitud")
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
  if (!leaveRequestData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Solicitud no encontrada</h3>
            <p className="text-sm text-muted-foreground">
              La solicitud que buscas no existe o ha sido eliminada
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/leaves">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/leaves/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Editar Solicitud de Permiso
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar solicitud de {leaveRequestData.employee.user.firstName}{" "}
            {leaveRequestData.employee.user.lastName}
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-1">Información importante:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Solo se pueden editar solicitudes pendientes</li>
            <li>Los cambios en las fechas recalcularán los días automáticamente</li>
            <li>Se verificará el saldo disponible del empleado</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card: Información del Empleado y Tipo (Solo lectura) */}
        <Card className="border-0 shadow-lg bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Información de la Solicitud (Solo lectura)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Empleado</Label>
                <p className="font-medium">
                  {leaveRequestData.employee.user.firstName}{" "}
                  {leaveRequestData.employee.user.lastName}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Código</Label>
                <p className="font-medium font-mono">
                  {leaveRequestData.employee.employeeCode}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Tipo de Permiso</Label>
                <p className="font-medium">
                  {getLeaveTypeName(leaveRequestData.leaveType.name)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> El empleado y el tipo de permiso no se
                pueden cambiar. Para solicitar un tipo diferente, cree una nueva
                solicitud.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card: Fechas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Fechas del Permiso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha de Inicio */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Fecha de Inicio *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* Fecha de Fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Fecha de Fin *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Resumen de días calculados */}
            {calculatedDays > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-sm text-green-900 mb-2">
                    Días nuevos:
                  </h4>
                  <div className="text-3xl font-bold text-green-700">
                    {calculatedDays} días
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm text-blue-900 mb-2">
                    Días anteriores:
                  </h4>
                  <div className="text-3xl font-bold text-blue-700">
                    {leaveRequestData.totalDays} días
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Motivo */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Motivo de la Solicitud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Motivo *
              </Label>
              <Textarea
                id="reason"
                placeholder="Explique el motivo de la solicitud de permiso..."
                {...register("reason")}
                disabled={isLoading}
                className="min-h-[120px]"
              />
              {errors.reason && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.reason.message}
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
            <Link href={`/admin/leaves/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading || calculatedDays === 0}
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
    </div>
  )
}
