# 🔧 Solución de Problemas - MySQL con Laragon

## Problema: No puedo conectar a MySQL de Laragon

### ✅ Solución Rápida

Ejecuta este comando en la terminal del proyecto:

```bash
npm install
node diagnostico-mysql.js
```

Este script probará todas las configuraciones posibles y te dirá cuál funciona.

## 📝 Pasos Manuales

### 1. Verificar que MySQL esté corriendo en Laragon

1. Abre **Laragon**
2. Asegúrate de que **MySQL** tenga una **marca verde** (✓)
3. Si no está iniciado:
   - Haz clic en **"Start All"**
   - Espera unos segundos
   - Verifica que aparezca la marca verde

### 2. Verificar el puerto de MySQL

**Opción A: Desde Laragon**
1. Clic derecho en el ícono de Laragon
2. **MySQL** > **Show MySQL Port**
3. Anota el puerto (generalmente `3306` o `3307`)

**Opción B: Desde la terminal de Laragon**
1. En Laragon, clic derecho > **Terminal**
2. Ejecuta:
```bash
netstat -ano | findstr :3306
netstat -ano | findstr :3307
```
3. Si aparecen resultados, ese es el puerto correcto

### 3. Verificar las credenciales de MySQL

**Opción A: Sin contraseña (más común en Laragon)**

Abre la terminal de Laragon y ejecuta:
```bash
mysql -u root
```

Si funciona SIN pedir contraseña, tu configuración es:
```env
DATABASE_URL="mysql://root@localhost:3306/hrms_db"
```

**Opción B: Con contraseña**

Si pide contraseña, prueba:
```bash
mysql -u root -p
```

Contraseñas comunes en Laragon:
- `root`
- (vacía - solo presiona Enter)
- `password`

Si funciona con contraseña `root`:
```env
DATABASE_URL="mysql://root:root@localhost:3306/hrms_db"
```

### 4. Crear la base de datos

Una vez dentro de MySQL:

```sql
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
exit;
```

Deberías ver `hrms_db` en la lista.

### 5. Actualizar .env.local

Abre el archivo `.env.local` y actualiza la línea de `DATABASE_URL` con la configuración que funcionó:

**Ejemplo 1: Sin contraseña, puerto 3306**
```env
DATABASE_URL="mysql://root@localhost:3306/hrms_db"
```

**Ejemplo 2: Con contraseña "root", puerto 3306**
```env
DATABASE_URL="mysql://root:root@localhost:3306/hrms_db"
```

**Ejemplo 3: Sin contraseña, puerto 3307**
```env
DATABASE_URL="mysql://root@localhost:3307/hrms_db"
```

**Ejemplo 4: Usando 127.0.0.1 en lugar de localhost**
```env
DATABASE_URL="mysql://root@127.0.0.1:3306/hrms_db"
```

### 6. Probar la conexión con Prisma

Después de actualizar `.env.local`:

```bash
npx prisma generate
npx prisma db push
```

Si ves errores, continúa con los pasos de solución a continuación.

## ❌ Errores Comunes y Soluciones

### Error: "Can't reach database server"

**Causas:**
1. MySQL no está corriendo en Laragon
2. Puerto incorrecto
3. Firewall bloqueando la conexión

**Soluciones:**
```bash
# 1. Reinicia MySQL en Laragon
# En Laragon: clic en "Stop All", luego "Start All"

# 2. Verifica que MySQL esté escuchando
netstat -ano | findstr :3306

# 3. Prueba todas las configuraciones
node diagnostico-mysql.js
```

### Error: "Access denied for user 'root'"

**Causa:** Contraseña incorrecta

**Soluciones:**

1. **Resetear contraseña de MySQL en Laragon:**
   - Abre Laragon
   - Clic derecho > **MySQL** > **Change MySQL Password**
   - Establece una contraseña vacía o `root`

2. **Probar sin contraseña:**
   ```env
   DATABASE_URL="mysql://root@localhost:3306/hrms_db"
   ```

3. **Probar con contraseña:**
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/hrms_db"
   ```

### Error: "Unknown database 'hrms_db'"

**Causa:** La base de datos no existe

**Solución:**
```bash
# Conéctate a MySQL
mysql -u root

# Dentro de MySQL:
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
exit;
```

### Error: "Error parsing URL"

**Causa:** Formato incorrecto de DATABASE_URL

**Solución:** El formato correcto es:
```
mysql://usuario:contraseña@host:puerto/nombre_base_datos
```

Ejemplos válidos:
```env
# Sin contraseña
DATABASE_URL="mysql://root@localhost:3306/hrms_db"

# Con contraseña vacía explícita
DATABASE_URL="mysql://root:@localhost:3306/hrms_db"

# Con contraseña
DATABASE_URL="mysql://root:root@localhost:3306/hrms_db"
```

## 🔍 Script de Diagnóstico

Usa el script incluido para diagnosticar el problema:

```bash
npm install
node diagnostico-mysql.js
```

Este script:
1. ✅ Prueba diferentes configuraciones automáticamente
2. ✅ Crea la base de datos si no existe
3. ✅ Te muestra la DATABASE_URL correcta
4. ✅ Detecta el puerto y configuración exacta de Laragon

## 🆘 Si Nada Funciona

### Opción 1: Reinstalar MySQL en Laragon

1. En Laragon: clic derecho > **MySQL** > **Reload**
2. Reinicia Laragon completamente

### Opción 2: Usar HeidiSQL (incluido en Laragon)

1. Abre Laragon
2. Clic derecho > **Database** > **Open**
3. Esto abrirá HeidiSQL
4. Verifica la conexión desde ahí
5. Las credenciales que funcionen en HeidiSQL son las que debes usar

### Opción 3: Ver logs de MySQL

1. En Laragon: clic derecho > **MySQL** > **Show Logs**
2. Busca errores en rojo
3. Esto te dirá qué está fallando exactamente

### Opción 4: Configuración manual en HeidiSQL

1. Abre HeidiSQL desde Laragon
2. Crea una nueva sesión con estos datos:
   - Host: `localhost` o `127.0.0.1`
   - Usuario: `root`
   - Contraseña: (vacía o `root`)
   - Puerto: `3306` (o `3307`)
3. Intenta conectar
4. Si funciona, crea la base de datos `hrms_db` desde HeidiSQL
5. Usa esas mismas credenciales en `.env.local`

## ✅ Verificación Final

Una vez que hayas configurado la conexión:

```bash
# 1. Generar cliente Prisma
npx prisma generate

# 2. Aplicar migraciones
npx prisma migrate dev --name init

# 3. Cargar datos de prueba
npx prisma db seed

# 4. Abrir Prisma Studio para verificar
npx prisma studio
```

Si Prisma Studio se abre y ves las tablas, **¡la conexión funciona! 🎉**

## 📞 ¿Necesitas más ayuda?

Si sigues teniendo problemas:

1. Ejecuta: `node diagnostico-mysql.js` y copia el resultado
2. Verifica que MySQL esté corriendo en Laragon (marca verde)
3. Prueba abrir HeidiSQL y conectarte manualmente
4. Verifica los logs de MySQL en Laragon

---

**Recuerda:** El proyecto NO necesita estar en la carpeta `www` de Laragon. Solo necesitas que MySQL esté corriendo.
