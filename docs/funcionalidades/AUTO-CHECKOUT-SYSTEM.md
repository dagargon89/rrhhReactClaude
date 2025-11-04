# Sistema de Auto-Checkout Automático

## 📋 Descripción

El sistema de auto-checkout permite cerrar automáticamente las asistencias de empleados cuando su turno ha terminado. Esto es útil para:

- Empleados que olvidan hacer check-out
- Asegurar que las horas trabajadas se registren correctamente
- Automatizar el cierre de jornadas laborales

## 🎯 Funcionamiento

### Flujo Automático

1. **Job Programado**: Cada 30 minutos, el sistema ejecuta el proceso de auto-checkout
2. **Verificación**: Busca asistencias activas (con check-in pero sin check-out) del día actual
3. **Validación**: Para cada asistencia verifica:
   - Si el turno tiene `autoCheckoutEnabled = true`
   - Si la hora actual ya pasó la hora de fin del turno
4. **Ejecución**: Realiza el check-out automático:
   - Registra hora de salida
   - Marca como `isAutoCheckout = true`
   - Marca método como `AUTO`
   - Calcula horas trabajadas
   - Calcula horas extra

### Configuración del Turno

Para habilitar auto-checkout en un turno:

1. Ve a **Admin → Turnos de Trabajo**
2. Edita el turno deseado
3. Activa la opción **"Habilitar auto-checkout"**
4. Guarda cambios

El sistema utilizará la hora de fin del último período del día como referencia para el auto-checkout.

## 🔧 Uso Manual

### El Job se Inicia Automáticamente

El job se inicia **automáticamente** cuando ejecutas `npm run dev` o `npm start`.

**No necesitas hacer nada manual** para que funcione.

### Comandos Opcionales (para testing/debugging)

```bash
# Ver estado del job
curl http://localhost:3001/api/jobs/auto-checkout

# Detener el job temporalmente
curl -X POST http://localhost:3001/api/jobs/auto-checkout \
  -H "Content-Type: application/json" \
  -d '{"action":"stop"}'

# Re-iniciar el job
curl -X POST http://localhost:3001/api/jobs/auto-checkout \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'
```

### Ejecutar Auto-Checkout Manualmente

```bash
curl -X POST http://localhost:3001/api/jobs/auto-checkout \
  -H "Content-Type: application/json" \
  -d '{"action":"run"}'
```

### Verificar Estado del Job

```bash
curl http://localhost:3001/api/jobs/auto-checkout
```

### Detener el Job

```bash
curl -X POST http://localhost:3001/api/jobs/auto-checkout \
  -H "Content-Type: application/json" \
  -d '{"action":"stop"}'
```

## 📊 Respuesta de Ejemplo

Al ejecutar manualmente (`action: "run"`):

```json
{
  "success": true,
  "message": "Auto-checkout ejecutado manualmente",
  "result": {
    "success": true,
    "processed": 3,
    "errors": 0,
    "details": [
      {
        "attendanceId": "clx...",
        "employeeId": "clx...",
        "employeeName": "Juan Pérez",
        "checkOutTime": "2025-11-04T17:30:00.000Z"
      },
      {
        "attendanceId": "cly...",
        "employeeId": "cly...",
        "employeeName": "María García",
        "checkOutTime": "2025-11-04T17:30:00.000Z"
      }
    ]
  }
}
```

## ⚙️ Configuración Técnica

### Archivos Principales

- **Servicio**: `src/services/autoCheckoutService.ts`
  - `processAutoCheckout()`: Procesa todos los empleados
  - `processAutoCheckoutForEmployee(employeeId)`: Procesa un empleado específico

- **Job**: `src/jobs/autoCheckoutJob.ts`
  - `startAutoCheckoutJob()`: Inicia el job programado
  - `stopAutoCheckoutJob()`: Detiene el job
  - `runManualAutoCheckout()`: Ejecución manual

- **API**: `src/app/api/jobs/auto-checkout/route.ts`
  - `GET`: Obtener estado
  - `POST`: Acciones (start, stop, run)

- **Inicializador**: `src/lib/jobInitializer.ts`
  - Inicializa todos los jobs al arrancar el servidor

### Configuración del Cron

- **Frecuencia**: Cada 30 minutos
- **Expresión cron**: `*/30 * * * *`
- **Zona horaria**: `America/Chihuahua` (configurable)

Para cambiar la frecuencia, edita `src/jobs/autoCheckoutJob.ts`:

```typescript
// Opciones comunes:
"*/30 * * * *"  // Cada 30 minutos
"0 * * * *"     // Cada hora en punto
"*/15 * * * *"  // Cada 15 minutos
"0 */2 * * *"   // Cada 2 horas
```

## 🔍 Logs

El sistema genera logs detallados:

```
🚀 Iniciando job de auto-checkout...
✅ Job de auto-checkout iniciado: cada 30 minutos
⏰ [4/11/2025 17:30:00] Ejecutando proceso de auto-checkout...
📋 Encontradas 5 asistencias activas
⏰ Procesando auto-checkout para Juan Pérez
✅ Auto-checkout completado para Juan Pérez
✅ Auto-checkout completado: 3 empleados procesados
  ✓ Juan Pérez: Check-out a las 17:30:00
  ✓ María García: Check-out a las 17:30:00
  ✓ Pedro López: Check-out a las 17:30:00
```

## ⚠️ Consideraciones

1. **Inicio Automático**: El job se inicia automáticamente SIEMPRE
   - ✅ En desarrollo (`npm run dev`)
   - ✅ En producción (`npm start`)
   - ✅ Se ejecuta al arrancar el servidor
   - ✅ Usando el hook de instrumentación de Next.js

3. **Zona Horaria**: Asegúrate de configurar la zona correcta
   - Actualmente: `America/Chihuahua`
   - Modifica en `src/jobs/autoCheckoutJob.ts`

4. **Períodos del Turno**: El auto-checkout usa la hora de fin del último período del día

## 🧪 Pruebas

### Escenario 1: Turno Diurno (9:00 AM - 5:00 PM)

1. Empleado hace check-in a las 9:00 AM
2. El job se ejecuta a las 5:30 PM
3. El sistema detecta que el turno terminó a las 5:00 PM
4. Realiza auto-checkout

### Escenario 2: Turno con Múltiples Períodos

Si un turno tiene dos períodos (ej: 9:00-1:00 y 2:00-6:00):
- El sistema usa el último período (6:00 PM)
- Auto-checkout se aplica después de las 6:00 PM

### Escenario 3: Turno sin Auto-Checkout

- El job NO procesará la asistencia
- El empleado debe hacer check-out manual

## 📝 To-Do / Mejoras Futuras

- [ ] Dashboard de administración para ver estado de jobs
- [ ] Notificaciones cuando se aplica auto-checkout
- [ ] Configurar margen de tiempo (ej: aplicar auto-checkout 30 min después del fin del turno)
- [ ] Reportes de auto-checkouts realizados
- [ ] Configuración de horarios activos del job (ej: solo de 7 AM a 11 PM)

## 🐛 Troubleshooting

### El job no se ejecuta

1. Verificar que esté iniciado:
   ```bash
   curl http://localhost:3001/api/jobs/auto-checkout
   ```

2. Revisar logs del servidor en la consola

3. Iniciar manualmente:
   ```bash
   node start-auto-checkout.js
   ```

### No se procesa un empleado específico

1. Verificar que el turno tenga `autoCheckoutEnabled = true`
2. Verificar que la hora actual sea posterior a la hora de fin del turno
3. Verificar que haya una asistencia activa (check-in sin check-out)
4. Revisar logs para ver errores específicos

### El auto-checkout se ejecuta a la hora incorrecta

1. Verificar zona horaria en `src/jobs/autoCheckoutJob.ts`
2. Verificar horarios del turno en la base de datos
3. Verificar que los períodos del turno estén correctamente configurados
