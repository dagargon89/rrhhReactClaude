# 📋 Estructura Completa de Módulos del Sistema HRMS

## ✅ Módulos EXISTENTES

### 1. **Gestión de Personal**
- ✅ **Usuarios** (`/admin/users`) - User
- ✅ **Empleados** (`/admin/employees`) - Employee
- ✅ **Departamentos** (`/admin/departments`) - Department
- ✅ **Posiciones** (`/admin/positions`) - Position

### 2. **Tiempo y Asistencia**
- ✅ **Turnos** (`/admin/work-shifts`) - WorkShift ← RECIÉN ACTUALIZADO
- ✅ **Horarios** (`/admin/schedules`) - Schedule

## ❌ Módulos FALTANTES

### 3. **Asistencias** (Attendance)
**Modelo:** `Attendance`
```
- /admin/attendance (lista de asistencias)
- /admin/attendance/[id] (detalle)
- /admin/attendance/checkin (registrar entrada)
```

### 4. **Vacaciones y Permisos** (Leaves)
**Modelos:** `LeaveType`, `LeaveRequest`, `LeaveBalance`

**Estructura anidada:**
```
/admin/leaves
  ├── /requests (solicitudes de permisos)
  │   ├── /new
  │   ├── /[id]
  │   └── /[id]/edit
  ├── /types (tipos de permisos - CONFIGURACIÓN)
  │   ├── /new
  │   ├── /[id]
  │   └── /[id]/edit
  └── /balances (saldos por empleado)
```

### 5. **Incidencias** (Incidents)
**Modelos:** `Incident`, `IncidentType`, `IncidentConfig`

**Estructura anidada:**
```
/admin/incidents
  ├── / (lista de incidencias)
  ├── /[id] (detalle)
  ├── /types (tipos - CONFIGURACIÓN)
  │   ├── /new
  │   └── /[id]/edit
  └── /configs (configuraciones de alertas)
      ├── /new
      └── /[id]/edit
```

### 6. **Reportes** (Reports)
```
/admin/reports
  ├── /attendance (reporte de asistencias)
  ├── /leaves (reporte de permisos)
  ├── /incidents (reporte de incidencias)
  ├── /employees (reporte de empleados)
  └── /custom (reportes personalizados)
```

## 🎯 Nueva Estructura del Sidebar (Organizada)

```javascript
📊 Dashboard

👥 GESTIÓN DE PERSONAL
  ├── Usuarios
  ├── Empleados
  ├── Departamentos
  └── Posiciones

⏰ TIEMPO Y ASISTENCIA
  ├── Turnos (WorkShifts)
  ├── Horarios (Schedules)
  └── Asistencias (Attendance)

🏖️ PERMISOS Y AUSENCIAS
  ├── Solicitudes de Permisos
  ├── Tipos de Permisos (config)
  └── Saldos de Permisos

⚠️ INCIDENCIAS
  ├── Incidencias
  ├── Tipos de Incidencias (config)
  └── Configuración de Alertas

📈 REPORTES
  ├── Reporte de Asistencias
  ├── Reporte de Permisos
  ├── Reporte de Incidencias
  └── Reportes Personalizados
```

## 🔧 Prioridad de Implementación

1. **ALTA** - Asistencias (core del sistema)
2. **ALTA** - Solicitudes de Permisos
3. **MEDIA** - Tipos de Permisos
4. **MEDIA** - Incidencias
5. **BAJA** - Reportes
6. **BAJA** - Configuraciones avanzadas

## 📝 Notas

- Los módulos de "Tipos" son configuraciones administrativas
- Los módulos de "Config" son para reglas de negocio
- Considerar implementar subnavegación cuando un módulo tenga submódulos


