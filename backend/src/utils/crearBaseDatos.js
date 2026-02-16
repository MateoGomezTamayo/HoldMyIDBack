const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear la base de datos si no existe
const crearBaseDatos = async () => {
  try {
    // Conectar a MySQL sin especificar la BD
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    // Crear base de datos si no existe
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    console.log(`✓ Base de datos '${process.env.DB_NAME}' creada o ya existente`);

    // Cerrar conexión
    await connection.end();

    return true;
  } catch (error) {
    console.error('✗ Error al crear base de datos:', error.message);
    return false;
  }
};

module.exports = crearBaseDatos;
