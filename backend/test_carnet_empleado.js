#!/usr/bin/env node

/**
 * SCRIPT DE PRUEBA: Flujo Completo de Agregar Carnet de Empleado
 * 
 * Uso: node test_carnet_empleado.js
 * 
 * Este script prueba el flujo completo sin necesidad de curl manual
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let token = '';
let userId = '';

function makeRequest(method, path, body = null, auth = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (auth && token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Iniciando pruebas del flujo de Carnet de Empleado\n');

  try {
    // Test 1: Verificar que el servidor está en línea
    console.log('1️⃣  Verificando estado del servidor...');
    const statusRes = await makeRequest('GET', '/');
    if (statusRes.status === 200) {
      console.log('✅ Servidor está en línea\n');
    } else {
      throw new Error('Servidor no responde');
    }

    // Test 2: Revisar rutas de carnet
    console.log('2️⃣  Verificando rutas de carnet...');
    const carnetStatusRes = await makeRequest('GET', '/api/carnets/status');
    console.log('✅ Rutas de carnet disponibles');
    console.log('   Info:', JSON.stringify(carnetStatusRes.data.info, null, 2));
    console.log('');

    // Test 3: Login
    console.log('3️⃣  Haciendo login...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'estudiante@test.com',
      contraseña: 'password123',
    });

    if (loginRes.status === 200 && loginRes.data.data && loginRes.data.data.id) {
      token = loginRes.data.token;
      userId = loginRes.data.data.id;
      console.log('✅ Login exitoso');
      console.log('   Token:', token.substring(0, 20) + '...');
      console.log('   Usuario ID:', userId);
      console.log('');
    } else {
      console.log('❌ Login fallido');
      console.log('   Status:', loginRes.status);
      console.log('   Response:', loginRes.data);
      console.log('\n   Primero necesitas registrarte. Usa:');
      console.log('   POST /api/auth/registro con tus datos');
      return;
    }

    // Test 4: Enviar código de verificación (opcional)
    console.log('4️⃣  Enviando código de verificación...');
    const sendCodeRes = await makeRequest(
      'POST',
      '/api/validacion/send-code',
      {
        cedula: '12345678', // Debe existir en tabla empleados
        tipo: 'EMPLEADO',
      },
      true
    );

    if (sendCodeRes.status === 200) {
      console.log('✅ Código enviado al correo');
      console.log('   En desarrollo, el código aparecerá en la consola del servidor');
      console.log('   Correo:', sendCodeRes.data.data.correo);
    } else {
      console.log('⚠️  Advertencia al enviar código:');
      console.log('   Status:', sendCodeRes.status);
      console.log('   Message:', sendCodeRes.data.message);
      console.log('\n   Esto puede ser normal si la cédula no existe en tabla empleados');
      console.log('   Continuando sin verificación...\n');
    }

    // Test 5: Agregar carnet de empleado
    console.log('5️⃣  Agregando carnet de empleado...');
    const addCarnetRes = await makeRequest(
      'POST',
      '/api/carnets/agregar-empleado',
      {
        cedula: '12345678',
        cargo: 'Profesor de Matemáticas',
      },
      true
    );

    if (addCarnetRes.status === 201) {
      console.log('✅ Carnet de empleado agregado exitosamente');
      console.log('   ID Carnet:', addCarnetRes.data.data.id);
      console.log('   Número:', addCarnetRes.data.data.numero);
      console.log('   Rol:', addCarnetRes.data.data.rol);
      console.log('   Cargo:', addCarnetRes.data.data.cargo);
    } else {
      console.log('❌ Error al agregar carnet');
      console.log('   Status:', addCarnetRes.status);
      console.log('   Message:', addCarnetRes.data.message || addCarnetRes.data);
      console.log('\n   Posibles soluciones:');
      console.log('   - La cédula debe existir en la tabla empleados');
      console.log('   - Ya no puedes agregar otro carnet con la misma cédula');
      console.log('   - El correo del empleado debe coincidir con el del usuario');
    }

    console.log('\n✅ Pruebas completadas');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();

// Instrucciones:
console.log(`
📋 ANTES DE EJECUTAR ESTE SCRIPT, ASEGÚRATE DE:

1. ✅ El servidor backend está corriendo: npm run dev
2. ✅ Tienes datos de prueba en la BD:
   - Usuario con email: estudiante@test.com y contraseña: password123
   - Empleado con cédula: 12345678 y correo: estudiante@test.com

3. ✅ Si no tienes datos, crea primero:
   - INSERT INTO estudiantes (codigo_estudiante, correo, carrera) 
     VALUES ('STU001', 'estudiante@test.com', 'Ingeniería');
   - INSERT INTO empleados (cedula, correo, cargo)
     VALUES ('12345678', 'estudiante@test.com', 'Profesor');
`);
