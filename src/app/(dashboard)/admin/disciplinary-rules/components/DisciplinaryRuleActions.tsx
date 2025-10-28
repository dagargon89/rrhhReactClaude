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
import { Edit, Trash2, Loader2, Power, PowerOff, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface DisciplinaryRuleActionsProps {
  rule: any
}

export function DisciplinaryRuleActions({ rule }: DisciplinaryRuleActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/disciplinary-rules/${rule.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Regla eliminada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar regla")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar regla")
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    setToggling(true)
    try {
      const response = await fetch(`/api/disciplinary-rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !rule.isActive,
        }),
      })

      if (response.ok) {
        toast.success(
          rule.isActive
            ? "Regla desactivada exitosamente"
            : "Regla activada exitosamente"
        )
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al cambiar estado de la regla")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cambiar estado de la regla")
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/disciplinary-rules/${rule.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/disciplinary-rules/${rule.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Activar/Desactivar */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleStatus}
        disabled={toggling}
        className={
          rule.isActive
            ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            : "text-green-600 hover:text-green-700 hover:bg-green-50"
        }
      >
        {toggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : rule.isActive ? (
          <PowerOff className="h-4 w-4" />
        ) : (
          <Power className="h-4 w-4" />
        )}
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
              ¿Eliminar regla?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la regla{" "}
              <span className="font-semibold">{rule.name}</span> y dejará de aplicarse
              en el sistema disciplinario.
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
