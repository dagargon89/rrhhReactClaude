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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Eye, Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface LeaveRequestActionsProps {
  request: any
}

export function LeaveRequestActions({ request }: LeaveRequestActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/leave-requests/${request.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Solicitud eliminada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar solicitud")
    } finally {
      setDeleting(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      const response = await fetch(`/api/leave-requests/${request.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
        }),
      })

      if (response.ok) {
        toast.success("Solicitud aprobada exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al aprobar solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al aprobar solicitud")
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Debe proporcionar un motivo de rechazo")
      return
    }

    setRejecting(true)
    try {
      const response = await fetch(`/api/leave-requests/${request.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      })

      if (response.ok) {
        toast.success("Solicitud rechazada exitosamente")
        setShowRejectDialog(false)
        setRejectionReason("")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al rechazar solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al rechazar solicitud")
    } finally {
      setRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/leaves/${request.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar (solo si está PENDING) */}
      {request.status === "PENDING" && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/leaves/${request.id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
      )}

      {/* Botón Aprobar (solo si está PENDING) */}
      {request.status === "PENDING" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              disabled={approving}
            >
              {approving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                ¿Aprobar solicitud de permiso?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Se aprobará la solicitud de permiso de{" "}
                <span className="font-semibold">
                  {request.employee.user.firstName} {request.employee.user.lastName}
                </span>{" "}
                por <span className="font-semibold">{request.totalDays} días</span>.
                <br />
                <br />
                Esta acción actualizará el saldo de permisos del empleado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                disabled={approving}
                className="bg-green-600 hover:bg-green-700"
              >
                {approving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Aprobando...
                  </>
                ) : (
                  "Aprobar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Botón Rechazar (solo si está PENDING) */}
      {request.status === "PENDING" && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-600" />
                Rechazar solicitud de permiso
              </DialogTitle>
              <DialogDescription>
                Proporcione un motivo para rechazar la solicitud de{" "}
                <span className="font-semibold">
                  {request.employee.user.firstName} {request.employee.user.lastName}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Motivo de rechazo *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Explique por qué se rechaza esta solicitud..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectionReason("")
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReject}
                disabled={rejecting || !rejectionReason.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {rejecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  "Rechazar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Botón Eliminar */}
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
              ¿Eliminar solicitud?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              solicitud de permiso de{" "}
              <span className="font-semibold">
                {request.employee.user.firstName} {request.employee.user.lastName}
              </span>
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
