import { z } from "zod"

export const createPositionSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20),
  description: z.string().optional(),
  departmentId: z.string().cuid("Departamento inválido"),
  level: z.enum(["ENTRY", "MID", "SENIOR", "MANAGER", "DIRECTOR"]).default("ENTRY"),
  isActive: z.boolean().default(true),
})

export const updatePositionSchema = createPositionSchema.partial().extend({
  departmentId: z.string().cuid("Departamento inválido").optional(),
})

export type CreatePositionInput = z.infer<typeof createPositionSchema>
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>
