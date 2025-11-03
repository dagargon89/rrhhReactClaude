"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseIdleTimerOptions {
  /**
   * Tiempo de inactividad en milisegundos antes de ejecutar onIdle
   * Por defecto: 3600000 (1 hora)
   */
  timeout?: number

  /**
   * Callback que se ejecuta cuando el usuario está inactivo
   */
  onIdle?: () => void

  /**
   * Callback que se ejecuta cuando el usuario vuelve a estar activo
   */
  onActive?: () => void

  /**
   * Tiempo antes del timeout para mostrar advertencia (en milisegundos)
   * Por defecto: 300000 (5 minutos)
   */
  promptBeforeIdle?: number

  /**
   * Callback para advertencia antes de timeout
   */
  onPrompt?: () => void

  /**
   * Eventos a escuchar para detectar actividad
   */
  events?: string[]

  /**
   * Habilitar/deshabilitar el timer
   */
  enabled?: boolean
}

const DEFAULT_EVENTS = [
  'mousemove',
  'keydown',
  'wheel',
  'DOMMouseScroll',
  'mousewheel',
  'mousedown',
  'touchstart',
  'touchmove',
  'MSPointerDown',
  'MSPointerMove',
  'visibilitychange',
]

export function useIdleTimer({
  timeout = 60 * 60 * 1000, // 1 hora por defecto
  onIdle,
  onActive,
  promptBeforeIdle = 5 * 60 * 1000, // 5 minutos antes
  onPrompt,
  events = DEFAULT_EVENTS,
  enabled = true,
}: UseIdleTimerOptions = {}) {
  const [isIdle, setIsIdle] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [remainingTime, setRemainingTime] = useState(timeout)

  const timeoutId = useRef<NodeJS.Timeout>()
  const promptTimeoutId = useRef<NodeJS.Timeout>()
  const intervalId = useRef<NodeJS.Timeout>()
  const lastActiveTime = useRef<number>(Date.now())

  const reset = useCallback(() => {
    if (!enabled) return

    lastActiveTime.current = Date.now()
    setRemainingTime(timeout)

    if (isIdle) {
      setIsIdle(false)
      onActive?.()
    }

    if (showPrompt) {
      setShowPrompt(false)
    }

    // Limpiar timeouts existentes
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    if (promptTimeoutId.current) {
      clearTimeout(promptTimeoutId.current)
    }

    // Configurar timeout para advertencia
    if (promptBeforeIdle > 0 && onPrompt) {
      const promptTime = timeout - promptBeforeIdle
      promptTimeoutId.current = setTimeout(() => {
        setShowPrompt(true)
        onPrompt()
      }, promptTime)
    }

    // Configurar timeout para inactividad
    timeoutId.current = setTimeout(() => {
      setIsIdle(true)
      onIdle?.()
    }, timeout)
  }, [enabled, timeout, promptBeforeIdle, isIdle, showPrompt, onIdle, onActive, onPrompt])

  const pause = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    if (promptTimeoutId.current) {
      clearTimeout(promptTimeoutId.current)
    }
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }
  }, [])

  const resume = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (!enabled) {
      pause()
      return
    }

    // Configurar listeners de eventos
    const handleActivity = () => {
      reset()
    }

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Iniciar el timer
    reset()

    // Actualizar tiempo restante cada segundo
    intervalId.current = setInterval(() => {
      const elapsed = Date.now() - lastActiveTime.current
      const remaining = Math.max(0, timeout - elapsed)
      setRemainingTime(remaining)
    }, 1000)

    return () => {
      // Limpiar listeners
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })

      // Limpiar timeouts e interval
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
      if (promptTimeoutId.current) {
        clearTimeout(promptTimeoutId.current)
      }
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [enabled, events, reset, timeout, pause])

  return {
    isIdle,
    showPrompt,
    remainingTime,
    reset,
    pause,
    resume,
  }
}
