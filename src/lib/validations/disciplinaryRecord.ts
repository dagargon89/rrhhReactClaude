import { z } from "zod"

// Esquema para crear registro disciplinario manual
export const createDisciplinaryRecordSchema = z.object({
  employeeId: z.string().cuid("ID de empleado inválido"),
  actionType: z.enum(["WARNING", "WRITTEN_WARNING", "ADMINISTRATIVE_ACT", "SUSPENSION", "TERMINATION"], {
    errorMap: () => ({ message: "Tipo de acción inválido" }),
  }),
  triggerType: z.string().optional(),
  triggerCount: z.number().min(0).optional(),
  appliedDate: z.string().datetime("Fecha de aplicación inválida"),
  effectiveDate: z.string().datetime("Fecha efectiva inválida").optional(),
  expirationDate: z.string().datetime("Fecha de expiración inválida").optional(),
  suspensionDays: z.number().min(0, "Los días de suspensión no pueden ser negativos").optional().nullable(),
  affectsSalary: z.boolean().default(false),
  reason: z.string().min(1, "La razón es requerida"),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Si el tipo es SUSPENSION, debe tener suspensionDays, effectiveDate y expirationDate
    if (data.actionType === "SUSPENSION") {
      return (
        data.suspensionDays !== null &&
        data.suspensionDays !== undefined &&
        data.suspensionDays > 0 &&
        data.effectiveDate !== undefined &&
        data.expirationDate !== undefined
      )
    }
    return true
  },
  {
    message: "Las suspensiones requieren días de suspensión, fecha efectiva y fecha de expiración",
    path: ["suspensionDays"],
  }
)

// Esquema para actualizar registro disciplinario
export const updateDisciplinaryRecordSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  approvedById: z.string().cuid("ID de aprobador inválido").optional(),
  approvalDate: z.string().datetime("Fecha de aprobación inválida").optional(),
  notes: z.string().optional(),
})

// Esquema para aprobar/rechazar registro
export const approveDisciplinaryRecordSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
})

// Tipos TypeScript inferidos
export type CreateDisciplinaryRecordInput = z.infer<typeof createDisciplinaryRecordSchema>
export type UpdateDisciplinaryRecordInput = z.infer<typeof updateDisciplinaryRecordSchema>
export type ApproveDisciplinaryRecordInput = z.infer<typeof approveDisciplinaryRecordSchema>

// Esquema para búsqueda/filtros
export const disciplinaryRecordFiltersSchema = z.object({
  employeeId: z.string().cuid().optional(),
  actionType: z.enum(["WARNING", "WRITTEN_WARNING", "ADMINISTRATIVE_ACT", "SUSPENSION", "TERMINATION"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type DisciplinaryRecordFilters = z.infer<typeof disciplinaryRecordFiltersSchema>
