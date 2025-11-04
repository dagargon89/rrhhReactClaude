/**
 * Script para iniciar el job de auto-checkout manualmente
 *
 * Uso:
 *   node start-auto-checkout.js
 *
 * Este script hace una petición POST al endpoint de jobs para iniciar el auto-checkout
 */

const http = require('http')

const PORT = process.env.PORT || 3001
const HOST = 'localhost'

console.log('🚀 Iniciando job de auto-checkout...')

const postData = JSON.stringify({
  action: 'start'
})

const options = {
  hostname: HOST,
  port: PORT,
  path: '/api/jobs/auto-checkout',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}

const req = http.request(options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data)
      console.log('✅ Job de auto-checkout iniciado exitosamente')
      console.log('📊 Estado:', response.status)
    } else {
      console.error('❌ Error al iniciar job:', res.statusCode, data)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message)
  console.log('ℹ️  Asegúrate de que el servidor esté ejecutándose en http://localhost:' + PORT)
})

req.write(postData)
req.end()
