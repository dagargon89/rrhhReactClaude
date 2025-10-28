import { z } from "zod"

// Transformador para fechas que acepta Date, string o null
const dateTransform = z.union([
  z.string().datetime(),
  z.date(),
  z.string().transform((val) => val === "" ? null : new Date(val)),
  z.null(),
]).optional()

export const employeeSchema = z.object({
  userId: z.string().cuid().optional(),
  employeeCode: z.string().min(3, "El código debe tener al menos 3 caracteres").max(20),
  dateOfBirth: dateTransform,
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  departmentId: z.string().cuid().optional().nullable(),
  positionId: z.string().cuid().optional().nullable(),
  hireDate: z.union([z.string().datetime(), z.date(), z.string().transform((val) => new Date(val))]),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"]).default("ACTIVE"),
  profilePicture: z.string().url().optional().nullable(),
})

export const createEmployeeWithUserSchema = z.object({
  // User data
  email: z.string().email("Email inválido"),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  // Employee data
  employee: employeeSchema.omit({ userId: true }),
})

export const updateEmployeeSchema = z.object({
  employeeCode: z.string().min(3, "El código debe tener al menos 3 caracteres").max(20).optional(),
  dateOfBirth: dateTransform,
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  departmentId: z.string().cuid().optional().nullable(),
  positionId: z.string().cuid().optional().nullable(),
  hireDate: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"]).optional(),
  profilePicture: z.string().url().optional().nullable(),
  // Campos del usuario
  email: z.string().email("Email inválido").optional(),
  username: z.string().min(3).max(50).optional().nullable(),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50).optional(),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50).optional(),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>
export type CreateEmployeeWithUserData = z.infer<typeof createEmployeeWithUserSchema>
export type UpdateEmployeeData = z.infer<typeof updateEmployeeSchema>
