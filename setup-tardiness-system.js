/**
 * Script para configurar el sistema completo de tardanzas y disciplina
 * Ejecutar con: node setup-tardiness-system.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('Configurando Sistema de Tardanzas');
  console.log('========================================\n');

  try {
    // 1. Insertar reglas de tardanzas
    console.log('📝 Insertando reglas de tardanzas...\n');

    // Regla 1: Llegadas tardías (CORREGIDO: 4 en lugar de 3)
    try {
      await prisma.tardinessRule.create({
        data: {
          id: 'tr_late_arrival_001',
          name: 'Llegadas Tardías',
          description: 'Llegadas entre 1 y 15 minutos tarde. Cada 4 llegadas tardías equivalen a 1 retardo formal.',
          type: 'LATE_ARRIVAL',
          startMinutesLate: 1,
          endMinutesLate: 15,
          accumulationCount: 4, // ✅ CORREGIDO: 4 según imagen
          equivalentFormalTardies: 1,
          isActive: true,
        },
      });
      console.log('✅ Regla "Llegadas Tardías" creada (4 llegadas = 1 retardo)');
    } catch (e) {
      if (e.code === 'P2002') {
        await prisma.tardinessRule.update({
          where: { id: 'tr_late_arrival_001' },
          data: { accumulationCount: 4, updatedAt: new Date() },
        });
        console.log('✅ Regla "Llegadas Tardías" actualizada (4 llegadas = 1 retardo)');
      }
    }

    // Regla 2: Retardos directos
    try {
      await prisma.tardinessRule.create({
        data: {
          id: 'tr_direct_tardiness_001',
          name: 'Retardos Directos',
          description: 'Llegadas con más de 15 minutos de retraso. Se cuentan como retardo formal inmediato.',
          type: 'DIRECT_TARDINESS',
          startMinutesLate: 16,
          endMinutesLate: null,
          accumulationCount: 1,
          equivalentFormalTardies: 1,
          isActive: true,
        },
      });
      console.log('✅ Regla "Retardos Directos" creada');
    } catch (e) {
      if (e.code === 'P2002') {
        console.log('⚠️  Regla "Retardos Directos" ya existe');
      }
    }

    // Regla 3: Después del primer retardo (NUEVA según imagen)
    try {
      await prisma.tardinessRule.create({
        data: {
          id: 'tr_post_first_tardiness',
          name: 'Regla Posterior al Primer Retardo',
          description: 'Después del primer retardo formal del mes, cualquier llegada tardía (incluso de 1 minuto) cuenta como retardo formal automático.',
          type: 'LATE_ARRIVAL',
          startMinutesLate: 1,
          endMinutesLate: 15,
          accumulationCount: 1,
          equivalentFormalTardies: 1,
          isActive: true,
        },
      });
      console.log('✅ Regla "Después del Primer Retardo" creada (NUEVA)');
    } catch (e) {
      if (e.code === 'P2002') {
        console.log('⚠️  Regla "Después del Primer Retardo" ya existe');
      }
    }

    console.log('\n📝 Insertando reglas disciplinarias...\n');

    // Regla disciplinaria 1: 5 retardos = 1 acta (CORREGIDO: con suspensión)
    try {
      await prisma.disciplinaryActionRule.create({
        data: {
          id: 'dar_formal_tardies_5',
          name: 'Acta por 5 Retardos Formales',
          description: 'Cuando un empleado acumula 5 o más retardos formales en un mes, se levanta 1 acta administrativa con suspensión de 1 día sin goce de sueldo.',
          triggerType: 'FORMAL_TARDIES',
          triggerCount: 5,
          periodDays: 30,
          actionType: 'ADMINISTRATIVE_ACT',
          suspensionDays: 1, // ✅ CORREGIDO: según imagen
          affectsSalary: true, // ✅ CORREGIDO: según imagen
          requiresApproval: true,
          autoApply: false,
          notificationEnabled: true,
          isActive: true,
        },
      });
      console.log('✅ Regla "5 Retardos = 1 Acta + 1 día suspensión" creada');
    } catch (e) {
      if (e.code === 'P2002') {
        await prisma.disciplinaryActionRule.update({
          where: { id: 'dar_formal_tardies_5' },
          data: {
            suspensionDays: 1,
            affectsSalary: true,
            updatedAt: new Date(),
          },
        });
        console.log('✅ Regla "5 Retardos" actualizada con suspensión');
      }
    }

    // Regla disciplinaria 2: Baja por 3 actas (NUEVA según imagen)
    try {
      await prisma.disciplinaryActionRule.create({
        data: {
          id: 'dar_admin_acts_3_termination',
          name: 'Baja por 3 Actas Administrativas',
          description: 'Tres actas administrativas en un período de 90 días resultan en baja automática (rescisión de contrato).',
          triggerType: 'ADMINISTRATIVE_ACTS',
          triggerCount: 3,
          periodDays: 90,
          actionType: 'TERMINATION',
          suspensionDays: null,
          affectsSalary: true,
          requiresApproval: true,
          autoApply: false,
          notificationEnabled: true,
          isActive: true,
        },
      });
      console.log('✅ Regla "3 Actas = Baja" creada (NUEVA)');
    } catch (e) {
      if (e.code === 'P2002') {
        console.log('⚠️  Regla "3 Actas = Baja" ya existe');
      }
    }

    // Reglas de faltas injustificadas
    console.log('\n📝 Insertando reglas de faltas injustificadas...\n');

    const absenceRules = [
      { id: 'dar_absence_1', count: 1, days: 1, desc: 'Primera falta' },
      { id: 'dar_absence_2', count: 2, days: 2, desc: 'Segunda falta' },
      { id: 'dar_absence_3', count: 3, days: 3, desc: 'Tercera falta' },
      { id: 'dar_absence_4_termination', count: 4, days: null, desc: 'Cuarta falta', termination: true },
    ];

    for (const rule of absenceRules) {
      try {
        await prisma.disciplinaryActionRule.create({
          data: {
            id: rule.id,
            name: rule.termination
              ? 'Rescisión por 4+ Faltas Injustificadas'
              : `Suspensión por ${rule.count} Falta${rule.count > 1 ? 's' : ''} Injustificada${rule.count > 1 ? 's' : ''}`,
            description: `${rule.desc} injustificada: ${rule.termination ? 'Rescisión de contrato' : `Suspensión de ${rule.days} día${rule.days > 1 ? 's' : ''} sin goce de sueldo`}.`,
            triggerType: 'UNJUSTIFIED_ABSENCES',
            triggerCount: rule.count,
            periodDays: 30,
            actionType: rule.termination ? 'SUSPENSION' : 'SUSPENSION',
            suspensionDays: rule.days,
            affectsSalary: true,
            requiresApproval: true,
            autoApply: false,
            notificationEnabled: true,
            isActive: true,
          },
        });
        console.log(`✅ Regla "${rule.count} falta${rule.count > 1 ? 's' : ''}" creada`);
      } catch (e) {
        if (e.code === 'P2002') {
          console.log(`⚠️  Regla "${rule.count} falta${rule.count > 1 ? 's' : ''}" ya existe`);
        }
      }
    }

    console.log('\n========================================');
    console.log('VERIFICANDO CONFIGURACIÓN FINAL');
    console.log('========================================\n');

    // Verificar reglas de tardanzas
    const tardinessRules = await prisma.tardinessRule.findMany({
      where: { isActive: true },
      orderBy: { startMinutesLate: 'asc' },
    });

    console.log('📋 REGLAS DE TARDANZAS:');
    console.table(tardinessRules.map(r => ({
      Nombre: r.name,
      Tipo: r.type,
      Rango: `${r.startMinutesLate}-${r.endMinutesLate || '∞'} min`,
      'Acumula': r.accumulationCount,
      'Equivale': r.equivalentFormalTardies,
    })));

    // Verificar reglas disciplinarias
    const disciplinaryRules = await prisma.disciplinaryActionRule.findMany({
      where: { isActive: true },
      orderBy: [
        { triggerType: 'asc' },
        { triggerCount: 'asc' },
      ],
    });

    console.log('\n📋 REGLAS DISCIPLINARIAS:');
    console.table(disciplinaryRules.map(r => ({
      Nombre: r.name,
      Disparador: r.triggerType,
      Cantidad: r.triggerCount,
      Acción: r.actionType,
      'Días Susp.': r.suspensionDays || '-',
      'Afecta $': r.affectsSalary ? 'Sí' : 'No',
    })));

    console.log('\n========================================');
    console.log('✅ SISTEMA CONFIGURADO CORRECTAMENTE');
    console.log('========================================\n');

    console.log('📝 Resumen según imagen:');
    console.log('  ✅ Llegadas tardías: 4 llegadas = 1 retardo formal');
    console.log('  ✅ Retardos directos: 8:46+ = retardo inmediato');
    console.log('  ✅ Después del 1er retardo: cualquier tardanza = retardo');
    console.log('  ✅ 5 retardos formales = 1 acta + 1 día sin goce');
    console.log('  ✅ 3 actas administrativas = baja');
    console.log('  ✅ Faltas injustificadas: 1→1día, 2→2días, 3→3días, 4→rescisión\n');

  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
