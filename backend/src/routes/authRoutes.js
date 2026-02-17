const express = require('express');
const router = express.Router();
const { registro, login, obtenerPerfil } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);

// Ruta de verificación de token
router.get('/verify', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido',
    data: {
      id: req.usuario.id,
      email: req.usuario.email,
    },
  });
});

// Rutas protegidas
router.get('/perfil', authMiddleware, obtenerPerfil);

module.exports = router;
