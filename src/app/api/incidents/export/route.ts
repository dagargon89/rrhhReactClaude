import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// GET - Exportar incidencias a CSV
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const format_type = searchParams.get("format") || "csv"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const incidentTypeId = searchParams.get("incidentTypeId")
    const departmentId = searchParams.get("departmentId")

    // Construir where clause
    const where: any = {}

    if (incidentTypeId) where.incidentTypeId = incidentTypeId
    if (departmentId) where.departmentId = departmentId

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Obtener incidencias
    const incidents = await prisma.incident.findMany({
      where,
      include: {
        incidentType: true,
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        department: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    if (format_type === "csv") {
      // Generar CSV
      const csvHeaders = [
        "ID",
        "Tipo",
        "Fecha",
        "Valor",
        "Empleado",
        "Código Empleado",
        "Departamento",
        "Posición",
        "Notas",
        "Creado",
      ].join(",")

      const csvRows = incidents.map(incident => {
        const employeeName = incident.employee
          ? `${incident.employee.firstName} ${incident.employee.lastName}`
          : ""
        const employeeCode = incident.employee?.employeeCode || ""
        const department = incident.department?.name || (incident.employee?.department?.name || "")
        const position = incident.employee?.position?.title || ""
        const notes = incident.notes ? `"${incident.notes.replace(/"/g, '""')}"` : ""

        return [
          incident.id,
          incident.incidentType.name,
          format(new Date(incident.date), "dd/MM/yyyy", { locale: es }),
          incident.value.toString(),
          `"${employeeName}"`,
          employeeCode,
          `"${department}"`,
          `"${position}"`,
          notes,
          format(new Date(incident.createdAt), "dd/MM/yyyy HH:mm", { locale: es }),
        ].join(",")
      })

      const csv = [csvHeaders, ...csvRows].join("\n")

      // Generar nombre de archivo
      const filename = `incidencias_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else if (format_type === "json") {
      // Exportar como JSON
      const filename = `incidencias_${format(new Date(), "yyyyMMdd_HHmmss")}.json`

      return new NextResponse(JSON.stringify(incidents, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else {
      return NextResponse.json(
        { error: "Formato no soportado. Use 'csv' o 'json'" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error exporting incidents:", error)
    return NextResponse.json(
      { error: "Error al exportar incidencias" },
      { status: 500 }
    )
  }
}

// POST - Generar reporte PDF (placeholder - requiere librería como pdfkit)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()

    // Por ahora retornamos un JSON con la estructura del reporte
    // En producción, aquí se generaría un PDF real con pdfkit o similar
    const reportData = {
      title: "Reporte de Incidencias",
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.name || session.user.email,
      period: body.period || "Todos los períodos",
      summary: {
        total: body.summary?.total || 0,
        byType: body.summary?.byType || {},
        byDepartment: body.summary?.byDepartment || {},
      },
      incidents: body.incidents || [],
    }

    return NextResponse.json({
      message: "Reporte PDF generado (placeholder)",
      data: reportData,
      note: "Implementación completa de PDF requiere librería adicional como pdfkit o puppeteer",
    })
  } catch (error) {
    console.error("Error generating PDF report:", error)
    return NextResponse.json(
      { error: "Error al generar reporte PDF" },
      { status: 500 }
    )
  }
}
