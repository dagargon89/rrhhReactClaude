import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from "date-fns"

/**
 * Servicio para cálculo automático de incidencias basado en asistencias
 */
export class IncidentCalculationService {
  /**
   * Calcula todas las incidencias para un período específico
   */
  static async calculateAllIncidents(startDate: Date, endDate: Date) {
    const results = {
      turnover: await this.calculateTurnover(startDate, endDate),
      absenteeism: await this.calculateAbsenteeism(startDate, endDate),
      tardiness: await this.calculateTardiness(startDate, endDate),
      overtime: await this.calculateOvertime(startDate, endDate),
    }

    return results
  }

  /**
   * Rotación: (Empleados terminados en período / Promedio empleados activos) * 100
   */
  static async calculateTurnover(startDate: Date, endDate: Date, departmentId?: string) {
    const where: any = {
      status: "TERMINATED",
      updatedAt: { gte: startDate, lte: endDate },
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    // Empleados terminados en el período
    const terminatedEmployees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
      },
    })

    // Promedio de empleados activos
    const activeEmployees = await prisma.employee.count({
      where: {
        status: "ACTIVE",
        ...(departmentId && { departmentId }),
      },
    })

    // Calcular tasa de rotación
    const turnoverRate = activeEmployees > 0
      ? (terminatedEmployees.length / activeEmployees) * 100
      : 0

    // Obtener tipo de incidencia
    const incidentType = await prisma.incidentType.findUnique({
      where: { name: "TURNOVER" },
    })

    if (!incidentType) {
      throw new Error("Tipo de incidencia TURNOVER no encontrado")
    }

    // Crear incidencias por departamento o global
    const incidents = []

    if (departmentId) {
      // Incidencia por departamento
      const incident = await prisma.incident.create({
        data: {
          incidentTypeId: incidentType.id,
          departmentId,
          date: endDate,
          value: turnoverRate,
          metadata: {
            terminated: terminatedEmployees.length,
            active: activeEmployees,
            period: {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            },
          },
          notes: `Rotación calculada automáticamente para el período`,
        },
      })
      incidents.push(incident)
    } else {
      // Incidencia por cada departamento
      const departments = await prisma.department.findMany({
        where: { isActive: true },
      })

      for (const dept of departments) {
        const deptTerminated = terminatedEmployees.filter(e => e.departmentId === dept.id)
        const deptActive = await prisma.employee.count({
          where: {
            status: "ACTIVE",
            departmentId: dept.id,
          },
        })

        if (deptActive > 0) {
          const deptRate = (deptTerminated.length / deptActive) * 100

          const incident = await prisma.incident.create({
            data: {
              incidentTypeId: incidentType.id,
              departmentId: dept.id,
              date: endDate,
              value: deptRate,
              metadata: {
                terminated: deptTerminated.length,
                active: deptActive,
                period: {
                  start: startDate.toISOString(),
                  end: endDate.toISOString(),
                },
              },
              notes: `Rotación calculada automáticamente para el departamento ${dept.name}`,
            },
          })
          incidents.push(incident)
        }
      }
    }

    return {
      rate: turnoverRate,
      terminated: terminatedEmployees.length,
      active: activeEmployees,
      incidents,
    }
  }

  /**
   * Ausentismo: (Días ausentes / Días laborables totales) * 100
   */
  static async calculateAbsenteeism(startDate: Date, endDate: Date, departmentId?: string) {
    const where: any = {
      date: { gte: startDate, lte: endDate },
      status: "ABSENT",
    }

    if (departmentId) {
      where.employee = { departmentId }
    }

    // Días ausentes
    const absentDays = await prisma.attendance.count({ where })

    // Días laborables (excluyendo fines de semana)
    const workDays = eachDayOfInterval({ start: startDate, end: endDate }).filter(
      (day) => day.getDay() !== 0 && day.getDay() !== 6
    ).length

    // Total empleados activos
    const totalEmployees = await prisma.employee.count({
      where: {
        status: "ACTIVE",
        ...(departmentId && { departmentId }),
      },
    })

    // Total días laborables posibles
    const totalWorkDays = workDays * totalEmployees

    // Tasa de ausentismo
    const absenteeismRate = totalWorkDays > 0
      ? (absentDays / totalWorkDays) * 100
      : 0

    // Obtener tipo de incidencia
    const incidentType = await prisma.incidentType.findUnique({
      where: { name: "ABSENTEEISM" },
    })

    if (!incidentType) {
      throw new Error("Tipo de incidencia ABSENTEEISM no encontrado")
    }

    // Crear incidencia
    const incident = await prisma.incident.create({
      data: {
        incidentTypeId: incidentType.id,
        departmentId: departmentId || null,
        date: endDate,
        value: absenteeismRate,
        metadata: {
          absentDays,
          totalWorkDays,
          employees: totalEmployees,
          workDays,
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
        notes: `Ausentismo calculado automáticamente para el período`,
      },
    })

    return {
      rate: absenteeismRate,
      absentDays,
      totalWorkDays,
      incident,
    }
  }

  /**
   * Impuntualidad: Conteo de llegadas tarde en el período
   */
  static async calculateTardiness(startDate: Date, endDate: Date, departmentId?: string) {
    const where: any = {
      date: { gte: startDate, lte: endDate },
      status: "LATE",
    }

    if (departmentId) {
      where.employee = { departmentId }
    }

    // Contar llegadas tarde
    const lateArrivals = await prisma.attendance.count({ where })

    // Total días laborables
    const workDays = eachDayOfInterval({ start: startDate, end: endDate }).filter(
      (day) => day.getDay() !== 0 && day.getDay() !== 6
    ).length

    // Total empleados
    const totalEmployees = await prisma.employee.count({
      where: {
        status: "ACTIVE",
        ...(departmentId && { departmentId }),
      },
    })

    // Tasa de impuntualidad
    const totalWorkDays = workDays * totalEmployees
    const tardinessRate = totalWorkDays > 0
      ? (lateArrivals / totalWorkDays) * 100
      : 0

    // Obtener tipo de incidencia
    const incidentType = await prisma.incidentType.findUnique({
      where: { name: "TARDINESS" },
    })

    if (!incidentType) {
      throw new Error("Tipo de incidencia TARDINESS no encontrado")
    }

    // Crear incidencia
    const incident = await prisma.incident.create({
      data: {
        incidentTypeId: incidentType.id,
        departmentId: departmentId || null,
        date: endDate,
        value: tardinessRate,
        metadata: {
          lateArrivals,
          totalWorkDays,
          employees: totalEmployees,
          workDays,
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
        notes: `Impuntualidad calculada automáticamente para el período`,
      },
    })

    return {
      rate: tardinessRate,
      lateArrivals,
      totalWorkDays,
      incident,
    }
  }

  /**
   * Horas Extra: Suma de horas extra trabajadas en el período
   */
  static async calculateOvertime(startDate: Date, endDate: Date, departmentId?: string) {
    const where: any = {
      date: { gte: startDate, lte: endDate },
      overtimeHours: { gt: 0 },
    }

    if (departmentId) {
      where.employee = { departmentId }
    }

    // Obtener todas las asistencias con horas extra
    const attendances = await prisma.attendance.findMany({
      where,
      select: {
        overtimeHours: true,
      },
    })

    // Sumar horas extra
    const totalOvertimeHours = attendances.reduce(
      (sum, att) => sum + parseFloat(att.overtimeHours.toString()),
      0
    )

    // Promedio por empleado
    const totalEmployees = await prisma.employee.count({
      where: {
        status: "ACTIVE",
        ...(departmentId && { departmentId }),
      },
    })

    const averageOvertimePerEmployee = totalEmployees > 0
      ? totalOvertimeHours / totalEmployees
      : 0

    // Obtener tipo de incidencia
    const incidentType = await prisma.incidentType.findUnique({
      where: { name: "OVERTIME" },
    })

    if (!incidentType) {
      throw new Error("Tipo de incidencia OVERTIME no encontrado")
    }

    // Crear incidencia
    const incident = await prisma.incident.create({
      data: {
        incidentTypeId: incidentType.id,
        departmentId: departmentId || null,
        date: endDate,
        value: totalOvertimeHours,
        metadata: {
          totalHours: totalOvertimeHours,
          averagePerEmployee: averageOvertimePerEmployee,
          employees: totalEmployees,
          attendances: attendances.length,
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
        notes: `Horas extra calculadas automáticamente para el período`,
      },
    })

    return {
      totalHours: totalOvertimeHours,
      average: averageOvertimePerEmployee,
      attendances: attendances.length,
      incident,
    }
  }

  /**
   * Verifica umbrales configurados y retorna alertas
   */
  static async checkThresholds(startDate: Date, endDate: Date) {
    const configs = await prisma.incidentConfig.findMany({
      where: {
        isActive: true,
      },
      include: {
        incidentType: true,
        department: true,
      },
    })

    const alerts = []

    for (const config of configs) {
      // Obtener incidencias del período según el tipo
      const incidents = await prisma.incident.findMany({
        where: {
          incidentTypeId: config.incidentTypeId,
          departmentId: config.departmentId || undefined,
          date: { gte: startDate, lte: endDate },
        },
      })

      if (incidents.length === 0) continue

      // Calcular valor según el método del tipo de incidencia
      let calculatedValue = 0

      switch (config.incidentType.calculationMethod) {
        case "RATE":
          // Promedio de las tasas
          calculatedValue = incidents.reduce((sum, i) => sum + parseFloat(i.value.toString()), 0) / incidents.length
          break
        case "COUNT":
          // Suma de conteos
          calculatedValue = incidents.reduce((sum, i) => sum + parseFloat(i.value.toString()), 0)
          break
        case "AVERAGE":
          // Promedio de valores
          calculatedValue = incidents.reduce((sum, i) => sum + parseFloat(i.value.toString()), 0) / incidents.length
          break
      }

      // Verificar umbral
      const thresholdValue = parseFloat(config.thresholdValue.toString())
      let thresholdExceeded = false

      switch (config.thresholdOperator) {
        case "GT":
          thresholdExceeded = calculatedValue > thresholdValue
          break
        case "LT":
          thresholdExceeded = calculatedValue < thresholdValue
          break
        case "GTE":
          thresholdExceeded = calculatedValue >= thresholdValue
          break
        case "LTE":
          thresholdExceeded = calculatedValue <= thresholdValue
          break
        case "EQ":
          thresholdExceeded = Math.abs(calculatedValue - thresholdValue) < 0.01
          break
      }

      if (thresholdExceeded) {
        alerts.push({
          config,
          calculatedValue,
          thresholdValue,
          incidents: incidents.length,
          message: `El ${config.incidentType.name} ha excedido el umbral configurado`,
        })
      }
    }

    return alerts
  }
}
