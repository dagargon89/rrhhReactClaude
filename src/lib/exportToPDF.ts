import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PDFExportOptions {
  title: string
  subtitle?: string
  period?: {
    startDate: string
    endDate: string
  }
  data: any[]
  columns: {
    header: string
    dataKey: string
    format?: (value: any) => string
  }[]
  summary?: {
    label: string
    value: string | number
  }[]
  orientation?: "portrait" | "landscape"
}

export const exportToPDF = (options: PDFExportOptions) => {
  const {
    title,
    subtitle,
    period,
    data,
    columns,
    summary,
    orientation = "portrait",
  } = options

  // Crear nuevo documento PDF
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 20

  // Agregar título
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(title, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 10

  // Agregar subtítulo si existe
  if (subtitle) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(subtitle, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 7
  }

  // Agregar período si existe
  if (period) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    const periodText = `Período: ${format(new Date(period.startDate), "dd/MM/yyyy", { locale: es })} - ${format(new Date(period.endDate), "dd/MM/yyyy", { locale: es })}`
    doc.text(periodText, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 10
  }

  // Agregar resumen si existe
  if (summary && summary.length > 0) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0)
    doc.text("Resumen:", 14, yPosition)
    yPosition += 7

    doc.setFont("helvetica", "normal")
    summary.forEach((item) => {
      doc.text(`${item.label}: ${item.value}`, 20, yPosition)
      yPosition += 5
    })
    yPosition += 5
  }

  // Preparar datos para la tabla
  const tableHeaders = columns.map((col) => col.header)
  const tableData = data.map((row) =>
    columns.map((col) => {
      const value = row[col.dataKey]
      return col.format ? col.format(value) : String(value || "")
    })
  )

  // Agregar tabla
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    margin: { left: 14, right: 14 },
  })

  // Agregar pie de página con fecha y hora de generación
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    )
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    )
  }

  // Guardar el PDF
  const fileName = `${title.toLowerCase().replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`
  doc.save(fileName)
}

// Utilidad específica para reporte de asistencia
export const exportAttendanceReportToPDF = (
  stats: any[],
  period: { startDate: string; endDate: string },
  type: "employee" | "department" = "employee"
) => {
  if (type === "employee") {
    exportToPDF({
      title: "Reporte de Asistencia por Empleado",
      subtitle: "Sistema de Recursos Humanos - HRMS",
      period,
      data: stats,
      columns: [
        { header: "Empleado", dataKey: "employeeName" },
        { header: "Código", dataKey: "employeeCode" },
        { header: "Departamento", dataKey: "department" },
        { header: "Total Días", dataKey: "totalDays" },
        { header: "Presente", dataKey: "present" },
        { header: "Tarde", dataKey: "late" },
        { header: "Ausente", dataKey: "absent" },
        {
          header: "Puntualidad",
          dataKey: "punctualityRate",
          format: (val) => `${val.toFixed(1)}%`,
        },
      ],
      orientation: "landscape",
    })
  } else {
    exportToPDF({
      title: "Reporte de Asistencia por Departamento",
      subtitle: "Sistema de Recursos Humanos - HRMS",
      period,
      data: stats,
      columns: [
        { header: "Departamento", dataKey: "departmentName" },
        { header: "Empleados", dataKey: "totalEmployees" },
        { header: "Total Días", dataKey: "totalDays" },
        { header: "Presente", dataKey: "present" },
        { header: "Tarde", dataKey: "late" },
        { header: "Ausente", dataKey: "absent" },
        {
          header: "Puntualidad",
          dataKey: "punctualityRate",
          format: (val) => `${val.toFixed(1)}%`,
        },
      ],
      orientation: "landscape",
    })
  }
}

// Utilidad para reporte de tardanzas
export const exportTardinessReportToPDF = (
  stats: any[],
  period: { startDate: string; endDate: string }
) => {
  const totalTardinesses = stats.reduce((sum, s) => sum + s.totalTardinesses, 0)
  const totalMinutes = stats.reduce((sum, s) => sum + s.totalMinutesLate, 0)

  exportToPDF({
    title: "Reporte de Tardanzas",
    subtitle: "Sistema de Recursos Humanos - HRMS",
    period,
    summary: [
      { label: "Total de Tardanzas", value: totalTardinesses },
      { label: "Total de Minutos Perdidos", value: totalMinutes },
      { label: "Empleados Afectados", value: stats.length },
    ],
    data: stats,
    columns: [
      { header: "Empleado", dataKey: "employeeName" },
      { header: "Código", dataKey: "employeeCode" },
      { header: "Departamento", dataKey: "department" },
      { header: "Total Tardanzas", dataKey: "totalTardinesses" },
      { header: "Min. Totales", dataKey: "totalMinutesLate" },
      {
        header: "Promedio",
        dataKey: "avgMinutesLate",
        format: (val) => `${val.toFixed(0)} min`,
      },
      { header: "Máximo", dataKey: "maxMinutesLate", format: (val) => `${val} min` },
    ],
    orientation: "landscape",
  })
}

// Utilidad para reporte de horas trabajadas
export const exportWorkedHoursReportToPDF = (
  stats: any[],
  period: { startDate: string; endDate: string }
) => {
  const totalHours = stats.reduce((sum, s) => sum + s.totalHours, 0)
  const totalOvertime = stats.reduce((sum, s) => sum + s.overtimeHours, 0)

  exportToPDF({
    title: "Reporte de Horas Trabajadas",
    subtitle: "Sistema de Recursos Humanos - HRMS",
    period,
    summary: [
      { label: "Total Horas Trabajadas", value: `${totalHours.toFixed(1)}h` },
      { label: "Total Horas Extra", value: `${totalOvertime.toFixed(1)}h` },
      { label: "Total Empleados", value: stats.length },
    ],
    data: stats,
    columns: [
      { header: "Empleado", dataKey: "employeeName" },
      { header: "Código", dataKey: "employeeCode" },
      { header: "Departamento", dataKey: "department" },
      { header: "Días", dataKey: "totalDays" },
      { header: "Hrs Totales", dataKey: "totalHours", format: (val) => `${val.toFixed(1)}h` },
      {
        header: "Hrs Extra",
        dataKey: "overtimeHours",
        format: (val) => `${val.toFixed(1)}h`,
      },
      {
        header: "Prom/Día",
        dataKey: "avgHoursPerDay",
        format: (val) => `${val.toFixed(1)}h`,
      },
      {
        header: "Cumplimiento",
        dataKey: "completionRate",
        format: (val) => `${val.toFixed(1)}%`,
      },
    ],
    orientation: "landscape",
  })
}
