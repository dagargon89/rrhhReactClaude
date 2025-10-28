import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { IncidentCalculationService } from "@/services/incidentCalculationService"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import { z } from "zod"

// Schema para validar parámetros
const calculateSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(["current_month", "last_month", "custom"]).default("current_month"),
  departmentId: z.string().cuid().optional(),
  types: z.array(z.enum(["turnover", "absenteeism", "tardiness", "overtime"])).optional(),
})

// POST - Calcular incidencias automáticamente
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = calculateSchema.parse(body)

    // Determinar fechas según el período
    let startDate: Date
    let endDate: Date

    switch (validatedData.period) {
      case "current_month":
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
        break
      case "last_month":
        const lastMonth = subMonths(new Date(), 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      case "custom":
        if (!validatedData.startDate || !validatedData.endDate) {
          return NextResponse.json(
            { error: "Para período personalizado se requieren startDate y endDate" },
            { status: 400 }
          )
        }
        startDate = new Date(validatedData.startDate)
        endDate = new Date(validatedData.endDate)
        break
      default:
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
    }

    // Determinar qué tipos calcular
    const typesToCalculate = validatedData.types || ["turnover", "absenteeism", "tardiness", "overtime"]

    const results: any = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      departmentId: validatedData.departmentId,
      calculations: {},
    }

    // Calcular cada tipo solicitado
    for (const type of typesToCalculate) {
      try {
        switch (type) {
          case "turnover":
            results.calculations.turnover = await IncidentCalculationService.calculateTurnover(
              startDate,
              endDate,
              validatedData.departmentId
            )
            break
          case "absenteeism":
            results.calculations.absenteeism = await IncidentCalculationService.calculateAbsenteeism(
              startDate,
              endDate,
              validatedData.departmentId
            )
            break
          case "tardiness":
            results.calculations.tardiness = await IncidentCalculationService.calculateTardiness(
              startDate,
              endDate,
              validatedData.departmentId
            )
            break
          case "overtime":
            results.calculations.overtime = await IncidentCalculationService.calculateOvertime(
              startDate,
              endDate,
              validatedData.departmentId
            )
            break
        }
      } catch (error: any) {
        console.error(`Error calculating ${type}:`, error)
        results.calculations[type] = {
          error: error.message || `Error al calcular ${type}`,
        }
      }
    }

    // Verificar umbrales
    try {
      results.alerts = await IncidentCalculationService.checkThresholds(startDate, endDate)
    } catch (error: any) {
      console.error("Error checking thresholds:", error)
      results.alerts = {
        error: error.message || "Error al verificar umbrales",
      }
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error calculating incidents:", error)
    return NextResponse.json(
      { error: "Error al calcular incidencias" },
      { status: 500 }
    )
  }
}

// GET - Obtener reporte de cálculos sin crear incidencias
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
      case "last_month":
        const lastMonth = subMonths(new Date(), 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      default:
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
    }

    // Verificar umbrales sin crear incidencias
    const alerts = await IncidentCalculationService.checkThresholds(startDate, endDate)

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      alerts,
      totalAlerts: alerts.length,
    })
  } catch (error) {
    console.error("Error getting calculation report:", error)
    return NextResponse.json(
      { error: "Error al obtener reporte" },
      { status: 500 }
    )
  }
}
