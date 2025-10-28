/**
 * Servicio de Gestión de Tardanzas
 *
 * Implementa la lógica completa del sistema de tardanzas según reglas oficiales:
 * - Llegadas tardías (8:31-8:45): 4 llegadas = 1 retardo formal
 * - Retardos directos (8:46+): Inmediato = 1 retardo formal
 * - Regla especial: Después del 1er retardo, cualquier tardanza = retardo automático
 */

import { prisma } from '@/lib/prisma';
import { TardinessType } from '@prisma/client';

interface ProcessTardinessParams {
  employeeId: string;
  minutesLate: number;
  checkInTime: Date;
  attendanceId: string;
}

interface TardinessResult {
  ruleApplied: string;
  ruleName: string;
  accumulationType: 'late_arrival' | 'direct_tardiness' | 'formal_tardy';
  formalTardiesAdded: number;
  currentMonthStats: {
    lateArrivalsCount: number;
    directTardinessCount: number;
    formalTardiesCount: number;
    administrativeActs: number;
  };
  disciplinaryActionTriggered: boolean;
  disciplinaryActionId?: string;
}

/**
 * Procesa una tardanza y aplica las reglas correspondientes
 */
export async function processTardiness(
  params: ProcessTardinessParams
): Promise<TardinessResult> {
  const { employeeId, minutesLate, checkInTime, attendanceId } = params;

  const month = checkInTime.getMonth() + 1;
  const year = checkInTime.getFullYear();

  // 1. Obtener o crear acumulación del mes actual
  const accumulation = await getOrCreateAccumulation(employeeId, month, year);

  // 2. Determinar qué regla aplicar según el contexto
  const rule = await determineApplicableRule(
    minutesLate,
    accumulation.formalTardiesCount
  );

  if (!rule) {
    throw new Error('No se encontró regla aplicable para esta tardanza');
  }

  // 3. Aplicar la regla y actualizar acumulaciones
  const result = await applyTardinessRule({
    employeeId,
    ruleId: rule.id,
    rule,
    accumulation,
    month,
    year,
    checkInTime,
    attendanceId,
  });

  // 4. Verificar si se debe disparar una acción disciplinaria
  const disciplinaryAction = await checkDisciplinaryTriggers(
    employeeId,
    result.currentMonthStats.formalTardiesCount,
    month,
    year
  );

  return {
    ...result,
    disciplinaryActionTriggered: !!disciplinaryAction,
    disciplinaryActionId: disciplinaryAction?.id,
  };
}

/**
 * Determina qué regla de tardanza aplicar según el contexto
 */
async function determineApplicableRule(
  minutesLate: number,
  currentFormalTardies: number
) {
  // Llegadas tardías (1-15 minutos)
  if (minutesLate >= 1 && minutesLate <= 15) {
    if (currentFormalTardies > 0) {
      // Ya tiene retardos este mes → usar regla estricta
      // "Después del primer retardo, cualquier tardanza = retardo automático"
      return await prisma.tardinessRule.findUnique({
        where: { id: 'tr_post_first_tardiness' },
      });
    } else {
      // Primer tardanza del mes → usar regla normal (4 llegadas)
      return await prisma.tardinessRule.findUnique({
        where: { id: 'tr_late_arrival_001' },
      });
    }
  }

  // Retardos directos (16+ minutos)
  if (minutesLate >= 16) {
    return await prisma.tardinessRule.findUnique({
      where: { id: 'tr_direct_tardiness_001' },
    });
  }

  return null;
}

/**
 * Aplica una regla de tardanza y actualiza las acumulaciones
 */
async function applyTardinessRule(params: {
  employeeId: string;
  ruleId: string;
  rule: any;
  accumulation: any;
  month: number;
  year: number;
  checkInTime: Date;
  attendanceId: string;
}): Promise<TardinessResult> {
  const { employeeId, ruleId, rule, accumulation, month, year } = params;

  let lateArrivalsIncrement = 0;
  let directTardinessIncrement = 0;
  let formalTardiesIncrement = 0;
  let accumulationType: 'late_arrival' | 'direct_tardiness' | 'formal_tardy' =
    'late_arrival';

  if (rule.type === TardinessType.LATE_ARRIVAL) {
    if (ruleId === 'tr_post_first_tardiness') {
      // Regla especial: después del primer retardo = retardo automático
      formalTardiesIncrement = 1;
      accumulationType = 'formal_tardy';
    } else {
      // Regla normal: acumular llegadas tardías
      lateArrivalsIncrement = 1;
      accumulationType = 'late_arrival';

      // Verificar si se completó la acumulación (4 llegadas)
      const newLateArrivalsCount =
        accumulation.lateArrivalsCount + lateArrivalsIncrement;

      if (newLateArrivalsCount >= rule.accumulationCount) {
        // Se completó la acumulación → convertir a retardo formal
        formalTardiesIncrement = rule.equivalentFormalTardies;
        // Resetear contador de llegadas tardías
        lateArrivalsIncrement = -accumulation.lateArrivalsCount;
        accumulationType = 'formal_tardy';
      }
    }
  } else if (rule.type === TardinessType.DIRECT_TARDINESS) {
    // Retardo directo = retardo formal inmediato
    directTardinessIncrement = 1;
    formalTardiesIncrement = rule.equivalentFormalTardies;
    accumulationType = 'direct_tardiness';
  }

  // Actualizar acumulación en BD
  const updatedAccumulation = await prisma.tardinessAccumulation.update({
    where: { id: accumulation.id },
    data: {
      lateArrivalsCount: {
        increment: lateArrivalsIncrement,
      },
      directTardinessCount: {
        increment: directTardinessIncrement,
      },
      formalTardiesCount: {
        increment: formalTardiesIncrement,
      },
      updatedAt: new Date(),
    },
  });

  return {
    ruleApplied: rule.id,
    ruleName: rule.name,
    accumulationType,
    formalTardiesAdded: formalTardiesIncrement,
    currentMonthStats: {
      lateArrivalsCount: updatedAccumulation.lateArrivalsCount,
      directTardinessCount: updatedAccumulation.directTardinessCount,
      formalTardiesCount: updatedAccumulation.formalTardiesCount,
      administrativeActs: updatedAccumulation.administrativeActs,
    },
    disciplinaryActionTriggered: false,
  };
}

/**
 * Verifica si se debe disparar una acción disciplinaria
 */
async function checkDisciplinaryTriggers(
  employeeId: string,
  formalTardiesCount: number,
  month: number,
  year: number
) {
  // Buscar regla de acción disciplinaria para retardos formales
  const rule = await prisma.disciplinaryActionRule.findFirst({
    where: {
      triggerType: 'FORMAL_TARDIES',
      triggerCount: { lte: formalTardiesCount },
      isActive: true,
    },
    orderBy: {
      triggerCount: 'desc', // Obtener la regla con mayor umbral cumplido
    },
  });

  if (!rule) {
    return null;
  }

  // Verificar si ya existe un registro para este mes
  const existingRecord = await prisma.employeeDisciplinaryRecord.findFirst({
    where: {
      employeeId,
      ruleId: rule.id,
      appliedDate: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  });

  if (existingRecord) {
    // Ya se creó un acta este mes por esta regla
    return null;
  }

  // Crear registro disciplinario (acta administrativa)
  const disciplinaryRecord = await prisma.employeeDisciplinaryRecord.create({
    data: {
      employeeId,
      ruleId: rule.id,
      actionType: rule.actionType,
      triggerType: rule.triggerType,
      triggerCount: formalTardiesCount,
      description: `Acta administrativa por acumular ${formalTardiesCount} retardos formales en el mes ${month}/${year}. Según reglamento: ${rule.description}`,
      appliedDate: new Date(),
      suspensionDays: rule.suspensionDays,
      status: rule.requiresApproval ? 'PENDING' : 'ACTIVE',
    },
  });

  // Actualizar contador de actas en acumulación
  await prisma.tardinessAccumulation.update({
    where: {
      unique_employee_year_month: {
        employeeId,
        year,
        month,
      },
    },
    data: {
      administrativeActs: { increment: 1 },
    },
  });

  // Verificar si se debe disparar baja por acumulación de actas
  await checkAdministrativeActsThreshold(employeeId);

  return disciplinaryRecord;
}

/**
 * Verifica si se alcanzó el umbral de 3 actas administrativas
 */
async function checkAdministrativeActsThreshold(employeeId: string) {
  // Buscar regla de baja por actas
  const rule = await prisma.disciplinaryActionRule.findFirst({
    where: {
      triggerType: 'ADMINISTRATIVE_ACTS',
      isActive: true,
    },
  });

  if (!rule) return null;

  // Contar actas en el período especificado
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - rule.periodDays);

  const actsCount = await prisma.employeeDisciplinaryRecord.count({
    where: {
      employeeId,
      actionType: 'ADMINISTRATIVE_ACT',
      appliedDate: { gte: startDate },
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
  });

  if (actsCount >= rule.triggerCount) {
    // Verificar si ya existe un registro de baja pendiente
    const existingTermination = await prisma.employeeDisciplinaryRecord.findFirst({
      where: {
        employeeId,
        actionType: 'TERMINATION',
        ruleId: rule.id,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (!existingTermination) {
      // Crear registro de baja por acumulación de actas
      return await prisma.employeeDisciplinaryRecord.create({
        data: {
          employeeId,
          ruleId: rule.id,
          actionType: rule.actionType,
          triggerType: rule.triggerType,
          triggerCount: actsCount,
          description: `Propuesta de baja por acumular ${actsCount} actas administrativas en ${rule.periodDays} días. Según reglamento: ${rule.description}`,
          appliedDate: new Date(),
          status: 'PENDING', // Siempre requiere aprobación
        },
      });
    }
  }

  return null;
}

/**
 * Obtiene o crea la acumulación del mes actual para un empleado
 */
async function getOrCreateAccumulation(
  employeeId: string,
  month: number,
  year: number
) {
  return await prisma.tardinessAccumulation.upsert({
    where: {
      unique_employee_year_month: {
        employeeId,
        year,
        month,
      },
    },
    create: {
      employeeId,
      month,
      year,
      lateArrivalsCount: 0,
      directTardinessCount: 0,
      formalTardiesCount: 0,
      administrativeActs: 0,
    },
    update: {}, // No actualizar si ya existe
  });
}

/**
 * Obtiene las estadísticas de tardanzas de un empleado en un mes
 */
export async function getMonthlyTardinessStats(
  employeeId: string,
  month: number,
  year: number
) {
  const accumulation = await prisma.tardinessAccumulation.findUnique({
    where: {
      unique_employee_year_month: {
        employeeId,
        year,
        month,
      },
    },
  });

  return accumulation || {
    lateArrivalsCount: 0,
    directTardinessCount: 0,
    formalTardiesCount: 0,
    administrativeActs: 0,
  };
}

/**
 * Obtiene el historial de actas disciplinarias de un empleado
 */
export async function getDisciplinaryHistory(
  employeeId: string,
  limit: number = 10
) {
  return await prisma.employeeDisciplinaryRecord.findMany({
    where: { employeeId },
    include: {
      rule: true,
      approvedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { appliedDate: 'desc' },
    take: limit,
  });
}

/**
 * Calcula los minutos de retraso basado en horario del turno
 */
export function calculateMinutesLate(
  checkInTime: Date,
  scheduledStartTime: string,
  gracePeriodMinutes: number = 0
): number {
  // Parsear hora programada (formato: "HH:MM")
  const [hours, minutes] = scheduledStartTime.split(':').map(Number);

  // Crear fecha con la hora programada
  const scheduled = new Date(checkInTime);
  scheduled.setHours(hours, minutes, 0, 0);

  // Agregar período de gracia
  scheduled.setMinutes(scheduled.getMinutes() + gracePeriodMinutes);

  // Calcular diferencia en minutos
  const diffMs = checkInTime.getTime() - scheduled.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  return Math.max(0, diffMinutes); // No puede ser negativo
}
