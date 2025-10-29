const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed con datos de prueba completos...\n')

  // ============================================
  // 1. CREAR DEPARTAMENTOS
  // ============================================
  console.log('📁 Creando departamentos...')
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'IT' },
      update: {},
      create: {
        name: 'Tecnología de la Información',
        code: 'IT',
        description: 'Desarrollo y soporte tecnológico',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { code: 'HR' },
      update: {},
      create: {
        name: 'Recursos Humanos',
        code: 'HR',
        description: 'Gestión de personal',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { code: 'SALES' },
      update: {},
      create: {
        name: 'Ventas',
        code: 'SALES',
        description: 'Equipo comercial',
        isActive: true,
      },
    }),
  ])
  console.log(`✅ ${departments.length} departamentos creados\n`)

  // ============================================
  // 2. CREAR POSICIONES
  // ============================================
  console.log('💼 Creando posiciones...')
  const positions = await Promise.all([
    prisma.position.upsert({
      where: { code: 'DEV-SR' },
      update: {},
      create: {
        title: 'Desarrollador Senior',
        code: 'DEV-SR',
        description: 'Desarrollador con experiencia',
        departmentId: departments[0].id,
        level: 'SENIOR',
        isActive: true,
      },
    }),
    prisma.position.upsert({
      where: { code: 'HR-MGR' },
      update: {},
      create: {
        title: 'Gerente de RRHH',
        code: 'HR-MGR',
        description: 'Responsable del área de recursos humanos',
        departmentId: departments[1].id,
        level: 'MANAGER',
        isActive: true,
      },
    }),
    prisma.position.upsert({
      where: { code: 'SALES-REP' },
      update: {},
      create: {
        title: 'Representante de Ventas',
        code: 'SALES-REP',
        description: 'Ejecutivo de ventas',
        departmentId: departments[2].id,
        level: 'MID',
        isActive: true,
      },
    }),
  ])
  console.log(`✅ ${positions.length} posiciones creadas\n`)

  // ============================================
  // 3. CREAR TURNOS CON PERÍODOS
  // ============================================
  console.log('🕐 Creando turnos de trabajo...')

  // Turno Matutino: 8:00 AM - 5:00 PM
  const morningShift = await prisma.workShift.upsert({
    where: { code: 'MORNING' },
    update: {},
    create: {
      name: 'Turno Matutino',
      code: 'MORNING',
      description: 'Horario de 8:00 AM a 5:00 PM',
      weeklyHours: 40,
      isActive: true,
    },
  })

  // Crear períodos para el turno matutino (Lunes a Viernes)
  // dayOfWeek: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  const daysOfWeek = [1, 2, 3, 4, 5] // Lunes a Viernes

  // Limpiar períodos existentes del turno
  await prisma.workShiftPeriod.deleteMany({
    where: { workShiftId: morningShift.id },
  })

  for (const day of daysOfWeek) {
    await prisma.workShiftPeriod.create({
      data: {
        workShiftId: morningShift.id,
        dayOfWeek: day,
        hourFrom: 8.0, // 8:00 AM
        hourTo: 17.0,  // 5:00 PM
        name: 'Turno Completo',
        dayPeriod: 'MORNING',
      },
    })
  }

  // Turno Vespertino: 2:00 PM - 10:00 PM
  const afternoonShift = await prisma.workShift.upsert({
    where: { code: 'AFTERNOON' },
    update: {},
    create: {
      name: 'Turno Vespertino',
      code: 'AFTERNOON',
      description: 'Horario de 2:00 PM a 10:00 PM',
      weeklyHours: 40,
      isActive: true,
    },
  })

  // Limpiar períodos existentes del turno
  await prisma.workShiftPeriod.deleteMany({
    where: { workShiftId: afternoonShift.id },
  })

  for (const day of daysOfWeek) {
    await prisma.workShiftPeriod.create({
      data: {
        workShiftId: afternoonShift.id,
        dayOfWeek: day,
        hourFrom: 14.0, // 2:00 PM
        hourTo: 22.0,   // 10:00 PM
        name: 'Turno Completo',
        dayPeriod: 'AFTERNOON',
      },
    })
  }

  console.log(`✅ 2 turnos creados con sus períodos\n`)

  // ============================================
  // 4. CREAR USUARIOS Y EMPLEADOS
  // ============================================
  console.log('👥 Creando usuarios y empleados...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Empleado 1: Juan Pérez (Puntual)
  const user1 = await prisma.user.upsert({
    where: { email: 'juan.perez@company.com' },
    update: {},
    create: {
      email: 'juan.perez@company.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      isActive: true,
      isStaff: false,
      isSuperuser: false,
    },
  })

  const employee1 = await prisma.employee.upsert({
    where: { employeeCode: 'EMP001' },
    update: {},
    create: {
      userId: user1.id,
      employeeCode: 'EMP001',
      phone: '555-0001',
      departmentId: departments[0].id,
      positionId: positions[0].id,
      defaultShiftId: morningShift.id, // Turno matutino
      hireDate: new Date('2023-01-15'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  })

  // Empleado 2: María García (Tarde ocasionalmente)
  const user2 = await prisma.user.upsert({
    where: { email: 'maria.garcia@company.com' },
    update: {},
    create: {
      email: 'maria.garcia@company.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'García',
      isActive: true,
      isStaff: false,
      isSuperuser: false,
    },
  })

  const employee2 = await prisma.employee.upsert({
    where: { employeeCode: 'EMP002' },
    update: {},
    create: {
      userId: user2.id,
      employeeCode: 'EMP002',
      phone: '555-0002',
      departmentId: departments[1].id,
      positionId: positions[1].id,
      defaultShiftId: morningShift.id,
      hireDate: new Date('2023-03-20'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  })

  // Empleado 3: Carlos López (Llega tarde frecuentemente)
  const user3 = await prisma.user.upsert({
    where: { email: 'carlos.lopez@company.com' },
    update: {},
    create: {
      email: 'carlos.lopez@company.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'López',
      isActive: true,
      isStaff: false,
      isSuperuser: false,
    },
  })

  const employee3 = await prisma.employee.upsert({
    where: { employeeCode: 'EMP003' },
    update: {},
    create: {
      userId: user3.id,
      employeeCode: 'EMP003',
      phone: '555-0003',
      departmentId: departments[2].id,
      positionId: positions[2].id,
      defaultShiftId: afternoonShift.id, // Turno vespertino
      hireDate: new Date('2023-06-10'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  })

  console.log(`✅ 3 empleados creados\n`)

  // ============================================
  // 5. CREAR TIPOS DE INCIDENTES
  // ============================================
  console.log('📝 Creando tipos de incidentes...')

  const tardinessIncidentType = await prisma.incidentType.upsert({
    where: { name: 'TARDINESS' },
    update: {},
    create: {
      name: 'TARDINESS',
      code: 'TARD',
      description: 'Llegadas tarde al trabajo',
      calculationMethod: 'COUNT',
      isActive: true,
    },
  })

  const absenceIncidentType = await prisma.incidentType.upsert({
    where: { name: 'ABSENTEEISM' },
    update: {},
    create: {
      name: 'ABSENTEEISM',
      code: 'ABS',
      description: 'Ausencias injustificadas',
      calculationMethod: 'COUNT',
      isActive: true,
    },
  })

  console.log(`✅ 2 tipos de incidentes creados\n`)

  // ============================================
  // 6. CREAR REGLAS DE TARDANZA
  // ============================================
  console.log('⚖️ Creando reglas de tardanza...')

  const tardinessRule1 = await prisma.tardinessRule.create({
    data: {
      name: 'Tardanza Leve',
      description: 'Llegadas tarde entre 1 y 15 minutos',
      type: 'LATE_ARRIVAL',
      startMinutesLate: 1,
      endMinutesLate: 15,
      accumulationCount: 1,
      equivalentFormalTardies: 1,
      isActive: true,
    },
  })

  const tardinessRule2 = await prisma.tardinessRule.create({
    data: {
      name: 'Tardanza Grave',
      description: 'Llegadas tarde de más de 15 minutos',
      type: 'DIRECT_TARDINESS',
      startMinutesLate: 16,
      endMinutesLate: null,
      accumulationCount: 1,
      equivalentFormalTardies: 2,
      isActive: true,
    },
  })

  console.log(`✅ 2 reglas de tardanza creadas\n`)

  // ============================================
  // 7. CREAR REGLAS DISCIPLINARIAS
  // ============================================
  console.log('📋 Creando reglas disciplinarias...')

  const disciplinaryRule1 = await prisma.disciplinaryActionRule.create({
    data: {
      name: 'Acción por Tardanzas Recurrentes',
      description: 'Advertencia escrita después de 5 tardanzas',
      triggerType: 'TARDINESS',
      triggerCount: 5,
      periodDays: 30,
      actionType: 'WRITTEN_WARNING',
      isActive: true,
    },
  })

  const disciplinaryRule2 = await prisma.disciplinaryActionRule.create({
    data: {
      name: 'Suspensión por Ausencias',
      description: 'Suspensión de 3 días después de 3 ausencias injustificadas',
      triggerType: 'ABSENTEEISM',
      triggerCount: 3,
      periodDays: 30,
      actionType: 'SUSPENSION',
      suspensionDays: 3,
      isActive: true,
    },
  })

  console.log(`✅ 2 reglas disciplinarias creadas\n`)

  // ============================================
  // 8. CREAR ASISTENCIAS DE PRUEBA (ÚLTIMOS 7 DÍAS)
  // ============================================
  console.log('📅 Creando asistencias de prueba...')

  const today = new Date()
  const dates = []

  // Generar últimos 7 días (solo días laborables)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    // Solo días laborables (1-5 = Lunes-Viernes)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(date)
    }
  }

  console.log(`   Generando asistencias para ${dates.length} días laborables...\n`)

  for (const date of dates) {
    // Juan Pérez - SIEMPRE PUNTUAL
    const checkIn1 = new Date(date)
    checkIn1.setHours(7, 55, 0, 0) // Llega 5 minutos antes
    const checkOut1 = new Date(date)
    checkOut1.setHours(17, 10, 0, 0) // Sale 10 minutos después

    await prisma.attendance.create({
      data: {
        employeeId: employee1.id,
        date: new Date(date.setHours(0, 0, 0, 0)),
        checkInTime: checkIn1,
        checkOutTime: checkOut1,
        checkInMethod: 'MANUAL',
        checkOutMethod: 'MANUAL',
        workedHours: 8.25,
        overtimeHours: 0.25,
        status: 'PRESENT',
      },
    })

    // María García - TARDE OCASIONALMENTE (2 de cada 5 días)
    const isLate = Math.random() > 0.6 // 40% probabilidad de llegar tarde
    const checkIn2 = new Date(date)
    if (isLate) {
      checkIn2.setHours(8, 20, 0, 0) // Llega 20 minutos tarde
    } else {
      checkIn2.setHours(8, 5, 0, 0) // Llega 5 minutos tarde (dentro de tolerancia)
    }
    const checkOut2 = new Date(date)
    checkOut2.setHours(17, 0, 0, 0)

    const lateMinutes2 = isLate ? 20 : 5
    const status2 = isLate ? 'LATE' : 'PRESENT'

    await prisma.attendance.create({
      data: {
        employeeId: employee2.id,
        date: new Date(date.setHours(0, 0, 0, 0)),
        checkInTime: checkIn2,
        checkOutTime: checkOut2,
        checkInMethod: 'MANUAL',
        checkOutMethod: 'MANUAL',
        workedHours: 8.0,
        overtimeHours: 0,
        status: status2,
      },
    })

    // Si llegó tarde, crear incident
    if (isLate) {
      await prisma.incident.create({
        data: {
          incidentTypeId: tardinessIncidentType.id,
          employeeId: employee2.id,
          date: new Date(date.setHours(0, 0, 0, 0)),
          value: lateMinutes2, // Minutos tarde
          notes: `Llegada tarde de ${lateMinutes2} minutos`,
        },
      })
    }

    // Carlos López - LLEGA TARDE FRECUENTEMENTE (turno vespertino)
    const checkIn3 = new Date(date)
    checkIn3.setHours(14, 30, 0, 0) // Llega 30 minutos tarde (turno inicia a 14:00)
    const checkOut3 = new Date(date)
    checkOut3.setHours(22, 0, 0, 0)

    await prisma.attendance.create({
      data: {
        employeeId: employee3.id,
        date: new Date(date.setHours(0, 0, 0, 0)),
        checkInTime: checkIn3,
        checkOutTime: checkOut3,
        checkInMethod: 'MANUAL',
        checkOutMethod: 'MANUAL',
        workedHours: 7.5,
        overtimeHours: 0,
        status: 'LATE',
      },
    })

    // Crear incident para cada tardanza
    await prisma.incident.create({
      data: {
        incidentTypeId: tardinessIncidentType.id,
        employeeId: employee3.id,
        date: new Date(date.setHours(0, 0, 0, 0)),
        value: 30, // Minutos tarde
        notes: `Llegada tarde de 30 minutos`,
      },
    })
  }

  console.log(`✅ ${dates.length * 3} asistencias creadas\n`)

  // ============================================
  // 9. CREAR ACUMULACIONES DE TARDANZA
  // ============================================
  console.log('📊 Creando acumulaciones de tardanza...')

  // Contar tardanzas reales
  const tardinessCountEmp2 = await prisma.attendance.count({
    where: {
      employeeId: employee2.id,
      status: 'LATE',
    },
  })

  const tardinessCountEmp3 = await prisma.attendance.count({
    where: {
      employeeId: employee3.id,
      status: 'LATE',
    },
  })

  const currentMonth = today.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
  const currentYear = today.getFullYear()

  if (tardinessCountEmp2 > 0) {
    await prisma.tardinessAccumulation.create({
      data: {
        employeeId: employee2.id,
        month: currentMonth,
        year: currentYear,
        lateArrivalsCount: tardinessCountEmp2, // Tardanzas leves (< 15 min)
        directTardinessCount: 0,
        formalTardiesCount: tardinessCountEmp2,
        administrativeActs: 0,
      },
    })
  }

  if (tardinessCountEmp3 > 0) {
    await prisma.tardinessAccumulation.create({
      data: {
        employeeId: employee3.id,
        month: currentMonth,
        year: currentYear,
        lateArrivalsCount: 0,
        directTardinessCount: tardinessCountEmp3, // Tardanzas graves (> 15 min)
        formalTardiesCount: tardinessCountEmp3 * 2, // Cada tardanza grave = 2 tardanzas formales
        administrativeActs: tardinessCountEmp3 >= 5 ? 1 : 0,
      },
    })
  }

  console.log(`✅ Acumulaciones de tardanza creadas\n`)

  // ============================================
  // 10. CREAR REGISTRO DISCIPLINARIO PARA CARLOS
  // ============================================
  if (tardinessCountEmp3 >= 5) {
    console.log('⚠️  Creando registro disciplinario para Carlos López...')

    await prisma.employeeDisciplinaryRecord.create({
      data: {
        employeeId: employee3.id,
        ruleId: disciplinaryRule1.id,
        actionType: 'WRITTEN_WARNING',
        triggerType: 'TARDINESS',
        triggerCount: tardinessCountEmp3,
        description: `Tardanzas recurrentes: ${tardinessCountEmp3} ocasiones en los últimos ${dates.length} días. Se ha observado un patrón constante de llegadas tarde al turno vespertino.`,
        appliedDate: new Date(),
        status: 'ACTIVE',
        approvedById: user2.id, // María (HR Manager) aplica la sanción
        approvedAt: new Date(),
      },
    })

    console.log('✅ Registro disciplinario creado\n')
  }

  // ============================================
  // RESUMEN
  // ============================================
  console.log('\n' + '='.repeat(60))
  console.log('✨ SEED COMPLETADO - RESUMEN DE DATOS')
  console.log('='.repeat(60))
  console.log(`
📊 DATOS CREADOS:
  • ${departments.length} Departamentos (IT, HR, Ventas)
  • ${positions.length} Posiciones
  • 2 Turnos de Trabajo con períodos
  • 3 Empleados con diferentes patrones:
    - Juan Pérez: PUNTUAL ✅
    - María García: Tarde ocasionalmente ⚠️
    - Carlos López: Tarde frecuentemente ❌
  • ${dates.length * 3} Registros de asistencia
  • 2 Reglas de tardanza
  • 2 Reglas disciplinarias
  • Acumulaciones de tardanza
  • Incidencias registradas
  • ${tardinessCountEmp3 >= 5 ? '1 Registro disciplinario' : 'Sin registros disciplinarios aún'}

🔑 CREDENCIALES DE PRUEBA:
  juan.perez@company.com / password123
  maria.garcia@company.com / password123
  carlos.lopez@company.com / password123

📋 FLUJO DEMOSTRADO:
  1. ✅ Empleados asignados a turnos
  2. ✅ Asistencias registradas con check-in/check-out
  3. ✅ Tardanzas detectadas automáticamente
  4. ✅ Incidencias creadas para cada tardanza
  5. ✅ Acumulación de tardanzas activa
  6. ✅ ${tardinessCountEmp3 >= 5 ? 'Acción disciplinaria aplicada' : 'Seguimiento de patrones'}

🎯 PRUEBAS SUGERIDAS:
  1. Accede a /admin/attendance - Ver asistencias
  2. Accede a /admin/reports/tardiness - Ver reporte de tardanzas
  3. Accede a /admin/tardiness-accumulations - Ver acumulaciones
  4. Accede a /admin/disciplinary-records - Ver sanciones
  5. Accede a /admin/incidents - Ver incidencias
  `)
  console.log('='.repeat(60) + '\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
