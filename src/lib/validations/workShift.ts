import { z } from "zod"

// Validación para formato de hora "HH:mm"
const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

// Schema para un día de trabajo individual
export const workDaySchema = z.object({
  day: z.number().int().min(0).max(6), // 0 = Lunes, 6 = Domingo
  enabled: z.boolean(),
  startTime: z.string().regex(timeFormatRegex, "Formato de hora inválido. Usa HH:mm"),
  endTime: z.string().regex(timeFormatRegex, "Formato de hora inválido. Usa HH:mm"),
  duration: z.number().min(0).max(24), // Horas trabajadas ese día
}).refine(
  (data) => {
    // Solo validar si el día está habilitado
    if (!data.enabled) return true
    
    // Validar que endTime sea posterior a startTime
    const [startHour, startMin] = data.startTime.split(":").map(Number)
    const [endHour, endMin] = data.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes > startMinutes
  },
  {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["endTime"],
  }
)

// Schema para crear un turno
export const createWorkShiftSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20),
  description: z.string().optional(),
  timezone: z.string().default("America/Ciudad_Juarez"),
  weeklyHours: z.number().min(0).max(168).default(48), // Máximo 168 horas por semana
  workingHours: z.array(workDaySchema).length(7, "Debe tener configuración para los 7 días"),
  isFlexible: z.boolean().default(false),
  gracePeriodMinutes: z.number().int().min(0).max(120).default(0),
  autoCheckoutEnabled: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    // Al menos un día debe estar habilitado
    const enabledDays = data.workingHours.filter(day => day.enabled)
    return enabledDays.length > 0
  },
  {
    message: "Debe habilitar al menos un día de la semana",
    path: ["workingHours"],
  }
).refine(
  (data) => {
    // Validar que weeklyHours coincida con la suma de durations de días habilitados
    const totalHours = data.workingHours
      .filter(day => day.enabled)
      .reduce((sum, day) => sum + day.duration, 0)
    
    // Permitir una diferencia de 0.5 horas por redondeo
    return Math.abs(totalHours - data.weeklyHours) <= 0.5
  },
  {
    message: "Las horas semanales deben coincidir con la suma de horas diarias",
    path: ["weeklyHours"],
  }
)

// Schema para actualizar un turno
export const updateWorkShiftSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100).optional(),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20).optional(),
  description: z.string().optional(),
  timezone: z.string().optional(),
  weeklyHours: z.number().min(0).max(168).optional(),
  workingHours: z.array(workDaySchema).length(7, "Debe tener configuración para los 7 días").optional(),
  isFlexible: z.boolean().optional(),
  gracePeriodMinutes: z.number().int().min(0).max(120).optional(),
  autoCheckoutEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    // Si workingHours está presente, validar que al menos un día esté habilitado
    if (data.workingHours) {
      const enabledDays = data.workingHours.filter(day => day.enabled)
      return enabledDays.length > 0
    }
    return true
  },
  {
    message: "Debe habilitar al menos un día de la semana",
    path: ["workingHours"],
  }
).refine(
  (data) => {
    // Si ambos weeklyHours y workingHours están presentes, validar que coincidan
    if (data.weeklyHours !== undefined && data.workingHours) {
      const totalHours = data.workingHours
        .filter(day => day.enabled)
        .reduce((sum, day) => sum + day.duration, 0)
      
      return Math.abs(totalHours - data.weeklyHours) <= 0.5
    }
    return true
  },
  {
    message: "Las horas semanales deben coincidir con la suma de horas diarias",
    path: ["weeklyHours"],
  }
)

export type WorkDay = z.infer<typeof workDaySchema>
export type CreateWorkShiftInput = z.infer<typeof createWorkShiftSchema>
export type UpdateWorkShiftInput = z.infer<typeof updateWorkShiftSchema>
