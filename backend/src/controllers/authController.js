const { Usuario, Carnet, Estudiante, Empleado } = require('../models');
const QRCode = require('qrcode');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// Registro de usuario
const registro = async (req, res) => {
  try {
    const { nombre, apellidos, codigo_estudiante, email, contraseña, contrasena, universidad, rol, cedula, cargo } = req.body;
    const password = contraseña || contrasena;

    // Validar campos requeridos básicos
    if (!nombre || !apellidos || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellidos, email y contraseña son requeridos',
      });
    }

    // Validar rol si se envia
    if (rol && !['ESTUDIANTE', 'EMPLEADO'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Usa ESTUDIANTE o EMPLEADO',
      });
    }

    const rolFinal = rol || 'ESTUDIANTE';

    // Validar campos específicos según el rol
    if (rolFinal === 'ESTUDIANTE' && !codigo_estudiante) {
      return res.status(400).json({
        success: false,
        message: 'El código de estudiante es requerido',
      });
    }

    if (rolFinal === 'EMPLEADO' && !cedula) {
      return res.status(400).json({
        success: false,
        message: 'La cédula es requerida para empleados',
      });
    }

    // Validar existencia en tablas base
    if (rolFinal === 'ESTUDIANTE') {
      const estudianteValido = await Estudiante.findOne({
        where: { codigo_estudiante },
      });

      if (!estudianteValido) {
        return res.status(400).json({
          success: false,
          message: 'El código de estudiante no está autorizado',
        });
      }
    }

    if (rolFinal === 'EMPLEADO') {
      const empleadoValido = await Empleado.findOne({
        where: { cedula },
      });

      if (!empleadoValido) {
        return res.status(400).json({
          success: false,
          message: 'La cédula no está autorizada',
        });
      }

      // Actualizar cargo si se proporciona
      if (cargo) {
        await empleadoValido.update({ cargo });
      }
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email },
    });

    let usuarioFinal = usuarioExistente;

    if (usuarioExistente) {
      const contraseñaValida = await verifyPassword(password, usuarioExistente.contrasena);
      if (!contraseñaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }
    } else {
      // Hashear contraseña
      const contraseñaHasheada = await hashPassword(password);

      // Crear usuario
      usuarioFinal = await Usuario.create({
        nombre,
        apellidos,
        codigo_estudiante: rolFinal === 'ESTUDIANTE' ? codigo_estudiante : null,
        email,
        contrasena: contraseñaHasheada,
        universidad: universidad || null,
        cedula: rolFinal === 'EMPLEADO' ? cedula : null,
        rol: rolFinal,
      });
    }

    const identificador = rolFinal === 'EMPLEADO' ? cedula : codigo_estudiante;

    const carnetExistente = await Carnet.findOne({
      where: {
        usuario_id: usuarioFinal.id,
        rol: rolFinal,
        codigo_estudiante: identificador,
      },
    });

    if (carnetExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un carnet para este rol',
      });
    }

    const qrPayload = JSON.stringify({
      id: usuarioFinal.id,
      identificador,
      rol: rolFinal,
    });
    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      type: 'png',
      width: 300,
      margin: 1,
    });

    const carnetCreado = await Carnet.create({
      usuario_id: usuarioFinal.id,
      codigo_estudiante: identificador,
      rol: rolFinal,
      numero: `${rolFinal}-${identificador}`,
      codigo_qr: qrBuffer,
    });

    // Generar token
    const token = generateToken(usuarioFinal);
    
    // Convertir QR a base64
    const qrBase64 = qrBuffer.toString('base64');

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: usuarioFinal.id,
        nombre: usuarioFinal.nombre,
        apellidos: usuarioFinal.apellidos,
        codigo_estudiante: usuarioFinal.codigo_estudiante,
        email: usuarioFinal.email,
        universidad: usuarioFinal.universidad,
        cedula: usuarioFinal.cedula,
        rol: usuarioFinal.rol,
        carnet: {
          id: carnetCreado.id,
          numero: carnetCreado.numero,
          rol: carnetCreado.rol,
          qr_base64: qrBase64,
        },
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el registro',
      error: error.message,
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, contraseña, contrasena } = req.body;
    const password = contraseña || contrasena;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar contraseña
    const contraseñaValida = await verifyPassword(password, usuario.contrasena);

    if (!contraseñaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado',
      });
    }

    // Generar token
    const token = generateToken(usuario);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        codigo_estudiante: usuario.codigo_estudiante,
        email: usuario.email,
        universidad: usuario.universidad,
        cedula: usuario.cedula,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el login',
      error: error.message,
    });
  }
};

// Obtener datos del usuario (requerido autenticación)
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: {
        exclude: ['contrasena'],
      },
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
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};

module.exports = {
  registro,
  login,
  obtenerPerfil,
};
