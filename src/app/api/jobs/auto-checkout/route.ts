import { NextRequest, NextResponse } from "next/server"
import {
  startAutoCheckoutJob,
  stopAutoCheckoutJob,
  getAutoCheckoutJobStatus,
  runManualAutoCheckout
} from "@/jobs/autoCheckoutJob"

// GET - Obtener estado del job
export async function GET() {
  try {
    const status = getAutoCheckoutJobStatus()
    return NextResponse.json({
      success: true,
      ...status
    })
  } catch (error) {
    console.error("Error getting auto-checkout job status:", error)
    return NextResponse.json(
      { error: "Error al obtener estado del job" },
      { status: 500 }
    )
  }
}

// POST - Ejecutar acciones en el job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "start":
        startAutoCheckoutJob()
        return NextResponse.json({
          success: true,
          message: "Job de auto-checkout iniciado",
          status: getAutoCheckoutJobStatus()
        })

      case "stop":
        stopAutoCheckoutJob()
        return NextResponse.json({
          success: true,
          message: "Job de auto-checkout detenido",
          status: getAutoCheckoutJobStatus()
        })

      case "run":
        console.log("📊 Ejecutando auto-checkout manual...")
        const result = await runManualAutoCheckout()
        return NextResponse.json({
          success: true,
          message: "Auto-checkout ejecutado manualmente",
          result
        })

      default:
        return NextResponse.json(
          { error: "Acción inválida. Usa: start, stop, o run" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error in auto-checkout job endpoint:", error)
    return NextResponse.json(
      {
        error: "Error al ejecutar acción",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}
