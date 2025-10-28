import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PDFGenerationService } from "@/services/pdfGenerationService"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

// GET - Generar reporte PDF/HTML de incidencias
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const format_type = searchParams.get("format") || "html"
    const period = searchParams.get("period") || "current_month"
    const incidentTypeId = searchParams.get("incidentTypeId")
    const departmentId = searchParams.get("departmentId")

    // Determinar período
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

    // Construir where clause
    const where: any = {
      date: { gte: startDate, lte: endDate },
    }

    if (incidentTypeId) where.incidentTypeId = incidentTypeId
    if (departmentId) where.departmentId = departmentId

    // Obtener incidencias
    const incidents = await prisma.incident.findMany({
      where,
      include: {
        incidentType: true,
        employee: {
          include: {
            department: true,
          },
        },
        department: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    // Calcular resumen
    const summary = {
      totalIncidents: incidents.length,
      byType: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
    }

    incidents.forEach((incident) => {
      // Por tipo
      const typeName = incident.incidentType.name
      summary.byType[typeName] = (summary.byType[typeName] || 0) + 1

      // Por departamento
      const deptName = incident.department?.name || incident.employee?.department?.name || "Sin departamento"
      summary.byDepartment[deptName] = (summary.byDepartment[deptName] || 0) + 1
    })

    // Preparar datos para el reporte
    const reportData = {
      title: "Reporte de Incidencias",
      period: { start: startDate, end: endDate },
      summary,
      incidents: incidents.map(i => ({
        ...i,
        value: i.value.toString(),
      })),
      generatedBy: session.user.name || session.user.email || "Sistema",
    }

    if (format_type === "html" || format_type === "pdf") {
      // Generar HTML
      const html = PDFGenerationService.generateIncidentReportHTML(reportData)

      // Para PDF, el cliente puede usar window.print() o una librería de conversión
      const prepared = PDFGenerationService.prepareForDownload(html, "reporte_incidencias")

      return new NextResponse(html, {
        headers: {
          "Content-Type": prepared.contentType,
          "Content-Disposition": `inline; filename="${prepared.filename}"`,
        },
      })
    } else {
      // Retornar JSON
      return NextResponse.json(reportData)
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    )
  }
}
