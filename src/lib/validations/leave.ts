import { z } from "zod"

// Schema para crear un tipo de permiso
export const createLeaveTypeSchema = z.object({
  name: z.enum(["VACATION", "SICK_LEAVE", "PERSONAL", "MATERNITY", "PATERNITY", "UNPAID"]),
  code: z.string().min(2).max(20),
  description: z.string().optional(),
  requiresApproval: z.boolean().default(true),
  maxDaysPerYear: z.number().int().min(0).optional().nullable(),
  isPaid: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color inválido (formato HEX)").default("#3B82F6"),
  isActive: z.boolean().default(true),
})

// Schema para actualizar un tipo de permiso
export const updateLeaveTypeSchema = createLeaveTypeSchema.partial()

// Schema para crear una solicitud de permiso
export const createLeaveRequestSchema = z.object({
  employeeId: z.string().cuid("ID de empleado inválido"),
  leaveTypeId: z.string().cuid("ID de tipo de permiso inválido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  reason: z.string().min(10, "La razón debe tener al menos 10 caracteres"),
  attachments: z.string().optional(),
}).refine(
  (data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end >= start
  },
  {
    message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
    path: ["endDate"],
  }
)

// Schema para actualizar una solicitud de permiso
export const updateLeaveRequestSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().min(10).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  rejectionReason: z.string().optional(),
  attachments: z.string().optional(),
})

// Schema para aprobar/rechazar una solicitud
export const reviewLeaveRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.status === "REJECTED" && !data.rejectionReason) {
      return false
    }
    return true
  },
  {
    message: "Debe proporcionar una razón para el rechazo",
    path: ["rejectionReason"],
  }
)

// Schema para crear/actualizar balance de permisos
export const leaveBalanceSchema = z.object({
  employeeId: z.string().cuid("ID de empleado inválido"),
  leaveTypeId: z.string().cuid("ID de tipo de permiso inválido"),
  year: z.number().int().min(2020).max(2100),
  totalDays: z.number().min(0),
})

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>
export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>
export type ReviewLeaveRequestInput = z.infer<typeof reviewLeaveRequestSchema>
export type LeaveBalanceInput = z.infer<typeof leaveBalanceSchema>



