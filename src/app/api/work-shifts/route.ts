import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createWorkShiftSchema } from "@/lib/validations/workShift"
import { z } from "zod"

// GET - Listar todos los turnos
export async function GET(request: NextRequest) {
  try {
    const workShifts = await prisma.workShift.findMany({
      include: {
        periods: {
          orderBy: [
            { dayOfWeek: "asc" },
            { hourFrom: "asc" },
          ],
        },
        _count: {
          select: {
            employeesWithDefault: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(workShifts)
  } catch (error) {
    console.error("Error fetching work shifts:", error)
    return NextResponse.json(
      { error: "Error al obtener turnos" },
      { status: 500 }
    )
  }
}

// Función auxiliar para convertir tiempo "HH:MM" a decimal
function timeToDecimal(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + (minutes / 60)
}

// Función para determinar el período del día
function getDayPeriod(startHour: number): "MORNING" | "AFTERNOON" | "LUNCH" | "NIGHT" {
  if (startHour >= 6 && startHour < 12) return 'MORNING'
  if (startHour >= 12 && startHour < 14) return 'LUNCH'
  if (startHour >= 14 && startHour < 20) return 'AFTERNOON'
  return 'NIGHT'
}

// POST - Crear nuevo turno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createWorkShiftSchema.parse(body)

    // Verificar que el código sea único
    const existingCode = await prisma.workShift.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "El código del turno ya existe" },
        { status: 400 }
      )
    }

    // Crear el WorkShift y sus períodos en una transacción
    const workShift = await prisma.$transaction(async (tx) => {
      // 1. Crear el turno
      const shift = await tx.workShift.create({
        data: {
          name: validatedData.name,
          code: validatedData.code,
          description: validatedData.description || null,
          timezone: validatedData.timezone,
          weeklyHours: validatedData.weeklyHours,
          gracePeriodMinutes: validatedData.gracePeriodMinutes,
          autoCheckoutEnabled: validatedData.autoCheckoutEnabled,
          isActive: validatedData.isActive,
        },
      })

      // 2. Crear los períodos basados en workingHours
      if (validatedData.workingHours && validatedData.workingHours.length > 0) {
        for (const workDay of validatedData.workingHours) {
          if (!workDay.enabled) continue

          const hourFrom = timeToDecimal(workDay.startTime)
          const hourTo = timeToDecimal(workDay.endTime)
          const duration = hourTo - hourFrom

          if (duration > 6) {
            // Turno largo, dividir en mañana y tarde
            const lunchStart = 13.0

            if (hourFrom < lunchStart && hourTo > lunchStart) {
              // Período de mañana
              await tx.workShiftPeriod.create({
                data: {
                  workShiftId: shift.id,
                  dayOfWeek: workDay.day,
                  hourFrom,
                  hourTo: lunchStart,
                  name: 'Mañana',
                  dayPeriod: 'MORNING',
                },
              })

              // Período de tarde
              await tx.workShiftPeriod.create({
                data: {
                  workShiftId: shift.id,
                  dayOfWeek: workDay.day,
                  hourFrom: lunchStart,
                  hourTo,
                  name: 'Tarde',
                  dayPeriod: 'AFTERNOON',
                },
              })
            } else {
              // Todo en un solo período
              await tx.workShiftPeriod.create({
                data: {
                  workShiftId: shift.id,
                  dayOfWeek: workDay.day,
                  hourFrom,
                  hourTo,
                  dayPeriod: getDayPeriod(hourFrom),
                },
              })
            }
          } else {
            // Turno corto, un solo período
            await tx.workShiftPeriod.create({
              data: {
                workShiftId: shift.id,
                dayOfWeek: workDay.day,
                hourFrom,
                hourTo,
                dayPeriod: getDayPeriod(hourFrom),
              },
            })
          }
        }
      }

      // 3. Retornar el turno con sus períodos
      return await tx.workShift.findUnique({
        where: { id: shift.id },
        include: {
          periods: {
            orderBy: [
              { dayOfWeek: 'asc' },
              { hourFrom: 'asc' },
            ],
          },
        },
      })
    })

    return NextResponse.json(workShift, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating work shift:", error)
    return NextResponse.json(
      { error: "Error al crear turno" },
      { status: 500 }
    )
  }
}
