require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const { Usuario, Carnet } = require('./models');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sincronizar modelos con la base de datos
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✓ Base de datos sincronizada correctamente');
  })
  .catch((error) => {
    console.error('✗ Error al sincronizar base de datos:', error.message);
  });

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a HoldMyIDBack API',
    version: '1.0.0',
    status: 'En desarrollo',
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
