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
import { ArrowLeft, Calendar, Loader2, Info, Users, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const createBulkSchedulesSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "Debe seleccionar al menos un empleado"),
  shiftId: z.string().cuid("Turno inválido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  isOverride: z.boolean().default(false),
  notes: z.string().optional(),
})

type CreateBulkSchedulesFormData = z.infer<typeof createBulkSchedulesSchema>

export default function BulkSchedulesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [workShifts, setWorkShifts] = useState<any[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateBulkSchedulesFormData>({
    resolver: zodResolver(createBulkSchedulesSchema),
    defaultValues: {
      isOverride: false,
      employeeIds: [],
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
          const activeEmployees = (Array.isArray(empData) ? empData : empData.employees || [])
            .filter((emp: any) => emp.status === "ACTIVE")
          setEmployees(activeEmployees)
        }

        if (shiftsResponse.ok) {
          const shiftsData = await shiftsResponse.json()
          const activeShifts = (Array.isArray(shiftsData) ? shiftsData : shiftsData.workShifts || [])
            .filter((shift: any) => shift.isActive)
          setWorkShifts(activeShifts)
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

  const handleEmployeeToggle = (employeeId: string) => {
    const newSelected = selectedEmployees.includes(employeeId)
      ? selectedEmployees.filter(id => id !== employeeId)
      : [...selectedEmployees, employeeId]

    setSelectedEmployees(newSelected)
    setValue("employeeIds", newSelected)
  }

  const selectAllEmployees = () => {
    const allIds = employees.map(emp => emp.id)
    setSelectedEmployees(allIds)
    setValue("employeeIds", allIds)
  }

  const deselectAllEmployees = () => {
    setSelectedEmployees([])
    setValue("employeeIds", [])
  }

  const onSubmit = async (data: CreateBulkSchedulesFormData) => {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await fetch("/api/schedules/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const resultData = await response.json()

      if (response.ok) {
        setResult(resultData)
        toast.success(`${resultData.created} horarios creados exitosamente`)
        if (resultData.conflicts > 0) {
          toast.warning(`${resultData.conflicts} conflictos encontrados`)
        }
      } else {
        toast.error(resultData.error || "Error al crear horarios")
      }
    } catch (error) {
      console.error("Error creating bulk schedules:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

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
            Asignación Masiva de Horarios
          </h1>
          <p className="text-lg text-muted-foreground">
            Crea múltiples horarios para varios empleados en un rango de fechas
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-2">Cómo funciona la asignación masiva:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Selecciona múltiples empleados y un turno</li>
            <li>Define un rango de fechas (inicio y fin)</li>
            <li>Los horarios se crearán solo en los días de trabajo del turno</li>
            <li>Si un empleado ya tiene horario en una fecha, se reportará como conflicto</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Resultado de la operación */}
      {result && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">Resultado de la asignación:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Horarios creados: <span className="font-bold">{result.created}</span></div>
                <div>Conflictos encontrados: <span className="font-bold">{result.conflicts}</span></div>
              </div>
              {result.conflicts > 0 && result.conflictDetails && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Detalles de conflictos:</p>
                  <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                    {result.conflictDetails.map((conflict: any, idx: number) => (
                      <div key={idx} className="bg-white/50 p-2 rounded">
                        Empleado ID: {conflict.employeeId} - Fecha: {conflict.date} - {conflict.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => router.push("/admin/schedules")}
              >
                Ver todos los horarios
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Selección de Empleados */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Selección de Empleados ({selectedEmployees.length} seleccionados)
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllEmployees}
                  disabled={loadingData}
                >
                  Seleccionar Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={deselectAllEmployees}
                  disabled={loadingData}
                >
                  Deseleccionar Todos
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-sm text-muted-foreground">Cargando empleados...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {employees.map((emp) => (
                  <div key={emp.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={`emp-${emp.id}`}
                      checked={selectedEmployees.includes(emp.id)}
                      onCheckedChange={() => handleEmployeeToggle(emp.id)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`emp-${emp.id}`} className="cursor-pointer flex-1">
                      <div className="font-medium text-sm">
                        {emp.user.firstName} {emp.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {emp.employeeCode}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {errors.employeeIds && (
              <p className="text-sm text-destructive mt-2">{errors.employeeIds.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Turno y Fechas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Turno y Rango de Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  {workShifts.map((shift) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha de Inicio */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              {/* Fecha de Fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
                )}
              </div>
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
                placeholder="Agregar notas que se aplicarán a todos los horarios..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        {(selectedEmployees.length > 0 || selectedShift || watchedValues.startDate || watchedValues.endDate) && (
          <Card className="border-0 shadow-lg bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de la Asignación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>
                  Empleados seleccionados: <span className="font-medium">{selectedEmployees.length}</span>
                </span>
              </div>
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
              {watchedValues.startDate && watchedValues.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>
                    Rango: <span className="font-medium">
                      {new Date(watchedValues.startDate).toLocaleDateString("es-ES")} - {new Date(watchedValues.endDate).toLocaleDateString("es-ES")}
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
            disabled={isLoading || loadingData || selectedEmployees.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando horarios...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Crear Horarios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
