"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Eye, MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface DisciplinaryRecordActionsProps {
  record: {
    id: string
    employeeId: string
    status: string
    actionType: string
    employee: {
      employeeCode: string
      user: {
        firstName: string
        lastName: string
      }
    }
  }
}

export function DisciplinaryRecordActions({ record }: DisciplinaryRecordActionsProps) {
  const router = useRouter()
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/disciplinary-records/${record.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: notes || undefined,
        }),
      })

      if (response.ok) {
        toast.success("Acta aprobada exitosamente")
        setIsApproveOpen(false)
        setNotes("")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al aprobar acta")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al aprobar acta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Debes proporcionar una razón para rechazar el acta")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/disciplinary-records/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CANCELLED",
          notes: rejectionReason,
        }),
      })

      if (response.ok) {
        toast.success("Acta rechazada exitosamente")
        setIsRejectOpen(false)
        setRejectionReason("")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al rechazar acta")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al rechazar acta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/disciplinary-records/${record.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </Link>
          </DropdownMenuItem>
          {record.status === "PENDING" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsApproveOpen(true)}
                className="text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsRejectOpen(true)}
                className="text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de Aprobación */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Aprobar Acta Disciplinaria
            </DialogTitle>
            <DialogDescription>
              Estás a punto de aprobar el acta para{" "}
              <span className="font-semibold">
                {record.employee.user.firstName} {record.employee.user.lastName}
              </span>{" "}
              ({record.employee.employeeCode}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Agrega comentarios o notas sobre esta aprobación..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Al aprobar esta acta, se aplicarán
                las consecuencias configuradas (suspensión, afectar salario, etc.)
                según la regla disciplinaria.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar Acta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Rechazo */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Rechazar Acta Disciplinaria
            </DialogTitle>
            <DialogDescription>
              Estás a punto de rechazar el acta para{" "}
              <span className="font-semibold">
                {record.employee.user.firstName} {record.employee.user.lastName}
              </span>{" "}
              ({record.employee.employeeCode}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">
                Razón del Rechazo *
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explica por qué se rechaza esta acta..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                disabled={isLoading}
                className={rejectionReason.trim() ? "" : "border-red-300"}
              />
              {!rejectionReason.trim() && (
                <p className="text-sm text-red-600">
                  La razón del rechazo es obligatoria
                </p>
              )}
            </div>

            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">
                <strong>Importante:</strong> Al rechazar esta acta, se cancelará
                y no se aplicará ninguna sanción al empleado.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar Acta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
