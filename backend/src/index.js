require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const carnetRoutes = require('./routes/carnetRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const validacionRoutes = require('./routes/validacionRoutes');
const crearBaseDatos = require('./utils/crearBaseDatos');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar servidor
const inicializarServidor = async () => {
  try {
    // Crear base de datos si no existe
    await crearBaseDatos();

    // Sincronizar modelos con la base de datos
    await sequelize.sync();
    console.log('✓ Base de datos sincronizada correctamente');

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✓ Servidor corriendo en puerto ${PORT}`);
      console.log(`✓ HoldMyIDBack API iniciado correctamente`);
    });
  } catch (error) {
    console.error('✗ Error al inicializar servidor:', error.message);
    process.exit(1);
  }
};

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a HoldMyIDBack API',
    version: '1.0.0',
    status: 'En desarrollo',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      carnets: '/api/carnets',
      validacion: '/api/validacion',
    },
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de usuarios
app.use('/api/usuarios', usuarioRoutes);

// Rutas de carnets

// Rutas de validación
app.use('/api/validacion', validacionRoutes);
app.use('/api/carnets', carnetRoutes);

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Iniciar aplicación
inicializarServidor();

module.exports = app;
