const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  obtenerCarnets,
  obtenerCarnetPorId,
  crearCarnet,
  actualizarCarnet,
  eliminarCarnet,
  agregarEmpleado,
  agregarEstudiante,
  actualizarFotoCarnet,
} = require('../controllers/carnetController');

// Configurar multer para fotos
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

// Todas las rutas de carnets requieren autenticación
router.use(authMiddleware);

// GET /api/carnets - Obtener todos los carnets del usuario
router.get('/', obtenerCarnets);

// POST /api/carnets/agregar-estudiante - Agregar carnet de estudiante
router.post('/agregar-estudiante', agregarEstudiante);

// POST /api/carnets/agregar-empleado - Agregar carnet de empleado
router.post('/agregar-empleado', agregarEmpleado);

// PUT /api/carnets/:id/foto - Actualizar foto del carnet
router.put('/:carnetId/foto', upload.single('foto'), actualizarFotoCarnet);

// GET /api/carnets/:id - Obtener un carnet específico
router.get('/:id', obtenerCarnetPorId);

// POST /api/carnets - Crear un nuevo carnet
router.post('/', crearCarnet);

// PUT /api/carnets/:id - Actualizar un carnet
router.put('/:id', actualizarCarnet);

// DELETE /api/carnets/:id - Eliminar un carnet
router.delete('/:id', eliminarCarnet);

module.exports = router;
