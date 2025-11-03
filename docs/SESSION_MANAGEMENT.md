# Gestión de Sesiones

Este documento describe las características de gestión de sesiones implementadas en el sistema HRMS.

## Características Implementadas

### 1. Cierre de Sesión por Inactividad

El sistema detecta automáticamente la inactividad del usuario y cierra la sesión después de un período configurable de tiempo sin actividad.

#### Eventos Detectados

El sistema detecta los siguientes eventos como "actividad del usuario":
- Movimiento del mouse (`mousemove`)
- Presión de teclas (`keydown`)
- Scroll del mouse (`wheel`, `mousewheel`, `DOMMouseScroll`)
- Click del mouse (`mousedown`)
- Eventos táctiles (`touchstart`, `touchmove`)
- Cambios de visibilidad de la pestaña (`visibilitychange`)

#### Configuración

El timeout de inactividad se puede configurar mediante variables de entorno:

```env
# Tiempo de inactividad en minutos antes de cerrar sesión (default: 60 minutos)
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES="60"

# Tiempo en minutos antes del cierre de sesión para mostrar advertencia (default: 5 minutos)
NEXT_PUBLIC_SESSION_WARNING_MINUTES="5"
```

#### Flujo de Funcionamiento

1. El usuario inicia sesión en el sistema
2. El sistema comienza a monitorear la actividad del usuario
3. Si el usuario está inactivo por `TIMEOUT_MINUTES - WARNING_MINUTES`, se muestra una advertencia
4. La advertencia muestra un contador regresivo y opciones para:
   - **Continuar sesión**: Resetea el timer de inactividad
   - **Cerrar sesión**: Cierra la sesión inmediatamente
5. Si el usuario no interactúa con la advertencia, la sesión se cierra automáticamente

### 2. Cierre de Sesión al Cerrar el Navegador

Las cookies de sesión están configuradas como "session cookies", lo que significa que se eliminan automáticamente cuando el usuario cierra el navegador.

#### Configuración Técnica

En `src/lib/auth.ts`:

```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      // No se establece maxAge para que la cookie sea de sesión
    },
  },
}
```

### 3. Tiempo Máximo de Sesión

Independientemente de la actividad, las sesiones tienen un tiempo máximo de vida configurado en NextAuth:

```typescript
session: {
  strategy: "jwt",
  maxAge: 60 * 60, // 1 hora de sesión máxima
}
```

## Componentes Implementados

### 1. `useIdleTimer` Hook

Hook personalizado que maneja la detección de inactividad.

**Ubicación:** `src/hooks/use-idle-timer.ts`

**Uso:**
```typescript
const { isIdle, showPrompt, remainingTime, reset } = useIdleTimer({
  timeout: 60 * 60 * 1000, // 1 hora
  promptBeforeIdle: 5 * 60 * 1000, // 5 minutos de advertencia
  onIdle: () => console.log("Usuario inactivo"),
  onPrompt: () => console.log("Mostrar advertencia"),
})
```

### 2. `SessionTimeoutProvider`

Componente que envuelve la aplicación y maneja el cierre de sesión por inactividad.

**Ubicación:** `src/components/providers/session-timeout-provider.tsx`

**Props:**
- `timeoutMinutes`: Tiempo de inactividad antes de cerrar sesión (default: 60)
- `warningMinutes`: Tiempo antes del cierre para mostrar advertencia (default: 5)

## Experiencia de Usuario

### Modal de Advertencia

Cuando se detecta inactividad, se muestra un modal con:
- **Título**: "Sesión por expirar"
- **Descripción**: Notificación sobre la inactividad
- **Contador regresivo**: Tiempo restante antes del cierre automático
- **Barra de progreso**: Visual del tiempo restante
- **Botones**:
  - "Cerrar sesión": Cierra la sesión inmediatamente
  - "Continuar sesión": Resetea el timer y continúa usando la aplicación

### Página de Login

Cuando la sesión se cierra por inactividad, el usuario es redirigido a la página de login con:
- Un mensaje de alerta explicando que la sesión fue cerrada por inactividad
- Un toast notification con la misma información

## Seguridad

### Medidas Implementadas

1. **Cookies HttpOnly**: Las cookies de sesión no son accesibles desde JavaScript
2. **Cookies Secure**: En producción, las cookies solo se transmiten por HTTPS
3. **SameSite**: Protección contra CSRF con `sameSite: 'lax'`
4. **JWT con expiración**: Los tokens tienen un tiempo de vida limitado
5. **Cierre automático**: Las sesiones se cierran automáticamente por inactividad

## Personalización

### Cambiar el Timeout de Inactividad

Para cambiar el tiempo de inactividad, edita el archivo `.env.local`:

```env
# Para 30 minutos de inactividad con 2 minutos de advertencia
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES="30"
NEXT_PUBLIC_SESSION_WARNING_MINUTES="2"
```

### Deshabilitar el Cierre por Inactividad

Para deshabilitar temporalmente el cierre por inactividad (no recomendado en producción), edita `src/components/providers.tsx`:

```typescript
<SessionTimeoutProvider
  timeoutMinutes={0} // 0 desactiva el timer
  warningMinutes={5}
>
```

### Personalizar Eventos de Actividad

Para personalizar los eventos que se consideran "actividad", edita el hook en `src/hooks/use-idle-timer.ts`:

```typescript
const DEFAULT_EVENTS = [
  'mousemove',
  'keydown',
  // Agrega o quita eventos según necesites
]
```

## Testing

### Probar el Cierre por Inactividad

1. Inicia sesión en la aplicación
2. No interactúes con la aplicación por el tiempo configurado menos el tiempo de advertencia
3. Deberías ver el modal de advertencia
4. Si no interactúas, la sesión se cerrará automáticamente

### Probar el Cierre al Cerrar Navegador

1. Inicia sesión en la aplicación
2. Cierra completamente el navegador (no solo la pestaña)
3. Abre el navegador nuevamente y navega a la aplicación
4. Deberías ser redirigido a la página de login

## Solución de Problemas

### El Timer no se Resetea

- Verifica que los eventos estén siendo detectados correctamente
- Revisa la consola del navegador para ver si hay errores
- Asegúrate de que el componente `SessionTimeoutProvider` esté correctamente integrado

### Las Cookies no se Eliminan al Cerrar el Navegador

- Verifica que no estés usando el modo de desarrollo con cookies persistentes
- Asegúrate de que la configuración de cookies no incluye `maxAge`
- Cierra todas las ventanas del navegador, no solo la pestaña

### El Modal no se Muestra

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que `warningMinutes` sea menor que `timeoutMinutes`
- Revisa que el componente `Dialog` de shadcn/ui esté correctamente instalado

## Referencias

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [HTTP Cookies - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
