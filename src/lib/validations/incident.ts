import { z } from "zod"

// Enums
export const incidentTypeNameEnum = z.enum([
  "TURNOVER",
  "ABSENTEEISM",
  "TARDINESS",
  "OVERTIME"
])

export const calculationMethodEnum = z.enum([
  "RATE",
  "COUNT",
  "AVERAGE"
])

// Schema para crear incidencia
export const createIncidentSchema = z.object({
  incidentTypeId: z.string().cuid("ID de tipo de incidencia inv\u00e1lido"),
  employeeId: z.string().cuid("ID de empleado inv\u00e1lido").optional(),
  departmentId: z.string().cuid("ID de departamento inv\u00e1lido").optional(),
  date: z.string().datetime("Fecha inv\u00e1lida"),
  value: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  metadata: z.record(z.any()).optional(),
  notes: z.string().max(500, "Las notas no pueden exceder 500 caracteres").optional(),
})

// Schema para actualizar incidencia
export const updateIncidentSchema = createIncidentSchema.partial()

// Schema para crear tipo de incidencia
export const createIncidentTypeSchema = z.object({
  name: incidentTypeNameEnum,
  code: z.string()
    .min(2, "El c\u00f3digo debe tener al menos 2 caracteres")
    .max(20, "El c\u00f3digo no puede exceder 20 caracteres")
    .regex(/^[A-Z0-9_]+$/, "El c\u00f3digo solo puede contener letras may\u00fasculas, n\u00fameros y guiones bajos"),
  description: z.string().max(500).optional(),
  calculationMethod: calculationMethodEnum.default("RATE"),
  isActive: z.boolean().default(true),
})

// Schema para actualizar tipo de incidencia
export const updateIncidentTypeSchema = createIncidentTypeSchema.partial()

// Schema para filtros
export const incidentFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  incidentTypeId: z.string().cuid().optional(),
  employeeId: z.string().cuid().optional(),
  departmentId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
})

// Enums para configuración de umbrales
export const thresholdOperatorEnum = z.enum([
  "GT",   // Greater than
  "LT",   // Less than
  "GTE",  // Greater than or equal
  "LTE",  // Less than or equal
  "EQ"    // Equal
])

export const periodTypeEnum = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY"
])

// Schema para crear configuración de umbrales
export const createIncidentConfigSchema = z.object({
  incidentTypeId: z.string().cuid("ID de tipo de incidencia inválido"),
  departmentId: z.string().cuid("ID de departamento inválido").optional(),
  thresholdValue: z.number().min(0, "El valor umbral debe ser mayor o igual a 0"),
  thresholdOperator: thresholdOperatorEnum,
  periodType: periodTypeEnum,
  notificationEnabled: z.boolean().default(false),
  notificationEmails: z.array(z.string().email("Email inválido")).default([]),
  isActive: z.boolean().default(true),
})

// Schema para actualizar configuración de umbrales
export const updateIncidentConfigSchema = createIncidentConfigSchema.partial()

// Tipos exportados
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>
export type CreateIncidentTypeInput = z.infer<typeof createIncidentTypeSchema>
export type UpdateIncidentTypeInput = z.infer<typeof updateIncidentTypeSchema>
export type IncidentFilters = z.infer<typeof incidentFiltersSchema>
export type IncidentTypeName = z.infer<typeof incidentTypeNameEnum>
export type CalculationMethod = z.infer<typeof calculationMethodEnum>
export type ThresholdOperator = z.infer<typeof thresholdOperatorEnum>
export type PeriodType = z.infer<typeof periodTypeEnum>
export type CreateIncidentConfigInput = z.infer<typeof createIncidentConfigSchema>
export type UpdateIncidentConfigInput = z.infer<typeof updateIncidentConfigSchema>
