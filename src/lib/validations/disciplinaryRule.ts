import { z } from "zod"

// Esquema para crear regla disciplinaria
export const createDisciplinaryRuleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  triggerType: z.string().min(1, "El tipo de disparador es requerido"),
  triggerCount: z.number().min(1, "El conteo de disparador debe ser al menos 1"),
  periodDays: z.number().min(1, "El período de días debe ser al menos 1"),
  actionType: z.enum(["WARNING", "WRITTEN_WARNING", "ADMINISTRATIVE_ACT", "SUSPENSION", "TERMINATION"], {
    errorMap: () => ({ message: "Tipo de acción inválido" }),
  }),
  suspensionDays: z.number().min(0, "Los días de suspensión no pueden ser negativos").optional().nullable(),
  affectsSalary: z.boolean().default(false),
  requiresApproval: z.boolean().default(true),
  autoApply: z.boolean().default(false),
  notificationEnabled: z.boolean().default(true),
  notificationEmails: z.array(z.string().email("Email inválido")).default([]),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    // Si el tipo de acción es SUSPENSION, debe tener suspensionDays
    if (data.actionType === "SUSPENSION") {
      return data.suspensionDays !== null && data.suspensionDays !== undefined && data.suspensionDays > 0
    }
    return true
  },
  {
    message: "Las suspensiones deben tener días de suspensión especificados",
    path: ["suspensionDays"],
  }
)

// Esquema para actualizar regla disciplinaria
export const updateDisciplinaryRuleSchema = createDisciplinaryRuleSchema.partial()

// Tipos TypeScript inferidos
export type CreateDisciplinaryRuleInput = z.infer<typeof createDisciplinaryRuleSchema>
export type UpdateDisciplinaryRuleInput = z.infer<typeof updateDisciplinaryRuleSchema>

// Esquema para búsqueda/filtros
export const disciplinaryRuleFiltersSchema = z.object({
  triggerType: z.string().optional(),
  actionType: z.enum(["WARNING", "WRITTEN_WARNING", "ADMINISTRATIVE_ACT", "SUSPENSION", "TERMINATION"]).optional(),
  isActive: z.boolean().optional(),
})

export type DisciplinaryRuleFilters = z.infer<typeof disciplinaryRuleFiltersSchema>
