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
  Wallet,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación
const createLeaveBalanceSchema = z.object({
  employeeId: z.string().min(1, "El empleado es requerido"),
  leaveTypeId: z.string().min(1, "El tipo de permiso es requerido"),
  year: z.string().regex(/^\d{4}$/, "Debe ser un año válido"),
  totalDays: z.string().min(1, "Los días totales son requeridos"),
})

type CreateLeaveBalanceFormData = z.infer<typeof createLeaveBalanceSchema>

export default function NewLeaveBalancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateLeaveBalanceFormData>({
    resolver: zodResolver(createLeaveBalanceSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
    },
  })

  const watchedEmployeeId = watch("employeeId")
  const watchedLeaveTypeId = watch("leaveTypeId")
  const watchedYear = watch("year")
  const watchedTotalDays = watch("totalDays")

  // Cargar empleados y tipos de permisos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesRes, leaveTypesRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/leave-types"),
        ])

        if (employeesRes.ok && leaveTypesRes.ok) {
          const employeesData = await employeesRes.json()
          const leaveTypesData = await leaveTypesRes.json()

          setEmployees(employeesData)
          setLeaveTypes(leaveTypesData.filter((type: any) => type.isActive))
        } else {
          toast.error("Error al cargar los datos")
        }
      } catch (error) {
        toast.error("Error al cargar los datos")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const onSubmit = async (data: CreateLeaveBalanceFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        year: parseInt(data.year),
        totalDays: parseFloat(data.totalDays),
      }

      const response = await fetch("/api/leave-balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Saldo asignado exitosamente")
        router.push("/admin/leave-balances")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al asignar saldo")
      }
    } catch (error) {
      console.error("Error creating leave balance:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
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

  const selectedEmployee = employees.find((e) => e.id === watchedEmployeeId)
  const selectedLeaveType = leaveTypes.find((t) => t.id === watchedLeaveTypeId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/leave-balances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Asignar Saldo de Permiso
          </h1>
          <p className="text-lg text-muted-foreground">
            Asigna días de permiso a un empleado
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-1">Información importante:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>No puedes asignar el mismo tipo de permiso dos veces al mismo empleado en el mismo año</li>
            <li>Los días asignados estarán disponibles inmediatamente</li>
            <li>Puedes modificar el saldo después de crearlo</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Selección de Empleado y Tipo */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Empleado y Tipo de Permiso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empleado */}
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-sm font-medium">
                  Empleado *
                </Label>
                <Select
                  onValueChange={(value) => setValue("employeeId", value)}
                  disabled={isLoading || loadingData}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.user.firstName} {employee.user.lastName} -{" "}
                        {employee.employeeCode}
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

              {/* Tipo de Permiso */}
              <div className="space-y-2">
                <Label htmlFor="leaveTypeId" className="text-sm font-medium">
                  Tipo de Permiso *
                </Label>
                <Select
                  onValueChange={(value) => setValue("leaveTypeId", value)}
                  disabled={isLoading || loadingData}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {getLeaveTypeName(type.name)} - {type.code}
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
            </div>

            {/* Mostrar información del empleado seleccionado */}
            {selectedEmployee && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Información del Empleado:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Departamento:</span>{" "}
                    {selectedEmployee.department?.name || "Sin asignar"}
                  </div>
                  <div>
                    <span className="font-medium">Posición:</span>{" "}
                    {selectedEmployee.position?.title || "Sin asignar"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Año y Días */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Configuración del Saldo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Año */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">
                  Año *
                </Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  {...register("year")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.year && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.year.message}
                  </p>
                )}
              </div>

              {/* Total de Días */}
              <div className="space-y-2">
                <Label htmlFor="totalDays" className="text-sm font-medium">
                  Total de Días *
                </Label>
                <Input
                  id="totalDays"
                  type="number"
                  step="0.5"
                  placeholder="15"
                  {...register("totalDays")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.totalDays && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.totalDays.message}
                  </p>
                )}
              </div>
            </div>

            {/* Resumen de asignación */}
            {watchedEmployeeId && watchedLeaveTypeId && watchedYear && watchedTotalDays && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resumen de Asignación:
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>
                      Empleado:{" "}
                      <strong>
                        {selectedEmployee?.user.firstName} {selectedEmployee?.user.lastName}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>
                      Tipo:{" "}
                      <strong>
                        {selectedLeaveType && getLeaveTypeName(selectedLeaveType.name)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span>
                      Período: <strong>Año {watchedYear}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span>
                      Días totales: <strong>{watchedTotalDays} días</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>
                      Días disponibles inicialmente: <strong>{watchedTotalDays} días</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/admin/leave-balances">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading || loadingData}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando saldo...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Asignar Saldo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
