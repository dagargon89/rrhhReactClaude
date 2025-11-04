/**
 * Instrumentation Hook de Next.js
 *
 * Este archivo se ejecuta una sola vez cuando el servidor de Next.js inicia.
 * Es el lugar perfecto para inicializar jobs, conexiones a BD, etc.
 *
 * Documentación: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Solo ejecutar en el servidor (no en edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 [Instrumentation] Iniciando configuración del servidor...')

    try {
      // Importar y ejecutar el inicializador de jobs
      const { initializeJobs } = await import('./src/lib/jobInitializer')

      console.log('📋 [Instrumentation] Inicializando jobs programados...')
      initializeJobs()

      console.log('✅ [Instrumentation] Configuración completada exitosamente')
    } catch (error) {
      console.error('❌ [Instrumentation] Error al inicializar:', error)
      // No lanzar el error para no detener el servidor
    }
  }
}
