import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { IncidentCalculationService } from "@/services/incidentCalculationService"
import { NotificationService } from "@/services/notificationService"
import { startOfMonth, endOfMonth } from "date-fns"

// POST - Verificar umbrales y enviar notificaciones
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { period = "current_month", sendNotifications = true } = body

    // Determinar fechas
    let startDate: Date
    let endDate: Date

    switch (period) {
      case "current_month":
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
        break
      default:
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
    }

    // Verificar umbrales
    const alerts = await IncidentCalculationService.checkThresholds(startDate, endDate)

    if (alerts.length === 0) {
      return NextResponse.json({
        message: "No se encontraron umbrales excedidos",
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        alerts: [],
      })
    }

    // Enviar notificaciones si está habilitado
    const notificationResults = []

    if (sendNotifications) {
      for (const alert of alerts) {
        const result = await NotificationService.sendThresholdAlert(alert)
        notificationResults.push({
          alert: alert.config.incidentType.name,
          ...result,
        })
      }
    }

    return NextResponse.json({
      message: `Se encontraron ${alerts.length} umbrales excedidos`,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      alerts,
      notifications: sendNotifications ? notificationResults : null,
    })
  } catch (error) {
    console.error("Error processing notifications:", error)
    return NextResponse.json(
      { error: "Error al procesar notificaciones" },
      { status: 500 }
    )
  }
}

// GET - Obtener alertas pendientes sin enviar notificaciones
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "current_month"

    // Determinar fechas
    let startDate: Date
    let endDate: Date

    switch (period) {
      case "current_month":
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
        break
      default:
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
    }

    // Verificar umbrales
    const alerts = await IncidentCalculationService.checkThresholds(startDate, endDate)

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      totalAlerts: alerts.length,
      alerts: alerts.map(alert => ({
        type: alert.config.incidentType.name,
        department: alert.config.department?.name || "Global",
        calculatedValue: alert.calculatedValue,
        thresholdValue: alert.thresholdValue,
        incidents: alert.incidents,
        notificationsEnabled: alert.config.notificationEnabled,
        recipients: alert.config.notificationEmails,
      })),
    })
  } catch (error) {
    console.error("Error getting alerts:", error)
    return NextResponse.json(
      { error: "Error al obtener alertas" },
      { status: 500 }
    )
  }
}
