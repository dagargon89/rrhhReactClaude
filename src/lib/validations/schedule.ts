import { z } from "zod"

// Schema para crear un horario
export const createScheduleSchema = z.object({
  employeeId: z.string().cuid("Empleado inválido"),
  shiftId: z.string().cuid("Turno inválido"),
  date: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]),
  isOverride: z.boolean().default(false),
  notes: z.string().optional().nullable(),
})

// Schema para actualizar un horario
export const updateScheduleSchema = z.object({
  employeeId: z.string().cuid("Empleado inválido").optional(),
  shiftId: z.string().cuid("Turno inválido").optional(),
  date: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]).optional(),
  isOverride: z.boolean().optional(),
  notes: z.string().optional().nullable(),
})

// Schema para crear horarios masivos (múltiples empleados o fechas)
export const createBulkSchedulesSchema = z.object({
  employeeIds: z.array(z.string().cuid()).min(1, "Debe seleccionar al menos un empleado"),
  shiftId: z.string().cuid("Turno inválido"),
  startDate: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]),
  endDate: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]),
  isOverride: z.boolean().default(false),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    const startDate = new Date(data.startDate as any)
    const endDate = new Date(data.endDate as any)
    return endDate >= startDate
  },
  {
    message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
    path: ["endDate"],
  }
)

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>
export type CreateBulkSchedulesInput = z.infer<typeof createBulkSchedulesSchema>
