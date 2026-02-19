#!/usr/bin/env node
/**
 * DIAGNÓSTICO SIMPLE: Verificar que las rutas funcionen
 */

const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          path: path,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        path: path,
        error: err.message
      });
    });

    req.end();
  });
}

async function run() {
  console.log('🔍 Verificando rutas...\n');

  const endpoints = [
    '/',
    '/api/carnets',
    '/api/carnets/status',
    '/api/auth',
    '/api/validacion'
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    if (result.status === 'ERROR') {
      console.log(`❌ ${endpoint}`);
      console.log(`   Error: ${result.error}\n`);
    } else if (result.status === 200) {
      console.log(`✅ ${endpoint} (Status: ${result.status})`);
    } else if (result.status === 404) {
      console.log(`🚫 ${endpoint} (Status: 404 - Ruta no encontrada)\n`);
    } else if (result.status === 401) {
      console.log(`🔒 ${endpoint} (Status: 401 - Requiere autenticación)`);
      console.log(`   ✅ Ruta existe pero requiere token\n`);
    } else {
      console.log(`⚠️  ${endpoint} (Status: ${result.status})`);
    }
  }

  console.log('\n📝 CONCLUSIÓN:');
  console.log('Si ves ✅ en /api/carnets/status, las rutas están funcionando correctamente.');
  console.log('Si ves ❌, el servidor no está corriendo o hay un problema de conexión.');
}

run();
