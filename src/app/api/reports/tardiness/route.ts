import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (!session.user.isStaff && !session.user.isSuperuser)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const employeeId = searchParams.get("employeeId")
    const departmentId = searchParams.get("departmentId")

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Se requieren fechas de inicio y fin" },
        { status: 400 }
      )
    }

    const where: any = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      status: "LATE", // Solo registros de tardanza
    }

    if (employeeId && employeeId !== "all") {
      where.employeeId = employeeId
    }

    if (departmentId) {
      where.employee = {
        departmentId,
      }
    }

    // Obtener registros de tardanza
    const tardinesses = await prisma.attendance.findMany({
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
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shiftOverride: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Agrupar estadísticas por empleado
    const employeeStats: any = {}

    tardinesses.forEach((att) => {
      const empId = att.employee.id
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          employeeName: `${att.employee.user.firstName} ${att.employee.user.lastName}`,
          employeeCode: att.employee.employeeCode,
          department: att.employee.department?.name || "Sin Departamento",
          departmentId: att.employee.department?.id || null,
          totalTardinesses: 0,
          totalMinutesLate: 0,
          avgMinutesLate: 0,
          maxMinutesLate: 0,
          lastTardinessDate: att.date,
          tardinesses: [],
        }
      }

      const stat = employeeStats[empId]
      stat.totalTardinesses++

      // Calcular minutos tarde (simplificado - usa la hora de entrada vs hora esperada)
      const minutesLate = att.lateMinutes || 0
      stat.totalMinutesLate += minutesLate
      stat.maxMinutesLate = Math.max(stat.maxMinutesLate, minutesLate)

      // Actualizar última fecha de tardanza
      const currentDate = new Date(att.date)
      const lastDate = new Date(stat.lastTardinessDate)
      if (currentDate > lastDate) {
        stat.lastTardinessDate = att.date
      }

      stat.tardinesses.push({
        id: att.id,
        date: att.date.toISOString(),
        checkInTime: att.checkInTime?.toISOString() || null,
        minutesLate: minutesLate,
        status: att.status,
      })
    })

    // Calcular promedios
    Object.values(employeeStats).forEach((stat: any) => {
      stat.avgMinutesLate = stat.totalTardinesses > 0
        ? stat.totalMinutesLate / stat.totalTardinesses
        : 0
    })

    // Calcular estadísticas generales
    const totalTardinesses = tardinesses.length
    const uniqueEmployees = Object.keys(employeeStats).length
    const totalMinutesLate = Object.values(employeeStats).reduce(
      (sum: number, stat: any) => sum + stat.totalMinutesLate,
      0
    )
    const avgMinutesLate = totalTardinesses > 0
      ? totalMinutesLate / totalTardinesses
      : 0

    // Ordenar por total de tardanzas (descendente)
    const sortedStats = Object.values(employeeStats).sort(
      (a: any, b: any) => b.totalTardinesses - a.totalTardinesses
    )

    // Estadísticas por departamento
    const departmentStats: any = {}
    Object.values(employeeStats).forEach((stat: any) => {
      const deptId = stat.departmentId || "no-department"
      const deptName = stat.department

      if (!departmentStats[deptId]) {
        departmentStats[deptId] = {
          departmentId: deptId,
          departmentName: deptName,
          totalEmployees: 0,
          totalTardinesses: 0,
          totalMinutesLate: 0,
          avgMinutesLate: 0,
        }
      }

      departmentStats[deptId].totalEmployees++
      departmentStats[deptId].totalTardinesses += stat.totalTardinesses
      departmentStats[deptId].totalMinutesLate += stat.totalMinutesLate
    })

    // Calcular promedios por departamento
    Object.values(departmentStats).forEach((stat: any) => {
      stat.avgMinutesLate = stat.totalTardinesses > 0
        ? stat.totalMinutesLate / stat.totalTardinesses
        : 0
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalTardinesses,
        uniqueEmployees,
        totalMinutesLate,
        avgMinutesLate: Math.round(avgMinutesLate * 10) / 10,
        totalHoursLost: Math.round((totalMinutesLate / 60) * 10) / 10,
      },
      employeeStats: sortedStats,
      departmentStats: Object.values(departmentStats),
      period: {
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error("Error generating tardiness report:", error)
    return NextResponse.json(
      { error: "Error al generar reporte de tardanzas" },
      { status: 500 }
    )
  }
}
