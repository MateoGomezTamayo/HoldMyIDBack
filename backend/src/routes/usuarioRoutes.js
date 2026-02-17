const express = require('express');
const router = express.Router();
const { obtenerUsuarioPorId, obtenerTodosLosUsuarios } = require('../controllers/usuarioController');

// GET /api/usuarios - Obtener todos los usuarios (sin autenticación, opcional)
router.get('/', obtenerTodosLosUsuarios);

// GET /api/usuarios/:id - Obtener datos de un usuario específico
router.get('/:id', obtenerUsuarioPorId);

module.exports = router;
