import { z } from "zod"

// Schema para crear una asistencia
export const createAttendanceSchema = z.object({
  employeeId: z.string().cuid("ID de empleado inválido"),
  scheduleId: z.string().cuid("ID de horario inválido").optional().nullable(),
  date: z.string().min(1, "La fecha es requerida"),
  checkInTime: z.string().optional().nullable(),
  checkInMethod: z.enum(["MANUAL", "AUTO", "BIOMETRIC"]).optional().nullable(),
  checkInLocation: z.string().optional().nullable(),
  checkOutTime: z.string().optional().nullable(),
  checkOutMethod: z.enum(["MANUAL", "AUTO", "BIOMETRIC"]).optional().nullable(),
  checkOutLocation: z.string().optional().nullable(),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"]).default("PRESENT"),
  notes: z.string().optional(),
})

// Schema para actualizar una asistencia
export const updateAttendanceSchema = z.object({
  checkInTime: z.string().optional().nullable(),
  checkInMethod: z.enum(["MANUAL", "AUTO", "BIOMETRIC"]).optional().nullable(),
  checkInLocation: z.string().optional().nullable(),
  checkOutTime: z.string().optional().nullable(),
  checkOutMethod: z.enum(["MANUAL", "AUTO", "BIOMETRIC"]).optional().nullable(),
  checkOutLocation: z.string().optional().nullable(),
  workedHours: z.number().min(0).optional(),
  overtimeHours: z.number().min(0).optional(),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"]).optional(),
  notes: z.string().optional(),
})

// Schema para check-in rápido
export const checkInSchema = z.object({
  employeeId: z.string().cuid("ID de empleado inválido"),
  checkInMethod: z.enum(["MANUAL", "AUTO", "BIOMETRIC"]).default("MANUAL"),
  checkInLocation: z.string().optional(),
})

// Schema para check-out rápido
export const checkOutSchema = z.object({
  attendanceId: z.string().cuid("ID de asistencia inválido"),
  checkOutMethod: z.enum(["MANUAL", "AUTO", "BIOMETRIC"]).default("MANUAL"),
  checkOutLocation: z.string().optional(),
})

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>
export type CheckInInput = z.infer<typeof checkInSchema>
export type CheckOutInput = z.infer<typeof checkOutSchema>


