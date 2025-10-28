# 🔄 Migración de Estructura de Turnos

## Descripción

Este documento describe cómo migrar la estructura de la tabla `work_shifts` de la versión antigua a la nueva que soporta **horarios individuales por día de la semana** (similar a Odoo).

## Cambios Principales

### Antes:
- `start_time`: Hora de inicio única para todos los días
- `end_time`: Hora de fin única para todos los días  
- `days_of_week`: JSON array con días activos `[0,1,2,3,4]`
- `auto_checkout_time`: Hora de auto-checkout

### Después:
- `description`: Descripción del turno (nuevo)
- `timezone`: Zona horaria (nuevo, default: America/Ciudad_Juarez)
- `weekly_hours`: Total de horas semanales (nuevo)
- `working_hours`: JSON con configuración por día:
  ```json
  [
    {"day": 0, "enabled": true, "startTime": "08:00", "endTime": "17:00", "duration": 9},
    {"day": 1, "enabled": true, "startTime": "08:00", "endTime": "17:00", "duration": 9},
    ...
  ]
  ```

## Pasos de Migración

### Opción 1: Migración Automática (Recomendada para desarrollo)

Si estás en desarrollo y puedes perder los datos existentes:

```bash
# 1. Hacer backup de la base de datos
npx prisma db push --force-reset

# 2. Regenerar el cliente de Prisma
npx prisma generate

# 3. Ejecutar seed si tienes datos de prueba
npm run seed
```

### Opción 2: Migración Manual (Recomendada para producción)

Si tienes datos en producción que NO quieres perder:

#### Paso 1: Agregar nuevas columnas

```sql
ALTER TABLE `work_shifts` 
  ADD COLUMN `description` TEXT NULL AFTER `code`,
  ADD COLUMN `timezone` VARCHAR(191) NOT NULL DEFAULT 'America/Ciudad_Juarez' AFTER `description`,
  ADD COLUMN `weekly_hours` DECIMAL(5,2) NOT NULL DEFAULT 48.00 AFTER `timezone`,
  ADD COLUMN `working_hours` TEXT NOT NULL DEFAULT '[]' AFTER `weekly_hours`;
```

#### Paso 2: Migrar datos existentes

**Opción A - Script manual por turno** (más seguro):

Para cada turno existente, ejecuta este script adaptándolo:

```sql
-- Ejemplo para un turno con código 'STD48'
-- Lunes a Viernes 08:00-17:00 (9 horas diarias = 45 semanales)

UPDATE `work_shifts` 
SET 
  `working_hours` = '[
    {"day":0,"enabled":true,"startTime":"08:00","endTime":"17:00","duration":9},
    {"day":1,"enabled":true,"startTime":"08:00","endTime":"17:00","duration":9},
    {"day":2,"enabled":true,"startTime":"08:00","endTime":"17:00","duration":9},
    {"day":3,"enabled":true,"startTime":"08:00","endTime":"17:00","duration":9},
    {"day":4,"enabled":true,"startTime":"08:00","endTime":"17:00","duration":9},
    {"day":5,"enabled":false,"startTime":"08:00","endTime":"17:00","duration":0},
    {"day":6,"enabled":false,"startTime":"08:00","endTime":"17:00","duration":0}
  ]',
  `weekly_hours` = 45.00,
  `description` = 'Horario estándar de oficina'
WHERE `code` = 'STD48';
```

**Opción B - Script automático** (si tienes MySQL 5.7+):

```sql
-- Este script intenta convertir automáticamente los turnos existentes
UPDATE `work_shifts` w
SET 
  w.`working_hours` = CONCAT('[',
    '{"day":0,"enabled":', IF(JSON_CONTAINS(w.`days_of_week`, '0'), 'true', 'false'), ',"startTime":"', w.`start_time`, '","endTime":"', w.`end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2), '},',
    '{"day":1,"enabled":', IF(JSON_CONTAINS(w.`days_of_week`, '1'), 'true', 'false'), ',"startTime":"', w.`start_time`, '","endTime":"', w.`end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2), '},',
    '{"day":2,"enabled":', IF(JSON_CONTAINS(w.`days_of_week`, '2'), 'true', 'false'), ',"startTime":"', w.`start_time`, '","endTime":"', w.`end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2), '},',
    '{"day":3,"enabled":', IF(JSON_CONTAINS(w.`days_of_week`, '3'), 'true', 'false'), ',"startTime":"', w.`start_time`, '","endTime":"', w.`end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2), '},',
    '{"day":4,"enabled":', IF(JSON_CONTAINS(w.`days_of_week`, '4'), 'true', 'false'), ',"startTime":"', w.`start_time`, '","endTime":"', w.`end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2), '},',
    '{"day":5,"enabled":', IF(JSON_CONTAINS(w.`days_of_week`, '5'), 'true', 'false'), ',"startTime":"', w.`start_time`, '","endTime":"', w.`end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2), '},',
    '{"day":6,"enabled":', IF(JSON_CONTAINS(w.`days_of_week`, '6'), 'true', 'false'), ',"startTime":"', w.`start_time`, '","endTime":"', w.`end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2), '}',
  ']'),
  w.`weekly_hours` = (
    (IF(JSON_CONTAINS(w.`days_of_week`, '0'), 1, 0) +
     IF(JSON_CONTAINS(w.`days_of_week`, '1'), 1, 0) +
     IF(JSON_CONTAINS(w.`days_of_week`, '2'), 1, 0) +
     IF(JSON_CONTAINS(w.`days_of_week`, '3'), 1, 0) +
     IF(JSON_CONTAINS(w.`days_of_week`, '4'), 1, 0) +
     IF(JSON_CONTAINS(w.`days_of_week`, '5'), 1, 0) +
     IF(JSON_CONTAINS(w.`days_of_week`, '6'), 1, 0)) 
    * ROUND(TIME_TO_SEC(TIMEDIFF(w.`end_time`, w.`start_time`))/3600, 2)
  );
```

#### Paso 3: Verificar datos migrados

```sql
-- Ver turnos migrados
SELECT 
  id, 
  name, 
  code, 
  weekly_hours,
  working_hours,
  start_time AS old_start_time,
  end_time AS old_end_time
FROM work_shifts;
```

#### Paso 4: Regenerar cliente de Prisma

```bash
npx prisma generate
```

#### Paso 5: Probar en desarrollo

Reinicia el servidor y verifica que:
1. ✅ Los turnos se listan correctamente
2. ✅ Puedes ver los detalles de un turno
3. ✅ Puedes editar un turno existente
4. ✅ Puedes crear un nuevo turno

#### Paso 6: Eliminar columnas antiguas (OPCIONAL)

**⚠️ SOLO después de verificar que todo funciona perfectamente:**

```sql
ALTER TABLE `work_shifts` 
  DROP COLUMN `start_time`,
  DROP COLUMN `end_time`,
  DROP COLUMN `days_of_week`,
  DROP COLUMN `auto_checkout_time`;
```

## Rollback

Si necesitas revertir los cambios:

```sql
-- Restaurar desde backup
-- O si aún no eliminaste las columnas antiguas:

ALTER TABLE `work_shifts` 
  DROP COLUMN `description`,
  DROP COLUMN `timezone`,
  DROP COLUMN `weekly_hours`,
  DROP COLUMN `working_hours`;

-- Luego restaura el schema.prisma anterior y ejecuta:
npx prisma generate
npx prisma db push
```

## Ejemplo de Datos Migrados

### Antes:
```json
{
  "name": "Turno Matutino",
  "code": "MAT-01",
  "start_time": "08:00",
  "end_time": "17:00",
  "days_of_week": "[0,1,2,3,4]",
  "is_flexible": false
}
```

### Después:
```json
{
  "name": "Turno Matutino",
  "code": "MAT-01",
  "description": null,
  "timezone": "America/Ciudad_Juarez",
  "weekly_hours": 45.00,
  "working_hours": [
    {"day": 0, "enabled": true, "startTime": "08:00", "endTime": "17:00", "duration": 9},
    {"day": 1, "enabled": true, "startTime": "08:00", "endTime": "17:00", "duration": 9},
    {"day": 2, "enabled": true, "startTime": "08:00", "endTime": "17:00", "duration": 9},
    {"day": 3, "enabled": true, "startTime": "08:00", "endTime": "17:00", "duration": 9},
    {"day": 4, "enabled": true, "startTime": "08:00", "endTime": "17:00", "duration": 9},
    {"day": 5, "enabled": false, "startTime": "08:00", "endTime": "17:00", "duration": 0},
    {"day": 6, "enabled": false, "startTime": "08:00", "endTime": "17:00", "duration": 0}
  ],
  "is_flexible": false
}
```

## Ventajas de la Nueva Estructura

1. ✅ **Horarios flexibles por día**: Puedes tener Lunes 8:00-17:00, Viernes 8:00-14:00
2. ✅ **Similar a Odoo**: Interfaz familiar para usuarios de Odoo
3. ✅ **Más preciso**: Calcula automáticamente horas semanales exactas
4. ✅ **Mejor UX**: Interfaz más intuitiva para configurar horarios

## Soporte

Si tienes problemas con la migración, verifica:
1. La versión de MySQL (recomendado 5.7+)
2. Que tengas backup de tu base de datos
3. Los logs de error en la consola

Para más información, consulta el archivo `CLAUDE.md`.

