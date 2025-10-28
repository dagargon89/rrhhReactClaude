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
import { 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus, 
  Loader2,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string | null
  isActive: boolean
  isStaff: boolean
  isSuperuser: boolean
  employee: {
    id: string
    employeeCode: string
  } | null
}

interface UserActionsProps {
  user: User
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [creatingEmployee, setCreatingEmployee] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${user.firstName} ${user.lastName}?`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Usuario eliminado exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar usuario")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar usuario")
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateEmployee = async () => {
    if (!confirm(`¿Crear empleado automáticamente para ${user.firstName} ${user.lastName}?`)) {
      return
    }

    setCreatingEmployee(true)
    try {
      const response = await fetch(`/api/users/${user.id}/create-employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // No necesitamos datos adicionales
      })

      if (response.ok) {
        const employee = await response.json()
        toast.success(`Empleado creado exitosamente con código: ${employee.employeeCode}`)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear empleado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al crear empleado")
    } finally {
      setCreatingEmployee(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/users/${user.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      
      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/users/${user.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Crear/Ver Empleado */}
      {!user.employee ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCreateEmployee}
          disabled={creatingEmployee}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          {creatingEmployee ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/employees/${user.employee.id}`}>
            <UserCheck className="h-4 w-4" />
          </Link>
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
              ¿Eliminar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
              <span className="font-semibold">{user.firstName} {user.lastName}</span>{" "}
              y todos sus datos asociados.
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
