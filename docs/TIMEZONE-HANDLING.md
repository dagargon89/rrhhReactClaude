# Manejo de Zonas Horarias en el Sistema

## 📋 Resumen

Este documento explica cómo se manejan las fechas y zonas horarias en el sistema de RRHH, específicamente en relación con:
- Almacenamiento de fechas en la base de datos
- Visualización de fechas en el frontend
- Auto check-out de asistencias

## 🗄️ Almacenamiento en Base de Datos

### Campo `date` (tipo DATE en MySQL)
- **Almacenamiento:** Siempre en UTC como medianoche (00:00:00.000Z)
- **Ejemplo:** `2025-11-04T00:00:00.000Z` representa el **4 de noviembre del 2025**
- **Razón:** Los campos DATE en MySQL/PostgreSQL se almacenan sin zona horaria, pero al convertirse a JavaScript Date se interpretan como UTC

```sql
-- En la base de datos
date = '2025-11-04'  -- Representa el 4 de noviembre

-- En JavaScript (después de Prisma)
date = new Date('2025-11-04T00:00:00.000Z')  -- Medianoche UTC del 4 de noviembre
```

### Campos de timestamp (`checkInTime`, `checkOutTime`, `createdAt`, `updatedAt`)
- **Almacenamiento:** En UTC con hora exacta
- **Ejemplo:** `2025-11-04T14:30:00.000Z` = 2:30 PM UTC = 8:30 AM en GMT-6
- **Razón:** Representan momentos exactos en el tiempo, no días del calendario

## 🎨 Visualización en el Frontend

### ❌ Problema Anterior
```typescript
// INCORRECTO - Usa zona horaria local del navegador
new Date(attendance.date).toLocaleDateString()
// Si attendance.date = '2025-11-04T00:00:00.000Z'
// En GMT-7: Muestra "3 de noviembre" ❌
```

### ✅ Solución Implementada
```typescript
// CORRECTO - Usa valores UTC
import { formatDateUTC } from "@/lib/date-utils"

formatDateUTC(attendance.date, { includeWeekday: true, short: true })
// Siempre muestra "4 de noviembre" ✅
```

### Funciones Disponibles en `date-utils.ts`

#### `getTodayDateUTC()`
Obtiene la fecha actual como medianoche UTC usando el calendario local.
```typescript
// Si hoy es 4 de noviembre en tu ubicación
const today = getTodayDateUTC()
// Devuelve: 2025-11-04T00:00:00.000Z
```

#### `formatDateUTC(date, options)`
Formatea fechas usando solo valores UTC (no convierte a zona local).
```typescript
formatDateUTC(date, { includeWeekday: true, short: true })
// Ejemplo: "mar, 4 nov 2025"

formatDateUTC(date, { includeWeekday: true })
// Ejemplo: "martes, 4 de noviembre de 2025"
```

#### `toISODateUTC(date)`
Convierte a formato ISO (YYYY-MM-DD) usando UTC.
```typescript
toISODateUTC(new Date('2025-11-04T00:00:00.000Z'))
// Devuelve: "2025-11-04"
```

#### Otras funciones UTC
- `toYearMonthUTC(date)` → "2025-11"
- `getDayUTC(date)` → 4
- `getWeekdayShortUTC(date)` → "mar"
- `getMonthNameUTC(date)` → "noviembre"
- `getYearUTC(date)` → 2025

## ⚙️ Auto Check-out

### Configuración del Cron Job
```typescript
// src/jobs/autoCheckoutJob.ts
cron.schedule("*/30 * * * *", async () => {
  // Se ejecuta cada 30 minutos
}, {
  timezone: "America/Chihuahua"  // GMT-7 o GMT-6 (según horario de verano)
})
```

### Flujo del Auto Check-out

1. **Buscar asistencias activas del día**
```typescript
const today = getTodayDateUTC()  // Ej: 2025-11-04T00:00:00.000Z

const activeAttendances = await prisma.attendance.findMany({
  where: {
    date: today,  // Filtra registros del 4 de noviembre
    checkInTime: { not: null },
    checkOutTime: null
  }
})
```

2. **Obtener períodos del turno**
```typescript
// ✅ CORRECTO (después de la corrección)
const dayOfWeek = today.getUTCDay()  // Día de la semana UTC
const todayPeriods = shift.periods.filter(p => p.dayOfWeek === dayOfWeek)

// ❌ INCORRECTO (antes de la corrección)
// const dayOfWeek = now.getDay()  // Día de la semana LOCAL
// Problema: Si son las 11 PM del lunes local pero ya es martes en UTC,
// buscaría períodos del lunes cuando el registro es del martes
```

3. **Verificar si pasó la hora de fin del turno**
```typescript
const endHour = Math.floor(Number(lastPeriod.hourTo))  // Ej: 17 (5 PM)
const endMin = Math.round((Number(lastPeriod.hourTo) - endHour) * 60)

const shiftEndTime = new Date(now)
shiftEndTime.setHours(endHour, endMin, 0, 0)  // Usar hora local

// Esta comparación usa hora local del servidor
// IMPORTANTE: El servidor debe estar en la misma zona horaria
// configurada en el cron job (America/Chihuahua)
if (now >= shiftEndTime) {
  // Hacer auto-checkout
}
```

## 🔑 Reglas Clave

### 1. Campo `date` en DB = Día del Calendario en UTC
- Siempre guarda como medianoche UTC: `YYYY-MM-DDT00:00:00.000Z`
- Usa `getTodayDateUTC()` para crear fechas
- Usa `getUTCDay()` para obtener el día de la semana

### 2. Campos de Timestamp = Momento Exacto
- Guarda con hora exacta en UTC
- Se pueden convertir a zona local para visualización
- Usar `toLocaleTimeString()` está bien para mostrar HORAS

### 3. Visualización de Fechas
- **Para fechas (días):** Usar funciones `*UTC()` de `date-utils.ts`
- **Para horas:** Usar `toLocaleTimeString()` está bien

### 4. Comparaciones
- Comparar `date` con `date` → Usar métodos UTC
- Comparar timestamps → Comparación directa está bien

## 🚨 Problemas Comunes

### Problema 1: Fecha se muestra un día antes
```typescript
// ❌ INCORRECTO
new Date('2025-11-04T00:00:00.000Z').toLocaleDateString()
// En GMT-7: "11/3/2025" (día anterior)

// ✅ CORRECTO
formatDateUTC('2025-11-04T00:00:00.000Z')
// "4 de noviembre de 2025"
```

### Problema 2: Auto check-out busca períodos del día incorrecto
```typescript
// ❌ INCORRECTO
const dayOfWeek = now.getDay()  // Usa zona local

// ✅ CORRECTO
const dayOfWeek = today.getUTCDay()  // Usa UTC para consistencia
```

### Problema 3: Servidor en zona horaria diferente
**Solución:** Asegúrate de que el servidor esté configurado en la zona horaria correcta:
```bash
# En el servidor (Linux)
timedatectl set-timezone America/Chihuahua

# O configura la variable de entorno
TZ=America/Chihuahua node server.js
```

## 📊 Ejemplo Completo

```typescript
// Escenario: 3 de noviembre, 11:30 PM en GMT-7 (America/Chihuahua)
const now = new Date()  // 2025-11-03T23:30:00-07:00 = 2025-11-04T06:30:00Z

// Obtener "hoy" según calendario local pero en formato UTC
const today = getTodayDateUTC()  // 2025-11-04T00:00:00.000Z (martes)

// Buscar asistencias
const attendance = await prisma.attendance.findFirst({
  where: {
    date: today  // Busca registros del 4 de noviembre
  }
})

// Obtener día de la semana para buscar períodos
const dayOfWeek = today.getUTCDay()  // 2 (martes en UTC)
const periods = shift.periods.filter(p => p.dayOfWeek === dayOfWeek)
// ✅ Encuentra períodos del martes (correcto!)

// Si hubiéramos usado now.getDay()
const wrongDay = now.getDay()  // 1 (lunes en GMT-7)
// ❌ Buscaría períodos del lunes (incorrecto!)
```

## ✅ Checklist de Verificación

Cuando trabajes con fechas, verifica:

- [ ] ¿Estoy guardando fechas usando `getTodayDateUTC()`?
- [ ] ¿Estoy mostrando fechas usando funciones `*UTC()` de `date-utils.ts`?
- [ ] ¿Estoy comparando `date` con `getUTCDay()` en lugar de `getDay()`?
- [ ] ¿El servidor está en la zona horaria correcta (America/Chihuahua)?
- [ ] ¿El cron job usa la misma zona horaria que el servidor?

## 🔗 Archivos Relacionados

- `src/lib/date-utils.ts` - Funciones de manejo de fechas UTC
- `src/services/autoCheckoutService.ts` - Servicio de auto check-out
- `src/jobs/autoCheckoutJob.ts` - Cron job de auto check-out
- `src/app/(dashboard)/admin/attendance/components/` - Componentes de visualización

---

**Última actualización:** Noviembre 2025
