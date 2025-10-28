# ⚠️ PENDIENTES - Sistema de Tardanzas y Disciplina

## 📋 Resumen

Se han creado las tablas y la estructura para el sistema de tardanzas y disciplina, pero **AÚN NO SE HAN APLICADO** a la base de datos. Este documento lista todos los pasos pendientes para completar la implementación.

---

## ✅ Lo que YA está hecho

1. ✅ **Schema de Prisma actualizado** (`prisma/schema.prisma`)
   - Nuevos modelos agregados
   - Nuevos enums definidos
   - Relaciones configuradas

2. ✅ **Migración SQL creada** (`prisma/migrations/20241024_add_tardiness_and_disciplinary_system.sql`)
   - Creación de 4 tablas nuevas
   - Datos iniciales de reglas
   - Configuración predeterminada

3. ✅ **Documentación creada** (`SISTEMA-TARDANZAS-DISCIPLINA.md`)
   - Explicación completa del sistema
   - Ejemplos de uso
   - Consultas útiles

---

## ❌ Lo que FALTA hacer

### 🔴 PASO 1: Aplicar la Migración a la Base de Datos

**IMPORTANTE**: Primero debes decidir qué método usar según tu entorno.

#### Opción A: Si usas Prisma como ORM principal

```bash
# 1. Genera el cliente de Prisma actualizado
npx prisma generate

# 2. Aplica los cambios a la base de datos
npx prisma db push

# 3. (Opcional) Ejecuta el seed si lo necesitas
npx prisma db seed
```

**⚠️ Advertencia**: `prisma db push` sincroniza el schema pero NO ejecuta el SQL de migración con los datos iniciales. Si quieres los datos iniciales (reglas predeterminadas), debes ejecutar el SQL manualmente después.

#### Opción B: Si NO usas Prisma o prefieres control manual

```bash
# Conecta a MySQL y ejecuta la migración
mysql -u tu_usuario -p tu_base_de_datos < prisma/migrations/20241024_add_tardiness_and_disciplinary_system.sql

# O desde el cliente MySQL:
mysql -u tu_usuario -p
USE tu_base_de_datos;
SOURCE prisma/migrations/20241024_add_tardiness_and_disciplinary_system.sql;
```

**✅ Ventaja**: Este método incluye automáticamente las reglas predeterminadas.

#### Opción C: Si usas Laravel con Laragon

```bash
# 1. Crea una nueva migración en Laravel
php artisan make:migration add_tardiness_and_disciplinary_system

# 2. Copia el contenido del archivo SQL al método up() de la migración
# (necesitarás adaptarlo al formato de Laravel)

# 3. Ejecuta la migración
php artisan migrate
```

---

### 🟡 PASO 2: Verificar que las Tablas se Crearon Correctamente

```sql
-- Verifica las tablas
SHOW TABLES LIKE '%tardiness%';
SHOW TABLES LIKE '%disciplinary%';

-- Verifica que las reglas se insertaron
SELECT * FROM tardiness_rules;
SELECT * FROM disciplinary_action_rules;

-- Debe mostrar:
-- - 2 reglas de tardanzas
-- - 5 reglas disciplinarias
```

---

### 🟡 PASO 3: Actualizar el Servicio de Cálculo de Incidencias

**Archivo a modificar**: `src/services/incidentCalculationService.ts`

Necesitas agregar lógica para:

1. **Al registrar una entrada tarde**:
   - Calcular minutos de retraso
   - Determinar qué regla de tardanza aplica
   - Actualizar `tardiness_accumulations` del empleado
   - Verificar si se alcanzó el límite para conversión a retardo formal
   - Si hay conversión, resetear el contador de llegadas tardías

2. **Verificar acciones disciplinarias**:
   - Revisar si se alcanzó algún umbral configurado
   - Crear registros en `employee_disciplinary_records` si aplica
   - Enviar notificaciones

**Ejemplo de función nueva a crear**:
```typescript
async function processTardiness(
  employeeId: string, 
  checkInTime: Date, 
  scheduledTime: Date
) {
  // 1. Calcular minutos de retraso
  // 2. Buscar regla aplicable
  // 3. Actualizar acumulaciones
  // 4. Verificar conversiones
  // 5. Verificar acciones disciplinarias
}
```

---

### 🟡 PASO 4: Crear Endpoints API

**Archivos a crear**:

1. **`src/app/api/tardiness-rules/route.ts`**
   - GET: Listar reglas
   - POST: Crear nueva regla

2. **`src/app/api/tardiness-rules/[id]/route.ts`**
   - GET: Obtener regla específica
   - PUT: Actualizar regla
   - DELETE: Eliminar regla

3. **`src/app/api/disciplinary-rules/route.ts`**
   - GET: Listar reglas disciplinarias
   - POST: Crear nueva regla

4. **`src/app/api/disciplinary-rules/[id]/route.ts`**
   - GET: Obtener regla específica
   - PUT: Actualizar regla
   - DELETE: Eliminar regla

5. **`src/app/api/disciplinary-records/route.ts`**
   - GET: Listar registros disciplinarios
   - POST: Crear acta manual

6. **`src/app/api/disciplinary-records/[id]/route.ts`**
   - GET: Obtener registro específico
   - PUT: Actualizar registro (aprobar/rechazar)
   - DELETE: Cancelar registro

7. **`src/app/api/tardiness-accumulations/route.ts`**
   - GET: Ver acumulaciones (con filtros por empleado, mes, año)

---

### 🟡 PASO 5: Crear Validaciones

**Archivos a crear**:

1. **`src/lib/validations/tardinessRule.ts`**
```typescript
import { z } from 'zod';

export const tardinessRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['LATE_ARRIVAL', 'DIRECT_TARDINESS']),
  startMinutesLate: z.number().min(0),
  endMinutesLate: z.number().min(0).optional(),
  accumulationCount: z.number().min(1),
  equivalentFormalTardies: z.number().min(1),
  isActive: z.boolean().default(true)
});
```

2. **`src/lib/validations/disciplinaryRule.ts`**
```typescript
import { z } from 'zod';

export const disciplinaryRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  triggerType: z.string(),
  triggerCount: z.number().min(1),
  periodDays: z.number().min(1),
  actionType: z.enum(['WARNING', 'WRITTEN_WARNING', 'ADMINISTRATIVE_ACT', 'SUSPENSION', 'TERMINATION']),
  suspensionDays: z.number().min(0).optional(),
  affectsSalary: z.boolean().default(false),
  requiresApproval: z.boolean().default(true),
  autoApply: z.boolean().default(false),
  notificationEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true)
});
```

---

### 🟡 PASO 6: Crear Páginas de Administración

**Rutas a crear**:

1. **`src/app/(dashboard)/admin/tardiness-rules/page.tsx`**
   - Listado de reglas de tardanzas
   - Botón para crear nueva regla
   - Acciones: editar, eliminar, activar/desactivar

2. **`src/app/(dashboard)/admin/tardiness-rules/new/page.tsx`**
   - Formulario para crear regla

3. **`src/app/(dashboard)/admin/tardiness-rules/[id]/edit/page.tsx`**
   - Formulario para editar regla

4. **`src/app/(dashboard)/admin/disciplinary-rules/page.tsx`**
   - Listado de reglas disciplinarias
   - Similar a tardiness-rules

5. **`src/app/(dashboard)/admin/disciplinary-rules/new/page.tsx`**
   - Formulario para crear regla disciplinaria

6. **`src/app/(dashboard)/admin/disciplinary-records/page.tsx`**
   - Listado de actas y sanciones
   - Filtros por empleado, estado, fecha
   - Acciones: aprobar, rechazar, ver detalles

7. **`src/app/(dashboard)/admin/disciplinary-records/[id]/page.tsx`**
   - Detalle completo de un acta
   - Botones para aprobar/rechazar
   - Historial de cambios

---

### 🟡 PASO 7: Crear Componentes Reutilizables

**Componentes a crear**:

1. **`src/app/(dashboard)/admin/tardiness-rules/components/TardinessRuleForm.tsx`**
   - Formulario reutilizable para crear/editar reglas de tardanzas

2. **`src/app/(dashboard)/admin/tardiness-rules/components/TardinessRulesList.tsx`**
   - Tabla con las reglas de tardanzas

3. **`src/app/(dashboard)/admin/disciplinary-rules/components/DisciplinaryRuleForm.tsx`**
   - Formulario para reglas disciplinarias

4. **`src/app/(dashboard)/admin/disciplinary-rules/components/DisciplinaryRulesList.tsx`**
   - Tabla con reglas disciplinarias

5. **`src/app/(dashboard)/admin/disciplinary-records/components/DisciplinaryRecordCard.tsx`**
   - Card para mostrar un acta
   - Con botones de acción

6. **`src/app/(dashboard)/admin/disciplinary-records/components/DisciplinaryRecordsList.tsx`**
   - Lista de actas

7. **`src/components/common/TardinessAccumulationBadge.tsx`**
   - Badge para mostrar acumulaciones de un empleado
   - Con colores según nivel de riesgo

---

### 🟡 PASO 8: Integrar con el Sistema de Asistencias

**Archivo a modificar**: `src/app/api/attendance/checkin/route.ts`

Agregar llamada al servicio de tardanzas después de registrar la entrada:

```typescript
// Después de crear la asistencia
if (minutesLate > 0) {
  await processTardinessService(
    employeeId,
    checkInTime,
    scheduledTime,
    minutesLate
  );
}
```

---

### 🟡 PASO 9: Actualizar el Navbar/Sidebar

**Archivo a modificar**: `src/components/layout/Sidebar.tsx`

Agregar nuevos enlaces en el menú:

```typescript
{
  name: 'Reglas de Tardanzas',
  href: '/admin/tardiness-rules',
  icon: ClockIcon
},
{
  name: 'Reglas Disciplinarias',
  href: '/admin/disciplinary-rules',
  icon: ShieldExclamationIcon
},
{
  name: 'Actas y Sanciones',
  href: '/admin/disciplinary-records',
  icon: DocumentTextIcon
}
```

---

### 🟡 PASO 10: Actualizar Types

**Archivo a modificar**: `src/types/index.ts`

Agregar los nuevos tipos:

```typescript
export type TardinessType = 'LATE_ARRIVAL' | 'DIRECT_TARDINESS';

export type DisciplinaryActionType = 
  | 'WARNING' 
  | 'WRITTEN_WARNING' 
  | 'ADMINISTRATIVE_ACT' 
  | 'SUSPENSION' 
  | 'TERMINATION';

export type SanctionStatus = 
  | 'PENDING' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface TardinessRule {
  id: string;
  name: string;
  description?: string;
  type: TardinessType;
  startMinutesLate: number;
  endMinutesLate?: number;
  accumulationCount: number;
  equivalentFormalTardies: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ... (agregar más interfaces)
```

---

### 🟡 PASO 11: Crear Notificaciones

**Archivo a modificar/crear**: `src/services/notificationService.ts`

Agregar funciones para notificar:

```typescript
async function notifyDisciplinaryAction(
  employee: Employee,
  action: DisciplinaryActionType,
  details: any
) {
  // Enviar email
  // Crear notificación in-app
  // Notificar al supervisor
}

async function notifyNearThreshold(
  employee: Employee,
  currentCount: number,
  threshold: number
) {
  // Avisar que está cerca del límite
}
```

---

### 🟡 PASO 12: Crear Reportes

**Rutas a crear**:

1. **`src/app/(dashboard)/admin/reports/tardiness/page.tsx`**
   - Reporte de tardanzas por período
   - Gráficas de tendencias
   - Top empleados con más tardanzas

2. **`src/app/(dashboard)/admin/reports/disciplinary/page.tsx`**
   - Reporte de actas por departamento
   - Tipos de sanciones más comunes
   - Evolución temporal

---

### 🟡 PASO 13: Crear Jobs/Cron

**Archivo a crear**: `src/jobs/tardinessAccumulationJob.ts`

Job para:
- Resetear acumulaciones mensuales
- Verificar reglas pendientes
- Generar alertas preventivas
- Limpiar registros antiguos

---

### 🟡 PASO 14: Testing

Crear pruebas para:

1. **Cálculo de tardanzas**
   - Verificar rangos de tiempo
   - Verificar conversiones
   - Verificar acumulaciones

2. **Disparadores de acciones**
   - Verificar umbrales
   - Verificar creación de actas
   - Verificar notificaciones

3. **Endpoints API**
   - Probar CRUD de reglas
   - Probar autorización
   - Probar validaciones

---

## 📊 Prioridad de Implementación

### 🔴 Alta Prioridad (Hacer Primero)
1. ✅ **PASO 1**: Aplicar migración a BD
2. ✅ **PASO 2**: Verificar tablas creadas
3. ✅ **PASO 3**: Actualizar servicio de cálculo
4. ✅ **PASO 8**: Integrar con sistema de asistencias

### 🟡 Media Prioridad (Hacer Después)
5. ⏳ **PASO 4**: Crear endpoints API
6. ⏳ **PASO 5**: Crear validaciones
7. ⏳ **PASO 6**: Crear páginas admin
8. ⏳ **PASO 7**: Crear componentes
9. ⏳ **PASO 9**: Actualizar menú

### 🟢 Baja Prioridad (Hacer al Final)
10. ⏳ **PASO 10**: Actualizar types
11. ⏳ **PASO 11**: Crear notificaciones
12. ⏳ **PASO 12**: Crear reportes
13. ⏳ **PASO 13**: Crear jobs
14. ⏳ **PASO 14**: Testing

---

## 🎯 Checklist Rápido

```
Base de Datos:
[ ] Ejecutar migración SQL
[ ] Verificar tablas creadas
[ ] Verificar reglas iniciales insertadas

Backend:
[ ] Actualizar servicio de cálculo de incidencias
[ ] Crear servicio de procesamiento de tardanzas
[ ] Crear endpoints API para reglas de tardanzas
[ ] Crear endpoints API para reglas disciplinarias
[ ] Crear endpoints API para registros disciplinarios
[ ] Crear validaciones con Zod
[ ] Actualizar types

Frontend:
[ ] Crear página de listado de reglas de tardanzas
[ ] Crear página de crear/editar regla de tardanzas
[ ] Crear página de listado de reglas disciplinarias
[ ] Crear página de crear/editar regla disciplinaria
[ ] Crear página de listado de actas y sanciones
[ ] Crear página de detalle de acta
[ ] Crear componentes reutilizables
[ ] Actualizar menú de navegación
[ ] Agregar badges en dashboard

Integraciones:
[ ] Integrar con check-in de asistencias
[ ] Integrar con sistema de notificaciones
[ ] Crear reportes y estadísticas
[ ] Crear jobs automáticos

Testing:
[ ] Pruebas unitarias
[ ] Pruebas de integración
[ ] Pruebas E2E
```

---

## 💡 Notas Importantes

1. **Backup**: Antes de aplicar la migración, haz un backup de tu base de datos
2. **Ambiente**: Prueba primero en desarrollo antes de aplicar en producción
3. **Datos**: Si ya tienes datos de asistencias, NO se calcularán retroactivamente a menos que crees un script para eso
4. **Configuración**: Las reglas predeterminadas son sugerencias, ajústalas según tu empresa
5. **Notificaciones**: No olvides configurar el servicio de email antes de activar notificaciones

---

## ❓ Próximos Pasos Inmediatos

**Para continuar, debes:**

1. **Decidir qué método usar** para aplicar la migración (Prisma o SQL directo)
2. **Aplicar la migración** a tu base de datos
3. **Verificar** que todo se creó correctamente
4. **Indicarme** si quieres que continúe con alguno de los pasos pendientes

¿Por dónde quieres que continúe?

