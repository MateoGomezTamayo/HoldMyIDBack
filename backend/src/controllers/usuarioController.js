const { Usuario, Carnet } = require('../models');

// Obtener datos del usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: {
        exclude: ['contrasena'],
      },
      include: [
        {
          model: Carnet,
          attributes: {
            exclude: ['codigo_qr', 'archivo_pdf', 'foto_perfil'],
          },
        },
      ],
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
    });
  }
};

// Obtener todos los usuarios (solo para admin, opcional)
const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: {
        exclude: ['contrasena'],
      },
    });

    res.status(200).json({
      success: true,
      data: usuarios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message,
    });
  }
};

module.exports = {
  obtenerUsuarioPorId,
  obtenerTodosLosUsuarios,
};
