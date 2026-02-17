const express = require('express');
const router = express.Router();
const { enviarCodigo, verificarCodigo } = require('../controllers/validacionController');
const authMiddleware = require('../middleware/auth');

// Rutas protegidas (requieren autenticación)
router.post('/send-code', authMiddleware, enviarCodigo);
router.post('/verify-code', authMiddleware, verificarCodigo);

module.exports = router;
