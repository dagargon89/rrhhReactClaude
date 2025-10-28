# 🔧 Solución: Error de Migración MySQL

## Problema Resuelto

El error se debía a que MySQL (versiones < 8.0.13) no permite valores por defecto en columnas TEXT/JSON.

He corregido el schema de Prisma eliminando el `@default("[]")` del campo `attachments`.

## Pasos para Arreglar

### Opción 1: Reset de Prisma (RECOMENDADO - Borra todos los datos)

```bash
# 1. Resetea Prisma completamente
npx prisma migrate reset

# Esto hará:
# - Eliminar la base de datos hrms_db
# - Crearla de nuevo
# - Aplicar las migraciones
# - Ejecutar el seed automáticamente

# 2. Verifica que todo esté bien
npx prisma studio
```

### Opción 2: Manual (Si quieres conservar datos)

```bash
# 1. Elimina la migración fallida
# En tu explorador de archivos, ve a:
# C:\Users\david\Documents\React Projects\rrhhReactClaude\prisma\migrations
# Y ELIMINA la carpeta: 20251022213212_init

# 2. Elimina la tabla _prisma_migrations en MySQL
mysql -u root hrms_db
DROP TABLE IF EXISTS _prisma_migrations;
exit;

# 3. Ahora ejecuta la migración de nuevo
npx prisma migrate dev --name init

# 4. Ejecuta el seed
npx prisma db seed
```

### Opción 3: Desde Cero (Más Simple)

```bash
# 1. Elimina la base de datos
mysql -u root
DROP DATABASE IF EXISTS hrms_db;
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 2. Ejecuta la migración
npx prisma migrate dev --name init

# 3. Ejecuta el seed
npx prisma db seed
```

## ✅ Después de Arreglar

Una vez que la migración se complete exitosamente, ejecuta:

```bash
# 1. Abre Prisma Studio para verificar
npx prisma studio

# 2. Inicia el servidor
npm run dev

# 3. Ve a http://localhost:3000
# 4. Inicia sesión con: admin@hrms.com / admin123
```

## 🔍 Verificar que Todo Funciona

Abre Prisma Studio:
```bash
npx prisma studio
```

Deberías ver todas estas tablas:
- users
- employees
- departments
- positions
- work_shifts
- schedules
- attendances
- leave_types
- leave_balances
- leave_requests
- incident_types
- incident_configs
- incidents

## ❓ Si Algo Sale Mal

Si obtienes otro error:

1. **Copia el error completo**
2. **Verifica que MySQL esté corriendo en Laragon**
3. **Ejecuta el diagnóstico:**
   ```bash
   node diagnostico-mysql.js
   ```
4. **Intenta con Opción 1 (Reset completo)**

## 📝 Cambios Realizados

He modificado el archivo `prisma/schema.prisma`:

**Antes:**
```prisma
attachments     String             @default("[]") @db.Text
```

**Después:**
```prisma
attachments     String?            @db.Text // JSON array of file URLs
```

Ahora el campo es opcional (puede ser null) en lugar de tener un valor por defecto.

---

**Ejecuta la Opción 1 (Reset) para continuar** ⬇️
