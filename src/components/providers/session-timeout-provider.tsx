"use client"

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useIdleTimer } from '@/hooks/use-idle-timer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface SessionTimeoutProviderProps {
  children: React.ReactNode
  /**
   * Tiempo de inactividad en minutos antes de cerrar sesión
   * Por defecto: 60 minutos (1 hora)
   */
  timeoutMinutes?: number
  /**
   * Tiempo en minutos antes del cierre de sesión para mostrar advertencia
   * Por defecto: 5 minutos
   */
  warningMinutes?: number
}

export function SessionTimeoutProvider({
  children,
  timeoutMinutes = 60,
  warningMinutes = 5,
}: SessionTimeoutProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = warningMinutes * 60 * 1000

  const handleIdle = async () => {
    // Cerrar sesión automáticamente
    console.log('Sesión cerrada por inactividad')
    await signOut({
      callbackUrl: '/login?reason=inactivity',
      redirect: true
    })
  }

  const handlePrompt = () => {
    // Mostrar advertencia
    setIsOpen(true)
  }

  const { reset, remainingTime } = useIdleTimer({
    timeout: timeoutMs,
    promptBeforeIdle: warningMs,
    onIdle: handleIdle,
    onPrompt: handlePrompt,
    enabled: true,
  })

  // Actualizar countdown cada segundo
  useEffect(() => {
    if (isOpen) {
      const countdownSeconds = Math.ceil(remainingTime / 1000)
      setCountdown(countdownSeconds)
    }
  }, [remainingTime, isOpen])

  const handleContinue = () => {
    setIsOpen(false)
    reset()
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await signOut({
      callbackUrl: '/login',
      redirect: true
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressValue = isOpen ? (countdown / (warningMinutes * 60)) * 100 : 100

  return (
    <>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Sesión por expirar</DialogTitle>
            <DialogDescription>
              Tu sesión está por expirar debido a inactividad. ¿Deseas continuar?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatTime(countdown)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                tiempo restante
              </p>
            </div>

            <Progress value={progressValue} className="h-2" />

            <p className="text-sm text-muted-foreground text-center">
              La sesión se cerrará automáticamente cuando el tiempo llegue a cero.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Cerrar sesión
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Continuar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
