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
import { Edit, Trash2, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface ScheduleActionsProps {
  schedule: any
}

export function ScheduleActions({ schedule }: ScheduleActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Horario eliminado exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar horario")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar horario")
    } finally {
      setDeleting(false)
    }
  }

  const hasAttendances = schedule._count?.attendances > 0
  const canDelete = !hasAttendances

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/schedules/${schedule.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/schedules/${schedule.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Eliminar con AlertDialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={!canDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              ¿Eliminar horario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {canDelete ? (
                <>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el horario de{" "}
                  <span className="font-semibold">
                    {schedule.employee.user.firstName} {schedule.employee.user.lastName}
                  </span>{" "}
                  para el turno <span className="font-semibold">{schedule.shift.name}</span>.
                </>
              ) : (
                <div className="space-y-2">
                  <p>No se puede eliminar este horario porque:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {hasAttendances && (
                      <li>Tiene {schedule._count.attendances} asistencia(s) registrada(s)</li>
                    )}
                  </ul>
                  <p className="text-sm mt-2">
                    Los horarios con asistencias registradas no pueden ser eliminados.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {canDelete && (
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
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
