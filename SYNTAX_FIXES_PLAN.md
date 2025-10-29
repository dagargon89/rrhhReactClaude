# Plan de Corrección de Errores de Sintaxis
**Fecha:** 28 de Octubre de 2025
**Rama:** `claude/fix-syntax-errors-011CUaSZZnMLp2SC6SothF2E`

## Resumen Ejecutivo

Se han identificado **30+ errores de sintaxis y tipo** en **11 archivos** del proyecto HRMS (Sistema de Recursos Humanos). Estos errores impiden que el proyecto compile correctamente con TypeScript y Next.js.

## Estadísticas de Errores

| Categoría | Cantidad |
|-----------|----------|
| Propiedades duplicadas en objetos | 4 |
| Campos/restricciones Prisma inválidos | 3 |
| Incompatibilidad de tipos (object vs string) | 5 |
| Importaciones de iconos incorrectas | 4 |
| Problemas de seguridad null | 1 |
| Módulos faltantes | 1 |
| Problemas de encadenamiento de tipos Zod | 2 |
| Tipos React inválidos | 1 |
| Errores de existencia de propiedades | 2 |
| Problemas de autenticación/callbacks | 3 |

## Archivos Afectados y Plan de Corrección

### 1. tailwind.config.ts
**Prioridad:** Alta
**Errores:** 4 propiedades duplicadas

**Problema:**
- Definiciones duplicadas de `accordion-down` y `accordion-up` en keyframes (líneas 81-96)
- Definiciones duplicadas de animaciones (líneas 101-102)

**Acción:**
- Eliminar las definiciones duplicadas de keyframes (líneas 81-96)
- Eliminar las animaciones duplicadas (líneas 101-102)

---

### 2. src/services/tardinessService.ts
**Prioridad:** Crítica
**Errores:** 3 nombres de restricción únicos incorrectos

**Problema:**
- Uso de `unique_employee_year_month` en lugar de `employeeId_year_month` (líneas 346, 261, 375)
- Este error causará fallos en consultas a la base de datos

**Acción:**
- Reemplazar todas las instancias de `unique_employee_year_month` con `employeeId_year_month`
- Verificar la definición del modelo Prisma para confirmar el nombre correcto

---

### 3. src/services/tardinessProcessingService.ts
**Prioridad:** Crítica
**Errores:** 2 nombres de campo inválidos

**Problema:**
- Campo `affectsSalary` no existe en el modelo (línea 228)
- Campo `approvalDate` debería ser `approvedAt` (línea 411)

**Acción:**
- Eliminar referencia a `affectsSalary` o verificar si debe agregarse al modelo
- Cambiar `approvalDate` por `approvedAt`

---

### 4. src/services/incidentCalculationService.ts
**Prioridad:** Crítica
**Errores:** 5 incompatibilidades de tipo en campo metadata

**Problema:**
- El campo `metadata` espera tipo `string` pero se le asigna un objeto
- Afecta a 5 métodos diferentes:
  - `calculateTurnover` (líneas 76, 112)
  - `calculateAbsenteeism` (línea 189)
  - `calculateTardiness` (línea 262)
  - `calculateOvertime` (línea 339)

**Acción:**
- Serializar objetos a JSON string usando `JSON.stringify()` antes de asignar a metadata
- Ejemplo: `metadata: JSON.stringify({ ... })`

---

### 5. src/lib/auth.ts
**Prioridad:** Crítica
**Errores:** 3 problemas de tipo y propiedades faltantes

**Problema:**
- Parámetro `credentials` sin tipo apropiado (línea 28)
- Propiedad `employee` no existe en el objeto user (línea 60)
- Tipos incompatibles en comparación de passwords (línea 41)

**Acción:**
- Agregar tipo explícito para `credentials`: `Record<"email" | "password", string> | undefined`
- Incluir relación `employee` en la consulta Prisma con `include: { employee: true }`
- Asegurar tipos correctos en toda la función authorize

---

### 6. src/components/ui/sonner.tsx
**Prioridad:** Alta
**Errores:** 4 nombres de iconos incorrectos

**Problema:**
- `CircleCheck` no existe → usar `CheckCircle2` o `Check`
- `LoaderCircle` no existe → usar `Loader2`
- `OctagonX` no existe → usar `X` o `AlertCircle`
- `TriangleAlert` no existe → usar `AlertTriangle`

**Acción:**
- Actualizar importaciones con los nombres correctos de lucide-react
- Actualizar referencias en el código

---

### 7. src/app/layout.tsx
**Prioridad:** Media
**Errores:** 1 tipo React inválido

**Problema:**
- `React.Node` no existe (línea 16)
- El tipo correcto es `React.ReactNode`

**Acción:**
- Cambiar `React.Node` por `React.ReactNode`

---

### 8. src/components/ui/toaster.tsx
**Prioridad:** Alta
**Errores:** Ruta de importación incorrecta + tipos implícitos

**Problema:**
- Importación desde `@/components/hooks/use-toast` que no existe (línea 3)
- Tipos implícitos 'any' en destructuración (líneas 18, 31, 35, 42)

**Acción:**
- Corregir ruta de importación a `@/hooks/use-toast`
- Agregar tipos explícitos o crear el archivo use-toast.ts si no existe

---

### 9. src/app/api/work-shifts/route.ts
**Prioridad:** Media
**Errores:** 1 problema de seguridad con null

**Problema:**
- `JSON.parse()` no maneja valores null (línea 84)
- `workingHours` puede ser `string | null`

**Acción:**
- Agregar verificación null: `workingHours: workShift.workingHours ? JSON.parse(workShift.workingHours) : null`

---

### 10. src/lib/validations/tardinessRule.ts
**Prioridad:** Alta
**Errores:** 1 problema de encadenamiento Zod

**Problema:**
- `.partial()` no está disponible en tipo `ZodEffects` (línea 30)
- El método se aplica después de `.refine()`

**Acción:**
- Reestructurar esquema para aplicar `.partial()` antes de `.refine()`
- O crear un nuevo esquema de actualización sin el refine

---

### 11. src/lib/validations/disciplinaryRule.ts
**Prioridad:** Alta
**Errores:** 1 problema de encadenamiento Zod

**Problema:**
- Mismo problema que tardinessRule.ts (línea 35)

**Acción:**
- Misma solución: aplicar `.partial()` antes de `.refine()`

---

## Orden de Ejecución

### Fase 1: Errores Críticos (Impiden funcionamiento)
1. ✅ incidentCalculationService.ts - Serialización de metadata
2. ✅ tardinessService.ts - Nombres de restricciones Prisma
3. ✅ tardinessProcessingService.ts - Campos inválidos
4. ✅ auth.ts - Tipos de autenticación y relaciones

### Fase 2: Errores Altos (Impiden compilación)
5. ✅ sonner.tsx - Iconos de lucide-react
6. ✅ toaster.tsx - Ruta de importación
7. ✅ tardinessRule.ts - Encadenamiento Zod
8. ✅ disciplinaryRule.ts - Encadenamiento Zod
9. ✅ tailwind.config.ts - Propiedades duplicadas

### Fase 3: Errores Medios (Mejoras de tipo)
10. ✅ layout.tsx - Tipo React correcto
11. ✅ work-shifts/route.ts - Seguridad null

## Verificación Post-Corrección

Una vez aplicadas todas las correcciones:

1. ✅ Instalar dependencias: `npm install`
2. ✅ Generar cliente Prisma: `npx prisma generate`
3. ✅ Ejecutar build: `npm run build`
4. ✅ Verificar tipos: `npx tsc --noEmit`
5. ✅ Commit y push a la rama

## Notas Importantes

- Todos los errores son legítimos y deben corregirse para que el proyecto compile
- Los errores relacionados con Prisma requieren verificar el schema.prisma
- Los cambios en auth.ts pueden requerir actualizar tipos de NextAuth
- Es recomendable ejecutar tests después de las correcciones

## Tiempo Estimado

- Corrección de errores: 45-60 minutos
- Pruebas y verificación: 15-20 minutos
- **Total estimado:** 1-1.5 horas

---

**Estado:** En Progreso
**Última Actualización:** 28 de Octubre de 2025
