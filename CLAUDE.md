# Sistema de Recursos Humanos - HR Management System

## 📋 Descripción del Proyecto
Sistema completo de gestión de recursos humanos con funcionalidades de:
- Gestión de empleados y usuarios
- Control de asistencias con check-in/check-out automático
- Turnos y horarios flexibles/establecidos
- Gestión de vacaciones y permisos
- Cálculo automático de incidencias (rotación, ausentismo, etc.)
- Paneles administrativos y de empleado

## 🛠️ Stack Tecnológico

### Core
- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript 5+
- **Base de datos:** PostgreSQL 15+
- **ORM:** Prisma 5+
- **Autenticación:** NextAuth.js v5 (Auth.js)
- **Validaciones:** Zod

### Frontend
- **UI Framework:** Tailwind CSS
- **Componentes:** shadcn/ui (Radix UI)
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Tablas:** TanStack Table
- **Gráficas:** Recharts
- **Icons:** Lucide React

### Backend & Servicios
- **Tareas programadas:** node-cron + BullMQ + Redis
- **Email:** Nodemailer / Resend
- **File Upload:** UploadThing / AWS S3
- **Logging:** Winston / Pino

## 📁 Estructura del Proyecto

```
src/
├── app/                       # Next.js App Router
│   ├── (auth)/                # Rutas de autenticación
│   ├── (dashboard)/           # Rutas protegidas
│   │   ├── admin/             # Panel administrativo
│   │   └── employee/          # Panel empleado
│   └── api/                   # API Routes
├── components/                # Componentes reutilizables
│   ├── ui/                    # Componentes shadcn/ui
│   └── layout/                # Layout components
├── lib/                       # Utilidades y configuraciones
├── hooks/                     # Custom hooks
├── services/                  # Servicios de negocio
└── types/                     # Definiciones TypeScript
```

## 🎯 Funcionalidades Clave

### 1. Auto Check-out
Sistema automático que registra la salida de empleados al final del turno.

### 2. Cálculo de Incidencias
Procesamiento automático de:
- Tardanzas
- Ausencias
- Rotación de personal
- Métricas de productividad

### 3. Flujo de Aprobación de Vacaciones
Sistema de aprobación con notificaciones automáticas.

## 🚀 Comandos Importantes

### Desarrollo
```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Desarrollo
npm run dev

# Build producción
npm run build

# Tests
npm run test
npm run test:e2e
```

### Prisma
```bash
# Crear migración
npx prisma migrate dev --name migration_name

# Aplicar migraciones
npx prisma migrate deploy

# Reset base de datos (desarrollo)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio
```

### Docker
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🔧 Variables de Entorno

### .env.local
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hrms_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis
REDIS_URL="redis://localhost:6379"

# Email
RESEND_API_KEY="re_123456789"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload
UPLOADTHING_SECRET="sk_live_123456789"
UPLOADTHING_APP_ID="app_123456789"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 📝 Convenciones de Código

### TypeScript/Next.js
- **Nomenclatura:** PascalCase para componentes, camelCase para funciones
- **Estructura:** Un componente por archivo
- **API Routes:** Usar Next.js Route Handlers
- **Validaciones:** Zod para schemas
- **Custom Hooks:** Prefijo `use`

### Estructura de Componentes
```typescript
// Componente funcional con TypeScript
interface ComponentProps {
  title: string;
  children: React.ReactNode;
}

export const Component = ({ title, children }: ComponentProps) => {
  return (
    <div className="p-4">
      <h1>{title}</h1>
      {children}
    </div>
  );
};
```

## 🔐 Sistema de Permisos

### Roles
- **ADMIN:** Acceso completo al sistema
- **HR:** Gestión de empleados y reportes
- **MANAGER:** Gestión de su departamento
- **EMPLOYEE:** Acceso a su perfil y solicitudes

### Middleware
Protección de rutas basada en roles con Next.js middleware.

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📋 Próximos Pasos

1. **Setup Inicial:** Configurar base de datos y autenticación
2. **Módulo Empleados:** CRUD completo de empleados
3. **Módulo Asistencias:** Sistema de check-in/check-out
4. **Módulo Vacaciones:** Gestión de permisos y vacaciones
5. **Módulo Incidencias:** Cálculo automático de métricas
6. **Testing y Deploy:** Pruebas y despliegue a producción

---

**Nota:** Este archivo contiene la información esencial del proyecto. Para detalles específicos de implementación, consultar los archivos de código fuente.