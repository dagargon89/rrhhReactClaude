# 🔧 Correcciones Necesarias - Reglas de Incidencias

**Fecha:** 2025-10-28
**Referencia:** image.png - Reglas oficiales del sistema

---

## 📋 Resumen de Discrepancias

Se encontraron **5 discrepancias críticas** entre las reglas oficiales (imagen.png) y el sistema implementado.

---

## ❌ DISCREPANCIA #1: Acumulación de Llegadas Tardías

### Regla Oficial (Imagen)
```
Llegadas tardías (8:31-8:45)
Cada 4 llegadas tardías equivalen a 1 retardo formal.
```

### Regla Actual (BD)
```sql
-- Línea 173 del SQL
`accumulation_count` = 3  -- ❌ INCORRECTO
```

### ✅ Corrección Necesaria
```sql
UPDATE `tardiness_rules`
SET
  `accumulation_count` = 4,
  `description` = 'Llegadas entre 1 y 15 minutos tarde. Cada 4 llegadas tardías equivalen a 1 retardo formal.',
  `updated_at` = NOW()
WHERE `id` = 'tr_late_arrival_001';
```

---

## ⚠️ DISCREPANCIA #2: Rango de Retardos Directos

### Regla Oficial (Imagen)
```
"Ret. formales" - Retardos directos (8:46-11:59)
Se cuentan como retardos formales inmediatos.
```

### Regla Actual (BD)
```sql
`start_minutes_late` = 16,  -- 8:46 ✅
`end_minutes_late` = NULL,  -- ⚠️ Sin límite superior
```

### 🤔 Análisis
La imagen muestra un límite superior de 11:59, lo que sugiere que después de ese horario podría considerarse **falta injustificada** en lugar de retardo.

### ✅ Corrección Sugerida (Opción 1)
Si después de 11:59 es falta injustificada:
```sql
UPDATE `tardiness_rules`
SET
  `end_minutes_late` = 210,  -- 3h 30min = 11:59 desde 8:30
  `description` = 'Llegadas entre 16 minutos (8:46) y 3.5 horas (11:59). Se cuentan como retardo formal inmediato. Después de las 12:00 es falta injustificada.',
  `updated_at` = NOW()
WHERE `id` = 'tr_direct_tardiness_001';
```

### ✅ Corrección Alternativa (Opción 2)
Si el límite solo es informativo:
```sql
-- No hacer cambios, mantener NULL para cualquier retardo después de 8:46
```

---

## ❌ DISCREPANCIA #3: Regla de Primer Retardo

### Regla Oficial (Imagen)
```
* después del primer retardo cada entrada tardía se tomará como retardo automático
```

### Regla Actual (BD)
```
❌ Esta regla NO existe en el sistema
```

### ✅ Corrección Necesaria

#### Paso 1: Agregar nueva regla en la tabla
```sql
INSERT INTO `tardiness_rules` (
  `id`, `name`, `description`, `type`,
  `start_minutes_late`, `end_minutes_late`,
  `accumulation_count`, `equivalent_formal_tardies`,
  `is_active`, `created_at`, `updated_at`
) VALUES (
  'tr_post_first_tardiness',
  'Regla Posterior al Primer Retardo',
  'Después del primer retardo formal del mes, cualquier llegada tardía (incluso de 1 minuto) cuenta como retardo formal automático.',
  'LATE_ARRIVAL',
  1,   -- Desde 1 minuto (8:31)
  15,  -- Hasta 15 minutos (8:45)
  1,   -- Cada uno cuenta
  1,   -- Equivale a 1 retardo formal
  true,
  NOW(),
  NOW()
);
```

#### Paso 2: Modificar lógica del servicio
```typescript
// En src/services/tardinessService.ts

async function processTardiness(
  employeeId: string,
  minutesLate: number,
  month: number,
  year: number
) {
  // Obtener acumulación del mes
  const accumulation = await getAccumulation(employeeId, month, year);

  // ⚠️ NUEVA LÓGICA: Si ya tiene retardos formales, aplicar regla especial
  if (accumulation.formal_tardies_count > 0) {
    // Después del primer retardo, cualquier llegada tardía = retardo formal
    if (minutesLate >= 1 && minutesLate <= 15) {
      // Usar regla 'tr_post_first_tardiness'
      return applyRule('tr_post_first_tardiness', employeeId, minutesLate);
    }
  } else {
    // Primera vez en el mes, usar regla normal
    if (minutesLate >= 1 && minutesLate <= 15) {
      // Usar regla 'tr_late_arrival_001' (4 llegadas = 1 retardo)
      return applyRule('tr_late_arrival_001', employeeId, minutesLate);
    }
  }

  // Retardos directos (8:46+)
  if (minutesLate >= 16) {
    return applyRule('tr_direct_tardiness_001', employeeId, minutesLate);
  }
}
```

---

## ❌ DISCREPANCIA #4: Suspensión por Acta Administrativa

### Regla Oficial (Imagen)
```
"Actas" - Actas Administrativas
* por acta administrativa es 1 día sin goce
```

### Regla Actual (BD)
```sql
-- Línea 209-230
`action_type` = 'ADMINISTRATIVE_ACT',
`suspension_days` = NULL,  -- ❌ INCORRECTO
`affects_salary` = false    -- ❌ INCORRECTO
```

### ✅ Corrección Necesaria
```sql
UPDATE `disciplinary_action_rules`
SET
  `suspension_days` = 1,
  `affects_salary` = true,
  `description` = 'Cuando un empleado acumula 5 o más retardos formales en un mes, se levanta 1 acta administrativa con suspensión de 1 día sin goce de sueldo.',
  `updated_at` = NOW()
WHERE `id` = 'dar_formal_tardies_5';
```

---

## ❌ DISCREPANCIA #5: Baja Automática por 3 Actas

### Regla Oficial (Imagen)
```
* 3 actas administrativas es baja automática
```

### Regla Actual (BD)
```
❌ Esta regla NO existe en el sistema
```

### ✅ Corrección Necesaria
```sql
INSERT INTO `disciplinary_action_rules` (
  `id`, `name`, `description`, `trigger_type`, `trigger_count`,
  `period_days`, `action_type`, `suspension_days`, `affects_salary`,
  `requires_approval`, `auto_apply`, `notification_enabled`,
  `is_active`, `created_at`, `updated_at`
) VALUES (
  'dar_admin_acts_3_termination',
  'Baja por 3 Actas Administrativas',
  'Tres actas administrativas en un período determinado resultan en baja automática (rescisión de contrato).',
  'ADMINISTRATIVE_ACTS',
  3,
  90,  -- Período de 90 días (ajustable según política)
  'TERMINATION',
  NULL,
  true,
  true,  -- Requiere aprobación (nunca automático para rescisiones)
  false, -- NO automático
  true,
  true,
  NOW(),
  NOW()
);
```

---

## ✅ REGLAS QUE SÍ ESTÁN CORRECTAS

### Faltas Injustificadas
Las siguientes reglas **coinciden perfectamente** con la imagen:

| Faltas | Sanción | Estado |
|--------|---------|--------|
| 1 falta | Suspensión de 1 día sin goce | ✅ CORRECTO |
| 2 faltas | Suspensión de 2 días | ✅ CORRECTO |
| 3 faltas | Suspensión de 3 días | ✅ CORRECTO |
| 4+ faltas (en 30 días) | Rescisión de contrato | ✅ CORRECTO |

---

## 📝 SCRIPT COMPLETO DE CORRECCIÓN

### Archivo: `fix-incidencias-rules.sql`

```sql
-- =========================================================
-- Script de Corrección de Reglas de Incidencias
-- Fecha: 2025-10-28
-- Referencia: image.png
-- =========================================================

USE hrms_db;

-- Corrección #1: Cambiar 3 a 4 llegadas tardías
UPDATE `tardiness_rules`
SET
  `accumulation_count` = 4,
  `description` = 'Llegadas entre 1 y 15 minutos tarde. Cada 4 llegadas tardías equivalen a 1 retardo formal.',
  `updated_at` = NOW()
WHERE `id` = 'tr_late_arrival_001';

-- Corrección #2: (Opcional) Agregar límite superior a retardos directos
-- Descomentar si después de 11:59 debe ser falta injustificada
-- UPDATE `tardiness_rules`
-- SET
--   `end_minutes_late` = 210,
--   `description` = 'Llegadas entre 16 minutos (8:46) y 3.5 horas (11:59). Se cuentan como retardo formal inmediato.',
--   `updated_at` = NOW()
-- WHERE `id` = 'tr_direct_tardiness_001';

-- Corrección #3: Agregar regla de primer retardo
INSERT INTO `tardiness_rules` (
  `id`, `name`, `description`, `type`,
  `start_minutes_late`, `end_minutes_late`,
  `accumulation_count`, `equivalent_formal_tardies`,
  `is_active`, `created_at`, `updated_at`
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
) ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- Corrección #4: Agregar suspensión a actas administrativas
UPDATE `disciplinary_action_rules`
SET
  `suspension_days` = 1,
  `affects_salary` = true,
  `description` = 'Cuando un empleado acumula 5 o más retardos formales en un mes, se levanta 1 acta administrativa con suspensión de 1 día sin goce de sueldo.',
  `updated_at` = NOW()
WHERE `id` = 'dar_formal_tardies_5';

-- Corrección #5: Agregar regla de baja por 3 actas
INSERT INTO `disciplinary_action_rules` (
  `id`, `name`, `description`, `trigger_type`, `trigger_count`,
  `period_days`, `action_type`, `suspension_days`, `affects_salary`,
  `requires_approval`, `auto_apply`, `notification_enabled`,
  `is_active`, `created_at`, `updated_at`
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
) ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- Verificar cambios
SELECT * FROM `tardiness_rules` WHERE `is_active` = true ORDER BY `start_minutes_late`;
SELECT * FROM `disciplinary_action_rules` WHERE `is_active` = true ORDER BY `trigger_count`;

-- =========================================================
-- FIN DEL SCRIPT
-- =========================================================
```

---

## 🚀 PASOS PARA APLICAR LAS CORRECCIONES

### Opción 1: Ejecutar SQL directamente
```bash
# En MySQL
mysql -u root -p hrms_db < fix-incidencias-rules.sql
```

### Opción 2: Desde phpMyAdmin
1. Abrir phpMyAdmin
2. Seleccionar base de datos `hrms_db`
3. Ir a pestaña "SQL"
4. Copiar y pegar el script completo
5. Hacer clic en "Continuar"

### Opción 3: Con Prisma
```bash
# Opción NO recomendada porque Prisma no maneja bien los UPDATE de datos
# Es mejor usar SQL directo para modificar datos existentes
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Ejecutar script `fix-incidencias-rules.sql`
- [ ] Verificar que `accumulation_count` cambió de 3 a 4
- [ ] Verificar que nueva regla `tr_post_first_tardiness` existe
- [ ] Verificar que actas administrativas tienen `suspension_days = 1`
- [ ] Verificar que existe regla de baja por 3 actas

### Código Backend
- [ ] Modificar `src/services/tardinessService.ts`
- [ ] Implementar lógica de "primer retardo del mes"
- [ ] Agregar función `getAccumulation(employeeId, month, year)`
- [ ] Agregar lógica para alternar entre reglas según historial

### Integración
- [ ] Modificar `/api/attendance/checkin` para llamar servicio de tardanzas
- [ ] Agregar cálculo de minutos tarde basado en horario del turno
- [ ] Implementar llamada a `processTardiness()` después de check-in
- [ ] Agregar manejo de errores y logs

### Testing
- [ ] Probar escenario: 4 llegadas tardías = 1 retardo formal
- [ ] Probar escenario: Después del primer retardo, llegada tardía = retardo directo
- [ ] Probar escenario: 5 retardos formales = 1 acta con 1 día suspensión
- [ ] Probar escenario: 3 actas = propuesta de baja

### Validación con Usuario
- [ ] Confirmar que límite de retardos directos debe ser 11:59 o sin límite
- [ ] Confirmar período de días para contar las 3 actas (90 días actual)
- [ ] Confirmar si "baja automática" debe ser realmente automática o requiere aprobación

---

## ⚠️ NOTAS IMPORTANTES

### 1. Lógica Compleja: "Después del Primer Retardo"
Esta regla requiere **lógica condicional en el backend** y no puede resolverse solo con configuración de BD.

**Flujo propuesto:**
```
Check-in → Calcular minutos tarde →
→ Consultar acumulación del mes →
→ SI tiene retardos formales previos:
    → Aplicar regla estricta (1 minuto = 1 retardo)
→ SI NO tiene retardos:
    → Aplicar regla normal (4 llegadas = 1 retardo)
```

### 2. Periodo de Conteo de Actas
La imagen no especifica el período para contar las 3 actas. Se asumió **90 días** (3 meses), pero esto debe confirmarse con el usuario.

### 3. Baja "Automática"
Aunque la imagen dice "baja automática", por seguridad jurídica **NO debe ser realmente automática**. Debe:
- Crear un registro en estado `PENDING`
- Notificar a RRHH
- Requerir aprobación de un supervisor

### 4. Límite de Retardos Directos
La imagen muestra "8:46-11:59" pero no especifica qué pasa después de las 12:00. Opciones:
- **Opción A:** Después de 12:00 = Falta injustificada
- **Opción B:** Cualquier hora después de 8:46 = Retardo directo

**Acción requerida:** Confirmar con el usuario.

---

## 📞 PREGUNTAS PARA EL USUARIO

1. **¿Qué sucede si alguien llega después de las 12:00 (11:59)?**
   - ¿Es retardo directo?
   - ¿Es falta injustificada?
   - ¿Es media falta?

2. **¿En qué período se cuentan las 3 actas administrativas?**
   - ¿30 días?
   - ¿90 días?
   - ¿Todo el año?

3. **¿La "baja automática" debe ser realmente automática?**
   - ¿O debe generar alerta para que RRHH revise y apruebe?

4. **¿Las llegadas tardías y retardos se resetean cada mes?**
   - La lógica actual asume que sí
   - Confirmar que es correcto

---

**Fin del documento**
