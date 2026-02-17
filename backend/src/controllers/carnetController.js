const { Carnet, Usuario } = require('../models');

// Obtener todos los carnets del usuario autenticado
const obtenerCarnets = async (req, res) => {
  try {
    const userId = req.usuario.id;

    const carnets = await Carnet.findAll({
      where: {
        usuario_id: userId,
      },
      attributes: {
        exclude: ['codigo_qr', 'archivo_pdf', 'foto_perfil'],
      },
    });

    res.status(200).json({
      success: true,
      message: 'Carnets obtenidos correctamente',
      data: carnets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carnets',
      error: error.message,
    });
  }
};

// Obtener un carnet específico
const obtenerCarnetPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id;

    const carnet = await Carnet.findOne({
      where: {
        id,
        usuario_id: userId,
      },
    });

    if (!carnet) {
      return res.status(404).json({
        success: false,
        message: 'Carnet no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: carnet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carnet',
      error: error.message,
    });
  }
};

// Crear un nuevo carnet
const crearCarnet = async (req, res) => {
  try {
    const {
      codigo_estudiante,
      tipo_credencial,
      numero,
      fecha_expedicion,
      fecha_vencimiento,
    } = req.body;
    const userId = req.usuario.id;

    // Validar campos requeridos
    if (!tipo_credencial || !numero) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de credencial y número son requeridos',
      });
    }

    // Verificar si el número ya existe para este usuario
    const carnetExistente = await Carnet.findOne({
      where: {
        usuario_id: userId,
        numero,
      },
    });

    if (carnetExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un carnet con este número para tu cuenta',
      });
    }

    const nuevoCarnet = await Carnet.create({
      usuario_id: userId,
      codigo_estudiante: codigo_estudiante || null,
      tipo_credencial,
      numero,
      fecha_expedicion: fecha_expedicion || null,
      fecha_vencimiento: fecha_vencimiento || null,
      codigo_qr: req.files?.qr ? req.files.qr[0].buffer : null,
      archivo_pdf: req.files?.pdf ? req.files.pdf[0].buffer : null,
      foto_perfil: req.files?.foto ? req.files.foto[0].buffer : null,
    });

    res.status(201).json({
      success: true,
      message: 'Carnet creado exitosamente',
      data: {
        id: nuevoCarnet.id,
        tipo_credencial: nuevoCarnet.tipo_credencial,
        numero: nuevoCarnet.numero,
        fecha_expedicion: nuevoCarnet.fecha_expedicion,
        fecha_vencimiento: nuevoCarnet.fecha_vencimiento,
        activo: nuevoCarnet.activo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear carnet',
      error: error.message,
    });
  }
};

// Actualizar un carnet
const actualizarCarnet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id;
    const {
      tipo_credencial,
      numero,
      fecha_expedicion,
      fecha_vencimiento,
      activo,
    } = req.body;

    const carnet = await Carnet.findOne({
      where: {
        id,
        usuario_id: userId,
      },
    });

    if (!carnet) {
      return res.status(404).json({
        success: false,
        message: 'Carnet no encontrado',
      });
    }

    // Actualizar campos
    if (tipo_credencial) carnet.tipo_credencial = tipo_credencial;
    if (numero) {
      // Verificar que el nuevo número no exista
      const carnetConNumero = await Carnet.findOne({
        where: {
          usuario_id: userId,
          numero,
          id: { [require('sequelize').Op.ne]: id },
        },
      });

      if (carnetConNumero) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro carnet con este número',
        });
      }

      carnet.numero = numero;
    }
    if (fecha_expedicion !== undefined) carnet.fecha_expedicion = fecha_expedicion;
    if (fecha_vencimiento !== undefined) carnet.fecha_vencimiento = fecha_vencimiento;
    if (activo !== undefined) carnet.activo = activo;

    // Actualizar archivos si se envían
    if (req.files?.qr) carnet.codigo_qr = req.files.qr[0].buffer;
    if (req.files?.pdf) carnet.archivo_pdf = req.files.pdf[0].buffer;
    if (req.files?.foto) carnet.foto_perfil = req.files.foto[0].buffer;

    await carnet.save();

    res.status(200).json({
      success: true,
      message: 'Carnet actualizado exitosamente',
      data: {
        id: carnet.id,
        tipo_credencial: carnet.tipo_credencial,
        numero: carnet.numero,
        fecha_expedicion: carnet.fecha_expedicion,
        fecha_vencimiento: carnet.fecha_vencimiento,
        activo: carnet.activo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar carnet',
      error: error.message,
    });
  }
};

// Eliminar un carnet
const eliminarCarnet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id;

    const carnet = await Carnet.findOne({
      where: {
        id,
        usuario_id: userId,
      },
    });

    if (!carnet) {
      return res.status(404).json({
        success: false,
        message: 'Carnet no encontrado',
      });
    }

    await carnet.destroy();

    res.status(200).json({
      success: true,
      message: 'Carnet eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar carnet',
      error: error.message,
    });
  }
};

module.exports = {
  obtenerCarnets,
  obtenerCarnetPorId,
  crearCarnet,
  actualizarCarnet,
  eliminarCarnet,
};
