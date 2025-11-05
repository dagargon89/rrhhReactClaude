"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Power, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

/**
 * Botón para ejecutar manualmente el proceso de auto check-out
 * Solo visible para administradores
 */
export function ManualAutoCheckoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAutoCheckout = async () => {
    setIsLoading(true)

    try {
      // Crear fecha en UTC para el día seleccionado (00:00:00)
      // El Calendar devuelve fechas en hora local, así que usamos los componentes locales
      // para crear una fecha UTC que represente ese mismo día calendario
      const targetDate = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        0, 0, 0, 0
      ))

      const response = await fetch("/api/attendance/auto-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: targetDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al ejecutar auto-checkout")
      }

      // Mostrar resultado
      if (data.data.processed > 0) {
        toast.success("Auto-checkout ejecutado", {
          description: `Se procesaron ${data.data.processed} asistencias${
            data.data.errors > 0 ? ` con ${data.data.errors} errores` : ""
          }`,
        })
      } else {
        toast.info("Auto-checkout ejecutado", {
          description: "No había asistencias pendientes para procesar",
        })
      }

      // Cerrar el diálogo y refrescar la página
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error al ejecutar auto-checkout:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudo ejecutar el auto-checkout",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="default"
          disabled={isLoading}
          className="border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              Auto Check-Out Manual
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Ejecutar Auto Check-Out Manual?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Selecciona la fecha para procesar:</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={es}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Esta acción ejecutará el proceso de auto check-out para todos los empleados que:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Tengan check-in registrado en la fecha seleccionada</li>
                <li>No tengan check-out registrado</li>
                <li>Tengan un turno con auto check-out habilitado</li>
                <li>Ya hayan pasado su hora de salida programada</li>
              </ul>
            </div>

            <p className="text-orange-600 font-medium text-sm">
              ⚠️ Esta acción registrará la salida automáticamente y no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAutoCheckout}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              "Ejecutar Auto Check-Out"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
