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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  User, 
  Mail, 
  UserCheck,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const updateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(50).optional().or(z.literal("")),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

type UpdateUserFormData = z.infer<typeof updateUserSchema>

interface EditUserPageProps {
  params: { id: string }
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  })

  const watchedValues = watch()

  // Cargar datos del usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        
        if (response.ok) {
          const user = await response.json()
          setUserData(user)
          reset({
            email: user.email,
            username: user.username || "",
            firstName: user.firstName,
            lastName: user.lastName,
            isStaff: user.isStaff,
            isSuperuser: user.isSuperuser,
            isActive: user.isActive,
          })
        } else {
          toast.error("Error al cargar los datos del usuario")
          router.push("/admin/users")
        }
      } catch (error) {
        console.error("Error loading user:", error)
        toast.error("Error al cargar los datos del usuario")
        router.push("/admin/users")
      } finally {
        setLoadingData(false)
      }
    }
    
    loadUser()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdateUserFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Usuario actualizado exitosamente")
        router.push(`/admin/users/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar usuario")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Usuario no encontrado</h3>
            <p className="text-sm text-muted-foreground">
              El usuario que buscas no existe o ha sido eliminado
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/users/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Editar Usuario
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar información de {userData.firstName} {userData.lastName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Información de la cuenta */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Información de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  {...register("email")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Nombre de usuario (Opcional)
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="nombredeusuario"
                  {...register("username")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.username && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Info sobre contraseña */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> La contraseña no se puede cambiar desde este formulario. 
                Para cambiar la contraseña, utiliza la función de recuperación de contraseña.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información personal */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Juan"
                  {...register("firstName")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Apellido *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Pérez"
                  {...register("lastName")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles y permisos */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Roles y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive" 
                  {...register("isActive")} 
                  disabled={isLoading}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Usuario activo
                </Label>
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isStaff" 
                  {...register("isStaff")} 
                  disabled={isLoading}
                />
                <Label htmlFor="isStaff" className="text-sm font-medium">
                  Es Staff (Puede acceder a paneles de administración)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isSuperuser" 
                  {...register("isSuperuser")} 
                  disabled={isLoading}
                />
                <Label htmlFor="isSuperuser" className="text-sm font-medium">
                  Es Superusuario (Acceso total al sistema)
                </Label>
              </div>
            </div>

            {/* Resumen de permisos */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Resumen de permisos:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className={`h-4 w-4 ${watchedValues.isActive ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-sm">
                    {watchedValues.isActive ? "Usuario activo" : "Usuario inactivo"}
                  </span>
                  {watchedValues.isActive && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      Activo
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${watchedValues.isStaff ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  <span className="text-sm">
                    {watchedValues.isStaff ? "Acceso a paneles administrativos" : "Sin acceso administrativo"}
                  </span>
                  {watchedValues.isStaff && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                      Staff
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`h-4 w-4 ${watchedValues.isSuperuser ? 'text-purple-600' : 'text-muted-foreground'}`} />
                  <span className="text-sm">
                    {watchedValues.isSuperuser ? "Acceso total al sistema" : "Acceso limitado"}
                  </span>
                  {watchedValues.isSuperuser && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                      Super Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del empleado (si existe) */}
        {userData.employee && (
          <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <UserCheck className="h-5 w-5" />
                Empleado Asociado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Código de Empleado:</span>
                  <Badge className="font-mono">{userData.employee.employeeCode}</Badge>
                </div>
                {userData.employee.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Departamento:</span>
                    <span className="font-medium">{userData.employee.department.name}</span>
                  </div>
                )}
                <Separator />
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/admin/employees/${userData.employee.id}`}>
                    Ver Detalles del Empleado
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            asChild
            disabled={isLoading}
          >
            <Link href={`/admin/users/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando cambios...
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
    </div>
  )
}
