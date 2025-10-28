"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, ArrowLeft, AlertTriangle, User, Calendar, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "sonner"

const editRecordSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]),
  suspensionDays: z.number().min(0).optional().nullable(),
  description: z.string().min(1, "La descripción es requerida").max(1000),
  notes: z.string().max(1000).optional().nullable(),
  appliedDate: z.string().optional(),
  effectiveDate: z.string().optional().nullable(),
  expirationDate: z.string().optional().nullable(),
})

type EditRecordFormValues = z.infer<typeof editRecordSchema>

const actionTypeLabels: Record<string, { label: string; color: string }> = {
  WARNING: { label: "Amonestación Verbal", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  WRITTEN_WARNING: { label: "Amonestación Escrita", color: "bg-orange-100 text-orange-800 border-orange-300" },
  ADMINISTRATIVE_ACT: { label: "Acta Administrativa", color: "bg-red-100 text-red-800 border-red-300" },
  SUSPENSION: { label: "Suspensión", color: "bg-purple-100 text-purple-800 border-purple-300" },
  TERMINATION: { label: "Terminación", color: "bg-gray-800 text-white border-gray-900" },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  ACTIVE: { label: "Activo", color: "bg-green-100 text-green-800" },
  COMPLETED: { label: "Completado", color: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "Cancelado", color: "bg-gray-100 text-gray-800" },
}

interface EditDisciplinaryRecordFormProps {
  record: any
}

export function EditDisciplinaryRecordForm({ record }: EditDisciplinaryRecordFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditRecordFormValues>({
    resolver: zodResolver(editRecordSchema),
    defaultValues: {
      status: record.status,
      suspensionDays: record.suspensionDays,
      description: record.description,
      notes: record.notes || "",
      appliedDate: record.appliedDate.split("T")[0],
      effectiveDate: record.effectiveDate?.split("T")[0] || "",
      expirationDate: record.expirationDate?.split("T")[0] || "",
    },
  })

  const onSubmit = async (data: EditRecordFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/disciplinary-records/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          appliedDate: data.appliedDate ? new Date(data.appliedDate).toISOString() : undefined,
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate).toISOString() : null,
          expirationDate: data.expirationDate ? new Date(data.expirationDate).toISOString() : null,
        }),
      })

      if (response.ok) {
        toast.success("Acta actualizada exitosamente")
        router.push(`/admin/disciplinary-records/${record.id}`)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar acta")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar acta")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/disciplinary-records/${record.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
            Editar Acta Disciplinaria
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar información del acta disciplinaria
          </p>
        </div>
      </div>

      {/* Alerta de advertencia */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Advertencia:</strong> Esta acción modificará datos de auditoría.
          Solo realice cambios si es absolutamente necesario por correcciones administrativas.
          Todos los cambios quedarán registrados en el sistema.
        </AlertDescription>
      </Alert>

      {/* Información del Empleado y Tipo de Acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Empleado */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="h-5 w-5" />
              Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-blue-700">Nombre</p>
              <p className="font-medium text-blue-900">
                {record.employee.user.firstName} {record.employee.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Email</p>
              <p className="text-sm text-blue-900">{record.employee.user.email}</p>
            </div>
            {record.employee.department && (
              <div>
                <p className="text-sm text-blue-700">Departamento</p>
                <p className="text-sm text-blue-900">{record.employee.department.name}</p>
              </div>
            )}
            {record.employee.position && (
              <div>
                <p className="text-sm text-blue-700">Posición</p>
                <p className="text-sm text-blue-900">{record.employee.position.title}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de la Acción */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Shield className="h-5 w-5" />
              Tipo de Acción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-red-700">Acción Disciplinaria</p>
              <Badge className={actionTypeLabels[record.actionType].color}>
                {actionTypeLabels[record.actionType].label}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-red-700">Trigger</p>
              <p className="text-sm text-red-900">{record.triggerType.replace(/_/g, " ")}</p>
            </div>
            {record.rule && (
              <div>
                <p className="text-sm text-red-700">Regla Aplicada</p>
                <p className="text-sm text-red-900">{record.rule.name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulario */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Datos del Acta</CardTitle>
          <CardDescription>
            Modifique los campos necesarios para corregir el acta disciplinaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Estado */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pendiente</SelectItem>
                          <SelectItem value="ACTIVE">Activo</SelectItem>
                          <SelectItem value="COMPLETED">Completado</SelectItem>
                          <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Estado actual del acta disciplinaria
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Días de Suspensión (si aplica) */}
                {record.actionType === "SUSPENSION" && (
                  <FormField
                    control={form.control}
                    name="suspensionDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Días de Suspensión</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value || 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de días de suspensión
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="appliedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fecha de Aplicación
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Cuando se aplicó el acta
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fecha Efectiva
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Cuando entra en vigencia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fecha de Expiración
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Cuando expira el acta
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción detallada del acta disciplinaria..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descripción completa de la acción disciplinaria
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notas */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales (opcional)..."
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Comentarios o notas adicionales sobre el acta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botones */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
