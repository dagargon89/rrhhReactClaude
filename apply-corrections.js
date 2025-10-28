/**
 * Script para aplicar correcciones de reglas de incidencias
 * Ejecutar con: node apply-corrections.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('Aplicando Correcciones de Reglas');
  console.log('========================================\n');

  try {
    // CORRECCIÓN #1: Cambiar 3 a 4 llegadas tardías
    console.log('1. Corrigiendo acumulación de llegadas tardías (3 → 4)...');
    const update1 = await prisma.$executeRaw`
      UPDATE tardiness_rules
      SET
        accumulation_count = 4,
        description = 'Llegadas entre 1 y 15 minutos tarde. Cada 4 llegadas tardías equivalen a 1 retardo formal.',
        updated_at = NOW()
      WHERE id = 'tr_late_arrival_001'
    `;
    console.log(`✅ Actualizado: ${update1} registro(s)\n`);

    // CORRECCIÓN #3: Agregar regla de primer retardo
    console.log('2. Agregando regla de "Después del Primer Retardo"...');
    try {
      await prisma.$executeRaw`
        INSERT INTO tardiness_rules (
          id, name, description, type,
          start_minutes_late, end_minutes_late,
          accumulation_count, equivalent_formal_tardies,
          is_active, created_at, updated_at
        ) VALUES (
          'tr_post_first_tardiness',
          'Regla Posterior al Primer Retardo',
          'Después del primer retardo formal del mes, cualquier llegada tardía (incluso de 1 minuto) cuenta como retardo formal automático.',
          'LATE_ARRIVAL',
          1,
          15,
          1,
          1,
          true,
          NOW(),
          NOW()
        )
      `;
      console.log('✅ Regla agregada\n');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️  La regla ya existe, actualizando...');
        await prisma.$executeRaw`
          UPDATE tardiness_rules
          SET updated_at = NOW()
          WHERE id = 'tr_post_first_tardiness'
        `;
        console.log('✅ Regla actualizada\n');
      } else {
        throw error;
      }
    }

    // CORRECCIÓN #4: Agregar suspensión a actas administrativas
    console.log('3. Agregando suspensión a actas administrativas...');
    const update4 = await prisma.$executeRaw`
      UPDATE disciplinary_action_rules
      SET
        suspension_days = 1,
        affects_salary = true,
        description = 'Cuando un empleado acumula 5 o más retardos formales en un mes, se levanta 1 acta administrativa con suspensión de 1 día sin goce de sueldo.',
        updated_at = NOW()
      WHERE id = 'dar_formal_tardies_5'
    `;
    console.log(`✅ Actualizado: ${update4} registro(s)\n`);

    // CORRECCIÓN #5: Agregar regla de baja por 3 actas
    console.log('4. Agregando regla de baja por 3 actas administrativas...');
    try {
      await prisma.$executeRaw`
        INSERT INTO disciplinary_action_rules (
          id, name, description, trigger_type, trigger_count,
          period_days, action_type, suspension_days, affects_salary,
          requires_approval, auto_apply, notification_enabled,
          is_active, created_at, updated_at
        ) VALUES (
          'dar_admin_acts_3_termination',
          'Baja por 3 Actas Administrativas',
          'Tres actas administrativas en un período de 90 días resultan en baja automática (rescisión de contrato).',
          'ADMINISTRATIVE_ACTS',
          3,
          90,
          'TERMINATION',
          NULL,
          true,
          true,
          false,
          true,
          true,
          NOW(),
          NOW()
        )
      `;
      console.log('✅ Regla agregada\n');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️  La regla ya existe, actualizando...');
        await prisma.$executeRaw`
          UPDATE disciplinary_action_rules
          SET updated_at = NOW()
          WHERE id = 'dar_admin_acts_3_termination'
        `;
        console.log('✅ Regla actualizada\n');
      } else {
        throw error;
      }
    }

    console.log('========================================');
    console.log('VERIFICANDO CAMBIOS');
    console.log('========================================\n');

    // Verificar reglas de tardanzas
    console.log('📋 REGLAS DE TARDANZAS:');
    const tardinessRules = await prisma.$queryRaw`
      SELECT
        id,
        name,
        type,
        start_minutes_late,
        end_minutes_late,
        accumulation_count,
        equivalent_formal_tardies
      FROM tardiness_rules
      WHERE is_active = true
      ORDER BY start_minutes_late
    `;
    console.table(tardinessRules);

    // Verificar reglas disciplinarias
    console.log('\n📋 REGLAS DISCIPLINARIAS:');
    const disciplinaryRules = await prisma.$queryRaw`
      SELECT
        id,
        name,
        trigger_type,
        trigger_count,
        action_type,
        suspension_days,
        affects_salary
      FROM disciplinary_action_rules
      WHERE is_active = true
      ORDER BY
        CASE trigger_type
          WHEN 'FORMAL_TARDIES' THEN 1
          WHEN 'ADMINISTRATIVE_ACTS' THEN 2
          WHEN 'UNJUSTIFIED_ABSENCES' THEN 3
          ELSE 4
        END,
        trigger_count
    `;
    console.table(disciplinaryRules);

    console.log('\n========================================');
    console.log('✅ CORRECCIONES APLICADAS EXITOSAMENTE');
    console.log('========================================\n');

    console.log('📝 Resumen de cambios aplicados:');
    console.log('  ✅ Llegadas tardías: 3 → 4');
    console.log('  ✅ Nueva regla: "Después del primer retardo"');
    console.log('  ✅ Actas administrativas: +1 día suspensión sin goce');
    console.log('  ✅ Nueva regla: Baja por 3 actas\n');

  } catch (error) {
    console.error('\n❌ ERROR al aplicar correcciones:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
