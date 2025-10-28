# HRMS - Sistema de Gestión de Recursos Humanos

Sistema completo de gestión de recursos humanos construido con Next.js 14, TypeScript, Prisma y MySQL.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- MySQL 8.0+
- npm 9+

### Instalación

1. **Clonar el repositorio (si aplica)**
   ```bash
   cd "C:\Users\david\Documents\React Projects\rrhhReactClaude"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar MySQL**

   Asegúrate de que MySQL esté corriendo en `localhost:3306` con usuario `root` sin contraseña.

   Crea la base de datos:
   ```sql
   CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Configurar variables de entorno**

   El archivo `.env.local` ya está creado con la configuración correcta:
   ```env
   DATABASE_URL="mysql://root@localhost:3306/hrms_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="hrms-secret-key-change-in-production-1234567890"
   ```

5. **Generar cliente de Prisma**
   ```bash
   npx prisma generate
   ```

6. **Ejecutar migraciones**
   ```bash
   npx prisma migrate dev --name init
   ```

7. **Seed de datos iniciales (opcional)**
   ```bash
   npx prisma db seed
   ```

8. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

9. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📊 Gestión de Base de Datos

### Prisma Studio
Para ver y editar los datos en una interfaz visual:
```bash
npx prisma studio
```

### Crear nueva migración
```bash
npx prisma migrate dev --name nombre_de_migracion
```

### Reset de base de datos (CUIDADO: Borra todos los datos)
```bash
npx prisma migrate reset
```

## 🏗️ Estructura del Proyecto

```
rrhhReactClaude/
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── api/              # API Routes
│   │   ├── (auth)/           # Rutas de autenticación
│   │   ├── (dashboard)/      # Rutas protegidas
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Página home
│   │   └── globals.css       # Estilos globales
│   ├── components/            # Componentes React
│   │   └── providers.tsx     # Providers (Session, Query, Theme)
│   ├── lib/                   # Utilidades y configuración
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── auth.ts           # Configuración NextAuth
│   │   ├── utils.ts          # Utilidades generales
│   │   └── validations/      # Esquemas Zod
│   └── types/                 # Tipos TypeScript
├── .env.local                 # Variables de entorno
├── next.config.js             # Configuración Next.js
├── tailwind.config.ts         # Configuración Tailwind
├── tsconfig.json              # Configuración TypeScript
└── package.json               # Dependencias

```

## 🔑 Usuarios por Defecto

Después del seed, puedes usar:

- **Super Admin:**
  - Email: `admin@hrms.com`
  - Password: `admin123`

- **HR Manager:**
  - Email: `hr@hrms.com`
  - Password: `hr123`

- **Empleado:**
  - Email: `empleado@hrms.com`
  - Password: `empleado123`

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build            # Construye la aplicación
npm start                # Inicia servidor de producción

# Base de Datos
npx prisma generate      # Genera cliente Prisma
npx prisma migrate dev   # Crea y aplica migraciones
npx prisma studio        # Abre Prisma Studio
npx prisma db seed       # Ejecuta seed

# Testing
npm run test             # Ejecuta tests unitarios
npm run test:e2e         # Ejecuta tests E2E
npm run test:coverage    # Genera reporte de cobertura

# Calidad de Código
npm run lint             # Ejecuta ESLint
npm run format           # Formatea código con Prettier
```

## 🔧 Tecnologías Principales

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5
- **Base de Datos:** MySQL 8
- **ORM:** Prisma 5
- **Autenticación:** NextAuth.js v5
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand + TanStack Query
- **Validación:** Zod
- **Forms:** React Hook Form

## 📚 Próximos Pasos

1. **Crear usuario administrador inicial** (si no usaste seed)
2. **Configurar departamentos y posiciones**
3. **Agregar empleados**
4. **Configurar turnos de trabajo**
5. **Definir tipos de permisos**

## 🐛 Solución de Problemas

### 🚨 ¿Usas Laragon con MySQL?

**Lee el archivo `SOLUCION-LARAGON.md` para solucionar problemas de conexión a MySQL.**

O ejecuta el diagnóstico automático:
```bash
npm install
node diagnostico-mysql.js
```

### Error de conexión a MySQL
```bash
# Verifica que MySQL esté corriendo
mysql -u root -p

# Verifica que la base de datos exista
SHOW DATABASES;
```

### Error "Prisma Client not generated"
```bash
npx prisma generate
```

### Error de migraciones
```bash
# Resetea las migraciones (CUIDADO: Borra datos)
npx prisma migrate reset

# O crea una nueva migración
npx prisma migrate dev --name fix_migration
```

### Problemas con node_modules
```bash
# Limpia e instala de nuevo
rd /s /q node_modules
npm install
```

## 📖 Documentación

Consulta el archivo `CLAUDE.md` para la documentación completa del proyecto, incluyendo:
- Estructura detallada de la base de datos
- Guías de desarrollo
- Convenciones de código
- Ejemplos de implementación
- API Routes disponibles

## 🤝 Contribución

1. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
2. Commit tus cambios (`git commit -m 'feat: Agrega nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
4. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado con Next.js y TypeScript**
