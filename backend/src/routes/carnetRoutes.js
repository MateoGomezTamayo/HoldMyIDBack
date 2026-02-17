const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  obtenerCarnets,
  obtenerCarnetPorId,
  crearCarnet,
  actualizarCarnet,
  eliminarCarnet,
} = require('../controllers/carnetController');

// Todas las rutas de carnets requieren autenticación
router.use(authMiddleware);

// GET /api/carnets - Obtener todos los carnets del usuario
router.get('/', obtenerCarnets);

// GET /api/carnets/:id - Obtener un carnet específico
router.get('/:id', obtenerCarnetPorId);

// POST /api/carnets - Crear un nuevo carnet
router.post('/', crearCarnet);

// PUT /api/carnets/:id - Actualizar un carnet
router.put('/:id', actualizarCarnet);

// DELETE /api/carnets/:id - Eliminar un carnet
router.delete('/:id', eliminarCarnet);

module.exports = router;
