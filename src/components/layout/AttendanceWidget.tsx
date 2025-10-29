"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface AttendanceStatus {
  hasAttendance: boolean
  attendance: {
    id: string
    checkInTime: string | null
    checkOutTime: string | null
    status: string
  } | null
}

export function AttendanceWidget() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<AttendanceStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState("")

  // Función para cargar el estado de asistencia
  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/attendance/status", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Status fetched:', {
          hasAttendance: data.hasAttendance,
          attendanceId: data.attendance?.id,
          checkInTime: data.attendance?.checkInTime,
          checkOutTime: data.attendance?.checkOutTime,
          status: data.attendance?.status
        })
        setStatus(data)
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error)
    }
  }

  // Cargar estado inicial
  useEffect(() => {
    if (session?.user?.employeeId) {
      fetchStatus()
    }
  }, [session])

  // Debug: Log cuando cambia el status
  useEffect(() => {
    console.log('🔄 Status changed:', {
      status,
      hasAttendance: status?.hasAttendance,
      hasCheckIn: !!status?.attendance?.checkInTime,
      checkInTime: status?.attendance?.checkInTime,
      hasCheckOut: !!status?.attendance?.checkOutTime,
      checkOutTime: status?.attendance?.checkOutTime
    })
  }, [status])

  // Actualizar tiempo transcurrido cada segundo
  useEffect(() => {
    if (!status?.attendance?.checkInTime || status?.attendance?.checkOutTime) {
      setElapsedTime("")
      return
    }

    const updateElapsedTime = () => {
      const checkInDate = new Date(status.attendance!.checkInTime!)
      const now = new Date()
      const diffMs = now.getTime() - checkInDate.getTime()

      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, 1000)

    return () => clearInterval(interval)
  }, [status])

  // Función para hacer check-in
  const handleCheckIn = async () => {
    if (!session?.user?.employeeId) return

    setLoading(true)
    try {
      const response = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: session.user.employeeId,
          checkInMethod: "MANUAL",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Check-in response:', data)
        toast.success("Entrada registrada exitosamente")

        // Mostrar información de tardanza si aplica
        if (data.tardiness) {
          toast.warning(`Llegaste ${data.tardiness.minutesLate} minutos tarde`, {
            description: `Regla aplicada: ${data.tardiness.ruleApplied}`,
          })
        }

        // Esperar un momento antes de actualizar el estado
        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchStatus()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al registrar entrada")
      }
    } catch (error) {
      toast.error("Error al registrar entrada")
      console.error("Check-in error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para hacer check-out
  const handleCheckOut = async () => {
    if (!status?.attendance?.id) return

    setLoading(true)
    try {
      const response = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId: status.attendance.id,
          checkOutMethod: "MANUAL",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Check-out response:', data)
        toast.success("Salida registrada exitosamente")

        // Esperar un momento antes de actualizar el estado
        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchStatus()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al registrar salida")
      }
    } catch (error) {
      toast.error("Error al registrar salida")
      console.error("Check-out error:", error)
    } finally {
      setLoading(false)
    }
  }

  // No mostrar nada si no es empleado
  if (!session?.user?.employeeId) {
    return null
  }

  // Si ya hizo check-out, no mostrar nada
  if (status?.attendance?.checkOutTime) {
    return null
  }

  // Log para debug antes del render
  console.log('🎨 Rendering widget:', {
    hasCheckInTime: !!status?.attendance?.checkInTime,
    checkInTimeValue: status?.attendance?.checkInTime,
    willShowCheckOut: !!status?.attendance?.checkInTime
  })

  // Mostrar widget compacto
  return (
    <Card className="shadow-sm border-l-4 border-l-primary">
      <CardContent className="p-3">
        {status?.attendance?.checkInTime ? (
          // Ya hizo check-in, mostrar tiempo y botón de salida
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Desde {format(new Date(status.attendance.checkInTime), "h:mm a", { locale: es })}
              </span>
            </div>

            <div className="text-2xl font-bold tabular-nums">
              {elapsedTime}
            </div>

            <Button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Registrar salida
            </Button>
          </div>
        ) : (
          // No ha hecho check-in, mostrar botón de entrada
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Asistencia</span>
            </div>

            <Button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              Registrar entrada
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
