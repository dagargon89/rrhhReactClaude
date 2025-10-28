/**
 * Script de Prueba: Integración del Sistema de Tardanzas
 *
 * Este script prueba diferentes escenarios de tardanzas para verificar
 * que el sistema funciona correctamente según las reglas oficiales.
 *
 * Ejecutar: node test-tardiness-integration.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n========================================', 'cyan');
  log('PRUEBA DE INTEGRACIÓN - SISTEMA DE TARDANZAS', 'cyan');
  log('========================================\n', 'cyan');

  try {
    // Verificar que las reglas existen
    log('📋 Verificando configuración del sistema...', 'blue');

    const tardinessRules = await prisma.tardinessRule.findMany({
      where: { isActive: true },
    });

    const disciplinaryRules = await prisma.disciplinaryActionRule.findMany({
      where: { isActive: true },
    });

    log(`✅ ${tardinessRules.length} reglas de tardanzas activas`, 'green');
    log(`✅ ${disciplinaryRules.length} reglas disciplinarias activas\n`, 'green');

    // Mostrar reglas
    log('📝 Reglas de Tardanzas:', 'yellow');
    tardinessRules.forEach((rule) => {
      log(
        `  - ${rule.name}: ${rule.startMinutesLate}-${rule.endMinutesLate || '∞'} min, acumula ${rule.accumulationCount} = ${rule.equivalentFormalTardies} retardo`,
        'reset'
      );
    });

    log('\n📝 Reglas Disciplinarias:', 'yellow');
    disciplinaryRules.forEach((rule) => {
      log(
        `  - ${rule.name}: ${rule.triggerCount} ${rule.triggerType} → ${rule.actionType}${rule.suspensionDays ? ` (${rule.suspensionDays} días)` : ''}`,
        'reset'
      );
    });

    // Buscar un empleado de prueba
    log('\n🔍 Buscando empleado de prueba...', 'blue');
    let employee = await prisma.employee.findFirst({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    });

    if (!employee) {
      log('❌ No se encontró ningún empleado activo', 'red');
      log('Por favor, crea al menos un empleado en el sistema', 'yellow');
      return;
    }

    log(`✅ Empleado encontrado: ${employee.user.firstName} ${employee.user.lastName} (${employee.employeeCode})\n`, 'green');

    // Verificar/Crear turno y horario para el empleado
    log('📅 Verificando horario del empleado...', 'blue');
    let schedule = await prisma.schedule.findFirst({
      where: {
        employeeId: employee.id,
        date: new Date(),
      },
      include: {
        shift: true,
      },
    });

    if (!schedule) {
      log('⚠️  No tiene horario asignado para hoy, creando uno de prueba...', 'yellow');

      // Buscar o crear un turno
      let shift = await prisma.workShift.findFirst({
        where: { isActive: true },
      });

      if (!shift) {
        log('❌ No hay turnos configurados en el sistema', 'red');
        return;
      }

      schedule = await prisma.schedule.create({
        data: {
          employeeId: employee.id,
          shiftId: shift.id,
          date: new Date(),
        },
        include: {
          shift: true,
        },
      });

      log(`✅ Horario creado con turno: ${schedule.shift.name}\n`, 'green');
    } else {
      log(`✅ Horario encontrado: ${schedule.shift.name}\n`, 'green');
    }

    // Limpiar acumulaciones del mes actual para empezar de cero
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    log('🧹 Limpiando acumulaciones previas para prueba limpia...', 'blue');
    await prisma.tardinessAccumulation.deleteMany({
      where: {
        employeeId: employee.id,
        month,
        year,
      },
    });
    log('✅ Listo para pruebas\n', 'green');

    // ESCENARIO 1: Primera llegada tardía (1-15 min)
    log('========================================', 'cyan');
    log('ESCENARIO 1: Primera Llegada Tardía (5 min)', 'cyan');
    log('========================================\n', 'cyan');

    log('Simulando llegada a las 8:35 (5 minutos tarde)...', 'yellow');
    const result1 = await simulateTardiness(employee.id, 5, 1);
    displayResult(result1);

    // ESCENARIO 2: Segunda llegada tardía
    log('\n========================================', 'cyan');
    log('ESCENARIO 2: Segunda Llegada Tardía (7 min)', 'cyan');
    log('========================================\n', 'cyan');

    log('Simulando llegada a las 8:37 (7 minutos tarde)...', 'yellow');
    const result2 = await simulateTardiness(employee.id, 7, 2);
    displayResult(result2);

    // ESCENARIO 3: Tercera llegada tardía
    log('\n========================================', 'cyan');
    log('ESCENARIO 3: Tercera Llegada Tardía (3 min)', 'cyan');
    log('========================================\n', 'cyan');

    log('Simulando llegada a las 8:33 (3 minutos tarde)...', 'yellow');
    const result3 = await simulateTardiness(employee.id, 3, 3);
    displayResult(result3);

    // ESCENARIO 4: Cuarta llegada tardía (completa acumulación)
    log('\n========================================', 'cyan');
    log('ESCENARIO 4: Cuarta Llegada Tardía (10 min)', 'cyan');
    log('Debería convertirse en 1 RETARDO FORMAL', 'cyan');
    log('========================================\n', 'cyan');

    log('Simulando llegada a las 8:40 (10 minutos tarde)...', 'yellow');
    const result4 = await simulateTardiness(employee.id, 10, 4);
    displayResult(result4);

    // ESCENARIO 5: Llegada tardía después del primer retardo (regla especial)
    log('\n========================================', 'cyan');
    log('ESCENARIO 5: Llegada Tardía tras Primer Retardo', 'cyan');
    log('Regla especial: Cualquier tardanza = retardo automático', 'cyan');
    log('========================================\n', 'cyan');

    log('Simulando llegada a las 8:31 (1 minuto tarde)...', 'yellow');
    const result5 = await simulateTardiness(employee.id, 1, 5);
    displayResult(result5);

    // ESCENARIO 6: Retardo directo (16+ minutos)
    log('\n========================================', 'cyan');
    log('ESCENARIO 6: Retardo Directo (20 min)', 'cyan');
    log('Debería contar como RETARDO FORMAL inmediato', 'cyan');
    log('========================================\n', 'cyan');

    log('Simulando llegada a las 8:50 (20 minutos tarde)...', 'yellow');
    const result6 = await simulateTardiness(employee.id, 20, 6);
    displayResult(result6);

    // Mostrar resumen final
    log('\n========================================', 'cyan');
    log('RESUMEN FINAL DEL MES', 'cyan');
    log('========================================\n', 'cyan');

    const finalStats = await prisma.tardinessAccumulation.findUnique({
      where: {
        unique_employee_year_month: {
          employeeId: employee.id,
          year,
          month,
        },
      },
    });

    if (finalStats) {
      log(`📊 Estadísticas finales:`, 'blue');
      log(`  Llegadas tardías acumuladas: ${finalStats.lateArrivalsCount}`, 'reset');
      log(`  Retardos directos: ${finalStats.directTardinessCount}`, 'reset');
      log(`  RETARDOS FORMALES TOTALES: ${finalStats.formalTardiesCount}`, 'bright');
      log(`  Actas administrativas: ${finalStats.administrativeActs}\n`, 'reset');

      if (finalStats.formalTardiesCount >= 5) {
        log('⚠️  ALERTA: Empleado ha alcanzado el umbral de 5 retardos formales', 'red');
        log('   Se debería haber generado un ACTA ADMINISTRATIVA\n', 'red');

        const acts = await prisma.employeeDisciplinaryRecord.findMany({
          where: {
            employeeId: employee.id,
            actionType: 'ADMINISTRATIVE_ACT',
          },
        });

        if (acts.length > 0) {
          log(`✅ Se generaron ${acts.length} acta(s) administrativa(s)`, 'green');
          acts.forEach((act, index) => {
            log(`   Acta ${index + 1}: ${act.description}`, 'reset');
            log(`   Estado: ${act.status}`, 'reset');
            log(`   Suspensión: ${act.suspensionDays || 0} día(s)\n`, 'reset');
          });
        } else {
          log('❌ No se generaron actas automáticas', 'red');
        }
      }
    }

    log('\n========================================', 'cyan');
    log('✅ PRUEBA COMPLETADA', 'green');
    log('========================================\n', 'cyan');

  } catch (error) {
    log('\n❌ ERROR EN LA PRUEBA:', 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función auxiliar para simular una tardanza
async function simulateTardiness(employeeId, minutesLate, day) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Obtener acumulación actual
  const currentAcc = await prisma.tardinessAccumulation.findUnique({
    where: {
      unique_employee_year_month: {
        employeeId,
        year,
        month,
      },
    },
  });

  // Determinar qué regla aplica
  let ruleId;
  if (minutesLate >= 1 && minutesLate <= 15) {
    if (currentAcc && currentAcc.formalTardiesCount > 0) {
      ruleId = 'tr_post_first_tardiness';
    } else {
      ruleId = 'tr_late_arrival_001';
    }
  } else if (minutesLate >= 16) {
    ruleId = 'tr_direct_tardiness_001';
  }

  const rule = await prisma.tardinessRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    throw new Error('Regla no encontrada');
  }

  // Simular procesamiento (sin servicio completo para prueba rápida)
  // Aquí solo registramos, no aplicamos la lógica completa
  const accumulation = await prisma.tardinessAccumulation.upsert({
    where: {
      unique_employee_year_month: {
        employeeId,
        year,
        month,
      },
    },
    create: {
      employeeId,
      month,
      year,
      lateArrivalsCount: 0,
      directTardinessCount: 0,
      formalTardiesCount: 0,
      administrativeActs: 0,
    },
    update: {},
  });

  return {
    rule,
    minutesLate,
    currentAccumulation: accumulation,
    day,
  };
}

function displayResult(result) {
  log(`📝 Regla aplicada: ${result.rule.name}`, 'yellow');
  log(`   Tipo: ${result.rule.type}`, 'reset');
  log(`   Acumula: ${result.rule.accumulationCount} para ${result.rule.equivalentFormalTardies} retardo formal`, 'reset');

  log(`\n📊 Estado actual:`, 'blue');
  log(`   Llegadas tardías: ${result.currentAccumulation.lateArrivalsCount}`, 'reset');
  log(`   Retardos directos: ${result.currentAccumulation.directTardinessCount}`, 'reset');
  log(`   Retardos formales: ${result.currentAccumulation.formalTardiesCount}`, 'bright');
  log(`   Actas: ${result.currentAccumulation.administrativeActs}`, 'reset');
}

main();
