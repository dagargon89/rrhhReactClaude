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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, ArrowLeft, AlertTriangle, User, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const editAccumulationSchema = z.object({
  lateArrivalsCount: z.number().min(0, "Debe ser mayor o igual a 0"),
  directTardinessCount: z.number().min(0, "Debe ser mayor o igual a 0"),
  formalTardiesCount: z.number().min(0, "Debe ser mayor o igual a 0"),
  administrativeActs: z.number().min(0, "Debe ser mayor o igual a 0"),
})

type EditAccumulationFormValues = z.infer<typeof editAccumulationSchema>

interface EditTardinessAccumulationFormProps {
  accumulation: any
}

export function EditTardinessAccumulationForm({ accumulation }: EditTardinessAccumulationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const form = useForm<EditAccumulationFormValues>({
    resolver: zodResolver(editAccumulationSchema),
    defaultValues: {
      lateArrivalsCount: accumulation.lateArrivalsCount,
      directTardinessCount: accumulation.directTardinessCount,
      formalTardiesCount: accumulation.formalTardiesCount,
      administrativeActs: accumulation.administrativeActs,
    },
  })

  const onSubmit = async (data: EditAccumulationFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tardiness-accumulations/${accumulation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Acumulación actualizada exitosamente")
        router.push(`/admin/tardiness-accumulations/employee/${accumulation.employeeId}`)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar acumulación")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar acumulación")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/tardiness-accumulations/employee/${accumulation.employeeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Editar Acumulación
          </h1>
          <p className="text-lg text-muted-foreground">
            {monthNames[accumulation.month - 1]} {accumulation.year}
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

      {/* Información del Empleado */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="h-5 w-5" />
            Empleado
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-blue-700">Nombre</p>
            <p className="font-medium text-blue-900">
              {accumulation.employee.user.firstName} {accumulation.employee.user.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Email</p>
            <p className="text-sm text-blue-900">{accumulation.employee.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Código</p>
            <p className="font-mono font-medium text-blue-900">{accumulation.employee.employeeCode}</p>
          </div>
          {accumulation.employee.department && (
            <div>
              <p className="text-sm text-blue-700">Departamento</p>
              <p className="text-sm text-blue-900">{accumulation.employee.department.name}</p>
            </div>
          )}
          {accumulation.employee.position && (
            <div>
              <p className="text-sm text-blue-700">Posición</p>
              <p className="text-sm text-blue-900">{accumulation.employee.position.title}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-blue-700 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Período
            </p>
            <p className="font-medium text-blue-900">
              {monthNames[accumulation.month - 1]} {accumulation.year}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Datos de Acumulación</CardTitle>
          <CardDescription>
            Modifique los valores de acumulación solo para correcciones administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Llegadas Tardías */}
                <FormField
                  control={form.control}
                  name="lateArrivalsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Llegadas Tardías</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Número de llegadas tardías (1-20 min) en el mes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Retardos Directos */}
                <FormField
                  control={form.control}
                  name="directTardinessCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retardos Directos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Número de retardos directos (más de 20 min) en el mes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Retardos Formales */}
                <FormField
                  control={form.control}
                  name="formalTardiesCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-700">Retardos Formales</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="border-red-200 focus-visible:ring-red-500"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Total de retardos formales acumulados (4 llegadas tardías = 1 retardo formal)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actas Administrativas */}
                <FormField
                  control={form.control}
                  name="administrativeActs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-700">Actas Administrativas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="border-purple-200 focus-visible:ring-purple-500"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Número de actas generadas (5 retardos formales = 1 acta)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
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
