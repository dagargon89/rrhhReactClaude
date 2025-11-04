/**
 * Inicializador de Jobs Programados
 *
 * Este archivo inicializa todos los jobs programados (cron jobs)
 * que se ejecutan en segundo plano en la aplicación.
 */

import { startAutoCheckoutJob } from "@/jobs/autoCheckoutJob"
import { startIncidentJobs } from "@/jobs/incidentCalculationJob"

let isInitialized = false

/**
 * Inicializa todos los jobs programados
 */
export function initializeJobs() {
  if (isInitialized) {
    console.log("ℹ️  Jobs ya inicializados previamente")
    return
  }

  console.log("🚀 Inicializando jobs programados...")

  try {
    // Iniciar job de auto-checkout
    console.log("📋 Iniciando job de auto-checkout...")
    startAutoCheckoutJob()

    // Iniciar jobs de cálculo de incidencias
    console.log("📊 Iniciando jobs de incidencias...")
    startIncidentJobs()

    isInitialized = true
    console.log("✅ Todos los jobs han sido iniciados exitosamente")
  } catch (error) {
    console.error("❌ Error al inicializar jobs:", error)
    throw error
  }
}

/**
 * Verifica si los jobs están inicializados
 */
export function areJobsInitialized(): boolean {
  return isInitialized
}

// Auto-inicializar en TODOS los entornos de servidor (desarrollo y producción)
if (typeof window === "undefined") {
  // Estamos en el servidor
  console.log(`🌐 Entorno ${process.env.NODE_ENV} detectado - iniciando jobs automáticamente`)

  // Inicializar con un pequeño delay para asegurar que todo esté listo
  setTimeout(() => {
    try {
      initializeJobs()
    } catch (error) {
      console.error("❌ Error al inicializar jobs:", error)
    }
  }, 1000) // 1 segundo de delay
}
