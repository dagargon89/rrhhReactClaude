const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

prisma.employee.findMany({
  include: {user: true}
}).then(employees => {
  console.log(`\nEmpleados encontrados: ${employees.length}\n`);
  employees.forEach(emp => {
    console.log(`- ${emp.user.firstName} ${emp.user.lastName} (${emp.user.email})`);
  });
}).finally(() => prisma.$disconnect());
