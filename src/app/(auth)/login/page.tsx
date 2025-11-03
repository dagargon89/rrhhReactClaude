"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Building2, Eye, EyeOff, Loader2, Shield, Users, Clock, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showInactivityAlert, setShowInactivityAlert] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason === 'inactivity') {
      setShowInactivityAlert(true)
      toast.error("Sesión cerrada", {
        description: "Tu sesión fue cerrada por inactividad. Por favor, inicia sesión nuevamente.",
        duration: 5000,
      })
    }
  }, [searchParams])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Error al iniciar sesión", {
          description: result.error,
        })
      } else {
        toast.success("Inicio de sesión exitoso")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("Error al iniciar sesión", {
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header con logo y título */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            HRMS
          </h1>
          <p className="text-muted-foreground">
            Sistema de Gestión de Recursos Humanos
          </p>
        </div>
      </div>

      {/* Alert de sesión cerrada por inactividad */}
      {showInactivityAlert && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            Tu sesión fue cerrada por inactividad. Por favor, inicia sesión nuevamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Card principal del login */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Bienvenido de vuelta</CardTitle>
            <CardDescription className="text-base">
              Inicia sesión en tu cuenta para continuar
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                {...register("email")}
                disabled={isLoading}
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          {/* Información de credenciales de prueba */}
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-medium">Credenciales de prueba:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span className="font-mono">admin@hrms.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">admin123</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Características del sistema */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Características del sistema:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="text-xs">
                Gestión de Empleados
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Control de Asistencias
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Gestión de Vacaciones
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Reportes y Analytics
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>© 2024 HRMS. Sistema de Recursos Humanos.</p>
      </div>
    </div>
  )
}