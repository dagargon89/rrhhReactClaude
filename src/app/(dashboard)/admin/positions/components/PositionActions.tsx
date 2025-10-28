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

interface PositionActionsProps {
  position: any
}

export function PositionActions({ position }: PositionActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/positions/${position.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Posición eliminada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar posición")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar posición")
    } finally {
      setDeleting(false)
    }
  }

  const hasEmployees = position._count?.employees > 0
  const canDelete = !hasEmployees

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/positions/${position.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/positions/${position.id}/edit`}>
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
              ¿Eliminar posición?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {canDelete ? (
                <>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la posición{" "}
                  <span className="font-semibold">{position.title}</span>.
                </>
              ) : (
                <div className="space-y-2">
                  <p>No se puede eliminar esta posición porque:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {hasEmployees && (
                      <li>Tiene {position._count.employees} empleado(s) asignado(s)</li>
                    )}
                  </ul>
                  <p className="text-sm mt-2">
                    Reasigne los empleados a otra posición antes de eliminar.
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
