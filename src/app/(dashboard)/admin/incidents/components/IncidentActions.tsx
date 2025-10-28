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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface IncidentActionsProps {
  incident: any
}

export function IncidentActions({ incident }: IncidentActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Incidencia eliminada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar incidencia")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar incidencia")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Bot\u00f3n Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/incidents/${incident.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Bot\u00f3n Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/incidents/${incident.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      {/* Bot\u00f3n Eliminar con AlertDialog */}
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
              \u00bfEliminar incidencia?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Esta acci\u00f3n no se puede deshacer. Se eliminar\u00e1 permanentemente la incidencia con los siguientes detalles:
                </p>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <div>
                    <span className="font-semibold">Tipo:</span>{" "}
                    {incident.incidentType.name}
                  </div>
                  <div>
                    <span className="font-semibold">Fecha:</span>{" "}
                    {format(new Date(incident.date), "dd/MM/yyyy", { locale: es })}
                  </div>
                  <div>
                    <span className="font-semibold">Valor:</span>{" "}
                    {parseFloat(incident.value).toFixed(2)}
                  </div>
                  {incident.employee && (
                    <div>
                      <span className="font-semibold">Empleado:</span>{" "}
                      {incident.employee.firstName} {incident.employee.lastName}
                    </div>
                  )}
                  {incident.department && (
                    <div>
                      <span className="font-semibold">Departamento:</span>{" "}
                      {incident.department.name}
                    </div>
                  )}
                </div>
              </div>
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
