"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Briefcase, Loader2, Info, Building2, TrendingUp, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const createPositionSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20),
  description: z.string().optional(),
  departmentId: z.string().cuid("Departamento inválido"),
  level: z.enum(["ENTRY", "MID", "SENIOR", "MANAGER", "DIRECTOR"]),
  isActive: z.boolean().default(true),
})

type CreatePositionFormData = z.infer<typeof createPositionSchema>

const LEVEL_LABELS: Record<string, string> = {
  ENTRY: "Inicial / Entry Level",
  MID: "Intermedio / Mid Level",
  SENIOR: "Senior",
  MANAGER: "Gerente / Manager",
  DIRECTOR: "Director",
}

export default function NewPositionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePositionFormData>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      isActive: true,
      level: "ENTRY",
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        if (response.ok) {
          const data = await response.json()
          setDepartments(Array.isArray(data) ? data : data.departments || [])
        }
      } catch (error) {
        console.error("Error loading departments:", error)
        toast.error("Error al cargar departamentos")
      } finally {
        setLoadingData(false)
      }
    }

    loadDepartments()
  }, [])

  const onSubmit = async (data: CreatePositionFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Posición creada exitosamente")
        router.push("/admin/positions")
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear posición")
      }
    } catch (error) {
      console.error("Error creating position:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/positions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear Nueva Posición
          </h1>
          <p className="text-lg text-muted-foreground">
            Agrega un nuevo puesto de trabajo a la estructura organizacional
          </p>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-2">Información sobre posiciones:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>El código debe ser único y se usa para identificación interna</li>
            <li>El nivel determina la jerarquía dentro de la organización</li>
            <li>Cada posición debe estar asociada a un departamento</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Posición *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  disabled={isLoading}
                  placeholder="Desarrollador Full Stack"
                  className="h-11"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  {...register("code")}
                  disabled={isLoading}
                  placeholder="DEV-FS"
                  className="h-11"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                disabled={isLoading}
                placeholder="Descripción de las responsabilidades y requisitos del puesto..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Departamento y Nivel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departamento *</Label>
                <Select
                  onValueChange={(value) => setValue("departmentId", value)}
                  disabled={isLoading || loadingData}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-destructive">{errors.departmentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Nivel *</Label>
                <Select
                  onValueChange={(value: any) => setValue("level", value)}
                  defaultValue="ENTRY"
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                {...register("isActive")}
                disabled={isLoading}
              />
              <Label htmlFor="isActive">Posición activa</Label>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Resumen:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span>Título: <span className="font-medium">{watchedValues.title || "Sin definir"}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Código: <span className="font-medium">{watchedValues.code || "Sin definir"}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span>Nivel: <span className="font-medium">{LEVEL_LABELS[watchedValues.level] || "Inicial"}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Estado: <span className="font-medium">{watchedValues.isActive ? "Activo" : "Inactivo"}</span></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/admin/positions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading || loadingData}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando posición...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Crear Posición
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
