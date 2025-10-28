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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación
const createLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, "Debe seleccionar un empleado"),
  leaveTypeId: z.string().min(1, "Debe seleccionar un tipo de permiso"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  reason: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
})

type CreateLeaveRequestFormData = z.infer<typeof createLeaveRequestSchema>

export default function NewLeaveRequestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [calculatedDays, setCalculatedDays] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateLeaveRequestFormData>({
    resolver: zodResolver(createLeaveRequestSchema),
  })

  const watchedEmployeeId = watch("employeeId")
  const watchedLeaveTypeId = watch("leaveTypeId")
  const watchedStartDate = watch("startDate")
  const watchedEndDate = watch("endDate")

  // Cargar empleados y tipos de permisos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesRes, leaveTypesRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/leave-types?isActive=true"),
        ])

        if (employeesRes.ok && leaveTypesRes.ok) {
          const employeesData = await employeesRes.json()
          const leaveTypesData = await leaveTypesRes.json()

          setEmployees(employeesData.employees || employeesData)
          setLeaveTypes(leaveTypesData)
        }
      } catch (error) {
        toast.error("Error al cargar datos")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Actualizar empleado seleccionado
  useEffect(() => {
    if (watchedEmployeeId) {
      const employee = employees.find((e) => e.id === watchedEmployeeId)
      setSelectedEmployee(employee)
    } else {
      setSelectedEmployee(null)
    }
  }, [watchedEmployeeId, employees])

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

  const onSubmit = async (data: CreateLeaveRequestFormData) => {
    if (calculatedDays === 0) {
      toast.error("El rango de fechas es inválido")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Solicitud de permiso creada exitosamente")
        router.push("/admin/leaves")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear solicitud")
      }
    } catch (error) {
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const selectedLeaveType = leaveTypes.find(
    (type) => type.id === watchedLeaveTypeId
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/leaves">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nueva Solicitud de Permiso
          </h1>
          <p className="text-lg text-muted-foreground">
            Crear una nueva solicitud de vacaciones o permiso
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-1">Información importante:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Solo se cuentan días laborables (Lunes a Viernes)</li>
            <li>Se verificará el saldo disponible del empleado</li>
            <li>No se pueden crear solicitudes que se traslapen con otras existentes</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card: Selección de Empleado */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Seleccionar Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-medium">
                Empleado *
              </Label>
              <Select
                value={watchedEmployeeId}
                onValueChange={(value) =>
                  setValue("employeeId", value, { shouldValidate: true })
                }
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} -{" "}
                      {employee.employeeCode}
                      {employee.department && ` (${employee.department.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.employeeId.message}
                </p>
              )}
            </div>

            {selectedEmployee && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-sm text-blue-900 mb-2">
                  Empleado seleccionado:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700">Nombre:</span>{" "}
                    <span className="font-medium">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Código:</span>{" "}
                    <span className="font-medium font-mono">
                      {selectedEmployee.employeeCode}
                    </span>
                  </div>
                  {selectedEmployee.department && (
                    <div>
                      <span className="text-blue-700">Departamento:</span>{" "}
                      <span className="font-medium">
                        {selectedEmployee.department.name}
                      </span>
                    </div>
                  )}
                  {selectedEmployee.position && (
                    <div>
                      <span className="text-blue-700">Posición:</span>{" "}
                      <span className="font-medium">
                        {selectedEmployee.position.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Tipo de Permiso */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Tipo de Permiso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="leaveTypeId" className="text-sm font-medium">
                Tipo de Permiso *
              </Label>
              <Select
                value={watchedLeaveTypeId}
                onValueChange={(value) =>
                  setValue("leaveTypeId", value, { shouldValidate: true })
                }
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar tipo de permiso" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name === "VACATION"
                        ? "Vacaciones"
                        : type.name === "SICK_LEAVE"
                          ? "Incapacidad médica"
                          : type.name === "PERSONAL"
                            ? "Personal"
                            : type.name === "MATERNITY"
                              ? "Maternidad"
                              : type.name === "PATERNITY"
                                ? "Paternidad"
                                : "Sin goce de sueldo"}
                      {type.isPaid ? " (Pagado)" : " (Sin pago)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveTypeId && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.leaveTypeId.message}
                </p>
              )}
            </div>

            {selectedLeaveType && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-sm text-purple-900 mb-2">
                  Información del tipo de permiso:
                </h4>
                <div className="space-y-1 text-sm">
                  {selectedLeaveType.description && (
                    <p className="text-purple-700">
                      {selectedLeaveType.description}
                    </p>
                  )}
                  <p className="text-purple-700">
                    <strong>¿Es pagado?</strong>{" "}
                    {selectedLeaveType.isPaid ? "Sí" : "No"}
                  </p>
                  {selectedLeaveType.maxDaysPerYear && (
                    <p className="text-purple-700">
                      <strong>Máximo por año:</strong>{" "}
                      {selectedLeaveType.maxDaysPerYear} días
                    </p>
                  )}
                </div>
              </div>
            )}
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
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-sm text-green-900 mb-2">
                  Días solicitados:
                </h4>
                <div className="text-3xl font-bold text-green-700">
                  {calculatedDays} días laborables
                </div>
                <p className="text-xs text-green-700 mt-1">
                  (No incluye fines de semana)
                </p>
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
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/admin/leaves">
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
                Creando solicitud...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crear Solicitud
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
