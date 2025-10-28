/**
 * Servicio de Procesamiento de Tardanzas y Acciones Disciplinarias
 *
 * Este servicio maneja:
 * - Cálculo de minutos de retraso
 * - Aplicación de reglas de tardanzas
 * - Actualización de acumulaciones mensuales
 * - Conversión a retardos formales
 * - Disparadores de acciones disciplinarias
 */

import { prisma } from "@/lib/prisma"
import { differenceInMinutes, startOfMonth, subDays } from "date-fns"

export class TardinessProcessingService {
  /**
   * Procesa una entrada tarde y aplica las reglas configuradas
   */
  static async processTardiness(
    employeeId: string,
    checkInTime: Date,
    scheduledTime: Date,
    attendanceId: string
  ) {
    try {
      // 1. Calcular minutos de retraso
      const minutesLate = differenceInMinutes(checkInTime, scheduledTime)

      if (minutesLate <= 0) {
        // No hay tardanza
        return {
          success: true,
          minutesLate: 0,
          ruleApplied: null,
          accumulated: false,
        }
      }

      // 2. Buscar regla aplicable
      const applicableRule = await this.findApplicableRule(minutesLate)

      if (!applicableRule) {
        console.warn(`No se encontró regla aplicable para ${minutesLate} minutos de retraso`)
        return {
          success: true,
          minutesLate,
          ruleApplied: null,
          accumulated: false,
        }
      }

      // 3. Obtener o crear acumulación del mes actual
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      let accumulation = await prisma.tardinessAccumulation.findFirst({
        where: {
          employeeId,
          month: currentMonth,
          year: currentYear,
        },
      })

      if (!accumulation) {
        accumulation = await prisma.tardinessAccumulation.create({
          data: {
            employeeId,
            month: currentMonth,
            year: currentYear,
            lateArrivalsCount: 0,
            directTardinessCount: 0,
            formalTardiesCount: 0,
            administrativeActs: 0,
          },
        })
      }

      // 4. Actualizar acumulación según el tipo de regla
      const updates: any = {}
      let conversionToFormalTardiness = false

      if (applicableRule.type === "LATE_ARRIVAL") {
        // Llegadas tardías (acumulativas)
        const newCount = accumulation.lateArrivalsCount + 1

        updates.lateArrivalsCount = newCount

        // Verificar si se alcanzó el límite para conversión
        if (newCount >= applicableRule.accumulationCount) {
          updates.formalTardiesCount = accumulation.formalTardiesCount + applicableRule.equivalentFormalTardies
          updates.lateArrivalsCount = 0 // Reset después de conversión
          conversionToFormalTardiness = true
        }
      } else if (applicableRule.type === "DIRECT_TARDINESS") {
        // Retardo directo (inmediato)
        updates.directTardinessCount = accumulation.directTardinessCount + 1
        updates.formalTardiesCount = accumulation.formalTardiesCount + applicableRule.equivalentFormalTardies
        conversionToFormalTardiness = true
      }

      // Actualizar acumulación
      accumulation = await prisma.tardinessAccumulation.update({
        where: { id: accumulation.id },
        data: updates,
      })

      // 5. Verificar acciones disciplinarias si hubo conversión a retardo formal
      let disciplinaryActionTriggered = null

      if (conversionToFormalTardiness) {
        disciplinaryActionTriggered = await this.checkDisciplinaryActions(
          employeeId,
          "FORMAL_TARDIES",
          accumulation.formalTardiesCount
        )
      }

      return {
        success: true,
        minutesLate,
        ruleApplied: applicableRule.name,
        accumulated: true,
        accumulation: {
          lateArrivalsCount: accumulation.lateArrivalsCount,
          directTardinessCount: accumulation.directTardinessCount,
          formalTardiesCount: accumulation.formalTardiesCount,
          administrativeActs: accumulation.administrativeActs,
        },
        conversionToFormalTardiness,
        disciplinaryActionTriggered,
      }
    } catch (error) {
      console.error("Error processing tardiness:", error)
      throw error
    }
  }

  /**
   * Busca la regla aplicable según los minutos de retraso
   */
  private static async findApplicableRule(minutesLate: number) {
    const rules = await prisma.tardinessRule.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { startMinutesLate: "asc" },
      ],
    })

    for (const rule of rules) {
      // Verificar si los minutos de retraso caen en el rango de la regla
      if (minutesLate >= rule.startMinutesLate) {
        if (rule.endMinutesLate === null || minutesLate <= rule.endMinutesLate) {
          return rule
        }
      }
    }

    return null
  }

  /**
   * Verifica si se debe disparar alguna acción disciplinaria
   */
  private static async checkDisciplinaryActions(
    employeeId: string,
    triggerType: string,
    currentCount: number
  ) {
    try {
      // Buscar reglas disciplinarias que apliquen
      const rules = await prisma.disciplinaryActionRule.findMany({
        where: {
          isActive: true,
          triggerType,
          triggerCount: {
            lte: currentCount,
          },
        },
        orderBy: {
          triggerCount: "desc",
        },
      })

      if (rules.length === 0) {
        return null
      }

      // Tomar la regla con el trigger_count más alto que aplique
      const applicableRule = rules[0]

      // Verificar si ya existe un registro para esta regla en el período
      const existingRecord = await prisma.employeeDisciplinaryRecord.findFirst({
        where: {
          employeeId,
          ruleId: applicableRule.id,
          appliedDate: {
            gte: subDays(new Date(), applicableRule.periodDays),
          },
        },
      })

      if (existingRecord) {
        // Ya se aplicó esta regla recientemente
        return {
          ruleApplied: applicableRule.name,
          actionType: applicableRule.actionType,
          alreadyExists: true,
        }
      }

      // Crear nuevo registro disciplinario
      const record = await prisma.employeeDisciplinaryRecord.create({
        data: {
          employeeId,
          ruleId: applicableRule.id,
          actionType: applicableRule.actionType,
          triggerType: applicableRule.triggerType,
          triggerCount: currentCount,
          appliedDate: new Date(),
          effectiveDate: applicableRule.actionType === "SUSPENSION" ? new Date() : null,
          expirationDate:
            applicableRule.actionType === "SUSPENSION" && applicableRule.suspensionDays
              ? subDays(new Date(), -applicableRule.suspensionDays)
              : null,
          suspensionDays: applicableRule.suspensionDays,
          reason: `Acumulación de ${currentCount} ${triggerType.toLowerCase()}`,
          status: applicableRule.requiresApproval ? "PENDING" : "ACTIVE",
        },
      })

      // Si es acta administrativa, incrementar contador
      if (applicableRule.actionType === "ADMINISTRATIVE_ACT") {
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()

        await prisma.tardinessAccumulation.updateMany({
          where: {
            employeeId,
            month: currentMonth,
            year: currentYear,
          },
          data: {
            administrativeActs: {
              increment: 1,
            },
          },
        })
      }

      // TODO: Enviar notificaciones si está habilitado
      if (applicableRule.notificationEnabled) {
        // await this.sendNotifications(employeeId, applicableRule, record)
      }

      return {
        ruleApplied: applicableRule.name,
        actionType: applicableRule.actionType,
        recordId: record.id,
        requiresApproval: applicableRule.requiresApproval,
        suspensionDays: applicableRule.suspensionDays,
      }
    } catch (error) {
      console.error("Error checking disciplinary actions:", error)
      return null
    }
  }

  /**
   * Procesa faltas injustificadas
   */
  static async processUnjustifiedAbsence(employeeId: string, absenceDate: Date) {
    try {
      // Contar faltas injustificadas en los últimos 30 días
      const thirtyDaysAgo = subDays(new Date(), 30)

      const absenceCount = await prisma.attendance.count({
        where: {
          employeeId,
          status: "ABSENT",
          date: {
            gte: thirtyDaysAgo,
          },
        },
      })

      // Verificar acciones disciplinarias
      const disciplinaryAction = await this.checkDisciplinaryActions(
        employeeId,
        "UNJUSTIFIED_ABSENCES",
        absenceCount
      )

      return {
        success: true,
        absenceCount,
        disciplinaryActionTriggered: disciplinaryAction,
      }
    } catch (error) {
      console.error("Error processing unjustified absence:", error)
      throw error
    }
  }

  /**
   * Obtiene el resumen de acumulaciones de un empleado
   */
  static async getEmployeeAccumulation(employeeId: string, month?: number, year?: number) {
    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()

    const accumulation = await prisma.tardinessAccumulation.findFirst({
      where: {
        employeeId,
        month: targetMonth,
        year: targetYear,
      },
    })

    if (!accumulation) {
      return {
        lateArrivalsCount: 0,
        directTardinessCount: 0,
        formalTardiesCount: 0,
        administrativeActs: 0,
      }
    }

    return accumulation
  }

  /**
   * Obtiene los registros disciplinarios de un empleado
   */
  static async getEmployeeDisciplinaryRecords(
    employeeId: string,
    filters?: {
      status?: string
      startDate?: Date
      endDate?: Date
    }
  ) {
    const where: any = {
      employeeId,
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.startDate || filters?.endDate) {
      where.appliedDate = {}
      if (filters.startDate) {
        where.appliedDate.gte = filters.startDate
      }
      if (filters.endDate) {
        where.appliedDate.lte = filters.endDate
      }
    }

    const records = await prisma.employeeDisciplinaryRecord.findMany({
      where,
      include: {
        rule: true,
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        appliedDate: "desc",
      },
    })

    return records
  }

  /**
   * Aprueba o rechaza un registro disciplinario
   */
  static async approveDisciplinaryRecord(
    recordId: string,
    approvedById: string,
    approved: boolean,
    notes?: string
  ) {
    const record = await prisma.employeeDisciplinaryRecord.findUnique({
      where: { id: recordId },
    })

    if (!record) {
      throw new Error("Registro no encontrado")
    }

    if (record.status !== "PENDING") {
      throw new Error("El registro ya fue procesado")
    }

    const updatedRecord = await prisma.employeeDisciplinaryRecord.update({
      where: { id: recordId },
      data: {
        status: approved ? "ACTIVE" : "CANCELLED",
        approvedById,
        approvedAt: new Date(),
        notes: notes || record.notes,
      },
    })

    // TODO: Enviar notificación al empleado

    return updatedRecord
  }
}
