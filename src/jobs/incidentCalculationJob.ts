import cron from "node-cron"
import { IncidentCalculationService } from "@/services/incidentCalculationService"
import { NotificationService } from "@/services/notificationService"
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns"

/**
 * Job para cálculo automático de incidencias
 *
 * Este job ejecuta los cálculos de incidencias de forma programada:
 * - Diariamente a las 23:00 para calcular incidencias del día
 * - Primer día del mes a las 02:00 para calcular incidencias del mes anterior
 */

let dailyJob: cron.ScheduledTask | null = null
let monthlyJob: cron.ScheduledTask | null = null
let alertsJob: cron.ScheduledTask | null = null

/**
 * Inicia todos los jobs programados
 */
export function startIncidentJobs() {
  console.log("🚀 Iniciando jobs de cálculo de incidencias...")

  // Job diario: Calcular incidencias del día a las 23:00
  if (!dailyJob) {
    dailyJob = cron.schedule("0 23 * * *", async () => {
      console.log("⏰ Ejecutando cálculo diario de incidencias...")
      await calculateDailyIncidents()
    }, {
      scheduled: true,
      timezone: "America/Mexico_City" // Ajustar según la zona horaria
    })
    console.log("✅ Job diario iniciado: 23:00 cada día")
  }

  // Job mensual: Calcular incidencias del mes pasado el día 1 a las 02:00
  if (!monthlyJob) {
    monthlyJob = cron.schedule("0 2 1 * *", async () => {
      console.log("⏰ Ejecutando cálculo mensual de incidencias...")
      await calculateMonthlyIncidents()
    }, {
      scheduled: true,
      timezone: "America/Mexico_City"
    })
    console.log("✅ Job mensual iniciado: 02:00 del día 1 de cada mes")
  }

  // Job de alertas: Verificar umbrales cada 6 horas
  if (!alertsJob) {
    alertsJob = cron.schedule("0 */6 * * *", async () => {
      console.log("⏰ Verificando umbrales de incidencias...")
      await checkThresholdsAndNotify()
    }, {
      scheduled: true,
      timezone: "America/Mexico_City"
    })
    console.log("✅ Job de alertas iniciado: cada 6 horas")
  }

  console.log("✨ Todos los jobs de incidencias están activos")
}

/**
 * Detiene todos los jobs programados
 */
export function stopIncidentJobs() {
  console.log("🛑 Deteniendo jobs de incidencias...")

  if (dailyJob) {
    dailyJob.stop()
    dailyJob = null
    console.log("❌ Job diario detenido")
  }

  if (monthlyJob) {
    monthlyJob.stop()
    monthlyJob = null
    console.log("❌ Job mensual detenido")
  }

  if (alertsJob) {
    alertsJob.stop()
    alertsJob = null
    console.log("❌ Job de alertas detenido")
  }

  console.log("✨ Todos los jobs han sido detenidos")
}

/**
 * Obtiene el estado de los jobs
 */
export function getJobsStatus() {
  return {
    dailyJob: dailyJob ? "running" : "stopped",
    monthlyJob: monthlyJob ? "running" : "stopped",
    alertsJob: alertsJob ? "running" : "stopped",
  }
}

/**
 * Calcula incidencias del día actual
 */
async function calculateDailyIncidents() {
  try {
    const today = new Date()
    const startDate = startOfDay(today)
    const endDate = endOfDay(today)

    console.log(`📊 Calculando incidencias del día: ${today.toISOString().split('T')[0]}`)

    // Calcular tardiness y overtime (se calculan por día)
    const results = {
      tardiness: await IncidentCalculationService.calculateTardiness(startDate, endDate),
      overtime: await IncidentCalculationService.calculateOvertime(startDate, endDate),
    }

    console.log("✅ Cálculo diario completado:", {
      tardiness: results.tardiness.lateArrivals,
      overtime: results.overtime.totalHours,
    })

    return results
  } catch (error) {
    console.error("❌ Error en cálculo diario:", error)
    throw error
  }
}

/**
 * Calcula incidencias del mes anterior
 */
async function calculateMonthlyIncidents() {
  try {
    const lastMonth = subMonths(new Date(), 1)
    const startDate = startOfMonth(lastMonth)
    const endDate = endOfMonth(lastMonth)

    console.log(`📊 Calculando incidencias del mes: ${lastMonth.toISOString().split('T')[0]}`)

    // Calcular todas las incidencias del mes
    const results = await IncidentCalculationService.calculateAllIncidents(startDate, endDate)

    console.log("✅ Cálculo mensual completado:", {
      turnover: results.turnover.rate,
      absenteeism: results.absenteeism.rate,
      tardiness: results.tardiness.lateArrivals,
      overtime: results.overtime.totalHours,
    })

    return results
  } catch (error) {
    console.error("❌ Error en cálculo mensual:", error)
    throw error
  }
}

/**
 * Verifica umbrales y envía notificaciones
 */
async function checkThresholdsAndNotify() {
  try {
    const today = new Date()
    const startDate = startOfMonth(today)
    const endDate = endOfMonth(today)

    console.log("🔍 Verificando umbrales de incidencias...")

    // Verificar umbrales
    const alerts = await IncidentCalculationService.checkThresholds(startDate, endDate)

    if (alerts.length === 0) {
      console.log("✅ No se encontraron umbrales excedidos")
      return { alerts: [], notifications: [] }
    }

    console.log(`⚠️ Se encontraron ${alerts.length} umbrales excedidos`)

    // Enviar notificaciones para cada alerta
    const notifications = []
    for (const alert of alerts) {
      const result = await NotificationService.sendThresholdAlert(alert)
      notifications.push(result)
    }

    console.log(`📧 Notificaciones enviadas: ${notifications.filter(n => n.sent).length}/${notifications.length}`)

    return { alerts, notifications }
  } catch (error) {
    console.error("❌ Error verificando umbrales:", error)
    throw error
  }
}

/**
 * Ejecuta el cálculo de forma manual (útil para testing)
 */
export async function runManualCalculation(type: "daily" | "monthly" | "alerts") {
  console.log(`🔧 Ejecutando cálculo manual: ${type}`)

  switch (type) {
    case "daily":
      return await calculateDailyIncidents()
    case "monthly":
      return await calculateMonthlyIncidents()
    case "alerts":
      return await checkThresholdsAndNotify()
    default:
      throw new Error(`Tipo de cálculo inválido: ${type}`)
  }
}

// Auto-iniciar jobs si NODE_ENV es production
if (process.env.NODE_ENV === "production") {
  console.log("🌐 Entorno de producción detectado, iniciando jobs automáticamente...")
  startIncidentJobs()
}
