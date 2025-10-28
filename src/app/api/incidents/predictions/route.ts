import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PredictionService } from "@/services/predictionService"
import { startOfMonth, endOfMonth, subMonths, differenceInMonths } from "date-fns"

// GET - Obtener predicciones de tendencias
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const incidentTypeId = searchParams.get("incidentTypeId")
    const departmentId = searchParams.get("departmentId")
    const monthsBack = parseInt(searchParams.get("monthsBack") || "6")
    const periodsToPredict = parseInt(searchParams.get("periodsToPredict") || "3")

    if (!incidentTypeId) {
      return NextResponse.json(
        { error: "incidentTypeId es requerido" },
        { status: 400 }
      )
    }

    // Calcular rango de fechas
    const endDate = endOfMonth(new Date())
    const startDate = startOfMonth(subMonths(endDate, monthsBack - 1))

    // Construir where clause
    const where: any = {
      incidentTypeId,
      date: { gte: startDate, lte: endDate },
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    // Obtener incidencias históricas agrupadas por mes
    const incidents = await prisma.incident.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    })

    if (incidents.length < 3) {
      return NextResponse.json(
        { error: "Se necesitan al menos 3 meses de datos históricos para hacer predicciones" },
        { status: 400 }
      )
    }

    // Agrupar por mes
    const monthlyData: Record<string, { sum: number; count: number }> = {}

    incidents.forEach((incident) => {
      const monthKey = startOfMonth(incident.date).toISOString()

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sum: 0, count: 0 }
      }

      monthlyData[monthKey].sum += parseFloat(incident.value.toString())
      monthlyData[monthKey].count += 1
    })

    // Convertir a array de puntos de datos
    const dataPoints = Object.keys(monthlyData)
      .sort()
      .map((monthKey, index) => ({
        x: index,
        y: monthlyData[monthKey].sum / monthlyData[monthKey].count, // Promedio mensual
        date: monthKey,
      }))

    // Realizar análisis de tendencias
    const analysis = PredictionService.analyzeTrends(dataPoints)

    // Obtener información del tipo de incidencia
    const incidentType = await prisma.incidentType.findUnique({
      where: { id: incidentTypeId },
    })

    // Obtener información del departamento si aplica
    let department = null
    if (departmentId) {
      department = await prisma.department.findUnique({
        where: { id: departmentId },
      })
    }

    return NextResponse.json({
      incidentType: {
        id: incidentType?.id,
        name: incidentType?.name,
        code: incidentType?.code,
      },
      department: department ? {
        id: department.id,
        name: department.name,
        code: department.code,
      } : null,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        months: monthsBack,
      },
      historicalData: dataPoints.map(point => ({
        month: point.date,
        value: point.y,
      })),
      analysis: {
        prediction: {
          ...analysis.prediction,
          predictions: analysis.prediction.predictions.map((pred, index) => ({
            ...pred,
            month: endOfMonth(subMonths(new Date(), -index - 1)).toISOString(),
          })),
        },
        anomalies: analysis.anomalies,
        changeRate: analysis.changeRate,
        recommendations: analysis.recommendations,
      },
      summary: {
        trend: analysis.prediction.trend,
        accuracy: analysis.prediction.accuracy,
        confidenceLevel: analysis.prediction.predictions[0]?.confidence || "low",
        totalDataPoints: dataPoints.length,
        anomaliesDetected: analysis.anomalies.length,
      },
    })
  } catch (error: any) {
    console.error("Error generating predictions:", error)
    return NextResponse.json(
      { error: error.message || "Error al generar predicciones" },
      { status: 500 }
    )
  }
}

// POST - Obtener predicciones para múltiples tipos
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { incidentTypeIds, departmentId, monthsBack = 6 } = body

    if (!incidentTypeIds || !Array.isArray(incidentTypeIds)) {
      return NextResponse.json(
        { error: "incidentTypeIds debe ser un array" },
        { status: 400 }
      )
    }

    const predictions = []

    for (const typeId of incidentTypeIds) {
      try {
        // Reutilizar la lógica del GET
        const result = await fetch(
          `${request.nextUrl.origin}/api/incidents/predictions?incidentTypeId=${typeId}&monthsBack=${monthsBack}${departmentId ? `&departmentId=${departmentId}` : ''}`,
          {
            headers: {
              Cookie: request.headers.get("Cookie") || "",
            },
          }
        )

        if (result.ok) {
          const data = await result.json()
          predictions.push(data)
        }
      } catch (error) {
        console.error(`Error predicting type ${typeId}:`, error)
      }
    }

    return NextResponse.json({
      predictions,
      totalPredictions: predictions.length,
    })
  } catch (error) {
    console.error("Error generating multiple predictions:", error)
    return NextResponse.json(
      { error: "Error al generar predicciones múltiples" },
      { status: 500 }
    )
  }
}
