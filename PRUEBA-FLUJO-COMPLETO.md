# 🧪 Prueba del Flujo Completo de Tardanzas

## 📋 Descripción del Flujo Automático

Cuando un empleado hace **check-in**, se disparan automáticamente los siguientes eventos:

```
┌──────────────┐
│   CHECK-IN   │
└──────┬───────┘
       │
       v
┌─────────────────────────────────┐
│ 1. Determinar Status            │
│    - Calcular hora programada   │
│    - Verificar período de gracia│
│    - Status: PRESENT o LATE     │
│    - Calcular minutos de retraso│
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│ 2. Guardar Asistencia           │
│    - Crear/actualizar registro  │
│    - Almacenar check-in time    │
│    - Registrar status           │
└──────┬──────────────────────────┘
       │
       v (si minutesLate > 0)
┌─────────────────────────────────┐
│ 3. Procesar Tardanza            │
│    processTardiness()            │
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│ 4. Determinar Regla Aplicable   │
│    - LATE_ARRIVAL (1-15 min)    │
│    - DIRECT_TARDINESS (16+ min) │
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│ 5. Obtener/Crear Acumulación    │
│    - TardinessAccumulation      │
│    - Mes actual del empleado    │
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│ 6. Aplicar Regla                │
│    - LATE_ARRIVAL:              │
│      lateArrivalsCount++        │
│      Si llega a 1, reset y      │
│      formalTardiesCount++       │
│    - DIRECT_TARDINESS:          │
│      directTardinessCount++     │
│      formalTardiesCount += 2    │
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│ 7. Verificar Triggers           │
│    Disciplinarios               │
│    - Si formalTardies >= 5      │
│      → Crear Acta Admin.        │
│    - Si administrativeActs >= 3 │
│      → Proponer Baja            │
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│ 8. Retornar Respuesta           │
│    - Attendance record          │
│    - Tardiness info             │
│    - Disciplinary action status │
└─────────────────────────────────┘
```

## 🎯 Casos de Prueba

### Caso 1: Llegada Puntual (No Tardanza)
```javascript
// Empleado: Juan Pérez
// Turno: 08:00 - 17:00
// Gracia: 15 minutos
// Check-in: 07:55

✅ Resultado Esperado:
- Status: PRESENT
- minutesLate: 0
- No se procesa tardanza
- No se crean incidencias
```

### Caso 2: Llegada Tarde Leve (1ra vez)
```javascript
// Empleado: María García
// Turno: 08:00 - 17:00
// Gracia: 15 minutos
// Check-in: 08:20 (5 minutos después de gracia)

✅ Resultado Esperado:
- Status: LATE
- minutesLate: 20
- Regla: LATE_ARRIVAL
- lateArrivalsCount: 1
- formalTardiesCount: 1 (se completa la acumulación)
- ⚠️ Aún no se crea acta (faltan más retardos)
```

### Caso 3: Tardanza Grave Directa
```javascript
// Empleado: Carlos López
// Turno: 14:00 - 22:00
// Gracia: 15 minutos
// Check-in: 14:30

✅ Resultado Esperado:
- Status: LATE
- minutesLate: 30
- Regla: DIRECT_TARDINESS
- directTardinessCount: 1
- formalTardiesCount: 2 (equivalente a 2 retardos formales)
- ⚠️ Aún no se crea acta (faltan más retardos)
```

### Caso 4: Acumulación que dispara Acta Administrativa
```javascript
// Empleado con 4 retardos formales previos
// Nueva tardanza: 25 minutos tarde

✅ Resultado Esperado:
- formalTardiesCount: 6 (4 previos + 2 nuevos)
- ✅ Se dispara acta administrativa
- EmployeeDisciplinaryRecord creado
- actionType: WRITTEN_WARNING
- status: ACTIVE
- administrativeActs: 1
```

### Caso 5: Acumulación de 3 Actas (Propuesta de Baja)
```javascript
// Empleado con 2 actas previas
// Nueva tardanza dispara 3ra acta

✅ Resultado Esperado:
- ✅ Se crea 3ra acta administrativa
- ✅ Se verifica umbral de 3 actas
- ✅ Se crea registro de propuesta de baja
- actionType: TERMINATION
- status: PENDING (requiere aprobación)
```

## 🚀 Cómo Hacer la Prueba

### Opción 1: Usar la Interfaz Web

1. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```
   Servidor corriendo en: http://localhost:3004

2. **Login con usuario de prueba**:
   - Email: `carlos.lopez@company.com`
   - Password: `password123`

3. **Navegar al Dashboard**:
   - Ir a: http://localhost:3004/admin/dashboard

4. **Hacer Check-in**:
   - Buscar el widget de asistencia
   - Hacer clic en "Check In"
   - Verificar mensaje de confirmación

5. **Ver Resultados en Consola del Servidor**:
   ```
   ✅ Check-in saved: {
     attendanceId: '...',
     employeeId: '...',
     status: 'LATE',
     ...
   }

   ✅ Tardanza procesada: {
     minutesLate: 30,
     rule: 'Tardanza Grave',
     type: 'direct_tardiness',
     formalTardiesAdded: 2,
     stats: { ... },
     disciplinaryAction: false
   }
   ```

6. **Verificar en Base de Datos**:
   ```bash
   npx prisma studio
   ```
   - Ver tabla `attendances`
   - Ver tabla `tardiness_accumulations`
   - Ver tabla `disciplinary_action_rules` (si aplica)

### Opción 2: Usar el Script de Prueba API

```bash
node test-check-in.js
```

## 📊 Tablas a Monitorear

### 1. attendances
- `id`, `employeeId`, `date`
- `checkInTime`, `status`
- `workedHours`, `overtimeHours`

### 2. tardiness_accumulations
- `employeeId`, `month`, `year`
- `lateArrivalsCount` (acumulación de 1-15 min)
- `directTardinessCount` (16+ min)
- `formalTardiesCount` (retardos formales)
- `administrativeActs` (actas creadas)

### 3. employee_disciplinary_records
- `employeeId`, `ruleId`
- `actionType` (WARNING, WRITTEN_WARNING, ADMINISTRATIVE_ACT, SUSPENSION, TERMINATION)
- `triggerType`, `triggerCount`
- `appliedDate`, `status`

## 🔍 Verificación de Reglas Activas

```sql
-- Ver reglas de tardanza
SELECT * FROM tardiness_rules WHERE is_active = true;

-- Ver reglas disciplinarias
SELECT * FROM disciplinary_action_rules WHERE is_active = true;

-- Ver acumulaciones del mes actual
SELECT * FROM tardiness_accumulations
WHERE month = MONTH(NOW()) AND year = YEAR(NOW());

-- Ver actas disciplinarias recientes
SELECT * FROM employee_disciplinary_records
ORDER BY applied_date DESC LIMIT 10;
```

## ✅ Checklist de Prueba

- [ ] Check-in puntual funciona sin crear tardanzas
- [ ] Check-in tarde (1-15 min) incrementa lateArrivalsCount
- [ ] Check-in tarde (16+ min) incrementa directTardinessCount y formalTardiesCount
- [ ] Al completar acumulación se convierte a retardo formal
- [ ] Al llegar a 5 retardos formales se crea acta administrativa
- [ ] Al llegar a 3 actas se propone baja
- [ ] Los logs en consola muestran cada paso
- [ ] La respuesta del API incluye toda la información de tardanza

## 🐛 Posibles Errores y Soluciones

### Error: "No se encontró regla aplicable"
**Causa**: No existen reglas de tardanza en la BD
**Solución**: Ejecutar `node seed-complete-test-data.js`

### Error: "Employee not found"
**Causa**: El employeeId no existe
**Solución**: Verificar que los empleados de prueba existen

### No se procesan tardanzas
**Causa**: WorkShift no tiene períodos configurados
**Solución**: Verificar que el turno del empleado tenga WorkShiftPeriod

## 📝 Notas Importantes

1. **Período de Gracia**: Configurado en el WorkShift (default: 15 minutos)
2. **Día de la Semana**: El sistema usa 0=Domingo, 1=Lunes, ..., 6=Sábado
3. **Hora Decimal**: Las horas se almacenan como decimal (8.5 = 08:30)
4. **Mes/Año**: Las acumulaciones se resetean automáticamente cada mes
5. **Auto-Check**: El sistema NO hace auto-checkout, debe hacerse manual

## 🎓 Aprendizajes del Sistema

- **Separación de Responsabilidades**: Check-in solo registra, tardiness service procesa
- **Transacciones Implícitas**: Prisma maneja las transacciones automáticamente
- **Error Handling**: Si falla el procesamiento de tardanzas, el check-in se completa igual
- **Logs Detallados**: Cada paso se registra en consola para debugging
- **Respuesta Completa**: El API retorna toda la información para mostrar al usuario
