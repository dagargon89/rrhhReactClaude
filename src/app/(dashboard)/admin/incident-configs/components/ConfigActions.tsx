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

interface ConfigActionsProps {
  config: any
}

const INCIDENT_TYPE_NAMES: Record<string, string> = {
  TURNOVER: "Rotación",
  ABSENTEEISM: "Ausentismo",
  TARDINESS: "Impuntualidad",
  OVERTIME: "Horas Extra",
}

const PERIOD_TYPE_NAMES: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
}

export function ConfigActions({ config }: ConfigActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/incident-configs/${config.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Configuración eliminada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar configuración")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar configuración")
    } finally {
      setDeleting(false)
    }
  }

  const typeName = INCIDENT_TYPE_NAMES[config.incidentType.name] || config.incidentType.name
  const periodName = PERIOD_TYPE_NAMES[config.periodType]
  const scope = config.department ? config.department.name : "Global"

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/incident-configs/${config.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/incident-configs/${config.id}/edit`}>
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              ¿Eliminar configuración?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la configuración:
                </p>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">Tipo:</span> {typeName}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Alcance:</span> {scope}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Período:</span> {periodName}
                  </p>
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
