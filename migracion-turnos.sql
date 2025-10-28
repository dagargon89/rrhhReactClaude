-- ========================================
-- MIGRACIÓN: Actualizar estructura de turnos
-- Fecha: 2024-10-23
-- ========================================
-- EJECUTAR EN phpMyAdmin - Compatible con MySQL/MariaDB
-- ========================================

-- Paso 1: Agregar nuevas columnas (ejecutar UNA POR UNA si da error)
ALTER TABLE `work_shifts` ADD COLUMN `description` TEXT NULL AFTER `code`;
ALTER TABLE `work_shifts` ADD COLUMN `timezone` VARCHAR(191) NOT NULL DEFAULT 'America/Ciudad_Juarez' AFTER `description`;
ALTER TABLE `work_shifts` ADD COLUMN `weekly_hours` DECIMAL(5,2) NOT NULL DEFAULT 48.00 AFTER `timezone`;
ALTER TABLE `work_shifts` ADD COLUMN `working_hours` TEXT NULL AFTER `weekly_hours`;

-- Paso 2: Migrar datos de turnos existentes
-- Convierte start_time, end_time y days_of_week al nuevo formato JSON
UPDATE `work_shifts` 
SET `working_hours` = CONCAT('[',
  '{"day":0,"enabled":', IF(JSON_CONTAINS(`days_of_week`, '0'), 'true', 'false'), ',"startTime":"', `start_time`, '","endTime":"', `end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2), '},',
  '{"day":1,"enabled":', IF(JSON_CONTAINS(`days_of_week`, '1'), 'true', 'false'), ',"startTime":"', `start_time`, '","endTime":"', `end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2), '},',
  '{"day":2,"enabled":', IF(JSON_CONTAINS(`days_of_week`, '2'), 'true', 'false'), ',"startTime":"', `start_time`, '","endTime":"', `end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2), '},',
  '{"day":3,"enabled":', IF(JSON_CONTAINS(`days_of_week`, '3'), 'true', 'false'), ',"startTime":"', `start_time`, '","endTime":"', `end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2), '},',
  '{"day":4,"enabled":', IF(JSON_CONTAINS(`days_of_week`, '4'), 'true', 'false'), ',"startTime":"', `start_time`, '","endTime":"', `end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2), '},',
  '{"day":5,"enabled":', IF(JSON_CONTAINS(`days_of_week`, '5'), 'true', 'false'), ',"startTime":"', `start_time`, '","endTime":"', `end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2), '},',
  '{"day":6,"enabled":', IF(JSON_CONTAINS(`days_of_week`, '6'), 'true', 'false'), ',"startTime":"', `start_time`, '","endTime":"', `end_time`, '","duration":', ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2), '}',
']')
WHERE `working_hours` IS NULL OR `working_hours` = '';

-- Paso 3: Calcular weekly_hours basado en días habilitados
UPDATE `work_shifts` 
SET `weekly_hours` = (
  (IF(JSON_CONTAINS(`days_of_week`, '0'), 1, 0) +
   IF(JSON_CONTAINS(`days_of_week`, '1'), 1, 0) +
   IF(JSON_CONTAINS(`days_of_week`, '2'), 1, 0) +
   IF(JSON_CONTAINS(`days_of_week`, '3'), 1, 0) +
   IF(JSON_CONTAINS(`days_of_week`, '4'), 1, 0) +
   IF(JSON_CONTAINS(`days_of_week`, '5'), 1, 0) +
   IF(JSON_CONTAINS(`days_of_week`, '6'), 1, 0)) 
  * ROUND(TIME_TO_SEC(TIMEDIFF(`end_time`, `start_time`))/3600, 2)
);

-- Paso 4: Verificar resultados
SELECT 
  id, 
  name, 
  code,
  weekly_hours,
  LEFT(working_hours, 100) as working_hours_preview,
  start_time as old_start,
  end_time as old_end
FROM work_shifts;
