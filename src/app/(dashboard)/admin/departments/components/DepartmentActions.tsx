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

interface DepartmentActionsProps {
  department: any
}

export function DepartmentActions({ department }: DepartmentActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/departments/${department.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Departamento eliminado exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar departamento")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar departamento")
    } finally {
      setDeleting(false)
    }
  }

  const hasEmployees = department._count?.employees > 0
  const hasSubDepartments = department._count?.subDepartments > 0
  const hasPositions = department._count?.positions > 0
  const canDelete = !hasEmployees && !hasSubDepartments && !hasPositions

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/departments/${department.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/departments/${department.id}/edit`}>
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
              ¿Eliminar departamento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {canDelete ? (
                <>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el departamento{" "}
                  <span className="font-semibold">{department.name}</span>.
                </>
              ) : (
                <div className="space-y-2">
                  <p>No se puede eliminar este departamento porque:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {hasEmployees && (
                      <li>Tiene {department._count.employees} empleado(s) asignado(s)</li>
                    )}
                    {hasSubDepartments && (
                      <li>Tiene {department._count.subDepartments} subdepartamento(s)</li>
                    )}
                    {hasPositions && (
                      <li>Tiene {department._count.positions} posición(es) asignada(s)</li>
                    )}
                  </ul>
                  <p className="text-sm mt-2">
                    Elimine o reasigne estos elementos antes de eliminar el departamento.
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
