# Sistema de Tardanzas y Disciplina

## Descripción General

Este sistema permite configurar y automatizar el control de llegadas tardías, retardos formales, actas administrativas y sanciones progresivas según las políticas de la empresa.

## 📊 Tablas Creadas

### 1. `tardiness_rules` - Reglas de Tardanzas

Configura los rangos de tiempo y conversiones para tardanzas.

**Campos principales:**
- `name`: Nombre de la regla
- `type`: LATE_ARRIVAL (llegada tardía) o DIRECT_TARDINESS (retardo directo)
- `start_minutes_late`: Minutos de inicio del rango (ej: 1 = 8:31)
- `end_minutes_late`: Minutos de fin del rango (ej: 15 = 8:45)
- `accumulation_count`: Cuántas veces debe ocurrir (ej: 3)
- `equivalent_formal_tardies`: A cuántos retardos formales equivale (ej: 1)

**Ejemplo de configuración:**
```sql
-- Llegadas tardías (8:31-8:45): Cada 3 = 1 retardo formal
{
  "name": "Llegadas Tardías",
  "type": "LATE_ARRIVAL",
  "start_minutes_late": 1,
  "end_minutes_late": 15,
  "accumulation_count": 3,
  "equivalent_formal_tardies": 1
}

-- Retardos directos (8:46+): Cada 1 = 1 retardo formal
{
  "name": "Retardos Directos",
  "type": "DIRECT_TARDINESS",
  "start_minutes_late": 16,
  "end_minutes_late": null,
  "accumulation_count": 1,
  "equivalent_formal_tardies": 1
}
```

### 2. `disciplinary_action_rules` - Reglas de Acciones Disciplinarias

Configura qué acciones se disparan según acumulaciones.

**Campos principales:**
- `trigger_type`: Qué dispara la acción (FORMAL_TARDIES, UNJUSTIFIED_ABSENCES)
- `trigger_count`: Cantidad que dispara (ej: 5 retardos, 1 falta)
- `period_days`: Período de días para contar (ej: 30)
- `action_type`: Tipo de acción (WARNING, ADMINISTRATIVE_ACT, SUSPENSION, TERMINATION)
- `suspension_days`: Días de suspensión (si aplica)
- `affects_salary`: Si afecta el sueldo (suspensión sin goce)
- `auto_apply`: Si se aplica automáticamente

**Reglas configuradas por defecto:**

| Disparador | Cantidad | Período | Acción | Días Suspensión | Afecta Sueldo |
|-----------|----------|---------|--------|-----------------|---------------|
| FORMAL_TARDIES | 5 | 30 días | Acta Administrativa | - | No |
| UNJUSTIFIED_ABSENCES | 1 | 30 días | Suspensión | 1 | Sí |
| UNJUSTIFIED_ABSENCES | 2 | 30 días | Suspensión | 2 | Sí |
| UNJUSTIFIED_ABSENCES | 3 | 30 días | Suspensión | 3 | Sí |
| UNJUSTIFIED_ABSENCES | 4 | 30 días | Rescisión | - | Sí |

### 3. `employee_disciplinary_records` - Registro de Acciones Disciplinarias

Registra cada acta administrativa o sanción aplicada a un empleado.

**Campos principales:**
- `employee_id`: ID del empleado
- `rule_id`: Regla que disparó la acción (NULL si es manual)
- `action_type`: Tipo de acción aplicada
- `trigger_type`: Qué la disparó
- `trigger_count`: Cantidad acumulada
- `applied_date`: Fecha en que se levantó el acta
- `effective_date`: Fecha de inicio (para suspensiones)
- `expiration_date`: Fecha de fin (para suspensiones)
- `status`: PENDING, ACTIVE, COMPLETED, CANCELLED
- `approved_by_id`: Quién aprobó la acción

### 4. `tardiness_accumulations` - Acumulación Mensual de Tardanzas

Lleva el conteo mensual de tardanzas por empleado.

**Campos principales:**
- `employee_id`: ID del empleado
- `month`: Mes (1-12)
- `year`: Año
- `late_arrivals_count`: Cantidad de llegadas tardías (8:31-8:45)
- `direct_tardiness_count`: Cantidad de retardos directos (8:46+)
- `formal_tardies_count`: Total de retardos formales
- `administrative_acts`: Actas administrativas levantadas

## 🔄 Flujo de Funcionamiento

### 1. Registro de Asistencia

Cuando un empleado marca entrada:

```typescript
// Ejemplo: Empleado llega a las 8:37
const scheduleStartTime = "08:30";
const checkInTime = "08:37";
const minutesLate = 7;

// El sistema busca qué regla aplica
const rule = findApplicableRule(minutesLate);
// Resultado: "Llegadas Tardías" (1-15 minutos)

// Actualiza acumulación
updateTardinessAccumulation(employee, {
  late_arrivals_count: +1
});

// Verifica si se alcanzó el límite para conversión
if (employee.late_arrivals_count === 3) {
  // Convierte a retardo formal
  updateTardinessAccumulation(employee, {
    formal_tardies_count: +1,
    late_arrivals_count: 0 // Resetea
  });
}
```

### 2. Verificación de Acciones Disciplinarias

Después de actualizar las acumulaciones:

```typescript
// Verifica si se debe disparar una acción
const rules = getDisciplinaryRules({
  trigger_type: 'FORMAL_TARDIES'
});

for (const rule of rules) {
  const count = getFormalTardiesInPeriod(
    employee,
    rule.period_days
  );
  
  if (count >= rule.trigger_count) {
    if (rule.auto_apply) {
      // Aplica automáticamente
      createDisciplinaryRecord(employee, rule);
    } else {
      // Notifica para aprobación manual
      notifyDisciplinaryAction(employee, rule);
    }
  }
}
```

### 3. Ejemplo Completo

**Escenario: Empleado con múltiples tardanzas**

| Fecha | Hora Entrada | Tipo | Acumulación |
|-------|--------------|------|-------------|
| 01/10 | 08:35 | Llegada Tardía 1/3 | - |
| 05/10 | 08:40 | Llegada Tardía 2/3 | - |
| 10/10 | 08:38 | Llegada Tardía 3/3 | ✅ **1 Retardo Formal** |
| 12/10 | 08:50 | Retardo Directo | ✅ **2 Retardos Formales** |
| 15/10 | 08:55 | Retardo Directo | ✅ **3 Retardos Formales** |
| 20/10 | 08:35 | Llegada Tardía 1/3 | - |
| 22/10 | 08:49 | Retardo Directo | ✅ **4 Retardos Formales** |
| 25/10 | 08:47 | Retardo Directo | ✅ **5 Retardos Formales** |

**Resultado al 25/10:**
- Se dispara la regla: "5 retardos formales = 1 Acta Administrativa"
- Se crea un registro en `employee_disciplinary_records`
- Se notifica al supervisor para aprobación
- El acta queda en estado PENDING hasta ser aprobada

## 🚀 Cómo Aplicar la Migración

### Opción 1: Con Prisma

```bash
# Genera el cliente de Prisma
npx prisma generate

# Aplica la migración
npx prisma db push
```

### Opción 2: Directamente con MySQL

```bash
# Conecta a tu base de datos
mysql -u tu_usuario -p tu_base_de_datos

# Ejecuta la migración
source prisma/migrations/20241024_add_tardiness_and_disciplinary_system.sql
```

### Opción 3: Desde Laravel (si aplica)

```bash
# Crea una migración en Laravel
php artisan make:migration add_tardiness_and_disciplinary_system

# Copia el contenido del SQL al método up()
# Ejecuta
php artisan migrate
```

## 📝 Configuración Inicial

Después de aplicar la migración, ya tendrás las reglas por defecto configuradas. Puedes modificarlas según tus necesidades:

### Modificar Rangos de Tardanzas

```sql
-- Cambiar el rango de "llegadas tardías" a 1-10 minutos
UPDATE tardiness_rules 
SET end_minutes_late = 10
WHERE id = 'tr_late_arrival_001';

-- Cambiar para que cada 5 llegadas tardías = 1 retardo formal
UPDATE tardiness_rules 
SET accumulation_count = 5
WHERE id = 'tr_late_arrival_001';
```

### Agregar Nuevas Reglas Disciplinarias

```sql
-- Ejemplo: 3 actas administrativas = Suspensión de 1 día
INSERT INTO disciplinary_action_rules (
  id, name, description, trigger_type, trigger_count,
  period_days, action_type, suspension_days, affects_salary,
  requires_approval, auto_apply, notification_enabled,
  is_active, created_at, updated_at
) VALUES (
  'dar_admin_acts_3',
  'Suspensión por 3 Actas Administrativas',
  'Tres actas administrativas: Suspensión de 1 día.',
  'ADMINISTRATIVE_ACTS',
  3,
  90, -- En 90 días
  'SUSPENSION',
  1,
  true,
  true,
  false,
  true,
  true,
  NOW(),
  NOW()
);
```

## 🔧 Integración con el Sistema de Asistencias

El siguiente paso será actualizar el servicio de cálculo de incidentes para que:

1. Al registrar una entrada tarde, aplique las reglas de tardanzas
2. Actualice las acumulaciones mensuales
3. Verifique si se deben disparar acciones disciplinarias
4. Envíe notificaciones cuando se creen actas o sanciones

## 📊 Consultas Útiles

### Ver acumulaciones del mes actual

```sql
SELECT 
  e.employee_code,
  CONCAT(u.first_name, ' ', u.last_name) as nombre,
  ta.late_arrivals_count as llegadas_tardias,
  ta.direct_tardiness_count as retardos_directos,
  ta.formal_tardies_count as retardos_formales,
  ta.administrative_acts as actas
FROM tardiness_accumulations ta
JOIN employees e ON ta.employee_id = e.id
JOIN users u ON e.user_id = u.id
WHERE ta.year = YEAR(NOW())
  AND ta.month = MONTH(NOW())
ORDER BY ta.formal_tardies_count DESC;
```

### Ver empleados cerca de recibir acta

```sql
-- Empleados con 4 retardos formales (próximos a 5)
SELECT 
  e.employee_code,
  CONCAT(u.first_name, ' ', u.last_name) as nombre,
  ta.formal_tardies_count as retardos_formales,
  (5 - ta.formal_tardies_count) as faltan_para_acta
FROM tardiness_accumulations ta
JOIN employees e ON ta.employee_id = e.id
JOIN users u ON e.user_id = u.id
WHERE ta.year = YEAR(NOW())
  AND ta.month = MONTH(NOW())
  AND ta.formal_tardies_count >= 4
  AND ta.formal_tardies_count < 5
ORDER BY ta.formal_tardies_count DESC;
```

### Ver historial de actas de un empleado

```sql
SELECT 
  edr.applied_date as fecha,
  edr.action_type as tipo_accion,
  edr.trigger_type as motivo,
  edr.trigger_count as cantidad,
  edr.status as estado,
  edr.suspension_days as dias_suspension,
  CONCAT(u.first_name, ' ', u.last_name) as aprobado_por
FROM employee_disciplinary_records edr
LEFT JOIN users u ON edr.approved_by_id = u.id
WHERE edr.employee_id = 'ID_DEL_EMPLEADO'
ORDER BY edr.applied_date DESC;
```

## ⚠️ Notas Importantes

1. **Aprobación Manual**: Las acciones críticas (actas, suspensiones, rescisiones) requieren aprobación manual por defecto
2. **Período de Conteo**: Las faltas injustificadas se cuentan en períodos de 30 días móviles
3. **Reseteo Mensual**: Las llegadas tardías y retardos se acumulan mensualmente y se resetean cada mes
4. **Sanciones Progresivas**: El sistema maneja automáticamente la progresión de sanciones
5. **Flexibilidad**: Todas las reglas son configurables y pueden ajustarse según políticas de la empresa

## 📚 Próximos Pasos

1. ✅ Tablas creadas
2. ⏳ Actualizar servicio de cálculo de incidencias
3. ⏳ Crear endpoints API para gestionar reglas
4. ⏳ Crear interfaz de administración
5. ⏳ Implementar notificaciones automáticas
6. ⏳ Crear reportes de disciplina


