"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
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
  const [open, setOpen] = useState(false)

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
        setStatus(data)
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error)
    }
  }

  // Cargar estado inicial
  useEffect(() => {
    console.log('🔐 AttendanceWidget Session Debug:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      employeeId: session?.user?.employeeId,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
    })

    if (session?.user?.employeeId) {
      fetchStatus()
    }
  }, [session])

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
        setOpen(false) // Cerrar el dialog
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
    if (!session?.user?.employeeId) return

    setLoading(true)
    try {
      const response = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: session.user.employeeId,
          checkOutMethod: "MANUAL",
        }),
      })

      if (response.ok) {
        toast.success("Salida registrada exitosamente")

        // Esperar un momento antes de actualizar el estado
        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchStatus()
        setOpen(false) // Cerrar el dialog
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
    console.log('❌ AttendanceWidget NOT showing: No employeeId in session')
    return null
  }

  console.log('✅ AttendanceWidget conditions passed:', {
    hasEmployeeId: true,
    hasCheckedOut: !!status?.attendance?.checkOutTime,
    hasCheckedIn: !!status?.attendance?.checkInTime,
  })

  // Determinar el color y el icono del botón
  const hasCheckedIn = !!status?.attendance?.checkInTime
  const buttonColor = hasCheckedIn
    ? "bg-green-600 hover:bg-green-700"
    : "bg-blue-600 hover:bg-blue-700"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${buttonColor} text-white shadow-md`}
          size="sm"
        >
          <Clock className="h-4 w-4 mr-2" />
          {hasCheckedIn ? "En trabajo" : "Sin marcar"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registro de Asistencia
          </DialogTitle>
          <DialogDescription>
            {hasCheckedIn
              ? "Ya has marcado tu entrada. Puedes registrar tu salida cuando termines o cuando hagas una pausa."
              : "Marca tu entrada para comenzar a registrar tu jornada laboral."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasCheckedIn ? (
            // Ya hizo check-in - Mostrar información y botón de salida
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Hora de entrada</span>
                  <span className="font-mono font-semibold">
                    {format(new Date(status.attendance!.checkInTime!), "h:mm a", { locale: es })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm text-muted-foreground">Tiempo transcurrido</span>
                  <span className="text-2xl font-bold tabular-nums text-primary">
                    {elapsedTime || "00:00:00"}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckOut}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-5 w-5 mr-2" />
                )}
                Registrar salida
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Puedes hacer múltiples entradas y salidas durante el día
              </p>
            </>
          ) : (
            // No ha hecho check-in - Mostrar botón de entrada
            <>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <LogIn className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Presiona el botón para registrar tu hora de entrada
                </p>
              </div>

              <Button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-5 w-5 mr-2" />
                )}
                Registrar entrada
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
