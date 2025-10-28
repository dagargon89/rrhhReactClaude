import { z } from "zod"

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20),
  description: z.string().optional(),
  managerId: z.string().cuid().optional().nullable(),
  parentDepartmentId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updateDepartmentSchema = createDepartmentSchema.partial()

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>
