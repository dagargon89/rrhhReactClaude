// Script de diagnóstico para probar la conexión a MySQL de Laragon
const mysql = require('mysql2/promise');

const configuraciones = [
  {
    nombre: 'Opción 1: Sin contraseña (puerto 3306)',
    config: {
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
    }
  },
  {
    nombre: 'Opción 2: Con contraseña "root" (puerto 3306)',
    config: {
      host: 'localhost',
      user: 'root',
      password: 'root',
      port: 3306,
    }
  },
  {
    nombre: 'Opción 3: 127.0.0.1 sin contraseña (puerto 3306)',
    config: {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      port: 3306,
    }
  },
  {
    nombre: 'Opción 4: Sin contraseña (puerto 3307)',
    config: {
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3307,
    }
  },
];

async function probarConexion(config, nombre) {
  try {
    const connection = await mysql.createConnection(config);
    console.log(`✅ ${nombre} - CONEXIÓN EXITOSA`);

    // Intentar crear la base de datos
    await connection.query('CREATE DATABASE IF NOT EXISTS hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log(`   ✅ Base de datos 'hrms_db' creada/verificada`);

    // Mostrar la URL de conexión
    const password = config.password ? `:${config.password}` : '';
    const url = `mysql://${config.user}${password}@${config.host}:${config.port}/hrms_db`;
    console.log(`   📝 DATABASE_URL="${url}"`);
    console.log('');

    await connection.end();
    return true;
  } catch (error) {
    console.log(`❌ ${nombre} - FALLO`);
    console.log(`   Error: ${error.code} - ${error.message}`);
    console.log('');
    return false;
  }
}

async function main() {
  console.log('🔍 Diagnóstico de Conexión MySQL - Laragon\n');
  console.log('Probando diferentes configuraciones...\n');

  let exitosa = false;

  for (const { nombre, config } of configuraciones) {
    const resultado = await probarConexion(config, nombre);
    if (resultado && !exitosa) {
      exitosa = true;
      console.log('🎉 CONFIGURACIÓN ENCONTRADA');
      console.log('Copia la DATABASE_URL de arriba y pégala en tu archivo .env.local\n');
    }
  }

  if (!exitosa) {
    console.log('❌ No se pudo conectar con ninguna configuración');
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que MySQL esté corriendo en Laragon');
    console.log('2. Verifica el puerto de MySQL en Laragon (Menu > MySQL > Show MySQL Port)');
    console.log('3. Intenta reiniciar MySQL en Laragon');
    console.log('4. Verifica la contraseña de root en Laragon\n');
  }
}

main().catch(console.error);
