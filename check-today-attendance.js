const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTodayAttendance() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const attendances = await prisma.attendance.findMany({
      where: {
        employee: {
          user: {
            email: {
              contains: 'dgarcia'
            }
          }
        },
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        checkInTime: true,
        checkOutTime: true,
        isAutoCheckout: true,
        checkInMethod: true,
        checkOutMethod: true,
        workedHours: true,
      }
    })

    console.log('Registros de asistencia de hoy:', attendances.length)

    if (attendances.length === 0) {
      console.log('\nNo hay registros de asistencia para hoy.')
      console.log('Esto explica por que el auto-checkout no se ejecuto:')
      console.log('  - No hubo check-in registrado hoy')
      console.log('  - O ya se hizo check-out de todos los check-ins')
    } else {
      attendances.forEach((att, i) => {
        console.log(`\n=== Registro ${i + 1} ===`)
        console.log('  Check-in:', att.checkInTime?.toLocaleTimeString('es-MX') || 'N/A')
        console.log('  Check-out:', att.checkOutTime?.toLocaleTimeString('es-MX') || 'N/A')
        console.log('  Auto-checkout:', att.isAutoCheckout ? 'SI' : 'NO')
        console.log('  Metodo entrada:', att.checkInMethod)
        console.log('  Metodo salida:', att.checkOutMethod || 'N/A')
        console.log('  Horas trabajadas:', att.workedHours || 'N/A')
      })
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
  }
}

checkTodayAttendance()
