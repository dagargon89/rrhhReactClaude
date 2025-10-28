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
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Save,
  Loader2,
  Wallet,
  User,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Esquema de validación
const updateLeaveBalanceSchema = z.object({
  totalDays: z.string().min(1, "Los días totales son requeridos"),
})

type UpdateLeaveBalanceFormData = z.infer<typeof updateLeaveBalanceSchema>

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

export default function EditLeaveBalancePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [balanceData, setBalanceData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<UpdateLeaveBalanceFormData>({
    resolver: zodResolver(updateLeaveBalanceSchema),
  })

  const watchedTotalDays = watch("totalDays")

  // Cargar datos del saldo
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const response = await fetch(`/api/leave-balances/${params.id}`)

        if (response.ok) {
          const balance = await response.json()
          setBalanceData(balance)

          // Reset form con datos del saldo
          reset({
            totalDays: balance.totalDays.toString(),
          })
        } else {
          toast.error("Error al cargar los datos del saldo")
          router.push("/admin/leave-balances")
        }
      } catch (error) {
        toast.error("Error al cargar los datos del saldo")
        router.push("/admin/leave-balances")
      } finally {
        setLoadingData(false)
      }
    }

    loadBalance()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdateLeaveBalanceFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        totalDays: parseFloat(data.totalDays),
      }

      const response = await fetch(`/api/leave-balances/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Saldo actualizado exitosamente")
        router.push(`/admin/leave-balances/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar saldo")
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
  if (!balanceData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Saldo no encontrado</h3>
            <p className="text-sm text-muted-foreground">
              El saldo que buscas no existe o ha sido eliminado
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/leave-balances">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentUsed = Number(balanceData.usedDays)
  const currentPending = Number(balanceData.pendingDays)
  const newTotal = watchedTotalDays ? parseFloat(watchedTotalDays) : 0
  const newAvailable = newTotal - currentUsed - currentPending

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/leave-balances/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Editar Saldo de Permiso
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar saldo de {balanceData.employee.user.firstName}{" "}
            {balanceData.employee.user.lastName}
          </p>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-1">Importante:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>
              No puedes asignar menos días de los que ya se han usado ({currentUsed}{" "}
              días)
            </li>
            <li>
              Hay {currentPending} días en solicitudes pendientes que también deben
              ser considerados
            </li>
            <li>
              El total debe ser al menos {currentUsed + currentPending} días
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Información del Saldo (Solo lectura) */}
        <Card className="border-0 shadow-lg bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Saldo (Solo lectura)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Empleado</Label>
                <p className="font-medium">
                  {balanceData.employee.user.firstName}{" "}
                  {balanceData.employee.user.lastName}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Tipo de Permiso</Label>
                <p className="font-medium">
                  {getLeaveTypeName(balanceData.leaveType.name)}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Año</Label>
                <p className="font-medium">{balanceData.year}</p>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> El empleado, tipo de permiso y año no se
                pueden cambiar. Para asignar un saldo diferente, crea uno nuevo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Editar Días */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Configuración de Días
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {/* Comparación de saldos */}
            {watchedTotalDays && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm text-blue-900 mb-2">
                    Saldo Actual:
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total:</span>
                      <span className="font-semibold text-blue-900">
                        {balanceData.totalDays} días
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Usados:</span>
                      <span className="font-semibold text-red-600">
                        {currentUsed} días
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Pendientes:</span>
                      <span className="font-semibold text-yellow-600">
                        {currentPending} días
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span className="text-blue-700">Disponibles:</span>
                      <span className="font-semibold text-green-600">
                        {Number(balanceData.totalDays) - currentUsed - currentPending}{" "}
                        días
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-sm text-green-900 mb-2">
                    Nuevo Saldo:
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total:</span>
                      <span className="font-semibold text-green-900">
                        {newTotal} días
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Usados:</span>
                      <span className="font-semibold text-red-600">
                        {currentUsed} días
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Pendientes:</span>
                      <span className="font-semibold text-yellow-600">
                        {currentPending} días
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="text-green-700">Disponibles:</span>
                      <span
                        className={`font-semibold ${
                          newAvailable >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {newAvailable} días
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencia si el nuevo saldo es insuficiente */}
            {watchedTotalDays && newAvailable < 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> El nuevo total de días ({newTotal}) es
                  insuficiente para cubrir los días ya usados ({currentUsed}) y
                  pendientes ({currentPending}). Se requieren al menos{" "}
                  {currentUsed + currentPending} días.
                </AlertDescription>
              </Alert>
            )}

            {/* Resumen de cambios */}
            {watchedTotalDays && newAvailable >= 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resumen de Cambios:
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>
                      Cambio en días totales:{" "}
                      <strong>
                        {balanceData.totalDays} → {newTotal} días
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>
                      Nuevos días disponibles: <strong>{newAvailable} días</strong>
                    </span>
                  </div>
                  {newTotal > balanceData.totalDays && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>
                        Se agregarán{" "}
                        <strong>{newTotal - balanceData.totalDays} días</strong>{" "}
                        adicionales
                      </span>
                    </div>
                  )}
                  {newTotal < balanceData.totalDays && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span>
                        Se reducirán{" "}
                        <strong>{balanceData.totalDays - newTotal} días</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href={`/admin/leave-balances/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading || (watchedTotalDays && newAvailable < 0)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
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
