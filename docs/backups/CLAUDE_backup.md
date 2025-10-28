# Sistema de Recursos Humanos - HR Management System

## 📋 Descripción del Proyecto
Sistema completo de gestión de recursos humanos similar a módulos de Odoo, con funcionalidades de:
- Gestión de empleados y usuarios
- Control de asistencias con check-in/check-out automático
- Turnos y horarios flexibles/establecidos
- Gestión de vacaciones y permisos
- Cálculo automático de incidencias (rotación, ausentismo, etc.)
- Paneles administrativos y de empleado

## 🛠️ Stack Tecnológico

### Full Stack Framework
- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript 5+
- **Runtime:** Node.js 18+
- **Base de datos:** PostgreSQL 15+
- **ORM:** Prisma 5+
- **Autenticación:** NextAuth.js v5 (Auth.js)
- **Validaciones:** Zod
- **API:** Next.js Route Handlers (App Router)

### Frontend
- **UI Framework:** Tailwind CSS
- **Componentes:** shadcn/ui (Radix UI) - Sistema de componentes open-source
- **State Management:** Zustand + React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Tablas:** TanStack Table (React Table v8)
- **Gráficas:** Recharts
- **Calendario:** React Big Calendar
- **Date handling:** date-fns
- **Icons:** Lucide React
- **Notifications:** Sonner (Toast notifications)

### Backend & Servicios
- **Tareas programadas:** node-cron + BullMQ + Redis
- **Email:** Nodemailer / Resend
- **File Upload:** UploadThing / AWS S3
- **Logging:** Winston / Pino
- **Rate Limiting:** @upstash/ratelimit

### DevOps
- **Containerización:** Docker + Docker Compose
- **Variables de entorno:** dotenv
- **Migraciones:** Prisma Migrations
- **Testing:** Vitest + React Testing Library + Playwright
- **Code Quality:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged

---

## 📁 Estructura del Proyecto

```
hr-management-system/
├── prisma/
│   ├── schema.prisma              # Esquema de base de datos
│   ├── migrations/                # Migraciones de Prisma
│   └── seed.ts                    # Datos iniciales
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Grupo de rutas de autenticación
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/           # Grupo de rutas protegidas
│   │   │   ├── admin/             # Panel administrativo
│   │   │   │   ├── employees/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── departments/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── attendance/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── schedules/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── leaves/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── incidents/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── employee/          # Panel empleado
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── attendance/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── leaves/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── employees/
│   │   │   │   ├── route.ts       # GET, POST /api/employees
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET, PUT, DELETE /api/employees/[id]
│   │   │   ├── departments/
│   │   │   │   └── route.ts
│   │   │   ├── positions/
│   │   │   │   └── route.ts
│   │   │   ├── attendance/
│   │   │   │   ├── route.ts
│   │   │   │   ├── check-in/
│   │   │   │   │   └── route.ts
│   │   │   │   └── check-out/
│   │   │   │       └── route.ts
│   │   │   ├── schedules/
│   │   │   │   └── route.ts
│   │   │   ├── leaves/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── approve/
│   │   │   │       │   └── route.ts
│   │   │   │       └── reject/
│   │   │   │           └── route.ts
│   │   │   ├── incidents/
│   │   │   │   └── route.ts
│   │   │   └── reports/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Estilos globales
│   │
│   ├── components/                # Componentes reutilizables
│   │   ├── ui/                    # Componentes base shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                # Componentes de layout
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── employees/             # Componentes de empleados
│   │   │   ├── EmployeeList.tsx
│   │   │   ├── EmployeeForm.tsx
│   │   │   ├── EmployeeCard.tsx
│   │   │   └── EmployeeFilters.tsx
│   │   │
│   │   ├── attendance/            # Componentes de asistencia
│   │   │   ├── AttendanceBoard.tsx
│   │   │   ├── CheckInButton.tsx
│   │   │   ├── CheckOutButton.tsx
│   │   │   └── AttendanceCalendar.tsx
│   │   │
│   │   ├── schedules/             # Componentes de horarios
│   │   │   ├── ShiftCalendar.tsx
│   │   │   ├── ShiftForm.tsx
│   │   │   └── ScheduleAssignment.tsx
│   │   │
│   │   ├── leaves/                # Componentes de vacaciones
│   │   │   ├── LeaveRequestForm.tsx
│   │   │   ├── LeaveApprovals.tsx
│   │   │   ├── LeaveBalance.tsx
│   │   │   └── LeaveCalendar.tsx
│   │   │
│   │   ├── incidents/             # Componentes de incidencias
│   │   │   ├── IncidentDashboard.tsx
│   │   │   ├── IncidentCharts.tsx
│   │   │   └── IncidentConfig.tsx
│   │   │
│   │   └── common/                # Componentes comunes
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── DataTable.tsx
│   │       └── ...
│   │
│   ├── lib/                       # Utilidades y configuración
│   │   ├── prisma.ts              # Cliente Prisma singleton
│   │   ├── auth.ts                # Configuración NextAuth
│   │   ├── redis.ts               # Cliente Redis
│   │   ├── email.ts               # Configuración email
│   │   ├── utils.ts               # Utilidades generales
│   │   ├── validations/           # Esquemas Zod
│   │   │   ├── employee.ts
│   │   │   ├── attendance.ts
│   │   │   ├── leave.ts
│   │   │   └── ...
│   │   └── constants.ts           # Constantes de la app
│   │
│   ├── services/                  # Lógica de negocio
│   │   ├── employeeService.ts     # Servicios de empleados
│   │   ├── attendanceService.ts   # Servicios de asistencia
│   │   ├── scheduleService.ts     # Servicios de horarios
│   │   ├── leaveService.ts        # Servicios de vacaciones
│   │   ├── incidentService.ts     # Servicios de incidencias
│   │   └── reportService.ts       # Servicios de reportes
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── useEmployees.ts
│   │   ├── useAttendance.ts
│   │   └── ...
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── ...
│   │
│   ├── types/                     # TypeScript types
│   │   ├── employee.ts
│   │   ├── attendance.ts
│   │   ├── schedule.ts
│   │   ├── leave.ts
│   │   ├── incident.ts
│   │   └── index.ts
│   │
│   ├── jobs/                      # Tareas programadas
│   │   ├── autoCheckout.ts        # Auto-checkout diario
│   │   ├── calculateIncidents.ts  # Cálculo de incidencias
│   │   └── scheduler.ts           # Configuración de cron jobs
│   │
│   └── middleware.ts              # Next.js middleware
│
├── public/
│   ├── images/
│   └── uploads/
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── playwright/
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── components.json              # shadcn/ui config
└── README.md
```

---

## 🎨 Sistema de Componentes shadcn/ui

### Configuración
El proyecto utiliza [shadcn/ui](https://ui.shadcn.com/) como sistema de componentes principal. shadcn/ui es un sistema de componentes open-source que proporciona:

- **Open Code:** Código abierto y modificable
- **Composition:** Interfaz común y predecible
- **Distribution:** CLI para distribuir componentes
- **Beautiful Defaults:** Estilos cuidadosamente elegidos
- **AI-Ready:** Optimizado para herramientas de IA

### Componentes Instalados
```bash
# Componentes base
npx shadcn@latest add button card input label

# Componentes de formularios
npx shadcn@latest add form select textarea checkbox radio-group switch

# Componentes de navegación
npx shadcn@latest add tabs accordion navigation-menu breadcrumb pagination

# Componentes de datos
npx shadcn@latest add table badge avatar skeleton progress

# Componentes de interacción
npx shadcn@latest add dropdown-menu alert-dialog dialog sheet popover

# Componentes de notificación
npx shadcn@latest add toast sonner

# Componentes avanzados
npx shadcn@latest add command calendar scroll-area separator tooltip hover-card context-menu menubar slider toggle toggle-group resizable aspect-ratio kbd
```

### Estructura de Componentes
```
src/components/ui/
├── accordion.tsx       # Acordeones colapsables
├── alert-dialog.tsx    # Diálogos de confirmación
├── aspect-ratio.tsx    # Contenedores con proporción
├── avatar.tsx          # Avatares de usuario
├── badge.tsx           # Etiquetas y badges
├── breadcrumb.tsx      # Navegación de migas de pan
├── button.tsx          # Botones con variantes
├── calendar.tsx        # Calendarios
├── card.tsx            # Tarjetas de contenido
├── checkbox.tsx        # Casillas de verificación
├── command.tsx         # Comandos y búsqueda
├── context-menu.tsx    # Menús contextuales
├── dialog.tsx          # Diálogos modales
├── dropdown-menu.tsx   # Menús desplegables
├── form.tsx            # Formularios con validación
├── hover-card.tsx      # Tarjetas con hover
├── input.tsx           # Campos de entrada
├── kbd.tsx             # Teclas de teclado
├── label.tsx           # Etiquetas de formulario
├── menubar.tsx         # Barras de menú
├── navigation-menu.tsx # Navegación principal
├── pagination.tsx       # Paginación
├── popover.tsx         # Popovers
├── progress.tsx        # Barras de progreso
├── radio-group.tsx     # Grupos de radio
├── resizable.tsx       # Paneles redimensionables
├── scroll-area.tsx     # Áreas con scroll
├── select.tsx          # Selectores
├── separator.tsx       # Separadores
├── sheet.tsx           # Hojas laterales
├── skeleton.tsx        # Esqueletos de carga
├── slider.tsx          # Deslizadores
├── sonner.tsx          # Sistema de notificaciones
├── switch.tsx          # Interruptores
├── table.tsx           # Tablas de datos
├── tabs.tsx            # Pestañas
├── textarea.tsx        # Áreas de texto
├── toast.tsx           # Notificaciones toast
├── toggle.tsx          # Botones toggle
├── toggle-group.tsx    # Grupos de toggle
├── tooltip.tsx         # Tooltips
└── toaster.tsx         # Contenedor de toasts
```

### Uso de Componentes
```typescript
// Ejemplo de uso de componentes shadcn/ui
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function EmployeeForm() {
  const handleSubmit = () => {
    toast.success("Empleado creado exitosamente")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Empleado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" placeholder="Juan" />
            </div>
            <Button type="submit">Crear Empleado</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Personalización
Los componentes de shadcn/ui se pueden personalizar fácilmente:

```typescript
// src/components/ui/button.tsx
import { cn } from "@/lib/utils"

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  )
}
```

### Ventajas de shadcn/ui
- ✅ **Código abierto:** Control total sobre los componentes
- ✅ **Accesibilidad:** Basado en Radix UI primitives
- ✅ **Consistencia:** Diseño unificado en toda la aplicación
- ✅ **Personalización:** Fácil modificación y extensión
- ✅ **AI-Friendly:** Optimizado para herramientas de IA
- ✅ **TypeScript:** Soporte completo de tipos

### Casos de Uso en el Sistema HR

#### **Gestión de Empleados**
```typescript
// Tabla de empleados con paginación
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Formularios de empleados
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
```

#### **Control de Asistencias**
```typescript
// Calendario de asistencias
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"

// Botones de check-in/check-out
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
```

#### **Gestión de Vacaciones**
```typescript
// Formulario de solicitud de vacaciones
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"

// Aprobación de vacaciones
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog"
```

#### **Dashboard y Reportes**
```typescript
// Dashboard con métricas
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Navegación
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
```

#### **Notificaciones y Feedback**
```typescript
// Notificaciones toast
import { toast } from "sonner"
import { Toaster } from "@/components/ui/toaster"

// Tooltips informativos
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

---

## 🏗️ Arquitectura y Patrones de Desarrollo - Módulo de Usuarios

### Resumen Ejecutivo
Este módulo sirve como **plantilla de referencia** para todos los CRUDs del sistema. Implementa las mejores prácticas de Next.js 14 con App Router, shadcn/ui, y arquitectura Server/Client Components.

### 📋 Estructura de Archivos Completa

```
src/app/(dashboard)/admin/users/
├── page.tsx                          # Server Component - Lista principal
├── new/
│   └── page.tsx                      # Client Component - Formulario creación
├── [id]/
│   ├── page.tsx                      # Server Component - Vista detalle
│   └── edit/
│       └── page.tsx                  # Client Component - Formulario edición
└── components/
    ├── UsersTable.tsx                # Client Component - Tabla con filtros
    └── UserActions.tsx               # Client Component - Acciones por fila

src/app/api/users/
├── route.ts                          # GET (listar), POST (crear)
└── [id]/
    ├── route.ts                      # GET (obtener), PUT (actualizar), DELETE (eliminar)
    └── create-employee/
        └── route.ts                  # POST (crear empleado desde usuario)

src/lib/validations/
└── user.ts                           # Esquemas Zod para validación
```

---

### 🎨 **1. Página Principal - Lista con Estadísticas**

**Archivo:** `src/app/(dashboard)/admin/users/page.tsx`

#### Características Clave:
- ✅ **Server Component** - Carga inicial de datos optimizada
- ✅ **Estadísticas en Cards** - KPIs principales con gradientes
- ✅ **Tabla con componente cliente** - Separación de responsabilidades
- ✅ **Serialización de datos** - Conversión de Dates para componentes cliente

#### Estructura del Código:

```typescript
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, User, UserPlus, Shield, UserCheck } from "lucide-react"
import Link from "next/link"
import { UsersTable } from "./components/UsersTable"

// Función Server-Side para obtener datos
async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  return users
}

export default async function UsersPage() {
  const users = await getUsers()

  // Cálculo de estadísticas
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.isActive).length
  const adminUsers = users.filter(user => user.isSuperuser || user.isStaff).length
  const usersWithEmployee = users.filter(user => user.employee).length

  // Serialización de datos para componentes cliente
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null,
    lastLogin: user.lastLogin?.toISOString() || null,
    employee: user.employee ? {
      ...user.employee,
      dateOfBirth: user.employee.dateOfBirth?.toISOString() || null,
      hireDate: user.employee.hireDate.toISOString(),
      createdAt: user.employee.createdAt.toISOString(),
      updatedAt: user.employee.updatedAt.toISOString(),
    } : null,
  }))

  return (
    <div className="space-y-8">
      {/* Header con título y botón de acción */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Usuarios
            </h1>
            <p className="text-lg text-muted-foreground">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>

        {/* Estadísticas en Cards con gradientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Usuarios */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">
                Total Usuarios
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalUsers}</div>
              <p className="text-xs text-blue-700 mt-1">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          {/* Card: Usuarios Activos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">
                Usuarios Activos
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{activeUsers}</div>
              <p className="text-xs text-green-700 mt-1">
                {((activeUsers / totalUsers) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Card: Administradores */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">
                Administradores
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{adminUsers}</div>
              <p className="text-xs text-purple-700 mt-1">
                Con permisos administrativos
              </p>
            </CardContent>
          </Card>

          {/* Card: Con Empleado */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">
                Con Empleado
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserPlus className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{usersWithEmployee}</div>
              <p className="text-xs text-orange-700 mt-1">
                Tienen empleado asociado
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de usuarios con búsqueda y filtros */}
      <UsersTable users={serializedUsers} />
    </div>
  )
}
```

#### Patrón de Diseño - Estadísticas:
- **4 Cards principales** en grid responsive
- **Gradientes temáticos** por tipo de métrica
- **Iconos contextuales** en círculos de color
- **Métricas principales** en texto grande
- **Descripción secundaria** con contexto adicional
- **Porcentajes calculados** cuando sea relevante

---

### 🔍 **2. Componente de Tabla con Búsqueda y Filtros**

**Archivo:** `src/app/(dashboard)/admin/users/components/UsersTable.tsx`

#### Características Clave:
- ✅ **Client Component** - Interactividad completa
- ✅ **Búsqueda en tiempo real** - Sin llamadas al servidor
- ✅ **Múltiples filtros** - Combinables entre sí
- ✅ **useMemo** - Optimización de performance
- ✅ **Tabs** - Vistas predefinidas (Todos, Activos, Admins, Con Empleado)

#### Estructura del Código:

```typescript
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { UserActions } from "./UserActions"

interface UsersTableProps {
  users: any[]
}

export function UsersTable({ users }: UsersTableProps) {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [employeeFilter, setEmployeeFilter] = useState("all")

  // Filtrado optimizado con useMemo
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filtro de búsqueda (nombre, email, username)
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.username && user.username.toLowerCase().includes(searchLower))

      // Filtro de rol
      const matchesRole = 
        roleFilter === "all" ||
        (roleFilter === "superuser" && user.isSuperuser) ||
        (roleFilter === "staff" && user.isStaff && !user.isSuperuser) ||
        (roleFilter === "user" && !user.isStaff && !user.isSuperuser)

      // Filtro de estado
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive)

      // Filtro de empleado
      const matchesEmployee = 
        employeeFilter === "all" ||
        (employeeFilter === "with" && user.employee) ||
        (employeeFilter === "without" && !user.employee)

      return matchesSearch && matchesRole && matchesStatus && matchesEmployee
    })
  }, [users, searchTerm, roleFilter, statusFilter, employeeFilter])

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
    setEmployeeFilter("all")
  }

  const hasActiveFilters = searchTerm || roleFilter !== "all" || statusFilter !== "all" || employeeFilter !== "all"

  // Función para renderizar la tabla
  const renderTable = (usersToShow: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Empleado</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Registrado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usersToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <User className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron usuarios con los filtros aplicados" : "No hay usuarios registrados"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          usersToShow.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              {/* Contenido de las celdas */}
              <TableCell className="text-right">
                <UserActions user={user} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="active">Activos</TabsTrigger>
        <TabsTrigger value="admins">Administradores</TabsTrigger>
        <TabsTrigger value="employees">Con Empleado</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Lista de Usuarios
                </CardTitle>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Barra de búsqueda y filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro de Rol */}
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <Shield className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="superuser">Super Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Estado */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <UserCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Empleado */}
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger>
                    <UserPlus className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with">Con empleado</SelectItem>
                    <SelectItem value="without">Sin empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Indicador de resultados */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {filteredUsers.length} de {users.length} usuarios
                </Badge>
                {hasActiveFilters && (
                  <span className="text-xs">Filtros aplicados</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderTable(filteredUsers)}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tabs adicionales con filtros predefinidos */}
      <TabsContent value="active">
        {/* Similar estructura con filtro predefinido */}
      </TabsContent>
    </Tabs>
  )
}
```

#### Patrón de Búsqueda y Filtros:
- **Input con icono** para búsqueda visual
- **Select components** para filtros categóricos
- **Grid responsive** de 1 columna móvil, 4 en desktop
- **Badge de resultados** para feedback inmediato
- **Botón "Limpiar filtros"** condicional
- **Estados vacíos** con mensajes contextuales

---

### ⚡ **3. Componente de Acciones por Fila**

**Archivo:** `src/app/(dashboard)/admin/users/components/UserActions.tsx`

#### Características Clave:
- ✅ **Botones cuadrados** simples y directos
- ✅ **4 acciones principales** - Ver, Editar, Crear/Ver Empleado, Eliminar
- ✅ **AlertDialog** para confirmación de eliminación
- ✅ **Estados de carga** con spinners
- ✅ **Lógica condicional** para botón de empleado

#### Estructura del Código:

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, UserPlus, Loader2, UserCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface UserActionsProps {
  user: any
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [creatingEmployee, setCreatingEmployee] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Usuario eliminado exitosamente")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar usuario")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar usuario")
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateEmployee = async () => {
    setCreatingEmployee(true)
    try {
      const response = await fetch(`/api/users/${user.id}/create-employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const employee = await response.json()
        toast.success(`Empleado creado exitosamente con código: ${employee.employeeCode}`)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear empleado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al crear empleado")
    } finally {
      setCreatingEmployee(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón Ver */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/users/${user.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Editar */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/users/${user.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      {/* Botón Crear/Ver Empleado (condicional) */}
      {!user.employee ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateEmployee}
          disabled={creatingEmployee}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          {creatingEmployee ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/employees/${user.employee.id}`}>
            <UserCheck className="h-4 w-4" />
          </Link>
        </Button>
      )}

      {/* Botón Eliminar con AlertDialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              ¿Eliminar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
              <span className="font-semibold">{user.firstName} {user.lastName}</span>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
```

#### Patrón de Acciones:
- **4 botones cuadrados** en flex horizontal
- **Solo iconos** sin texto para compactar
- **Colores temáticos** (verde para crear, rojo para eliminar)
- **Estados de carga** en botones asíncronos
- **AlertDialog** para acciones destructivas
- **Lógica condicional** para botones dinámicos

---

### 📋 **4. Formulario de Creación**

**Archivo:** `src/app/(dashboard)/admin/users/new/page.tsx`

#### Características Clave:
- ✅ **React Hook Form** - Manejo de formularios
- ✅ **Zod validation** - Validación de esquemas
- ✅ **Cards agrupados** - Por sección lógica
- ✅ **Iconos contextuales** - Feedback visual
- ✅ **Estados de carga** - UX mejorada

#### Estructura de Cards:
1. **Información de la Cuenta** - Email, Username, Password
2. **Información Personal** - Nombre, Apellido
3. **Roles y Estado** - Checkboxes para permisos

#### Patrón de Formulario:
```typescript
// Imports
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Esquema de validación
const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3).max(50),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  isActive: z.boolean().default(true),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
})

type CreateUserForm = z.infer<typeof createUserSchema>

// Componente
export default function NewUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      isActive: true,
      isStaff: false,
      isSuperuser: false,
    },
  })

  const onSubmit = async (data: CreateUserForm) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Usuario creado exitosamente")
        router.push("/admin/users")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear usuario")
      }
    } catch (error) {
      toast.error("Error al crear usuario")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Nuevo Usuario
          </h1>
          <p className="text-muted-foreground">
            Crear un nuevo usuario en el sistema
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      {/* Formulario */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Card: Información de la Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Información de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campos del formulario */}
          </CardContent>
        </Card>

        {/* Card: Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campos del formulario */}
          </CardContent>
        </Card>

        {/* Card: Roles y Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Roles y Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Checkboxes con feedback visual */}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
```

---

### 👁️ **5. Vista de Detalle**

**Archivo:** `src/app/(dashboard)/admin/users/[id]/page.tsx`

#### Características Clave:
- ✅ **Server Component** - Carga de datos optimizada
- ✅ **Cards informativos** - Información agrupada
- ✅ **Badges temáticos** - Estado visual
- ✅ **Botones de acción** - Editar, Eliminar

#### Estructura de Cards:
1. **Información de la Cuenta** - Email, Username, Fechas
2. **Información Personal** - Nombre completo
3. **Roles y Permisos** - Badges de roles
4. **Empleado Asociado** - Si existe

---

### 🗄️ **6. API Routes**

#### **Listar y Crear - `/api/users/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createUserSchema } from "@/lib/validations/user"
import bcrypt from "bcryptjs"

// GET - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    )
  }
}

// POST - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Verificar email único
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Verificar username único
    if (validatedData.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: validatedData.username },
      })

      if (existingUsername) {
        return NextResponse.json(
          { error: "El nombre de usuario ya está en uso" },
          { status: 400 }
        )
      }
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      include: {
        employee: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}
```

#### **Obtener, Actualizar y Eliminar - `/api/users/[id]/route.ts`**

```typescript
// GET - Obtener un usuario
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Verificaciones de unicidad (email, username)
    // Hash de contraseña si se proporciona
    // Actualizar usuario

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        employee: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}
```

---

### 📝 **7. Validaciones Zod**

**Archivo:** `src/lib/validations/user.ts`

```typescript
import { z } from "zod"

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50),
  isActive: z.boolean().default(true),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
})

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
```

---

### 🎯 **Checklist de Implementación para Nuevos CRUDs**

Al implementar un nuevo CRUD (ej: Departamentos, Posiciones, etc.), seguir este checklist:

#### **Estructura de Archivos:**
- [ ] Crear carpeta en `src/app/(dashboard)/admin/[nombre]/`
- [ ] Crear `page.tsx` (lista principal)
- [ ] Crear `new/page.tsx` (formulario creación)
- [ ] Crear `[id]/page.tsx` (vista detalle)
- [ ] Crear `[id]/edit/page.tsx` (formulario edición)
- [ ] Crear `components/` con componentes auxiliares

#### **Componentes:**
- [ ] Componente tabla con búsqueda y filtros (client)
- [ ] Componente de acciones por fila (client)
- [ ] Página principal con estadísticas (server)
- [ ] Formulario con React Hook Form + Zod
- [ ] Vista de detalle con cards informativos

#### **API Routes:**
- [ ] `api/[nombre]/route.ts` con GET (listar) y POST (crear)
- [ ] `api/[nombre]/[id]/route.ts` con GET, PUT, DELETE
- [ ] Autenticación y autorización en cada endpoint
- [ ] Validación con esquemas Zod
- [ ] Manejo de errores consistente

#### **Validaciones:**
- [ ] Crear esquema Zod en `src/lib/validations/[nombre].ts`
- [ ] Esquema de creación (`create`)
- [ ] Esquema de actualización (`update`)
- [ ] Exportar tipos TypeScript

#### **UI/UX:**
- [ ] Header con título gradient + botón "Nuevo"
- [ ] Grid de estadísticas (2-4 cards)
- [ ] Búsqueda con icono y placeholder
- [ ] Filtros con Select components
- [ ] Tabs para vistas predefinidas
- [ ] Botones de acción cuadrados con iconos
- [ ] AlertDialog para confirmaciones
- [ ] Estados de carga con spinners
- [ ] Notificaciones con Sonner (toast)

#### **Performance:**
- [ ] useMemo para filtrado de listas
- [ ] Server Components para carga de datos
- [ ] Client Components solo para interactividad
- [ ] Serialización de fechas para props

#### **Accesibilidad:**
- [ ] Labels en todos los inputs
- [ ] Aria-labels en botones de iconos
- [ ] Keyboard navigation funcional
- [ ] Estados vacíos con mensajes

---

### 🚀 **Ventajas de Este Patrón**

#### **Arquitectura:**
- ✅ **Separación clara** Server/Client Components
- ✅ **Performance optimizado** con carga incremental
- ✅ **Type safety** con TypeScript + Zod
- ✅ **Code reusability** con componentes compartidos

#### **UX/UI:**
- ✅ **Búsqueda instantánea** sin latencia
- ✅ **Filtros combinables** para búsqueda precisa
- ✅ **Feedback visual** en todas las acciones
- ✅ **Estados de carga** para operaciones asíncronas
- ✅ **Confirmaciones** para acciones destructivas

#### **Mantenibilidad:**
- ✅ **Código consistente** en todos los CRUDs
- ✅ **Fácil de extender** con nuevas funcionalidades
- ✅ **Validaciones centralizadas** con Zod
- ✅ **API routes estandarizadas** con patrones claros

#### **Escalabilidad:**
- ✅ **Paginación preparada** para grandes datasets
- ✅ **Filtros extensibles** sin refactorización
- ✅ **Componentes reutilizables** en otros módulos
- ✅ **Estructura modular** fácil de mantener

---

## 📝 **Formularios CRUD - Patrón Completo**

### Resumen Ejecutivo
Esta sección documenta los tres tipos de formularios/vistas del CRUD: **Crear**, **Ver** y **Editar**. Cada uno sigue un patrón específico optimizado para su propósito.

---

### 🆕 **Formulario de Creación (NEW)**

**Archivo:** `src/app/(dashboard)/admin/users/new/page.tsx`

#### **Características Principales:**
- ✅ **Client Component** - Manejo de formularios en el cliente
- ✅ **React Hook Form** - Gestión eficiente del estado del formulario
- ✅ **Zod Validation** - Validación de esquemas en tiempo real
- ✅ **Cards agrupados** - Información organizada por categorías
- ✅ **Validación en tiempo real** - Feedback inmediato
- ✅ **Preview de permisos** - Muestra resumen dinámico de roles
- ✅ **Estados de carga** - Spinners durante submit
- ✅ **Alert informativo** - Explica los roles del sistema

#### **Estructura de Cards:**
1. **Alert Informativo** - Explicación de roles (opcional, contextual)
2. **Información de la Cuenta** - Email, Username, Password
3. **Información Personal** - Nombre, Apellido
4. **Roles y Permisos** - Checkboxes + Resumen dinámico

#### **Implementación Completa:**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Save, 
  UserPlus, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  UserCheck,
  Info
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación Zod
const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(50).optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

export default function NewUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      isStaff: false,
      isSuperuser: false,
      isActive: true,
    },
  })

  // Watch para el resumen dinámico
  const watchedValues = watch()

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Usuario creado exitosamente")
        reset()
        router.push("/admin/users")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al crear usuario")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header con botón de retorno */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear Nuevo Usuario
          </h1>
          <p className="text-lg text-muted-foreground">
            Agrega un nuevo usuario al sistema con roles y permisos
          </p>
        </div>
      </div>

      {/* Alert informativo sobre roles */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p className="font-medium">Información sobre roles:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Usuario: Acceso básico al sistema
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Staff: Acceso a paneles administrativos
              </Badge>
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Super Admin: Acceso total al sistema
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Información de la cuenta */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Información de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  {...register("email")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Nombre de usuario (Opcional)
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="nombredeusuario"
                  {...register("username")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.username && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isLoading}
                className="h-11"
              />
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Información personal */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Juan"
                  {...register("firstName")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Apellido *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Pérez"
                  {...register("lastName")}
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Roles y permisos */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Roles y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Checkbox: isActive */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive" 
                  {...register("isActive")} 
                  disabled={isLoading}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Usuario activo
                </Label>
              </div>

              <Separator />

              {/* Checkbox: isStaff */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isStaff" 
                  {...register("isStaff")} 
                  disabled={isLoading}
                />
                <Label htmlFor="isStaff" className="text-sm font-medium">
                  Es Staff (Puede acceder a paneles de administración)
                </Label>
              </div>

              {/* Checkbox: isSuperuser */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isSuperuser" 
                  {...register("isSuperuser")} 
                  disabled={isLoading}
                />
                <Label htmlFor="isSuperuser" className="text-sm font-medium">
                  Es Superusuario (Acceso total al sistema)
                </Label>
              </div>
            </div>

            {/* Resumen dinámico de permisos */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Resumen de permisos:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {watchedValues.isActive ? "Usuario activo" : "Usuario inactivo"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {watchedValues.isStaff ? "Acceso a paneles administrativos" : "Sin acceso administrativo"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">
                    {watchedValues.isSuperuser ? "Acceso total al sistema" : "Acceso limitado"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            asChild
            disabled={isLoading}
          >
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando usuario...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
```

#### **Patrón de Formulario de Creación:**
- ✅ **Header** - Título con gradiente + botón retorno
- ✅ **Alert informativo** - Contexto sobre el formulario (opcional)
- ✅ **Cards temáticos** - Agrupados por tipo de información
- ✅ **Validación Zod** - Esquema definido y resolver
- ✅ **React Hook Form** - `useForm` con `register` y `handleSubmit`
- ✅ **Watch para preview** - Resumen dinámico de valores
- ✅ **Errores visuales** - Iconos + mensajes debajo de inputs
- ✅ **Estados de carga** - Spinner en botón submit
- ✅ **Notificaciones** - Toast con Sonner
- ✅ **Reset form** - Limpiar después de crear
- ✅ **Redirección** - Volver a lista después de éxito

---

### 👁️ **Vista de Detalle (VIEW)**

**Archivo:** `src/app/(dashboard)/admin/users/[id]/page.tsx`

#### **Características Principales:**
- ✅ **Server Component** - Carga de datos optimizada
- ✅ **Avatar** - Foto de perfil con fallback de iniciales
- ✅ **Badges temáticos** - Estado, rol, empleado
- ✅ **Cards informativos** - Información agrupada por categoría
- ✅ **Separadores** - Divisiones visuales claras
- ✅ **Botón de edición** - Acceso rápido a formulario
- ✅ **Link a empleado** - Si existe relación
- ✅ **Formato de fechas** - Localizado en español
- ✅ **Grid responsive** - 2 columnas en desktop

#### **Estructura de Cards:**
1. **Información de la Cuenta** - Email, Username, Fechas
2. **Información Personal** - Nombre, Apellido, Verificación
3. **Roles y Permisos** - Estado, Staff, Superuser + Resumen
4. **Información del Empleado** - Si existe (condicional)

#### **Implementación Completa:**

```typescript
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  User, 
  Calendar, 
  Shield, 
  UserCheck, 
  ShieldCheck,
  Clock,
  Building2,
  Briefcase,
  UserX
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    },
  })

  return user
}

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  // Funciones de formato de fechas
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatDateShort = (date: Date | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-8">
      {/* Header con avatar y nombre */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href={`/admin/users/${user.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Usuario
          </Link>
        </Button>
      </div>

      {/* Badges de estado y rol */}
      <div className="flex flex-wrap gap-3">
        {/* Badge de estado */}
        {user.isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <UserX className="h-3 w-3 mr-1" />
            Inactivo
          </Badge>
        )}

        {/* Badge de rol */}
        {user.isSuperuser ? (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        ) : user.isStaff ? (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Staff
          </Badge>
        ) : (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            Usuario
          </Badge>
        )}

        {/* Badge de empleado */}
        {user.employee && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Empleado: {user.employee.employeeCode}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Información de la Cuenta */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Información de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Campo: Email */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {/* Campo: Username */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre de Usuario
                  </p>
                  <p className="font-medium">{user.username || "No configurado"}</p>
                </div>
              </div>

              {/* Campo: Fecha de Registro */}
              <div className="flex items-start justify-between py-3 border-b">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Registro
                  </p>
                  <p className="font-medium">{formatDateShort(user.createdAt)}</p>
                </div>
              </div>

              {/* Campo: Último Acceso */}
              <div className="flex items-start justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Último Acceso
                  </p>
                  <p className="font-medium">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Información Personal */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campos de información personal */}
            {/* ... similar al Card 1 ... */}
          </CardContent>
        </Card>

        {/* Card 3: Roles y Permisos */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Roles y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Estado, Staff, Superuser con badges */}
              {/* ... */}
            </div>

            {/* Resumen de permisos */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Resumen de Permisos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {user.isSuperuser && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Acceso total al sistema
                  </li>
                )}
                {/* ... más permisos ... */}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Información del Empleado (condicional) */}
        {user.employee ? (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-600" />
                Información del Empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información del empleado + botón ver detalles */}
              {/* ... */}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <UserCheck className="h-5 w-5" />
                Sin Empleado Asociado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Este usuario no tiene un perfil de empleado asociado.
              </p>
              <Button variant="outline" asChild>
                <Link href="/admin/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a la Lista
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

#### **Patrón de Vista de Detalle:**
- ✅ **Server Component** - Carga de datos con Prisma
- ✅ **Avatar prominente** - 16x16 con iniciales fallback
- ✅ **Header con gradiente** - Título grande y descriptivo
- ✅ **Badges informativos** - Estado, rol, empleado
- ✅ **Grid 2 columnas** - Responsive (1 col móvil)
- ✅ **Cards temáticos** - Iconos de color por categoría
- ✅ **Separadores visuales** - Border-b entre campos
- ✅ **Formato de fechas** - Localizado con Intl
- ✅ **Condicionales** - Mostrar solo si hay datos
- ✅ **Botón de edición** - Fácil acceso
- ✅ **Links relacionados** - Navegar a empleado
- ✅ **Estado vacío** - Card dashed para sin empleado

---

### ✏️ **Formulario de Edición (EDIT)**

**Archivo:** `src/app/(dashboard)/admin/users/[id]/edit/page.tsx`

#### **Características Principales:**
- ✅ **Client Component** - Formulario interactivo
- ✅ **React Hook Form** - Gestión de estado
- ✅ **Zod Validation** - Validación de esquemas
- ✅ **Carga de datos** - useEffect para fetch inicial
- ✅ **Skeleton loading** - Estados de carga elegantes
- ✅ **Reset con datos** - Pre-llenado del formulario
- ✅ **Preview dinámico** - Resumen de permisos actualizado
- ✅ **Card de empleado** - Si existe relación
- ✅ **Nota sobre password** - No editable desde aquí

#### **Diferencias con Formulario de Creación:**
- ❌ **Sin campo password** - No se edita aquí
- ✅ **Carga inicial de datos** - useEffect + fetch
- ✅ **Skeleton mientras carga** - Mejor UX
- ✅ **Reset con valores** - Pre-populate form
- ✅ **PUT en lugar de POST** - Método HTTP
- ✅ **Redirección a detalle** - En lugar de lista
- ✅ **Card de empleado asociado** - Info adicional

#### **Implementación Completa:**

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  User, 
  Mail, 
  UserCheck,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Esquema de validación (sin password)
const updateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3).max(50).optional().or(z.literal("")),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

type UpdateUserFormData = z.infer<typeof updateUserSchema>

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  })

  const watchedValues = watch()

  // Cargar datos del usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        
        if (response.ok) {
          const user = await response.json()
          setUserData(user)
          // Reset form con datos del usuario
          reset({
            email: user.email,
            username: user.username || "",
            firstName: user.firstName,
            lastName: user.lastName,
            isStaff: user.isStaff,
            isSuperuser: user.isSuperuser,
            isActive: user.isActive,
          })
        } else {
          toast.error("Error al cargar los datos del usuario")
          router.push("/admin/users")
        }
      } catch (error) {
        toast.error("Error al cargar los datos del usuario")
        router.push("/admin/users")
      } finally {
        setLoadingData(false)
      }
    }
    
    loadUser()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdateUserFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Usuario actualizado exitosamente")
        router.push(`/admin/users/${params.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar usuario")
      }
    } catch (error) {
      toast.error("Error de red o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  // Skeleton mientras carga
  if (loadingData) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Estado de no encontrado
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Usuario no encontrado</h3>
            <p className="text-sm text-muted-foreground">
              El usuario que buscas no existe o ha sido eliminado
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/users/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Editar Usuario
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar información de {userData.firstName} {userData.lastName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: Información de la cuenta */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Información de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email y Username (igual que crear) */}
              {/* ... */}
            </div>

            {/* Nota sobre contraseña */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> La contraseña no se puede cambiar desde este formulario. 
                Para cambiar la contraseña, utiliza la función de recuperación de contraseña.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Información personal */}
        {/* ... igual que formulario de creación ... */}

        {/* Card 3: Roles y permisos */}
        {/* ... igual que formulario de creación con resumen dinámico ... */}

        {/* Card 4: Información del empleado asociado (si existe) */}
        {userData.employee && (
          <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <UserCheck className="h-5 w-5" />
                Empleado Asociado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Código de Empleado:</span>
                  <Badge className="font-mono">{userData.employee.employeeCode}</Badge>
                </div>
                {userData.employee.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Departamento:</span>
                    <span className="font-medium">{userData.employee.department.name}</span>
                  </div>
                )}
                <Separator />
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/admin/employees/${userData.employee.id}`}>
                    Ver Detalles del Empleado
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            asChild
            disabled={isLoading}
          >
            <Link href={`/admin/users/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando cambios...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
```

#### **Patrón de Formulario de Edición:**
- ✅ **Client Component** con useEffect
- ✅ **Carga inicial** - fetch + reset form
- ✅ **Skeleton loading** - Mientras carga datos
- ✅ **Estado de error** - Si no encuentra recurso
- ✅ **Sin campo password** - Nota explicativa
- ✅ **Misma validación** - Excepto password
- ✅ **PUT request** - Actualizar existente
- ✅ **Card de empleado** - Border lateral naranja
- ✅ **Redirección a detalle** - Después de guardar
- ✅ **Preview dinámico** - Igual que crear
- ✅ **Botón cancelar** - Vuelve a detalle

---

### 📊 **Comparación de los Tres Formularios**

| Característica | Crear (NEW) | Ver (VIEW) | Editar (EDIT) |
|----------------|-------------|------------|---------------|
| Tipo de componente | Client | Server | Client |
| React Hook Form | ✅ | ❌ | ✅ |
| Zod Validation | ✅ | ❌ | ✅ |
| useEffect | ❌ | ❌ | ✅ (carga datos) |
| Campo Password | ✅ | ❌ | ❌ (nota) |
| Skeleton Loading | ❌ | ❌ | ✅ |
| Avatar | ❌ | ✅ (grande) | ❌ |
| Badges en header | ❌ | ✅ | ❌ |
| Resumen dinámico | ✅ | ✅ (estático) | ✅ |
| Método HTTP | POST | GET | PUT |
| Redirección | Lista | N/A | Detalle |
| Alert informativo | ✅ | ❌ | ❌ |
| Card empleado | ❌ | ✅ | ✅ (border) |
| Botón editar | ❌ | ✅ | ❌ |
| Grid responsive | ❌ | ✅ (2 cols) | ❌ |

---

### 🎯 **Checklist para Implementar Formularios**

#### **Formulario de Creación:**
- [ ] Definir esquema Zod completo
- [ ] Configurar React Hook Form con resolver
- [ ] Agregar Alert informativo contextual
- [ ] Crear cards temáticos por categoría
- [ ] Implementar validación en tiempo real
- [ ] Agregar resumen dinámico con watch()
- [ ] Manejar estados de carga (isLoading)
- [ ] Implementar notificaciones (toast)
- [ ] Limpiar formulario después de crear (reset)
- [ ] Redireccionar a lista después de éxito

#### **Vista de Detalle:**
- [ ] Fetch de datos con Prisma (Server Component)
- [ ] Agregar Avatar con fallback de iniciales
- [ ] Mostrar badges de estado/rol/empleado
- [ ] Crear grid de 2 columnas responsive
- [ ] Agrupar información en cards temáticos
- [ ] Formatear fechas con Intl
- [ ] Agregar separadores entre campos
- [ ] Incluir botón de edición prominente
- [ ] Manejar cards condicionales (empleado)
- [ ] Implementar estado de "no encontrado"

#### **Formulario de Edición:**
- [ ] Definir esquema Zod (sin password)
- [ ] Configurar React Hook Form con resolver
- [ ] Implementar useEffect para carga de datos
- [ ] Agregar Skeleton loading
- [ ] Reset form con datos cargados
- [ ] Agregar nota sobre password
- [ ] Mostrar card de empleado asociado
- [ ] Implementar resumen dinámico
- [ ] Manejar estado de "no encontrado"
- [ ] Redireccionar a detalle después de éxito

---

### 🚀 **Ventajas de Este Patrón**

#### **Consistencia:**
- ✅ **Misma estructura** en todos los CRUDs
- ✅ **Mismo diseño visual** con gradientes y shadows
- ✅ **Mismos componentes** de shadcn/ui
- ✅ **Misma organización** de cards

#### **UX Optimizada:**
- ✅ **Validación inmediata** con Zod + RHF
- ✅ **Feedback visual** en cada acción
- ✅ **Estados de carga** claros
- ✅ **Preview dinámico** de valores
- ✅ **Navegación intuitiva** entre vistas

#### **Performance:**
- ✅ **Server Components** para vistas
- ✅ **Client Components** solo para formularios
- ✅ **Skeleton loading** para mejor UX
- ✅ **Validación client-side** reduce requests

#### **Mantenibilidad:**
- ✅ **Código predecible** en todos los módulos
- ✅ **Fácil de replicar** para nuevos CRUDs
- ✅ **Validación centralizada** con Zod
- ✅ **Componentes reutilizables** de shadcn/ui

---

## 🗄️ Estructura de Base de Datos (Prisma Schema)

### Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USUARIOS ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String?   @unique
  password      String
  emailVerified DateTime? @map("email_verified")
  image         String?
  isActive      Boolean   @default(true) @map("is_active")
  isStaff       Boolean   @default(false) @map("is_staff")
  isSuperuser   Boolean   @default(false) @map("is_superuser")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  lastLogin     DateTime? @map("last_login")

  // Relaciones
  employee       Employee?
  sessions       Session[]
  accounts       Account[]
  approvedLeaves LeaveRequest[] @relation("ApprovedBy")

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ==================== EMPLEADOS ====================

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN

  @@map("employment_type")
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  TERMINATED

  @@map("employee_status")
}

model Employee {
  id             String         @id @default(cuid())
  userId         String         @unique @map("user_id")
  employeeCode   String         @unique @map("employee_code")
  firstName      String         @map("first_name")
  lastName       String         @map("last_name")
  dateOfBirth    DateTime?      @map("date_of_birth")
  phone          String?
  address        String?
  departmentId   String?        @map("department_id")
  positionId     String?        @map("position_id")
  hireDate       DateTime       @map("hire_date")
  employmentType EmploymentType @default(FULL_TIME) @map("employment_type")
  status         EmployeeStatus @default(ACTIVE)
  profilePicture String?        @map("profile_picture")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  // Relaciones
  user               User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  department         Department?     @relation("EmployeeDepartment", fields: [departmentId], references: [id])
  position           Position?       @relation(fields: [positionId], references: [id])
  managedDepartments Department[]    @relation("DepartmentManager")
  attendances        Attendance[]
  schedules          Schedule[]
  leaveRequests      LeaveRequest[]
  leaveBalances      LeaveBalance[]
  incidents          Incident[]

  @@index([employeeCode])
  @@index([departmentId, status])
  @@map("employees")
}

model Department {
  id                 String      @id @default(cuid())
  name               String
  code               String      @unique
  description        String?
  managerId          String?     @map("manager_id")
  parentDepartmentId String?     @map("parent_department_id")
  isActive           Boolean     @default(true) @map("is_active")
  createdAt          DateTime    @default(now()) @map("created_at")
  updatedAt          DateTime    @updatedAt @map("updated_at")

  // Relaciones
  manager          Employee?         @relation("DepartmentManager", fields: [managerId], references: [id])
  parentDepartment Department?       @relation("SubDepartments", fields: [parentDepartmentId], references: [id])
  subDepartments   Department[]      @relation("SubDepartments")
  employees        Employee[]        @relation("EmployeeDepartment")
  positions        Position[]
  incidentConfigs  IncidentConfig[]
  incidents        Incident[]

  @@map("departments")
}

enum PositionLevel {
  ENTRY
  MID
  SENIOR
  MANAGER
  DIRECTOR

  @@map("position_level")
}

model Position {
  id           String        @id @default(cuid())
  title        String
  code         String        @unique
  description  String?
  departmentId String        @map("department_id")
  level        PositionLevel @default(ENTRY)
  isActive     Boolean       @default(true) @map("is_active")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  // Relaciones
  department Department @relation(fields: [departmentId], references: [id])
  employees  Employee[]

  @@map("positions")
}

// ==================== HORARIOS Y TURNOS ====================

model WorkShift {
  id                  String   @id @default(cuid())
  name                String
  code                String   @unique
  startTime           String   @map("start_time") // Formato: "HH:mm"
  endTime             String   @map("end_time")   // Formato: "HH:mm"
  isFlexible          Boolean  @default(false) @map("is_flexible")
  gracePeriodMinutes  Int      @default(0) @map("grace_period_minutes")
  autoCheckoutEnabled Boolean  @default(false) @map("auto_checkout_enabled")
  autoCheckoutTime    String?  @map("auto_checkout_time") // Formato: "HH:mm"
  daysOfWeek          Int[]    @map("days_of_week") // [0,1,2,3,4] 0=Monday
  isActive            Boolean  @default(true) @map("is_active")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  // Relaciones
  schedules Schedule[]

  @@map("work_shifts")
}

model Schedule {
  id         String   @id @default(cuid())
  employeeId String   @map("employee_id")
  shiftId    String   @map("shift_id")
  date       DateTime @db.Date
  isOverride Boolean  @default(false) @map("is_override")
  notes      String?
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  // Relaciones
  employee    Employee     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  shift       WorkShift    @relation(fields: [shiftId], references: [id])
  attendances Attendance[]

  @@unique([employeeId, date])
  @@index([employeeId])
  @@index([date])
  @@map("schedules")
}

// ==================== ASISTENCIAS ====================

enum CheckMethod {
  MANUAL
  AUTO
  BIOMETRIC

  @@map("check_method")
}

enum AttendanceStatus {
  PRESENT
  LATE
  ABSENT
  HALF_DAY
  ON_LEAVE

  @@map("attendance_status")
}

model Attendance {
  id                String           @id @default(cuid())
  employeeId        String           @map("employee_id")
  scheduleId        String?          @map("schedule_id")
  date              DateTime         @db.Date
  checkInTime       DateTime?        @map("check_in_time")
  checkInMethod     CheckMethod?     @map("check_in_method")
  checkInLocation   Json?            @map("check_in_location") // {lat, lng}
  checkOutTime      DateTime?        @map("check_out_time")
  checkOutMethod    CheckMethod?     @map("check_out_method")
  checkOutLocation  Json?            @map("check_out_location") // {lat, lng}
  workedHours       Decimal          @default(0) @map("worked_hours") @db.Decimal(5, 2)
  overtimeHours     Decimal          @default(0) @map("overtime_hours") @db.Decimal(5, 2)
  status            AttendanceStatus @default(PRESENT)
  isAutoCheckout    Boolean          @default(false) @map("is_auto_checkout")
  notes             String?
  createdAt         DateTime         @default(now()) @map("created_at")
  updatedAt         DateTime         @updatedAt @map("updated_at")

  // Relaciones
  employee Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  schedule Schedule? @relation(fields: [scheduleId], references: [id])

  @@index([employeeId])
  @@index([date])
  @@index([status])
  @@map("attendances")
}

// ==================== VACACIONES Y PERMISOS ====================

enum LeaveTypeName {
  VACATION
  SICK_LEAVE
  PERSONAL
  MATERNITY
  PATERNITY
  UNPAID

  @@map("leave_type_name")
}

model LeaveType {
  id               String        @id @default(cuid())
  name             LeaveTypeName @unique
  code             String        @unique
  description      String?
  requiresApproval Boolean       @default(true) @map("requires_approval")
  maxDaysPerYear   Int?          @map("max_days_per_year")
  isPaid           Boolean       @default(true) @map("is_paid")
  color            String        @default("#3B82F6") // Hex color
  isActive         Boolean       @default(true) @map("is_active")
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")

  // Relaciones
  leaveBalances  LeaveBalance[]
  leaveRequests  LeaveRequest[]

  @@map("leave_types")
}

model LeaveBalance {
  id           String   @id @default(cuid())
  employeeId   String   @map("employee_id")
  leaveTypeId  String   @map("leave_type_id")
  year         Int
  totalDays    Decimal  @map("total_days") @db.Decimal(5, 2)
  usedDays     Decimal  @default(0) @map("used_days") @db.Decimal(5, 2)
  pendingDays  Decimal  @default(0) @map("pending_days") @db.Decimal(5, 2)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relaciones
  employee  Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  leaveType LeaveType @relation(fields: [leaveTypeId], references: [id])

  @@unique([employeeId, leaveTypeId, year])
  @@map("leave_balances")
}

enum LeaveRequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED

  @@map("leave_request_status")
}

model LeaveRequest {
  id              String             @id @default(cuid())
  employeeId      String             @map("employee_id")
  leaveTypeId     String             @map("leave_type_id")
  startDate       DateTime           @map("start_date") @db.Date
  endDate         DateTime           @map("end_date") @db.Date
  totalDays       Decimal            @map("total_days") @db.Decimal(5, 2)
  reason          String
  status          LeaveRequestStatus @default(PENDING)
  requestedAt     DateTime           @default(now()) @map("requested_at")
  approvedById    String?            @map("approved_by_id")
  approvedAt      DateTime?          @map("approved_at")
  rejectionReason String?            @map("rejection_reason")
  attachments     Json[]             @default([]) // Array of file URLs
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  // Relaciones
  employee   Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  leaveType  LeaveType @relation(fields: [leaveTypeId], references: [id])
  approvedBy User?     @relation("ApprovedBy", fields: [approvedById], references: [id])

  @@index([employeeId])
  @@index([status])
  @@index([startDate])
  @@map("leave_requests")
}

// ==================== INCIDENCIAS ====================

enum IncidentTypeName {
  TURNOVER
  ABSENTEEISM
  TARDINESS
  OVERTIME

  @@map("incident_type_name")
}

enum CalculationMethod {
  RATE
  COUNT
  AVERAGE

  @@map("calculation_method")
}

model IncidentType {
  id                String            @id @default(cuid())
  name              IncidentTypeName  @unique
  code              String            @unique
  description       String?
  calculationMethod CalculationMethod @default(RATE) @map("calculation_method")
  isActive          Boolean           @default(true) @map("is_active")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  // Relaciones
  configs   IncidentConfig[]
  incidents Incident[]

  @@map("incident_types")
}

enum ThresholdOperator {
  GT
  LT
  GTE
  LTE
  EQ

  @@map("threshold_operator")
}

enum PeriodType {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY

  @@map("period_type")
}

model IncidentConfig {
  id                  String            @id @default(cuid())
  incidentTypeId      String            @map("incident_type_id")
  departmentId        String?           @map("department_id")
  thresholdValue      Decimal           @map("threshold_value") @db.Decimal(10, 2)
  thresholdOperator   ThresholdOperator @map("threshold_operator")
  periodType          PeriodType        @map("period_type")
  notificationEnabled Boolean           @default(false) @map("notification_enabled")
  notificationEmails  String[]          @map("notification_emails")
  isActive            Boolean           @default(true) @map("is_active")
  createdAt           DateTime          @default(now()) @map("created_at")
  updatedAt           DateTime          @updatedAt @map("updated_at")

  // Relaciones
  incidentType IncidentType @relation(fields: [incidentTypeId], references: [id])
  department   Department?  @relation(fields: [departmentId], references: [id])

  @@map("incident_configs")
}

model Incident {
  id             String       @id @default(cuid())
  incidentTypeId String       @map("incident_type_id")
  employeeId     String?      @map("employee_id")
  departmentId   String?      @map("department_id")
  date           DateTime     @db.Date
  value          Decimal      @db.Decimal(10, 2)
  metadata       Json?        // Detalles específicos
  notes          String?
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  // Relaciones
  incidentType IncidentType @relation(fields: [incidentTypeId], references: [id])
  employee     Employee?    @relation(fields: [employeeId], references: [id])
  department   Department?  @relation(fields: [departmentId], references: [id])

  @@index([incidentTypeId])
  @@index([date])
  @@index([employeeId])
  @@index([departmentId])
  @@map("incidents")
}
```

---

## 🔐 Sistema de Permisos

### Roles y Middleware

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { employee: true },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.username,
          isStaff: user.isStaff,
          isSuperuser: user.isSuperuser,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isStaff = user.isStaff;
        token.isSuperuser = user.isSuperuser;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.isStaff = token.isStaff as boolean;
        session.user.isSuperuser = token.isSuperuser as boolean;
      }
      return session;
    },
  },
};

// Tipos de roles
export enum Role {
  SUPERADMIN = "superadmin",
  HR_MANAGER = "hr_manager",
  DEPARTMENT_MANAGER = "department_manager",
  EMPLOYEE = "employee",
}

// Permisos por módulo
export const PERMISSIONS = {
  employees: {
    view: ["superadmin", "hr_manager", "department_manager"],
    create: ["superadmin", "hr_manager"],
    update: ["superadmin", "hr_manager"],
    delete: ["superadmin", "hr_manager"],
  },
  attendance: {
    view: ["superadmin", "hr_manager", "department_manager", "employee"],
    manage: ["superadmin", "hr_manager"],
  },
  schedules: {
    view: ["superadmin", "hr_manager", "department_manager", "employee"],
    manage: ["superadmin", "hr_manager", "department_manager"],
  },
  leave: {
    view: ["superadmin", "hr_manager", "department_manager", "employee"],
    request: ["employee"],
    approve: ["superadmin", "hr_manager", "department_manager"],
  },
  incidents: {
    view: ["superadmin", "hr_manager"],
    generate_reports: ["superadmin", "hr_manager"],
  },
};
```

---

## 🎯 Funcionalidades Clave

### 1. Auto Check-out

```typescript
// src/jobs/autoCheckout.ts
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function autoCheckoutJob() {
  const today = new Date();
  const startDay = startOfDay(today);
  const endDay = endOfDay(today);

  // Buscar asistencias sin check-out
  const pendingAttendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDay,
        lte: endDay,
      },
      checkInTime: { not: null },
      checkOutTime: null,
    },
    include: {
      schedule: {
        include: {
          shift: true,
        },
      },
    },
  });

  for (const attendance of pendingAttendances) {
    if (attendance.schedule?.shift?.autoCheckoutEnabled) {
      const autoCheckoutTime = attendance.schedule.shift.autoCheckoutTime;

      // Aplicar auto-checkout
      const checkOutDateTime = new Date(`${attendance.date.toISOString().split('T')[0]}T${autoCheckoutTime}`);

      const workedHours = calculateWorkedHours(
        attendance.checkInTime!,
        checkOutDateTime
      );

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOutTime: checkOutDateTime,
          checkOutMethod: "AUTO",
          isAutoCheckout: true,
          workedHours,
        },
      });
    }
  }
}

function calculateWorkedHours(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
}
```

### 2. Cálculo de Incidencias

```typescript
// src/services/incidentService.ts
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export class IncidentService {
  // Rotación: (Salidas en período / Promedio empleados) * 100
  static async calculateTurnover(departmentId?: string, period = new Date()) {
    const start = startOfMonth(period);
    const end = endOfMonth(period);

    const terminatedEmployees = await prisma.employee.count({
      where: {
        status: "TERMINATED",
        updatedAt: { gte: start, lte: end },
        ...(departmentId && { departmentId }),
      },
    });

    const avgEmployees = await prisma.employee.count({
      where: {
        status: "ACTIVE",
        ...(departmentId && { departmentId }),
      },
    });

    const turnoverRate = (terminatedEmployees / avgEmployees) * 100;

    return {
      rate: turnoverRate,
      terminated: terminatedEmployees,
      average: avgEmployees,
    };
  }

  // Ausentismo: (Días ausentes / Días laborables) * 100
  static async calculateAbsenteeism(departmentId?: string, period = new Date()) {
    const start = startOfMonth(period);
    const end = endOfMonth(period);

    const absentDays = await prisma.attendance.count({
      where: {
        date: { gte: start, lte: end },
        status: "ABSENT",
        ...(departmentId && {
          employee: { departmentId },
        }),
      },
    });

    const workDays = eachDayOfInterval({ start, end }).filter(
      (day) => day.getDay() !== 0 && day.getDay() !== 6
    ).length;

    const totalEmployees = await prisma.employee.count({
      where: {
        status: "ACTIVE",
        ...(departmentId && { departmentId }),
      },
    });

    const totalWorkDays = workDays * totalEmployees;
    const absenteeismRate = (absentDays / totalWorkDays) * 100;

    return {
      rate: absenteeismRate,
      absentDays,
      totalWorkDays,
    };
  }

  // Impuntualidad: Conteo de llegadas tarde
  static async calculateTardiness(departmentId?: string, period = new Date()) {
    const start = startOfMonth(period);
    const end = endOfMonth(period);

    const lateArrivals = await prisma.attendance.count({
      where: {
        date: { gte: start, lte: end },
        status: "LATE",
        ...(departmentId && {
          employee: { departmentId },
        }),
      },
    });

    return {
      count: lateArrivals,
      period: { start, end },
    };
  }
}
```

### 3. Flujo de Aprobación de Vacaciones

```typescript
// src/app/api/leaves/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: params.id },
    include: {
      employee: true,
      leaveType: true,
    },
  });

  if (!leaveRequest) {
    return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
  }

  if (leaveRequest.status !== "PENDING") {
    return NextResponse.json(
      { error: "Leave request already processed" },
      { status: 400 }
    );
  }

  // Verificar balance disponible
  const balance = await prisma.leaveBalance.findFirst({
    where: {
      employeeId: leaveRequest.employeeId,
      leaveTypeId: leaveRequest.leaveTypeId,
      year: new Date().getFullYear(),
    },
  });

  if (!balance) {
    return NextResponse.json(
      { error: "No leave balance found" },
      { status: 400 }
    );
  }

  const remainingDays = balance.totalDays.toNumber() - balance.usedDays.toNumber();

  if (remainingDays < leaveRequest.totalDays.toNumber()) {
    return NextResponse.json(
      { error: "Insufficient leave balance" },
      { status: 400 }
    );
  }

  // Aprobar solicitud y actualizar balance
  const [updatedRequest, updatedBalance] = await prisma.$transaction([
    prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        approvedById: session.user.id,
        approvedAt: new Date(),
      },
    }),
    prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        usedDays: {
          increment: leaveRequest.totalDays,
        },
        pendingDays: {
          decrement: leaveRequest.totalDays,
        },
      },
    }),
  ]);

  // TODO: Enviar notificación al empleado

  return NextResponse.json(updatedRequest);
}
```

---

## 📝 Convenciones de Código

### TypeScript/Next.js

#### Nomenclatura
- **Componentes:** PascalCase (`EmployeeList.tsx`)
- **Funciones/variables:** camelCase (`handleSubmit`, `isLoading`)
- **Constantes:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces:** PascalCase con prefijo I para interfaces (`IEmployee`, `EmployeeFormData`)
- **Archivos:** camelCase para utilidades, PascalCase para componentes

#### Estructura de componentes

```typescript
// src/components/employees/EmployeeList.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { employeeColumns } from "./columns";
import { Button } from "@/components/ui/button";

interface EmployeeListProps {
  departmentId?: string;
}

export function EmployeeList({ departmentId }: EmployeeListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["employees", { departmentId, page }],
    queryFn: () => fetchEmployees({ departmentId, page }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empleados</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={employeeColumns}
          data={data?.employees || []}
          pagination={{
            page,
            totalPages: data?.totalPages || 1,
            onPageChange: setPage,
          }}
        />
      </CardContent>
    </Card>
  );
}
```

#### API Route Handlers

```typescript
// src/app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { employeeSchema } from "@/lib/validations/employee";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const departmentId = searchParams.get("departmentId");

  const where = {
    ...(departmentId && { departmentId }),
    status: "ACTIVE",
  };

  const [employees, total] = await prisma.$transaction([
    prisma.employee.findMany({
      where,
      include: {
        department: true,
        position: true,
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.count({ where }),
  ]);

  return NextResponse.json({
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = employeeSchema.parse(body);

    const employee = await prisma.employee.create({
      data: validatedData,
      include: {
        department: true,
        position: true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Validaciones con Zod

```typescript
// src/lib/validations/employee.ts
import { z } from "zod";

export const employeeSchema = z.object({
  userId: z.string().cuid(),
  employeeCode: z.string().min(3).max(20),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dateOfBirth: z.string().datetime().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  positionId: z.string().cuid().optional(),
  hireDate: z.string().datetime(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"]).default("ACTIVE"),
  profilePicture: z.string().url().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
```

#### Custom Hooks

```typescript
// src/hooks/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface FetchEmployeesParams {
  page?: number;
  limit?: number;
  departmentId?: string;
}

export function useEmployees(params: FetchEmployeesParams = {}) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => fetchEmployees(params),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeFormData) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Empleado creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

async function fetchEmployees(params: FetchEmployeesParams) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.departmentId) searchParams.set("departmentId", params.departmentId);

  const res = await fetch(`/api/employees?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

async function createEmployee(data: EmployeeFormData) {
  const res = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create employee");
  return res.json();
}
```

---

## 🔄 Flujo de Trabajo Git

### Ramas
- `main` - Producción
- `develop` - Desarrollo
- `feature/*` - Nuevas características
- `bugfix/*` - Corrección de bugs
- `hotfix/*` - Correcciones urgentes en producción

### Commits
Formato: `tipo(scope): mensaje`

**Tipos:**
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo, estilos
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```
feat(attendance): add auto-checkout functionality
fix(leave): correct available days calculation
docs(api): update API endpoints documentation
refactor(components): improve employee form validation
```

---

## 🧪 Testing

### Unit Tests

```typescript
// tests/unit/services/incidentService.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { IncidentService } from "@/services/incidentService";
import { prisma } from "@/lib/prisma";

describe("IncidentService", () => {
  beforeEach(async () => {
    // Limpiar base de datos de prueba
    await prisma.attendance.deleteMany();
    await prisma.employee.deleteMany();
  });

  it("should calculate turnover rate correctly", async () => {
    // Arrange
    const departmentId = "dept-123";

    // Act
    const result = await IncidentService.calculateTurnover(departmentId);

    // Assert
    expect(result).toHaveProperty("rate");
    expect(result).toHaveProperty("terminated");
    expect(result).toHaveProperty("average");
    expect(typeof result.rate).toBe("number");
  });
});
```

### Integration Tests

```typescript
// tests/integration/api/employees.test.ts
import { describe, it, expect } from "vitest";
import { createMocks } from "node-mocks-http";
import { GET, POST } from "@/app/api/employees/route";

describe("/api/employees", () => {
  it("GET should return employees list", async () => {
    const { req } = createMocks({
      method: "GET",
    });

    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("employees");
    expect(data).toHaveProperty("pagination");
  });

  it("POST should create new employee", async () => {
    const { req } = createMocks({
      method: "POST",
      body: {
        userId: "user-123",
        employeeCode: "EMP001",
        firstName: "Juan",
        lastName: "Pérez",
        hireDate: new Date().toISOString(),
        employmentType: "FULL_TIME",
      },
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.firstName).toBe("Juan");
  });
});
```

### E2E Tests

```typescript
// tests/e2e/employees.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Employee Management", () => {
  test("should create new employee", async ({ page }) => {
    await page.goto("/admin/employees/new");

    await page.fill('input[name="firstName"]', "Juan");
    await page.fill('input[name="lastName"]', "Pérez");
    await page.fill('input[name="employeeCode"]', "EMP001");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=Empleado creado exitosamente")).toBeVisible();
  });

  test("should display employees list", async ({ page }) => {
    await page.goto("/admin/employees");

    await expect(page.locator("h1")).toContainText("Empleados");
    await expect(page.locator("table")).toBeVisible();
  });
});
```

---

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

# Iniciar producción
npm start

# Lint y formato
npm run lint
npm run format

# Tests
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # E2E tests
npm run test:coverage    # Coverage report
```

### Prisma

```bash
# Crear migración
npx prisma migrate dev --name migration_name

# Aplicar migraciones
npx prisma migrate deploy

# Reset base de datos (desarrollo)
npx prisma migrate reset

# Generar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

### Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy

# Detener servicios
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## 🔧 Variables de Entorno

### .env.local

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hrms_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Redis (para BullMQ y rate limiting)
REDIS_URL="redis://localhost:6379"

# Email (Resend)
RESEND_API_KEY="re_123456789"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload (UploadThing)
UPLOADTHING_SECRET="sk_live_123456789"
UPLOADTHING_APP_ID="app_123456789"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Logging
LOG_LEVEL="debug"
```

### .env.production

```env
# Database
DATABASE_URL="postgresql://user:password@prod-host:5432/hrms_db?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"

# Redis
REDIS_URL="redis://redis-prod:6379"

# Email
RESEND_API_KEY="re_prod_key"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload
UPLOADTHING_SECRET="sk_live_prod_key"
UPLOADTHING_APP_ID="app_prod_id"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Logging
LOG_LEVEL="error"
```

---

## 📚 Recursos y Documentación

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Database & ORM
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### Auth
- [NextAuth.js](https://next-auth.js.org/)
- [Auth.js Docs](https://authjs.dev/)

### UI & Styling
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) - Sistema de componentes open-source
- [Radix UI](https://www.radix-ui.com/) - Primitivos accesibles para React

### State Management
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)

### Testing
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)

### API
- Documentación API disponible en: `/api-docs` (usando swagger-ui-react)

---

## 📋 Próximos Pasos

### Fase 1: Setup Inicial (Semana 1)
- [ ] Configurar proyecto Next.js con TypeScript
- [ ] Configurar Prisma y PostgreSQL
- [ ] Setup Docker y Docker Compose
- [ ] Implementar autenticación con NextAuth
- [ ] Configurar shadcn/ui y Tailwind
- [ ] Setup testing environment (Vitest + Playwright)

### Fase 2: Módulo Empleados (Semana 2)
- [ ] Crear schema Prisma para empleados, departamentos y posiciones
- [ ] API routes para CRUD de empleados
- [ ] UI para lista y formularios de empleados
- [ ] Implementar búsqueda y filtros
- [ ] Importación masiva CSV
- [ ] Tests unitarios y de integración

### Fase 3: Módulo Asistencias (Semana 3)
- [ ] Schema Prisma para asistencias y turnos
- [ ] API routes para check-in/check-out
- [ ] Implementar auto-checkout con BullMQ
- [ ] UI calendario de asistencias
- [ ] Dashboard de asistencias
- [ ] Tests y validaciones

### Fase 4: Módulo Vacaciones (Semana 4)
- [ ] Schema Prisma para vacaciones y permisos
- [ ] API routes para solicitudes de vacaciones
- [ ] Flujo de aprobaciones con notificaciones
- [ ] UI para solicitar y aprobar vacaciones
- [ ] Balance de vacaciones
- [ ] Tests de flujo completo

### Fase 5: Módulo Incidencias (Semana 5)
- [ ] Schema Prisma para incidencias
- [ ] Servicios para cálculo de métricas
- [ ] API routes para incidencias y reportes
- [ ] Dashboard de análisis con gráficas
- [ ] Configuración de alertas
- [ ] Tests de cálculos

### Fase 6: Testing y Deploy (Semana 6)
- [ ] Tests E2E completos con Playwright
- [ ] Optimizaciones de rendimiento
- [ ] Setup CI/CD
- [ ] Documentación final
- [ ] Deploy a producción (Vercel/AWS)
- [ ] Monitoreo y logging

---

## 🎨 Paleta de Colores (UI)

```css
/* Usando variables CSS de Tailwind */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;        /* Azul */
    --primary-foreground: 210 40% 98%;
    --secondary: 262.1 83.3% 57.8%;      /* Púrpura */
    --secondary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;        /* Rojo */
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;

    /* Custom colors */
    --success: 142.1 76.2% 36.3%;        /* Verde */
    --warning: 38 92% 50%;               /* Amarillo */
    --info: 188.7 94.5% 42.7%;          /* Cyan */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 262.1 83.3% 57.8%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

---

## 🏗️ Docker Setup

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: hrms_postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: hrms_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - hrms_network

  redis:
    image: redis:7-alpine
    container_name: hrms_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - hrms_network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hrms_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/hrms_db?schema=public
      REDIS_URL: redis://redis:6379
      NEXTAUTH_URL: http://localhost:3000
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    networks:
      - hrms_network
    command: >
      sh -c "npx prisma migrate deploy &&
             node server.js"

volumes:
  postgres_data:
  redis_data:

networks:
  hrms_network:
    driver: bridge
```

---

## 📞 Contacto y Soporte

Para dudas o soporte durante el desarrollo:
- Revisar este archivo `CLAUDE.md`
- Consultar documentación oficial de Next.js, Prisma y tecnologías utilizadas
- Revisar logs de errores en detalle
- Usar Prisma Studio para debugging de base de datos

---

## 🔒 Seguridad

### Mejores Prácticas
- Usar variables de entorno para secrets
- Implementar rate limiting en API routes
- Validar todas las entradas con Zod
- Sanitizar datos antes de almacenar
- Usar NextAuth para autenticación segura
- Implementar CSRF protection
- Usar HTTPS en producción
- Configurar CORS apropiadamente

---

**Última actualización:** 2025-10-22
**Versión:** 2.0.0 (Next.js)
**Autor:** Claude + Usuario
