import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.incident.deleteMany()
  await prisma.incidentConfig.deleteMany()
  await prisma.incidentType.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.leaveBalance.deleteMany()
  await prisma.leaveType.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.workShift.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.position.deleteMany()
  await prisma.department.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Datos existentes eliminados')

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hrms.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      isStaff: true,
      isSuperuser: true,
    },
  })

  console.log('✅ Usuario administrador creado')

  // Crear departamentos
  const itDepartment = await prisma.department.create({
    data: {
      name: 'Tecnología de la Información',
      code: 'IT',
      description: 'Departamento de TI',
      isActive: true,
    },
  })

  const hrDepartment = await prisma.department.create({
    data: {
      name: 'Recursos Humanos',
      code: 'HR',
      description: 'Departamento de RRHH',
      isActive: true,
    },
  })

  const salesDepartment = await prisma.department.create({
    data: {
      name: 'Ventas',
      code: 'SALES',
      description: 'Departamento de ventas',
      isActive: true,
    },
  })

  console.log('✅ Departamentos creados')

  // Crear posiciones
  const devPosition = await prisma.position.create({
    data: {
      title: 'Desarrollador Full Stack',
      code: 'DEV-FS',
      description: 'Desarrollador de software full stack',
      departmentId: itDepartment.id,
      level: 'MID',
      isActive: true,
    },
  })

  const hrManagerPosition = await prisma.position.create({
    data: {
      title: 'Gerente de RRHH',
      code: 'HR-MGR',
      description: 'Gerente de Recursos Humanos',
      departmentId: hrDepartment.id,
      level: 'MANAGER',
      isActive: true,
    },
  })

  const salesRepPosition = await prisma.position.create({
    data: {
      title: 'Representante de Ventas',
      code: 'SALES-REP',
      description: 'Representante de ventas',
      departmentId: salesDepartment.id,
      level: 'ENTRY',
      isActive: true,
    },
  })

  console.log('✅ Posiciones creadas')

  // Crear empleado para el admin
  const adminEmployee = await prisma.employee.create({
    data: {
      userId: adminUser.id,
      employeeCode: 'EMP001',
      hireDate: new Date('2024-01-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      departmentId: itDepartment.id,
      positionId: devPosition.id,
    },
  })

  console.log('✅ Empleado administrador creado')

  // Crear turnos de trabajo
  const morningShift = await prisma.workShift.create({
    data: {
      name: 'Turno Matutino',
      code: 'MORNING',
      startTime: '09:00',
      endTime: '17:00',
      isFlexible: false,
      gracePeriodMinutes: 15,
      autoCheckoutEnabled: true,
      autoCheckoutTime: '17:30',
      daysOfWeek: JSON.stringify([0, 1, 2, 3, 4]), // Lunes a Viernes
      isActive: true,
    },
  })

  const afternoonShift = await prisma.workShift.create({
    data: {
      name: 'Turno Vespertino',
      code: 'AFTERNOON',
      startTime: '14:00',
      endTime: '22:00',
      isFlexible: false,
      gracePeriodMinutes: 15,
      autoCheckoutEnabled: true,
      autoCheckoutTime: '22:30',
      daysOfWeek: JSON.stringify([0, 1, 2, 3, 4]),
      isActive: true,
    },
  })

  const flexibleShift = await prisma.workShift.create({
    data: {
      name: 'Horario Flexible',
      code: 'FLEXIBLE',
      startTime: '08:00',
      endTime: '18:00',
      isFlexible: true,
      gracePeriodMinutes: 30,
      autoCheckoutEnabled: false,
      daysOfWeek: JSON.stringify([0, 1, 2, 3, 4]),
      isActive: true,
    },
  })

  console.log('✅ Turnos de trabajo creados')

  // Crear tipos de permisos
  const vacationLeave = await prisma.leaveType.create({
    data: {
      name: 'VACATION',
      code: 'VAC',
      description: 'Vacaciones anuales',
      requiresApproval: true,
      maxDaysPerYear: 15,
      isPaid: true,
      color: '#3B82F6',
      isActive: true,
    },
  })

  const sickLeave = await prisma.leaveType.create({
    data: {
      name: 'SICK_LEAVE',
      code: 'SICK',
      description: 'Permiso por enfermedad',
      requiresApproval: true,
      maxDaysPerYear: 10,
      isPaid: true,
      color: '#EF4444',
      isActive: true,
    },
  })

  const personalLeave = await prisma.leaveType.create({
    data: {
      name: 'PERSONAL',
      code: 'PERS',
      description: 'Permiso personal',
      requiresApproval: true,
      maxDaysPerYear: 5,
      isPaid: true,
      color: '#F59E0B',
      isActive: true,
    },
  })

  console.log('✅ Tipos de permisos creados')

  // Crear balance de vacaciones para el empleado admin
  await prisma.leaveBalance.create({
    data: {
      employeeId: adminEmployee.id,
      leaveTypeId: vacationLeave.id,
      year: new Date().getFullYear(),
      totalDays: 15,
      usedDays: 0,
      pendingDays: 0,
    },
  })

  await prisma.leaveBalance.create({
    data: {
      employeeId: adminEmployee.id,
      leaveTypeId: sickLeave.id,
      year: new Date().getFullYear(),
      totalDays: 10,
      usedDays: 0,
      pendingDays: 0,
    },
  })

  await prisma.leaveBalance.create({
    data: {
      employeeId: adminEmployee.id,
      leaveTypeId: personalLeave.id,
      year: new Date().getFullYear(),
      totalDays: 5,
      usedDays: 0,
      pendingDays: 0,
    },
  })

  console.log('✅ Balances de vacaciones creados')

  // Crear tipos de incidencias
  await prisma.incidentType.create({
    data: {
      name: 'TURNOVER',
      code: 'TURN',
      description: 'Rotación de personal',
      calculationMethod: 'RATE',
      isActive: true,
    },
  })

  await prisma.incidentType.create({
    data: {
      name: 'ABSENTEEISM',
      code: 'ABS',
      description: 'Ausentismo laboral',
      calculationMethod: 'RATE',
      isActive: true,
    },
  })

  await prisma.incidentType.create({
    data: {
      name: 'TARDINESS',
      code: 'TARD',
      description: 'Impuntualidad',
      calculationMethod: 'COUNT',
      isActive: true,
    },
  })

  await prisma.incidentType.create({
    data: {
      name: 'OVERTIME',
      code: 'OT',
      description: 'Horas extras',
      calculationMethod: 'AVERAGE',
      isActive: true,
    },
  })

  console.log('✅ Tipos de incidencias creados')

  console.log('')
  console.log('🎉 Seed completado exitosamente!')
  console.log('')
  console.log('📝 Credenciales de acceso:')
  console.log('   Email: admin@hrms.com')
  console.log('   Password: admin123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
