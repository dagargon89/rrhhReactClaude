# 📦 Instrucciones de Instalación - HRMS

## ✅ Lista de Verificación Pre-Instalación

Antes de comenzar, asegúrate de tener:

- [ ] Node.js 18 o superior instalado
- [ ] MySQL 8.0 o superior instalado y corriendo
- [ ] Git instalado (opcional)
- [ ] Un editor de código (VS Code recomendado)

## 🚀 Pasos de Instalación

### 1. Verificar Node.js

Abre tu terminal (CMD o PowerShell) y ejecuta:

```bash
node --version
npm --version
```

Deberías ver versiones 18.x.x o superior.

### 2. Verificar MySQL

Abre MySQL y verifica que puedes conectarte:

```bash
mysql -u root
```

Si funciona, escribe:

```sql
SELECT VERSION();
exit;
```

### 3. Instalar Dependencias del Proyecto

En la terminal, navega a la carpeta del proyecto:

```bash
cd "C:\Users\david\Documents\React Projects\rrhhReactClaude"
```

Instala todas las dependencias:

```bash
npm install
```

⏱️ **Esto tomará 3-5 minutos**. Verás un montón de texto en la pantalla, es normal.

### 4. Crear la Base de Datos

Abre MySQL:

```bash
mysql -u root
```

Ejecuta estos comandos:

```sql
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
exit;
```

Deberías ver `hrms_db` en la lista.

### 5. Configurar Prisma

Genera el cliente de Prisma:

```bash
npx prisma generate
```

Crea las tablas en la base de datos:

```bash
npx prisma migrate dev --name init
```

Cuando te pregunte "Enter a name for the new migration", simplemente presiona Enter.

### 6. Cargar Datos de Prueba

Ejecuta el seed para crear datos iniciales:

```bash
npx prisma db seed
```

Verás mensajes como:
- ✅ Usuario administrador creado
- ✅ Departamentos creados
- ✅ Posiciones creadas
- etc.

### 7. Iniciar el Servidor

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Deberías ver:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in X.Xs
```

### 8. Abrir en el Navegador

Abre tu navegador en: **http://localhost:3000**

Serás redirigido a la página de login automáticamente.

### 9. Iniciar Sesión

Usa las credenciales de prueba:

- **Email:** admin@hrms.com
- **Password:** admin123

¡Deberías ver el Dashboard Administrativo!

## 🎉 ¡Listo!

Tu sistema HRMS está funcionando. Ahora puedes:

1. Explorar el dashboard
2. Ver la lista de empleados
3. Navegar por las diferentes secciones

## 🛠️ Herramientas Útiles

### Prisma Studio (Base de Datos Visual)

Para ver y editar los datos de la base de datos visualmente:

```bash
npx prisma studio
```

Esto abrirá http://localhost:5555 con una interfaz gráfica de la base de datos.

### Detener el Servidor

Para detener el servidor de desarrollo, presiona `Ctrl + C` en la terminal.

### Reiniciar el Servidor

Si algo sale mal, detén el servidor y vuelve a iniciarlo:

```bash
npm run dev
```

## ❌ Problemas Comunes

### Error: "Can't reach database server"

**Solución:**
1. Verifica que MySQL esté corriendo
2. Verifica que la base de datos `hrms_db` exista
3. Verifica el archivo `.env.local` tenga: `DATABASE_URL="mysql://root@localhost:3306/hrms_db"`

### Error: "Port 3000 is already in use"

**Solución:**
Alguien más está usando el puerto 3000. Puedes:

1. Cerrar el otro programa que usa el puerto
2. O usar otro puerto: `npm run dev -- -p 3001`

### Error: "Module not found" o errores de TypeScript

**Solución:**
```bash
rd /s /q node_modules
rd /s /q .next
npm install
npm run dev
```

### La página muestra errores o está en blanco

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console" y busca errores en rojo
3. Intenta refrescar la página (Ctrl + F5)

### No puedo hacer login

**Solución:**
1. Verifica que ejecutaste `npx prisma db seed`
2. Verifica las credenciales: admin@hrms.com / admin123
3. Abre Prisma Studio y verifica que existe el usuario en la tabla `users`

## 🔄 Reiniciar Todo (Última Opción)

Si nada funciona, reinicia completamente:

```bash
# 1. Elimina node_modules
rd /s /q node_modules
rd /s /q .next

# 2. Reinstala dependencias
npm install

# 3. Resetea la base de datos (BORRA TODOS LOS DATOS)
npx prisma migrate reset

# 4. Ejecuta seed de nuevo
npx prisma db seed

# 5. Inicia el servidor
npm run dev
```

## 📞 Necesitas Ayuda?

Si sigues teniendo problemas:

1. Revisa los logs en la terminal (texto que aparece)
2. Revisa la consola del navegador (F12)
3. Verifica que MySQL esté corriendo
4. Verifica que seguiste todos los pasos en orden

## 📚 Próximos Pasos

Una vez que todo funcione:

1. Lee el archivo `README.md` para más información
2. Lee el archivo `CLAUDE.md` para documentación técnica detallada
3. Explora el código en la carpeta `src/`
4. Empieza a personalizar el sistema según tus necesidades

---

**¡Éxito en tu proyecto!** 🎊
