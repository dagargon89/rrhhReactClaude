import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateWorkShiftSchema } from "@/lib/validations/workShift"
import { z } from "zod"

// GET - Obtener un turno por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workShift = await prisma.workShift.findUnique({
      where: { id: params.id },
      include: {
        periods: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        _count: {
          select: {
            employeesWithDefault: true,
          },
        },
      },
    })

    if (!workShift) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    // Convertir periods a workingHours para compatibilidad con UI
    // Crear array de 7 días (0=Lunes, 1=Martes, etc.)
    const workingHours = Array.from({ length: 7 }, (_, day) => {
      const period = workShift.periods.find(p => p.dayOfWeek === day)

      if (period) {
        // Convertir hourFrom y hourTo de decimal a string "HH:MM"
        const hourFrom = Number(period.hourFrom)
        const hourTo = Number(period.hourTo)

        const startHour = Math.floor(hourFrom)
        const startMin = Math.round((hourFrom - startHour) * 60)
        const endHour = Math.floor(hourTo)
        const endMin = Math.round((hourTo - endHour) * 60)

        const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

        const duration = hourTo - hourFrom

        return {
          day,
          enabled: true,
          startTime,
          endTime,
          duration: Number(duration.toFixed(2)),
        }
      }

      // Si no hay period para este día, está deshabilitado
      return {
        day,
        enabled: false,
        startTime: "09:00",
        endTime: "17:00",
        duration: 0,
      }
    })

    const workShiftWithParsed = {
      ...workShift,
      workingHours,
      isFlexible: false, // Campo legacy para compatibilidad
      periods: undefined, // No enviar periods a la UI
    }

    return NextResponse.json(workShiftWithParsed)
  } catch (error) {
    console.error("Error fetching work shift:", error)
    return NextResponse.json(
      { error: "Error al obtener turno" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un turno
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateWorkShiftSchema.parse(body)

    // Verificar que el turno existe
    const existingShift = await prisma.workShift.findUnique({
      where: { id: params.id },
    })

    if (!existingShift) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    // Si se está actualizando el código, verificar que sea único
    if (validatedData.code && validatedData.code !== existingShift.code) {
      const codeExists = await prisma.workShift.findUnique({
        where: { code: validatedData.code },
      })

      if (codeExists) {
        return NextResponse.json(
          { error: "El código del turno ya existe" },
          { status: 400 }
        )
      }
    }

    // Extraer workingHours antes de preparar cleanedData
    const workingHours = validatedData.workingHours

    // Limpiar valores undefined y preparar datos (sin workingHours ni isFlexible)
    const cleanedData: any = Object.fromEntries(
      Object.entries(validatedData).filter(([key, value]) =>
        value !== undefined && key !== 'workingHours' && key !== 'isFlexible'
      )
    )

    // Actualizar el turno y sus períodos en una transacción
    const updatedShift = await prisma.$transaction(async (tx) => {
      // Actualizar turno básico
      const shift = await tx.workShift.update({
        where: { id: params.id },
        data: cleanedData,
      })

      // Si hay workingHours, actualizar los períodos
      if (workingHours && Array.isArray(workingHours)) {
        // Eliminar períodos existentes
        await tx.workShiftPeriod.deleteMany({
          where: { workShiftId: params.id },
        })

        // Crear nuevos períodos solo para días habilitados
        const periodsToCreate = workingHours
          .filter(day => day.enabled)
          .map(day => {
            // Convertir "HH:MM" a decimal
            const [startHour, startMin] = day.startTime.split(':').map(Number)
            const [endHour, endMin] = day.endTime.split(':').map(Number)

            const hourFrom = startHour + (startMin / 60)
            const hourTo = endHour + (endMin / 60)

            return {
              workShiftId: params.id,
              dayOfWeek: day.day,
              hourFrom,
              hourTo,
              dayPeriod: hourFrom < 12 ? 'MORNING' : (hourFrom < 18 ? 'AFTERNOON' : 'NIGHT'),
            }
          })

        if (periodsToCreate.length > 0) {
          await tx.workShiftPeriod.createMany({
            data: periodsToCreate,
          })
        }
      }

      // Retornar el turno actualizado con sus períodos
      return await tx.workShift.findUnique({
        where: { id: params.id },
        include: {
          periods: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },
        },
      })
    })

    // Convertir periods a workingHours para la respuesta
    const responseWorkingHours = Array.from({ length: 7 }, (_, day) => {
      const period = updatedShift?.periods.find(p => p.dayOfWeek === day)

      if (period) {
        const hourFrom = Number(period.hourFrom)
        const hourTo = Number(period.hourTo)

        const startHour = Math.floor(hourFrom)
        const startMin = Math.round((hourFrom - startHour) * 60)
        const endHour = Math.floor(hourTo)
        const endMin = Math.round((hourTo - endHour) * 60)

        const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

        return {
          day,
          enabled: true,
          startTime,
          endTime,
          duration: Number((hourTo - hourFrom).toFixed(2)),
        }
      }

      return {
        day,
        enabled: false,
        startTime: "09:00",
        endTime: "17:00",
        duration: 0,
      }
    })

    const workShiftWithParsed = {
      ...updatedShift,
      workingHours: responseWorkingHours,
      isFlexible: false,
      periods: undefined,
    }

    return NextResponse.json(workShiftWithParsed)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating work shift:", error)
    return NextResponse.json(
      { error: "Error al actualizar turno" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un turno
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el turno existe
    const existingShift = await prisma.workShift.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            employeesWithDefault: true,
          },
        },
      },
    })

    if (!existingShift) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que no tenga empleados asignados
    if (existingShift._count.employeesWithDefault > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar el turno porque tiene empleados asignados",
          employeesCount: existingShift._count.employeesWithDefault
        },
        { status: 400 }
      )
    }

    // Eliminar en transacción: primero períodos, luego turno
    await prisma.$transaction(async (tx) => {
      await tx.workShiftPeriod.deleteMany({
        where: { workShiftId: params.id },
      })
      await tx.workShift.delete({
        where: { id: params.id },
      })
    })

    return NextResponse.json({
      message: "Turno eliminado exitosamente"
    })
  } catch (error) {
    console.error("Error deleting work shift:", error)
    return NextResponse.json(
      { error: "Error al eliminar turno" },
      { status: 500 }
    )
  }
}
