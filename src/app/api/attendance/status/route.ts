import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET - Obtener estado de asistencia del día actual
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.employeeId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Buscar el registro más reciente que tenga check-in pero NO check-out
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: session.user.employeeId,
        checkInTime: {
          not: null
        },
        checkOutTime: null,
      },
      orderBy: {
        checkInTime: 'desc'
      }
    })

    console.log('🔍 Active attendance search:', {
      employeeId: session.user.employeeId,
      found: !!activeAttendance,
      attendanceId: activeAttendance?.id,
      date: activeAttendance?.date?.toISOString(),
      checkInTime: activeAttendance?.checkInTime?.toISOString(),
      checkOutTime: activeAttendance?.checkOutTime?.toISOString(),
    })

    // Verificar si el registro activo es de hoy
    let attendance = null
    if (activeAttendance) {
      const attendanceDate = new Date(activeAttendance.date)
      const today = new Date()

      // Comparar usando UTC para evitar problemas de zona horaria
      const isSameDay =
        attendanceDate.getUTCFullYear() === today.getUTCFullYear() &&
        attendanceDate.getUTCMonth() === today.getUTCMonth() &&
        attendanceDate.getUTCDate() === today.getUTCDate()

      console.log('📅 Date comparison:', {
        attendanceDateISO: attendanceDate.toISOString(),
        attendanceDateUTC: `${attendanceDate.getUTCFullYear()}-${attendanceDate.getUTCMonth() + 1}-${attendanceDate.getUTCDate()}`,
        todayISO: today.toISOString(),
        todayUTC: `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`,
        isSameDay,
      })

      if (isSameDay) {
        attendance = activeAttendance
      }
    }

    console.log('✅ Final attendance:', {
      found: !!attendance,
      id: attendance?.id,
      checkInTime: attendance?.checkInTime?.toISOString(),
      checkOutTime: attendance?.checkOutTime?.toISOString(),
    })

    return NextResponse.json({
      hasAttendance: !!attendance,
      attendance: attendance ? {
        id: attendance.id,
        checkInTime: attendance.checkInTime?.toISOString() || null,
        checkOutTime: attendance.checkOutTime?.toISOString() || null,
        status: attendance.status,
      } : null,
    })
  } catch (error) {
    console.error("Error fetching attendance status:", error)
    return NextResponse.json(
      { error: "Error al obtener estado de asistencia" },
      { status: 500 }
    )
  }
}
