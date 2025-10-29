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
    const reportType = searchParams.get("type") || "employee" // employee, department, general

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
    }

    if (employeeId && employeeId !== "all") {
      where.employeeId = employeeId
    }

    if (departmentId) {
      where.employee = {
        departmentId,
      }
    }

    // Obtener todos los registros de asistencia
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
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            defaultShift: {
              select: {
                id: true,
                name: true,
                code: true,
                weeklyHours: true,
              },
            },
          },
        },
        shiftOverride: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Calcular estadísticas según el tipo de reporte
    let stats: any = {}

    if (reportType === "employee") {
      // Agrupar por empleado
      const employeeStats: any = {}

      attendances.forEach((att) => {
        const empId = att.employee.id
        if (!employeeStats[empId]) {
          employeeStats[empId] = {
            employeeId: empId,
            employeeName: `${att.employee.user.firstName} ${att.employee.user.lastName}`,
            employeeCode: att.employee.employeeCode,
            department: att.employee.department?.name || "Sin Departamento",
            totalDays: 0,
            present: 0,
            late: 0,
            absent: 0,
            halfDay: 0,
            onLeave: 0,
            totalHours: 0,
            overtimeHours: 0,
            avgHours: 0,
            punctualityRate: 0,
            attendanceRate: 0,
          }
        }

        const stat = employeeStats[empId]
        stat.totalDays++
        stat.totalHours += Number(att.workedHours) || 0
        stat.overtimeHours += Number(att.overtimeHours) || 0

        switch (att.status) {
          case "PRESENT":
            stat.present++
            break
          case "LATE":
            stat.late++
            break
          case "ABSENT":
            stat.absent++
            break
          case "HALF_DAY":
            stat.halfDay++
            break
          case "ON_LEAVE":
            stat.onLeave++
            break
        }
      })

      // Calcular tasas
      Object.values(employeeStats).forEach((stat: any) => {
        stat.avgHours = stat.totalDays > 0 ? stat.totalHours / stat.totalDays : 0
        stat.punctualityRate =
          stat.totalDays > 0 ? ((stat.present + stat.halfDay) / stat.totalDays) * 100 : 0
        stat.attendanceRate =
          stat.totalDays > 0
            ? ((stat.present + stat.late + stat.halfDay) / stat.totalDays) * 100
            : 0
      })

      stats = Object.values(employeeStats)
    } else if (reportType === "department") {
      // Agrupar por departamento
      const deptStats: any = {}
      const employeesByDept: any = {}

      attendances.forEach((att) => {
        const deptId = att.employee.department?.id || "no-department"
        const deptName = att.employee.department?.name || "Sin Departamento"
        const empId = att.employee.id

        if (!deptStats[deptId]) {
          deptStats[deptId] = {
            departmentId: deptId,
            departmentName: deptName,
            totalEmployees: 0,
            totalDays: 0,
            present: 0,
            late: 0,
            absent: 0,
            halfDay: 0,
            onLeave: 0,
            totalHours: 0,
            punctualityRate: 0,
            attendanceRate: 0,
          }
          employeesByDept[deptId] = new Set()
        }

        const stat = deptStats[deptId]
        employeesByDept[deptId].add(empId)
        stat.totalDays++
        stat.totalHours += Number(att.workedHours) || 0

        switch (att.status) {
          case "PRESENT":
            stat.present++
            break
          case "LATE":
            stat.late++
            break
          case "ABSENT":
            stat.absent++
            break
          case "HALF_DAY":
            stat.halfDay++
            break
          case "ON_LEAVE":
            stat.onLeave++
            break
        }
      })

      // Calcular tasas
      Object.keys(deptStats).forEach((deptId) => {
        const stat = deptStats[deptId]
        stat.totalEmployees = employeesByDept[deptId].size
        stat.punctualityRate =
          stat.totalDays > 0 ? ((stat.present + stat.halfDay) / stat.totalDays) * 100 : 0
        stat.attendanceRate =
          stat.totalDays > 0
            ? ((stat.present + stat.late + stat.halfDay) / stat.totalDays) * 100
            : 0
      })

      stats = Object.values(deptStats)
    } else {
      // Estadísticas generales
      const general = {
        totalRecords: attendances.length,
        present: attendances.filter((a) => a.status === "PRESENT").length,
        late: attendances.filter((a) => a.status === "LATE").length,
        absent: attendances.filter((a) => a.status === "ABSENT").length,
        halfDay: attendances.filter((a) => a.status === "HALF_DAY").length,
        onLeave: attendances.filter((a) => a.status === "ON_LEAVE").length,
        totalHours: attendances.reduce((sum, a) => sum + Number(a.workedHours), 0),
        overtimeHours: attendances.reduce((sum, a) => sum + Number(a.overtimeHours), 0),
      }

      stats = general
    }

    return NextResponse.json({
      success: true,
      data: stats,
      period: {
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    )
  }
}
