/**
 * Tipos TypeScript para el sistema de tardanzas y disciplina
 */

import {
  TardinessType,
  DisciplinaryActionType,
  SanctionStatus
} from '@prisma/client';

// ============================================
// Tipos de Tardanzas
// ============================================

export interface TardinessRule {
  id: string;
  name: string;
  description?: string;
  type: TardinessType;
  startMinutesLate: number;
  endMinutesLate?: number;
  accumulationCount: number;
  equivalentFormalTardies: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TardinessAccumulation {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  lateArrivalsCount: number;
  directTardinessCount: number;
  formalTardiesCount: number;
  administrativeActs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TardinessProcessingResult {
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

// ============================================
// Tipos de Acciones Disciplinarias
// ============================================

export interface DisciplinaryActionRule {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerCount: number;
  periodDays: number;
  actionType: DisciplinaryActionType;
  suspensionDays?: number;
  affectsSalary: boolean;
  requiresApproval: boolean;
  autoApply: boolean;
  notificationEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeDisciplinaryRecord {
  id: string;
  employeeId: string;
  ruleId?: string;
  actionType: DisciplinaryActionType;
  triggerType: string;
  triggerCount: number;
  description: string;
  appliedDate: Date;
  effectiveDate?: Date;
  expirationDate?: Date;
  suspensionDays?: number;
  status: SanctionStatus;
  approvedById?: string;
  approvedAt?: Date;
  notes?: string;
  attachments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisciplinaryStats {
  totalRecords: number;
  activeRecords: number;
  last30Days: number;
  last90Days: number;
  administrativeActs: number;
  suspensions: number;
  recentActs: number;
  atRiskOfTermination: boolean;
}

export interface EmployeeAtRisk {
  id: string;
  employeeCode: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  department?: {
    name: string;
  };
  position?: {
    title: string;
  };
  actsCount: number;
  remainingActs: number;
  riskLevel: 'HIGH' | 'MEDIUM';
}

// ============================================
// Parámetros de Funciones
// ============================================

export interface ProcessTardinessParams {
  employeeId: string;
  minutesLate: number;
  checkInTime: Date;
  attendanceId: string;
}

export interface CreateDisciplinaryRecordParams {
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

export interface ApproveDisciplinaryRecordParams {
  recordId: string;
  approvedById: string;
  notes?: string;
}

export interface RejectDisciplinaryRecordParams {
  recordId: string;
  approvedById: string;
  rejectionReason: string;
}

// ============================================
// Respuestas de API
// ============================================

export interface CheckInResponse {
  success: boolean;
  attendance: {
    id: string;
    employeeId: string;
    date: Date;
    checkInTime: Date;
    status: string;
    employee: {
      employeeCode: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
  tardiness?: {
    minutesLate: number;
    ruleApplied: string;
    accumulationType: string;
    formalTardiesAdded: number;
    currentMonthStats: {
      lateArrivalsCount: number;
      directTardinessCount: number;
      formalTardiesCount: number;
      administrativeActs: number;
    };
    disciplinaryActionTriggered: boolean;
    disciplinaryActionId?: string;
  };
}

// ============================================
// Constantes y Enums
// ============================================

export const TARDINESS_THRESHOLDS = {
  LATE_ARRIVAL_START: 1,
  LATE_ARRIVAL_END: 15,
  DIRECT_TARDINESS_START: 16,
} as const;

export const DISCIPLINARY_PERIODS = {
  TARDIES: 30, // días para contar retardos formales
  ACTS: 90,    // días para contar actas administrativas
  ABSENCES: 30, // días para contar faltas injustificadas
} as const;

export const TARDINESS_RULES_IDS = {
  LATE_ARRIVAL: 'tr_late_arrival_001',
  POST_FIRST_TARDINESS: 'tr_post_first_tardiness',
  DIRECT_TARDINESS: 'tr_direct_tardiness_001',
} as const;

export const DISCIPLINARY_RULES_IDS = {
  FIVE_TARDIES: 'dar_formal_tardies_5',
  THREE_ACTS: 'dar_admin_acts_3_termination',
  ONE_ABSENCE: 'dar_absence_1',
  TWO_ABSENCES: 'dar_absence_2',
  THREE_ABSENCES: 'dar_absence_3',
  FOUR_ABSENCES: 'dar_absence_4_termination',
} as const;
