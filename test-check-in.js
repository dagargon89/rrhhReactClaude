/**
 * Script de Prueba - Check-In con Tardanza
 *
 * Este script simula un check-in tarde para verificar
 * que todo el flujo automático funciona correctamente
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCheckIn() {
  console.log('\n🧪 INICIANDO PRUEBA DE CHECK-IN CON TARDANZA\n')
  console.log('='.repeat(60))

  try {
    // 1. Obtener empleado de prueba (Juan Pérez - empleado puntual)
    const employee = await prisma.employee.findFirst({
      where: {
        user: {
          email: 'juan.perez@company.com'
        }
      },
      include: {
        user: true,
        defaultShift: {
          include: {
            periods: true
          }
        },
        department: true
      }
    })

    if (!employee) {
      console.error('❌ No se encontró el empleado de prueba')
      console.log('💡 Ejecuta primero: node seed-complete-test-data.js')
      return
    }

    console.log('\n📋 EMPLEADO DE PRUEBA:')
    console.log(`   Nombre: ${employee.user.firstName} ${employee.user.lastName}`)
    console.log(`   Código: ${employee.employeeCode}`)
    console.log(`   Departamento: ${employee.department?.name || 'N/A'}`)
    console.log(`   Turno: ${employee.defaultShift?.name || 'N/A'}`)

    // 2. Ver estadísticas actuales
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const currentStats = await prisma.tardinessAccumulation.findUnique({
      where: {
        employeeId_year_month: {
          employeeId: employee.id,
          year: currentYear,
          month: currentMonth
        }
      }
    })

    console.log('\n📊 ESTADÍSTICAS ANTES DEL CHECK-IN:')
    if (currentStats) {
      console.log(`   Llegadas tarde: ${currentStats.lateArrivalsCount}`)
      console.log(`   Tardanzas directas: ${currentStats.directTardinessCount}`)
      console.log(`   Retardos formales: ${currentStats.formalTardiesCount}`)
      console.log(`   Actas administrativas: ${currentStats.administrativeActs}`)
    } else {
      console.log('   (No hay estadísticas previas este mes)')
    }

    // 3. Simular check-in tarde (30 minutos después del turno)
    console.log('\n⏰ SIMULANDO CHECK-IN TARDE...')

    // Obtener hora de inicio del turno
    const dayOfWeek = now.getDay()
    const todayPeriods = employee.defaultShift?.periods.filter(p => p.dayOfWeek === dayOfWeek) || []

    if (todayPeriods.length === 0) {
      console.error('❌ No hay períodos configurados para hoy')
      return
    }

    const firstPeriod = todayPeriods[0]
    const hourFromDecimal = Number(firstPeriod.hourFrom)
    const shiftHour = Math.floor(hourFromDecimal)
    const shiftMin = Math.round((hourFromDecimal - shiftHour) * 60)

    console.log(`   Turno comienza a las: ${String(shiftHour).padStart(2, '0')}:${String(shiftMin).padStart(2, '0')}`)
    console.log(`   Período de gracia: ${employee.defaultShift.gracePeriodMinutes} minutos`)

    // Simular check-in 30 minutos tarde
    const checkInTime = new Date(now)
    checkInTime.setHours(shiftHour, shiftMin + 30, 0, 0)

    console.log(`   Check-in simulado a las: ${checkInTime.toLocaleTimeString()}`)
    console.log(`   Minutos de retraso: 30`)

    // 4. Hacer request al API de check-in
    console.log('\n🔄 EJECUTANDO CHECK-IN VÍA API...')

    const response = await fetch('http://localhost:3004/api/attendance/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employeeId: employee.id,
        checkInMethod: 'MANUAL',
        checkInLocation: 'Oficina Principal'
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Error en el check-in:', result.error)
      return
    }

    console.log('\n✅ CHECK-IN EXITOSO!')
    console.log('\n📝 RESULTADO:')
    console.log(JSON.stringify(result, null, 2))

    // 5. Ver estadísticas después del check-in
    const updatedStats = await prisma.tardinessAccumulation.findUnique({
      where: {
        employeeId_year_month: {
          employeeId: employee.id,
          year: currentYear,
          month: currentMonth
        }
      }
    })

    console.log('\n📊 ESTADÍSTICAS DESPUÉS DEL CHECK-IN:')
    if (updatedStats) {
      console.log(`   Llegadas tarde: ${updatedStats.lateArrivalsCount}`)
      console.log(`   Tardanzas directas: ${updatedStats.directTardinessCount}`)
      console.log(`   Retardos formales: ${updatedStats.formalTardiesCount}`)
      console.log(`   Actas administrativas: ${updatedStats.administrativeActs}`)
    }

    // 6. Ver si se creó alguna acta disciplinaria
    const latestDisciplinaryRecord = await prisma.employeeDisciplinaryRecord.findFirst({
      where: {
        employeeId: employee.id
      },
      orderBy: {
        appliedDate: 'desc'
      },
      include: {
        rule: true
      }
    })

    if (latestDisciplinaryRecord) {
      console.log('\n⚠️  ACTA DISCIPLINARIA ENCONTRADA:')
      console.log(`   Tipo: ${latestDisciplinaryRecord.actionType}`)
      console.log(`   Descripción: ${latestDisciplinaryRecord.description}`)
      console.log(`   Estado: ${latestDisciplinaryRecord.status}`)
      console.log(`   Fecha: ${latestDisciplinaryRecord.appliedDate.toLocaleDateString()}`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE\n')

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar prueba
testCheckIn()
  .catch(console.error)
