import { format } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Servicio para generación de reportes PDF
 *
 * Este servicio genera reportes en formato PDF para incidencias
 * Usa HTML templates que pueden ser convertidos a PDF en el cliente o servidor
 */

interface PDFReportData {
  title: string
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalIncidents: number
    byType: Record<string, number>
    byDepartment: Record<string, number>
  }
  incidents: any[]
  generatedBy: string
}

export class PDFGenerationService {
  /**
   * Genera el HTML para el reporte de incidencias
   */
  static generateIncidentReportHTML(data: PDFReportData): string {
    const { title, period, summary, incidents, generatedBy } = data

    const typeNames: Record<string, string> = {
      TURNOVER: "Rotación",
      ABSENTEEISM: "Ausentismo",
      TARDINESS: "Impuntualidad",
      OVERTIME: "Horas Extra",
    }

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      padding: 40px;
      background: #f9fafb;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header {
      background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 40px;
      text-align: center;
    }

    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }

    .header p {
      font-size: 16px;
      opacity: 0.9;
    }

    .metadata {
      display: flex;
      justify-content: space-between;
      padding: 20px;
      background: #f3f4f6;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .metadata-item {
      text-align: center;
    }

    .metadata-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .metadata-value {
      font-size: 16px;
      font-weight: bold;
      color: #111827;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 24px;
      color: #111827;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #dc2626;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #dc2626;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #dc2626;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    thead {
      background: #f3f4f6;
    }

    th {
      text-align: left;
      padding: 12px;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #dc2626;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    tbody tr:hover {
      background: #f9fafb;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-turnover {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .badge-absenteeism {
      background: #fed7aa;
      color: #ea580c;
    }

    .badge-tardiness {
      background: #fef3c7;
      color: #d97706;
    }

    .badge-overtime {
      background: #dbeafe;
      color: #2563eb;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }

    .chart-placeholder {
      width: 100%;
      height: 300px;
      background: #f3f4f6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      margin: 20px 0;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }

      .container {
        box-shadow: none;
      }

      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${title}</h1>
      <p>Reporte de Incidencias del Sistema de RRHH</p>
    </div>

    <!-- Metadata -->
    <div class="metadata">
      <div class="metadata-item">
        <div class="metadata-label">Período</div>
        <div class="metadata-value">
          ${format(period.start, "dd/MM/yyyy", { locale: es })} - ${format(period.end, "dd/MM/yyyy", { locale: es })}
        </div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Total Incidencias</div>
        <div class="metadata-value">${summary.totalIncidents}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Generado por</div>
        <div class="metadata-value">${generatedBy}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Fecha de Generación</div>
        <div class="metadata-value">${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}</div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="section">
      <h2 class="section-title">Resumen Ejecutivo</h2>

      <h3 style="margin-bottom: 15px; color: #374151;">Por Tipo de Incidencia</h3>
      <div class="stats-grid">
        ${Object.entries(summary.byType).map(([type, count]) => `
          <div class="stat-card">
            <div class="stat-label">${typeNames[type] || type}</div>
            <div class="stat-value">${count}</div>
          </div>
        `).join('')}
      </div>

      ${Object.keys(summary.byDepartment).length > 0 ? `
        <h3 style="margin: 30px 0 15px; color: #374151;">Por Departamento</h3>
        <div class="stats-grid">
          ${Object.entries(summary.byDepartment).map(([dept, count]) => `
            <div class="stat-card">
              <div class="stat-label">${dept}</div>
              <div class="stat-value">${count}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <!-- Incidents Table -->
    ${incidents.length > 0 ? `
      <div class="section page-break">
        <h2 class="section-title">Detalle de Incidencias</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Valor</th>
              <th>Empleado/Departamento</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            ${incidents.slice(0, 50).map(incident => {
              const badgeClass = `badge-${incident.incidentType.name.toLowerCase()}`
              const target = incident.employee
                ? `${incident.employee.firstName} ${incident.employee.lastName}`
                : incident.department?.name || 'N/A'

              return `
                <tr>
                  <td>
                    <span class="badge ${badgeClass}">
                      ${typeNames[incident.incidentType.name] || incident.incidentType.name}
                    </span>
                  </td>
                  <td>${format(new Date(incident.date), "dd/MM/yyyy", { locale: es })}</td>
                  <td><strong>${parseFloat(incident.value).toFixed(2)}</strong></td>
                  <td>${target}</td>
                  <td style="font-size: 12px; color: #6b7280;">
                    ${incident.notes ? incident.notes.substring(0, 50) + (incident.notes.length > 50 ? '...' : '') : '-'}
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        ${incidents.length > 50 ? `
          <p style="margin-top: 20px; text-align: center; color: #6b7280; font-style: italic;">
            Mostrando 50 de ${incidents.length} incidencias. Para ver el reporte completo, exporte en formato CSV.
          </p>
        ` : ''}
      </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p><strong>Sistema de Gestión de Recursos Humanos</strong></p>
      <p>Este reporte fue generado automáticamente el ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</p>
      <p>© ${new Date().getFullYear()} Todos los derechos reservados</p>
    </div>
  </div>

  <script>
    // Auto-print cuando se abre el PDF
    if (window.location.search.includes('autoprint=true')) {
      window.onload = function() {
        window.print();
      }
    }
  </script>
</body>
</html>
    `
  }

  /**
   * Genera un reporte de tendencias con gráficas
   */
  static generateTrendReportHTML(data: any): string {
    // Similar al anterior pero con enfoque en tendencias y comparaciones
    return this.generateIncidentReportHTML(data)
  }

  /**
   * Convierte el HTML a datos para descarga
   */
  static prepareForDownload(html: string, filename: string) {
    return {
      html,
      filename: `${filename}_${format(new Date(), "yyyyMMdd_HHmmss")}.html`,
      contentType: "text/html; charset=utf-8",
    }
  }
}
