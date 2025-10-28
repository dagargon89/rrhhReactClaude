/**
 * Servicio de Gestión de Acciones Disciplinarias
 *
 * Maneja la creación, aprobación y seguimiento de actas administrativas,
 * suspensiones y otras acciones disciplinarias.
 */

import { prisma } from '@/lib/prisma';
import { DisciplinaryActionType, SanctionStatus } from '@prisma/client';

interface CreateDisciplinaryRecordParams {
  employeeId: string;
  ruleId?: string;
  actionType: DisciplinaryActionType;
  triggerType: string;
  triggerCount: number;
  description: string;
  suspensionDays?: number;
  effectiveDate?: Date;
  notes?: string;
}

interface ApproveDisciplinaryRecordParams {
  recordId: string;
  approvedById: string;
  notes?: string;
}

interface RejectDisciplinaryRecordParams {
  recordId: string;
  approvedById: string;
  rejectionReason: string;
}

/**
 * Crea un registro disciplinario (acta, suspensión, etc.)
 */
export async function createDisciplinaryRecord(
  params: CreateDisciplinaryRecordParams
) {
  const {
    employeeId,
    ruleId,
    actionType,
    triggerType,
    triggerCount,
    description,
    suspensionDays,
    effectiveDate,
    notes,
  } = params;

  // Calcular fecha de expiración para suspensiones
  let expirationDate: Date | undefined;
  if (suspensionDays && effectiveDate) {
    expirationDate = new Date(effectiveDate);
    expirationDate.setDate(expirationDate.getDate() + suspensionDays);
  }

  const record = await prisma.employeeDisciplinaryRecord.create({
    data: {
      employeeId,
      ruleId,
      actionType,
      triggerType,
      triggerCount,
      description,
      appliedDate: new Date(),
      effectiveDate,
      expirationDate,
      suspensionDays,
      status: 'PENDING',
      notes,
    },
    include: {
      employee: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          department: true,
          position: true,
        },
      },
      rule: true,
    },
  });

  // TODO: Enviar notificación al supervisor/RRHH
  // await sendDisciplinaryNotification(record);

  return record;
}

/**
 * Aprueba un registro disciplinario
 */
export async function approveDisciplinaryRecord(
  params: ApproveDisciplinaryRecordParams
) {
  const { recordId, approvedById, notes } = params;

  const record = await prisma.employeeDisciplinaryRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    throw new Error('Registro disciplinario no encontrado');
  }

  if (record.status !== 'PENDING') {
    throw new Error('Solo se pueden aprobar registros pendientes');
  }

  // Actualizar registro
  const updatedRecord = await prisma.employeeDisciplinaryRecord.update({
    where: { id: recordId },
    data: {
      status: 'ACTIVE',
      approvedById,
      approvedAt: new Date(),
      notes: notes ? `${record.notes || ''}\n\nAprobación: ${notes}` : record.notes,
    },
    include: {
      employee: {
        include: {
          user: true,
          department: true,
        },
      },
      rule: true,
      approvedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Si es una suspensión, marcar las asistencias afectadas
  if (
    updatedRecord.actionType === 'SUSPENSION' &&
    updatedRecord.effectiveDate &&
    updatedRecord.expirationDate
  ) {
    await markSuspensionPeriod(
      updatedRecord.employeeId,
      updatedRecord.effectiveDate,
      updatedRecord.expirationDate
    );
  }

  // Si es una terminación, actualizar estado del empleado
  if (updatedRecord.actionType === 'TERMINATION') {
    await prisma.employee.update({
      where: { id: updatedRecord.employeeId },
      data: {
        status: 'TERMINATED',
      },
    });
  }

  // TODO: Enviar notificación al empleado
  // await sendApprovalNotification(updatedRecord);

  return updatedRecord;
}

/**
 * Rechaza un registro disciplinario
 */
export async function rejectDisciplinaryRecord(
  params: RejectDisciplinaryRecordParams
) {
  const { recordId, approvedById, rejectionReason } = params;

  const record = await prisma.employeeDisciplinaryRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    throw new Error('Registro disciplinario no encontrado');
  }

  if (record.status !== 'PENDING') {
    throw new Error('Solo se pueden rechazar registros pendientes');
  }

  const updatedRecord = await prisma.employeeDisciplinaryRecord.update({
    where: { id: recordId },
    data: {
      status: 'CANCELLED',
      approvedById,
      approvedAt: new Date(),
      notes: `RECHAZADO: ${rejectionReason}\n\n${record.notes || ''}`,
    },
    include: {
      employee: {
        include: {
          user: true,
        },
      },
      approvedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // TODO: Enviar notificación
  // await sendRejectionNotification(updatedRecord);

  return updatedRecord;
}

/**
 * Marca el período de suspensión en el sistema de asistencias
 */
async function markSuspensionPeriod(
  employeeId: string,
  startDate: Date,
  endDate: Date
) {
  // Crear registros de ausencia justificada para cada día de suspensión
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Verificar si ya existe un registro para ese día
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: currentDate,
      },
    });

    if (!existingAttendance) {
      // Crear registro de suspensión
      await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(currentDate),
          status: 'ABSENT',
          notes: 'Suspensión disciplinaria sin goce de sueldo',
        },
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

/**
 * Obtiene registros disciplinarios pendientes de aprobación
 */
export async function getPendingDisciplinaryRecords() {
  return await prisma.employeeDisciplinaryRecord.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      employee: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          department: true,
          position: true,
        },
      },
      rule: true,
    },
    orderBy: {
      appliedDate: 'desc',
    },
  });
}

/**
 * Obtiene el historial disciplinario de un empleado
 */
export async function getEmployeeDisciplinaryHistory(
  employeeId: string,
  limit: number = 20
) {
  return await prisma.employeeDisciplinaryRecord.findMany({
    where: {
      employeeId,
    },
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
    orderBy: {
      appliedDate: 'desc',
    },
    take: limit,
  });
}

/**
 * Obtiene estadísticas disciplinarias de un empleado
 */
export async function getEmployeeDisciplinaryStats(employeeId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [
    totalRecords,
    activeRecords,
    last30Days,
    last90Days,
    administrativeActs,
    suspensions,
  ] = await Promise.all([
    // Total de registros
    prisma.employeeDisciplinaryRecord.count({
      where: { employeeId },
    }),
    // Registros activos
    prisma.employeeDisciplinaryRecord.count({
      where: {
        employeeId,
        status: 'ACTIVE',
      },
    }),
    // Últimos 30 días
    prisma.employeeDisciplinaryRecord.count({
      where: {
        employeeId,
        appliedDate: { gte: thirtyDaysAgo },
      },
    }),
    // Últimos 90 días
    prisma.employeeDisciplinaryRecord.count({
      where: {
        employeeId,
        appliedDate: { gte: ninetyDaysAgo },
      },
    }),
    // Actas administrativas
    prisma.employeeDisciplinaryRecord.count({
      where: {
        employeeId,
        actionType: 'ADMINISTRATIVE_ACT',
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
    }),
    // Suspensiones
    prisma.employeeDisciplinaryRecord.count({
      where: {
        employeeId,
        actionType: 'SUSPENSION',
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
    }),
  ]);

  // Actas en últimos 90 días (para verificar umbral de baja)
  const recentActs = await prisma.employeeDisciplinaryRecord.count({
    where: {
      employeeId,
      actionType: 'ADMINISTRATIVE_ACT',
      appliedDate: { gte: ninetyDaysAgo },
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
  });

  return {
    totalRecords,
    activeRecords,
    last30Days,
    last90Days,
    administrativeActs,
    suspensions,
    recentActs, // Importante: si es >= 3, está en riesgo de baja
    atRiskOfTermination: recentActs >= 3,
  };
}

/**
 * Completa automáticamente registros expirados
 */
export async function completeExpiredRecords() {
  const now = new Date();

  // Buscar suspensiones que ya expiraron
  const expiredRecords = await prisma.employeeDisciplinaryRecord.findMany({
    where: {
      status: 'ACTIVE',
      actionType: 'SUSPENSION',
      expirationDate: {
        lt: now,
      },
    },
  });

  // Marcar como completadas
  for (const record of expiredRecords) {
    await prisma.employeeDisciplinaryRecord.update({
      where: { id: record.id },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  return expiredRecords.length;
}

/**
 * Obtiene alertas de empleados en riesgo
 */
export async function getEmployeesAtRisk() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Obtener empleados con 2 o más actas (cercanos al umbral de 3)
  const employeesWithActs = await prisma.employeeDisciplinaryRecord.groupBy({
    by: ['employeeId'],
    where: {
      actionType: 'ADMINISTRATIVE_ACT',
      appliedDate: { gte: ninetyDaysAgo },
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gte: 2,
        },
      },
    },
  });

  // Obtener detalles de los empleados
  const employeeIds = employeesWithActs.map((e) => e.employeeId);

  const employees = await prisma.employee.findMany({
    where: {
      id: { in: employeeIds },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      department: true,
      position: true,
    },
  });

  return employees.map((employee) => {
    const actsCount =
      employeesWithActs.find((e) => e.employeeId === employee.id)?._count.id ||
      0;

    return {
      ...employee,
      actsCount,
      remainingActs: 3 - actsCount,
      riskLevel: actsCount === 2 ? 'HIGH' : 'MEDIUM',
    };
  });
}
