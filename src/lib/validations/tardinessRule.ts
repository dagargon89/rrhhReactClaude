import { z } from "zod"

// Objeto base para regla de tardanzas
const tardinessRuleBaseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  type: z.enum(["LATE_ARRIVAL", "DIRECT_TARDINESS"], {
    errorMap: () => ({ message: "Tipo debe ser LATE_ARRIVAL o DIRECT_TARDINESS" }),
  }),
  startMinutesLate: z.number().min(0, "Los minutos de inicio no pueden ser negativos"),
  endMinutesLate: z.number().min(0, "Los minutos de fin no pueden ser negativos").optional().nullable(),
  accumulationCount: z.number().min(1, "El conteo de acumulación debe ser al menos 1"),
  equivalentFormalTardies: z.number().min(1, "Los retardos formales equivalentes deben ser al menos 1"),
  isActive: z.boolean().default(true),
})

// Esquema para crear regla de tardanzas
export const createTardinessRuleSchema = tardinessRuleBaseSchema.refine(
  (data) => {
    // Si endMinutesLate existe, debe ser mayor que startMinutesLate
    if (data.endMinutesLate !== null && data.endMinutesLate !== undefined) {
      return data.endMinutesLate > data.startMinutesLate
    }
    return true
  },
  {
    message: "Los minutos de fin deben ser mayores que los minutos de inicio",
    path: ["endMinutesLate"],
  }
)

// Esquema para actualizar regla de tardanzas
export const updateTardinessRuleSchema = tardinessRuleBaseSchema.partial()

// Tipos TypeScript inferidos
export type CreateTardinessRuleInput = z.infer<typeof createTardinessRuleSchema>
export type UpdateTardinessRuleInput = z.infer<typeof updateTardinessRuleSchema>

// Esquema para búsqueda/filtros
export const tardinessRuleFiltersSchema = z.object({
  type: z.enum(["LATE_ARRIVAL", "DIRECT_TARDINESS"]).optional(),
  isActive: z.boolean().optional(),
})

export type TardinessRuleFilters = z.infer<typeof tardinessRuleFiltersSchema>
