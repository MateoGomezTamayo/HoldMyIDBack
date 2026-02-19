#!/usr/bin/env node
/**
 * TEST: Intentar agregar empleado sin token
 */

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            path: path,
            method: method,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            path: path,
            method: method,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        path: path,
        method: method,
        error: err.message
      });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('🧪 TEST: Agregar empleado sin token\n');

  const result = await makeRequest('POST', '/api/carnets/agregar-empleado', {
    cedula: '12345678',
    cargo: 'Profesor'
  });

  console.log(`Endpoint: ${result.method} ${result.path}`);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  console.log('');

  if (result.status === 401) {
    console.log('✅ CORRECTO: Retorna 401 (No autenticado)');
    console.log('   La ruta EXISTE pero requiere token');
    console.log('   Debes enviar: Authorization: Bearer {token}');
  } else if (result.status === 404) {
    console.log('❌ ERROR: Retorna 404 (Ruta no encontrada)');
    console.log('   Parece que la ruta no está registrada');
  } else {
    console.log('⚠️ Status inesperado:', result.status);
  }
}

run();
