# 🚀 Inicio Rápido - HRMS

## Paso 1: Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias del proyecto. Tomará unos minutos.

## Paso 2: Verificar MySQL

Asegúrate de que MySQL esté corriendo:

```bash
mysql -u root
```

Si funciona, crea la base de datos:

```sql
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

## Paso 3: Configurar Prisma

Genera el cliente de Prisma:

```bash
npx prisma generate
```

Ejecuta las migraciones:

```bash
npx prisma migrate dev --name init
```

## Paso 4: Cargar Datos Iniciales

```bash
npx prisma db seed
```

Esto creará:
- Usuario administrador (admin@hrms.com / admin123)
- Departamentos de ejemplo (TI, RRHH, Ventas)
- Posiciones de trabajo
- Turnos de trabajo
- Tipos de permisos
- Balance de vacaciones

## Paso 5: Iniciar el Servidor

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

## 🔑 Credenciales de Acceso

**Email:** admin@hrms.com
**Password:** admin123

## ✅ Verificar que Todo Funciona

1. Ve a http://localhost:3000
2. Deberías ser redirigido a /login
3. Ingresa con las credenciales de admin
4. Deberías ver el dashboard de administrador

## 🛠️ Herramientas Útiles

### Prisma Studio
Para ver y editar la base de datos visualmente:

```bash
npx prisma studio
```

Esto abrirá http://localhost:5555 con una interfaz gráfica.

## ❓ Problemas Comunes

### Error: "Can't reach database server"
- Verifica que MySQL esté corriendo
- Verifica que la URL en .env.local sea correcta: `mysql://root@localhost:3306/hrms_db`

### Error: "Prisma Client not generated"
Ejecuta:
```bash
npx prisma generate
```

### Error: "Module not found"
Limpia node_modules e instala de nuevo:
```bash
rd /s /q node_modules
npm install
```

### La página no carga
- Asegúrate de que el servidor esté corriendo (`npm run dev`)
- Verifica que no haya otro proceso usando el puerto 3000

## 📚 Siguiente Pasos

1. Explora el dashboard de administrador
2. Crea nuevos departamentos
3. Agrega empleados
4. Configura turnos de trabajo
5. Prueba el sistema de check-in/check-out

## 🎯 Funcionalidades Principales

- ✅ Autenticación con NextAuth
- ✅ Gestión de empleados
- ✅ Departamentos y posiciones
- ✅ Turnos de trabajo
- ✅ Sistema de permisos
- ⏳ Check-in/Check-out (próximamente)
- ⏳ Solicitud de vacaciones (próximamente)
- ⏳ Reportes e incidencias (próximamente)

## 📖 Documentación Completa

Consulta el archivo `CLAUDE.md` para la documentación técnica completa.
