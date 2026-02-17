const { Usuario } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// Registro de usuario
const registro = async (req, res) => {
  try {
    const { nombre, apellidos, codigo_estudiante, email, contraseña, universidad } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellidos || !codigo_estudiante || !email || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben ser completados',
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: {
        email,
      },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // Verificar si el código de estudiante ya existe
    const codigoExistente = await Usuario.findOne({
      where: {
        codigo_estudiante,
      },
    });

    if (codigoExistente) {
      return res.status(400).json({
        success: false,
        message: 'El código de estudiante ya está registrado',
      });
    }

    // Hashear contraseña
    const contraseñaHasheada = await hashPassword(contraseña);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellidos,
      codigo_estudiante,
      email,
      contrasena: contraseñaHasheada,
      universidad: universidad || null,
    });

    // Generar token
    const token = generateToken(nuevoUsuario);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellidos: nuevoUsuario.apellidos,
        codigo_estudiante: nuevoUsuario.codigo_estudiante,
        email: nuevoUsuario.email,
        universidad: nuevoUsuario.universidad,
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
    const { email, contraseña } = req.body;

    // Validar campos requeridos
    if (!email || !contraseña) {
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
    const contraseñaValida = await verifyPassword(contraseña, usuario.contrasena);

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
