"use client"

import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Save, 
  UserPlus, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  UserCheck,
  Info
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(50).optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

export default function NewUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      isStaff: false,
      isSuperuser: false,
      isActive: true,
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Usuario creado exitosamente")
        reset()
        router.push("/admin/users")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear usuario")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear Nuevo Usuario
          </h1>
          <p className="text-lg text-muted-foreground">
            Agrega un nuevo usuario al sistema con roles y permisos
          </p>
        </div>
      </div>

      {/* Información de roles */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p className="font-medium">Información sobre roles:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Usuario: Acceso básico al sistema
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Staff: Acceso a paneles administrativos
              </Badge>
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Super Admin: Acceso total al sistema
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>

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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isLoading}
                className="h-11"
              />
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
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
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {watchedValues.isActive ? "Usuario activo" : "Usuario inactivo"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {watchedValues.isStaff ? "Acceso a paneles administrativos" : "Sin acceso administrativo"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">
                    {watchedValues.isSuperuser ? "Acceso total al sistema" : "Acceso limitado"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            asChild
            disabled={isLoading}
          >
            <Link href="/admin/users">
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
                Creando usuario...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}