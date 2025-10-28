# 📝 Variables de Entorno - Explicación

## ¿Por qué hay DOS archivos de variables?

### `.env` (para Prisma)
- **Usado por:** Prisma CLI
- **Contiene:** Solo `DATABASE_URL`
- **Cuándo se usa:** Al ejecutar comandos de Prisma (`prisma migrate`, `prisma generate`, etc.)

### `.env.local` (para Next.js)
- **Usado por:** Next.js y la aplicación en runtime
- **Contiene:** Todas las variables de entorno (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- **Cuándo se usa:** Cuando ejecutas `npm run dev` o `npm start`

## ⚠️ IMPORTANTE

**Necesitas AMBOS archivos:**

1. **`.env`** - Para que Prisma funcione
2. **`.env.local`** - Para que Next.js funcione

## 🔧 Configuración Actual

### Archivo: `.env`
```env
DATABASE_URL="mysql://root@localhost:3306/hrms_db"
```

### Archivo: `.env.local`
```env
# Database MySQL
DATABASE_URL="mysql://root@localhost:3306/hrms_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="hrms-secret-key-change-in-production-1234567890"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
LOG_LEVEL="debug"
```

## 🎯 Configuración para Laragon

Si usas Laragon, asegúrate de que AMBOS archivos tengan la misma `DATABASE_URL`.

### Opciones de DATABASE_URL (prueba en orden):

**1. Sin contraseña (más común en Laragon):**
```env
DATABASE_URL="mysql://root@localhost:3306/hrms_db"
```

**2. Con contraseña "root":**
```env
DATABASE_URL="mysql://root:root@localhost:3306/hrms_db"
```

**3. Usando 127.0.0.1:**
```env
DATABASE_URL="mysql://root@127.0.0.1:3306/hrms_db"
```

**4. Puerto alternativo 3307:**
```env
DATABASE_URL="mysql://root@localhost:3307/hrms_db"
```

## 🚀 Cómo Actualizar

Si cambias la configuración de MySQL:

1. **Actualiza AMBOS archivos:**
   - `.env`
   - `.env.local`

2. **Regenera Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 🔍 Verificar Configuración

Para ver qué variables de entorno está usando tu aplicación:

```bash
# Ver variables de Prisma
npx prisma -v

# Ejecutar diagnóstico de MySQL
node diagnostico-mysql.js
```

## 🛡️ Seguridad

- ✅ `.env` y `.env.local` están en `.gitignore`
- ✅ Nunca se suben a Git
- ✅ Cada desarrollador debe crear sus propios archivos
- ✅ Usa `.env.example` como plantilla

## 📋 Checklist

Antes de ejecutar la aplicación, verifica:

- [ ] Existe el archivo `.env` con `DATABASE_URL`
- [ ] Existe el archivo `.env.local` con todas las variables
- [ ] La `DATABASE_URL` es la misma en ambos archivos
- [ ] MySQL está corriendo en Laragon
- [ ] La base de datos `hrms_db` existe

---

**Recuerda:** Si tienes problemas de conexión, ejecuta: `node diagnostico-mysql.js`
