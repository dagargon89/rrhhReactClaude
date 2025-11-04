import cron from "node-cron"
import { processAutoCheckout } from "@/services/autoCheckoutService"

/**
 * Job para auto-checkout de empleados
 *
 * Este job ejecuta el auto-checkout automáticamente:
 * - Cada 30 minutos durante horas laborales (7:00 AM - 11:30 PM)
 * - Verifica asistencias activas y aplica checkout si el turno terminó
 */

let autoCheckoutJob: cron.ScheduledTask | null = null

/**
 * Inicia el job de auto-checkout
 */
export function startAutoCheckoutJob() {
  console.log("🚀 Iniciando job de auto-checkout...")

  // Job cada 30 minutos (*/30 * * * * = cada 30 minutos)
  // Alternativa: "0 */1 * * *" para ejecutar cada hora en punto
  if (!autoCheckoutJob) {
    autoCheckoutJob = cron.schedule("*/30 * * * *", async () => {
      const now = new Date()
      console.log(`⏰ [${now.toLocaleString()}] Ejecutando proceso de auto-checkout...`)

      try {
        const result = await processAutoCheckout()

        if (result.processed > 0) {
          console.log(`✅ Auto-checkout completado: ${result.processed} empleados procesados`)

          // Log de detalles
          result.details.forEach(detail => {
            if (detail.error) {
              console.error(`  ❌ ${detail.employeeName}: ${detail.error}`)
            } else {
              console.log(`  ✓ ${detail.employeeName}: Check-out a las ${detail.checkOutTime.toLocaleTimeString()}`)
            }
          })
        } else {
          console.log("ℹ️ No hay empleados pendientes de auto-checkout")
        }

        if (result.errors > 0) {
          console.warn(`⚠️ Se encontraron ${result.errors} errores durante el proceso`)
        }
      } catch (error) {
        console.error("❌ Error fatal en job de auto-checkout:", error)
      }
    }, {
      scheduled: true,
      timezone: "America/Chihuahua" // Ajustar según tu zona horaria
    })

    console.log("✅ Job de auto-checkout iniciado: cada 30 minutos")
  } else {
    console.log("ℹ️ Job de auto-checkout ya está ejecutándose")
  }
}

/**
 * Detiene el job de auto-checkout
 */
export function stopAutoCheckoutJob() {
  console.log("🛑 Deteniendo job de auto-checkout...")

  if (autoCheckoutJob) {
    autoCheckoutJob.stop()
    autoCheckoutJob = null
    console.log("❌ Job de auto-checkout detenido")
  } else {
    console.log("ℹ️ El job de auto-checkout no estaba ejecutándose")
  }
}

/**
 * Obtiene el estado del job
 */
export function getAutoCheckoutJobStatus() {
  return {
    running: autoCheckoutJob !== null,
    status: autoCheckoutJob ? "running" : "stopped",
    schedule: "Cada 30 minutos",
    timezone: "America/Chihuahua"
  }
}

/**
 * Ejecuta el auto-checkout manualmente (útil para testing)
 */
export async function runManualAutoCheckout() {
  console.log("🔧 Ejecutando auto-checkout manual...")

  try {
    const result = await processAutoCheckout()
    console.log("✅ Auto-checkout manual completado:", result)
    return result
  } catch (error) {
    console.error("❌ Error en auto-checkout manual:", error)
    throw error
  }
}

// Auto-iniciar job SIEMPRE (desarrollo y producción)
// NOTA: Este código se ejecuta al importar el módulo por primera vez
if (typeof window === "undefined") {
  // Solo ejecutar en el servidor (no en el cliente)
  console.log(`🌐 Entorno ${process.env.NODE_ENV} detectado, iniciando job de auto-checkout automáticamente...`)
  startAutoCheckoutJob()
}
