import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAttendanceSchema } from "@/lib/validations/attendance"
import { z } from "zod"

// GET - Listar todas las asistencias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")

    const where: any = {}

    if (date) {
      where.date = new Date(date)
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (status) {
      where.status = status
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        schedule: {
          select: {
            id: true,
            shift: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error("Error fetching attendances:", error)
    return NextResponse.json(
      { error: "Error al obtener asistencias" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva asistencia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAttendanceSchema.parse(body)

    // Calcular horas trabajadas si hay check-in y check-out
    let workedHours = 0
    let overtimeHours = 0

    if (validatedData.checkInTime && validatedData.checkOutTime) {
      const checkIn = new Date(validatedData.checkInTime)
      const checkOut = new Date(validatedData.checkOutTime)
      const diffMs = checkOut.getTime() - checkIn.getTime()
      workedHours = diffMs / (1000 * 60 * 60) // Convertir a horas

      // Si hay un horario asignado, calcular horas extra
      if (validatedData.scheduleId) {
        const schedule = await prisma.schedule.findUnique({
          where: { id: validatedData.scheduleId },
          include: {
            shift: true,
          },
        })

        if (schedule?.shift) {
          // Parsear workingHours si existe
          let expectedHours = 8 // Default
          if (schedule.shift.workingHours) {
            try {
              const workingHours = JSON.parse(schedule.shift.workingHours)
              const dayOfWeek = new Date(validatedData.date).getDay()
              const dayConfig = workingHours.find((d: any) => d.day === dayOfWeek)
              if (dayConfig?.enabled) {
                expectedHours = dayConfig.duration
              }
            } catch (e) {
              // Si falla el parse, usar startTime y endTime antiguos
              const [startHour, startMin] = schedule.shift.startTime.split(":").map(Number)
              const [endHour, endMin] = schedule.shift.endTime.split(":").map(Number)
              expectedHours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60
            }
          }

          overtimeHours = Math.max(0, workedHours - expectedHours)
        }
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: validatedData.employeeId,
        scheduleId: validatedData.scheduleId,
        date: new Date(validatedData.date),
        checkInTime: validatedData.checkInTime ? new Date(validatedData.checkInTime) : null,
        checkInMethod: validatedData.checkInMethod,
        checkInLocation: validatedData.checkInLocation,
        checkOutTime: validatedData.checkOutTime ? new Date(validatedData.checkOutTime) : null,
        checkOutMethod: validatedData.checkOutMethod,
        checkOutLocation: validatedData.checkOutLocation,
        workedHours,
        overtimeHours,
        status: validatedData.status,
        notes: validatedData.notes,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating attendance:", error)
    return NextResponse.json(
      { error: "Error al crear asistencia" },
      { status: 500 }
    )
  }
}




