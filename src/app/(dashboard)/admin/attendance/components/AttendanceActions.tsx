"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Edit, Trash2, Eye, Loader2, LogOut } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AttendanceActionsProps {
  attendance: any
}

export function AttendanceActions({ attendance }: AttendanceActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/attendance/${attendance.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Asistencia eliminada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar asistencia")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar asistencia")
    } finally {
      setDeleting(false)
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      const response = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceId: attendance.id,
          checkOutMethod: "MANUAL",
        }),
      })

      if (response.ok) {
        toast.success("Salida registrada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al registrar salida")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al registrar salida")
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/attendance/${attendance.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/attendance/${attendance.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Registrar Salida (solo si no tiene checkout) */}
      {attendance.checkInTime && !attendance.checkOutTime && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCheckout}
          disabled={checkingOut}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          {checkingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Botón Eliminar con AlertDialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              ¿Eliminar registro de asistencia?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              registro de asistencia de{" "}
              <span className="font-semibold">
                {attendance.employee.user.firstName}{" "}
                {attendance.employee.user.lastName}
              </span>{" "}
              del día{" "}
              {new Date(attendance.date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



