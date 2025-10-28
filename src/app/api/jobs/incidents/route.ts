import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { startIncidentJobs, stopIncidentJobs, getJobsStatus, runManualCalculation } from "@/jobs/incidentCalculationJob"

// GET - Obtener estado de los jobs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const status = getJobsStatus()

    return NextResponse.json({
      status,
      message: "Estado de los jobs de incidencias",
      schedules: {
        daily: "23:00 cada día",
        monthly: "02:00 del día 1 de cada mes",
        alerts: "Cada 6 horas",
      },
    })
  } catch (error) {
    console.error("Error getting jobs status:", error)
    return NextResponse.json(
      { error: "Error al obtener estado de los jobs" },
      { status: 500 }
    )
  }
}

// POST - Controlar jobs (start, stop, run)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { action, jobType } = body

    switch (action) {
      case "start":
        startIncidentJobs()
        return NextResponse.json({
          message: "Jobs iniciados exitosamente",
          status: getJobsStatus(),
        })

      case "stop":
        stopIncidentJobs()
        return NextResponse.json({
          message: "Jobs detenidos exitosamente",
          status: getJobsStatus(),
        })

      case "run":
        if (!jobType || !["daily", "monthly", "alerts"].includes(jobType)) {
          return NextResponse.json(
            { error: "jobType debe ser 'daily', 'monthly' o 'alerts'" },
            { status: 400 }
          )
        }

        const result = await runManualCalculation(jobType as "daily" | "monthly" | "alerts")
        return NextResponse.json({
          message: `Job ${jobType} ejecutado manualmente`,
          result,
        })

      default:
        return NextResponse.json(
          { error: "Acción inválida. Use 'start', 'stop' o 'run'" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error controlling jobs:", error)
    return NextResponse.json(
      { error: "Error al controlar los jobs" },
      { status: 500 }
    )
  }
}
