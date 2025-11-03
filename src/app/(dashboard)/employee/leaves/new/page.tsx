"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { differenceInDays } from "date-fns"

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "El tipo de permiso es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  reason: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end >= start
}, {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
  path: ["endDate"],
})

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

interface LeaveType {
  id: string
  name: string
  code: string
  description: string | null
}

export default function NewLeaveRequestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
  })

  const startDate = watch("startDate")
  const endDate = watch("endDate")

  // Calcular días solicitados
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.max(0, differenceInDays(end, start) + 1)
  }

  useEffect(() => {
    fetchLeaveTypes()
  }, [])

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("/api/leave-types")
      if (!response.ok) throw new Error("Error al cargar tipos de permiso")
      const data = await response.json()
      setLeaveTypes(data)
    } catch (error) {
      toast.error("Error al cargar tipos de permiso")
    } finally {
      setLoadingTypes(false)
    }
  }

  const onSubmit = async (data: LeaveRequestFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear la solicitud")
      }

      toast.success("Solicitud creada exitosamente", {
        description: "Tu solicitud ha sido enviada para revisión",
      })

      router.push("/employee/leaves")
      router.refresh()
    } catch (error) {
      toast.error("Error al crear la solicitud", {
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/employee/leaves">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Solicitud de Permiso</h1>
          <p className="text-muted-foreground">
            Completa el formulario para solicitar días de permiso
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Solicitud</CardTitle>
          <CardDescription>
            Todos los campos son requeridos excepto el motivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Permiso */}
            <div className="space-y-2">
              <Label htmlFor="leaveTypeId">Tipo de Permiso *</Label>
              <Select
                onValueChange={(value) => setValue("leaveTypeId", value)}
                disabled={loadingTypes || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de permiso" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{type.code}</span>
                        {type.description && (
                          <span className="text-xs text-muted-foreground">
                            {type.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveTypeId && (
                <p className="text-sm text-destructive">{errors.leaveTypeId.message}</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  disabled={isLoading}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  disabled={isLoading}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Días solicitados */}
            {startDate && endDate && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Días solicitados: <span className="text-2xl ml-2">{calculateDays()}</span>
                </p>
              </div>
            )}

            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (Opcional)</Label>
              <Textarea
                id="reason"
                {...register("reason")}
                disabled={isLoading}
                placeholder="Describe brevemente el motivo de tu solicitud..."
                rows={4}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason.message}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <Link href="/employee/leaves" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
