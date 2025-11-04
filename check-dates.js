const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDates() {
  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        employee: {
          user: {
            email: {
              contains: 'dgarcia'
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        date: true,
        checkInTime: true,
        checkOutTime: true,
        createdAt: true
      }
    })

    console.log('=== ULTIMOS 10 REGISTROS DE ASISTENCIA ===\n')

    if (attendances.length === 0) {
      console.log('No hay registros de asistencia.')
    } else {
      attendances.forEach((att, i) => {
        console.log(`${i+1}. ID: ${att.id.substring(0, 10)}...`)
        console.log(`   Campo 'date': ${att.date.toISOString()} (${att.date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})`)
        console.log(`   Check-in: ${att.checkInTime ? att.checkInTime.toISOString() + ' (' + att.checkInTime.toLocaleString('es-MX') + ')' : 'N/A'}`)
        console.log(`   Check-out: ${att.checkOutTime ? att.checkOutTime.toISOString() + ' (' + att.checkOutTime.toLocaleString('es-MX') + ')' : 'N/A'}`)
        console.log(`   Creado: ${att.createdAt.toISOString()} (${att.createdAt.toLocaleString('es-MX')})`)
        console.log('')
      })
    }

    console.log('\n=== FECHA/HORA ACTUAL ===')
    const now = new Date()
    console.log(`Hora del servidor: ${now.toISOString()} (${now.toLocaleString('es-MX')})`)
    console.log(`Fecha local: ${now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
  }
}

checkDates()
