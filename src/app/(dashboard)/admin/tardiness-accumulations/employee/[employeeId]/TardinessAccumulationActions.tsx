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
import { Edit, Trash2, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface TardinessAccumulationActionsProps {
  accumulation: any
}

export function TardinessAccumulationActions({ accumulation }: TardinessAccumulationActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/tardiness-accumulations/${accumulation.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Acumulación eliminada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar acumulación")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar acumulación")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón Editar */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Link href={`/admin/tardiness-accumulations/${accumulation.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Eliminar con AlertDialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              ¿Eliminar acumulación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la acumulación de{" "}
              <span className="font-semibold">
                {monthNames[accumulation.month - 1]} {accumulation.year}
              </span>.
              <br />
              <br />
              <strong className="text-red-600">Advertencia:</strong> Esta acción eliminará datos de
              auditoría. Solo realice esta acción si es absolutamente necesario.
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
