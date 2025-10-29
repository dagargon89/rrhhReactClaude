const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserEmployee() {
  try {
    console.log('🔍 Checking User-Employee relationships...\n')

    // Get all users with their employee records
    const users = await prisma.user.findMany({
      include: {
        employee: {
          include: {
            defaultShift: true,
            department: true,
            position: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    users.forEach(user => {
      console.log(`\n📧 User: ${user.email}`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Staff: ${user.isStaff}, Superuser: ${user.isSuperuser}`)

      if (user.employee) {
        console.log(`   ✅ HAS EMPLOYEE RECORD`)
        console.log(`      Employee ID: ${user.employee.id}`)
        console.log(`      Employee Code: ${user.employee.employeeCode}`)
        console.log(`      Department: ${user.employee.department?.name || 'N/A'}`)
        console.log(`      Position: ${user.employee.position?.name || 'N/A'}`)
        console.log(`      Default Shift: ${user.employee.defaultShift?.name || 'N/A'} (${user.employee.defaultShift?.code || 'N/A'})`)
      } else {
        console.log(`   ❌ NO EMPLOYEE RECORD LINKED`)
      }
    })

    // Check for attendance records
    console.log('\n\n📊 Checking active attendance records...\n')

    const activeAttendances = await prisma.attendance.findMany({
      where: {
        checkInTime: { not: null },
        checkOutTime: null,
      },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        checkInTime: 'desc'
      },
      take: 10
    })

    if (activeAttendances.length === 0) {
      console.log('   No active attendance records found (no check-out)')
    } else {
      activeAttendances.forEach(att => {
        console.log(`\n   ✅ Active attendance:`)
        console.log(`      Employee: ${att.employee.user.firstName} ${att.employee.user.lastName}`)
        console.log(`      Email: ${att.employee.user.email}`)
        console.log(`      Employee ID: ${att.employeeId}`)
        console.log(`      Date: ${att.date.toISOString().split('T')[0]}`)
        console.log(`      Check-in: ${att.checkInTime?.toISOString()}`)
        console.log(`      Status: ${att.status}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserEmployee()
