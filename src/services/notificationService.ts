/**
 * Servicio de notificaciones para alertas de incidencias
 *
 * Este servicio maneja el envío de notificaciones por email cuando
 * las incidencias exceden los umbrales configurados
 */

interface NotificationData {
  config: any
  calculatedValue: number
  thresholdValue: number
  incidents: number
  message: string
}

export class NotificationService {
  /**
   * Envía notificaciones para alertas de umbrales excedidos
   */
  static async sendThresholdAlert(alert: NotificationData) {
    const { config, calculatedValue, thresholdValue, incidents, message } = alert

    if (!config.notificationEnabled || config.notificationEmails.length === 0) {
      return {
        sent: false,
        reason: "Notificaciones deshabilitadas o sin emails configurados",
      }
    }

    try {
      // Preparar el contenido del email
      const emailContent = this.buildEmailContent(alert)

      // Aquí se enviaría el email real usando Nodemailer o Resend
      // Por ahora retornamos un objeto simulado
      console.log("📧 Enviando notificación de alerta:", {
        to: config.notificationEmails,
        subject: emailContent.subject,
        incidentType: config.incidentType.name,
        value: calculatedValue,
        threshold: thresholdValue,
      })

      // Simular envío de email
      // En producción, usar:
      // await sendEmail({
      //   to: config.notificationEmails,
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      //   text: emailContent.text,
      // })

      return {
        sent: true,
        recipients: config.notificationEmails,
        alert,
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      return {
        sent: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  /**
   * Construye el contenido del email de notificación
   */
  private static buildEmailContent(alert: NotificationData) {
    const { config, calculatedValue, thresholdValue, incidents } = alert

    const incidentTypeNames: Record<string, string> = {
      TURNOVER: "Rotación",
      ABSENTEEISM: "Ausentismo",
      TARDINESS: "Impuntualidad",
      OVERTIME: "Horas Extra",
    }

    const typeName = incidentTypeNames[config.incidentType.name] || config.incidentType.name

    const operatorSymbols: Record<string, string> = {
      GT: ">",
      LT: "<",
      GTE: ">=",
      LTE: "<=",
      EQ: "=",
    }

    const operator = operatorSymbols[config.thresholdOperator] || config.thresholdOperator

    const subject = `⚠️ Alerta: ${typeName} ha excedido el umbral configurado`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .alert-box {
              background: white;
              border-left: 4px solid #dc2626;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .metric {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .metric:last-child {
              border-bottom: none;
            }
            .value {
              font-weight: bold;
              color: #dc2626;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Incidencia</h1>
              <p>Se ha detectado un umbral excedido</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>Detalles de la Alerta</h2>
                <div class="metric">
                  <span>Tipo de Incidencia:</span>
                  <span class="value">${typeName}</span>
                </div>
                <div class="metric">
                  <span>Valor Calculado:</span>
                  <span class="value">${calculatedValue.toFixed(2)}</span>
                </div>
                <div class="metric">
                  <span>Umbral Configurado:</span>
                  <span class="value">${operator} ${thresholdValue.toFixed(2)}</span>
                </div>
                <div class="metric">
                  <span>Número de Incidencias:</span>
                  <span class="value">${incidents}</span>
                </div>
                ${config.department ? `
                <div class="metric">
                  <span>Departamento:</span>
                  <span class="value">${config.department.name}</span>
                </div>
                ` : ''}
                <div class="metric">
                  <span>Período:</span>
                  <span class="value">${config.periodType}</span>
                </div>
              </div>

              <p>
                Se recomienda revisar las incidencias de tipo <strong>${typeName}</strong>
                ${config.department ? `en el departamento <strong>${config.department.name}</strong>` : ''}
                y tomar las acciones correctivas necesarias.
              </p>

              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/incidents"
                   style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 5px; margin-top: 10px;">
                  Ver Incidencias
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático del Sistema de Gestión de RRHH</p>
              <p>Generado el ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
ALERTA: ${typeName} ha excedido el umbral configurado

Detalles de la Alerta:
- Tipo de Incidencia: ${typeName}
- Valor Calculado: ${calculatedValue.toFixed(2)}
- Umbral Configurado: ${operator} ${thresholdValue.toFixed(2)}
- Número de Incidencias: ${incidents}
${config.department ? `- Departamento: ${config.department.name}` : ''}
- Período: ${config.periodType}

Se recomienda revisar las incidencias y tomar las acciones correctivas necesarias.

Acceda al sistema: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/incidents

---
Este es un mensaje automático del Sistema de Gestión de RRHH
Generado el ${new Date().toLocaleString('es-ES')}
    `

    return {
      subject,
      html,
      text,
    }
  }

  /**
   * Envía un resumen de alertas múltiples
   */
  static async sendAlertsSummary(alerts: NotificationData[], recipients: string[]) {
    if (alerts.length === 0 || recipients.length === 0) {
      return {
        sent: false,
        reason: "Sin alertas o sin destinatarios",
      }
    }

    try {
      const subject = `📊 Resumen de Alertas de Incidencias (${alerts.length} alertas)`

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .alert-item {
                background: white;
                border-left: 4px solid #dc2626;
                padding: 15px;
                margin: 15px 0;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Resumen de Alertas</h1>
                <p>${alerts.length} umbrales excedidos</p>
              </div>
              <div class="content">
                <p>Se han detectado las siguientes alertas en el sistema:</p>
                ${alerts.map((alert, index) => `
                  <div class="alert-item">
                    <h3>${index + 1}. ${alert.config.incidentType.name}</h3>
                    <p><strong>Valor:</strong> ${alert.calculatedValue.toFixed(2)} / ${alert.thresholdValue.toFixed(2)}</p>
                    ${alert.config.department ? `<p><strong>Departamento:</strong> ${alert.config.department.name}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </body>
        </html>
      `

      console.log("📧 Enviando resumen de alertas:", {
        to: recipients,
        alertCount: alerts.length,
      })

      return {
        sent: true,
        recipients,
        alertCount: alerts.length,
      }
    } catch (error) {
      console.error("Error sending summary:", error)
      return {
        sent: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }
}
