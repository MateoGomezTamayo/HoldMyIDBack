const { Usuario, Carnet, Estudiante, Empleado, VerificacionCodigo } = require('../models');
const QRCode = require('qrcode');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { generarCodigo, enviarCodigoVerificacion } = require('../utils/emailService');
const { Op } = require('sequelize');

// Registro de usuario (Paso 1: Enviar código de verificación)
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

    // Validar rol si se envía
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

    // Validar que exista en la tabla base (estudiantes/empleados)
    let registroBase;
    let identificador;
    let correoRegistro; // un solo nombre usado en todo el flujo

    if (rolFinal === 'ESTUDIANTE') {
      registroBase = await Estudiante.findOne({
        where: { codigo_estudiante },
      });

      if (!registroBase) {
        return res.status(400).json({
          success: false,
          message: 'El código de estudiante no existe en la base de datos',
        });
      }

      identificador = codigo_estudiante;
      correoRegistro = registroBase.correo; // campo DB en minúsculas

      if (!correoRegistro) {
        return res.status(400).json({
          success: false,
          message: 'El código de estudiante no tiene correo registrado. Contacta admisión.',
        });
      }

      // Verificar que el correo proporcionado coincida con el de la BD
      if (email.toLowerCase() !== correoRegistro.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'El correo proporcionado no coincide con el registrado para este código de estudiante',
        });
      }
    } else {
      registroBase = await Empleado.findOne({
        where: { cedula },
      });

      if (!registroBase) {
        return res.status(400).json({
          success: false,
          message: 'La cédula no existe en la base de datos',
        });
      }

      identificador = cedula;
      correoRegistro = registroBase.correo;

      if (!correoRegistro) {
        return res.status(400).json({
          success: false,
          message: 'La cédula no tiene correo registrado. Contacta recursos humanos.',
        });
      }

      // Verificar que el correo proporcionado coincida con el de la BD
      if (email.toLowerCase() !== correoRegistro.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'El correo proporcionado no coincide con el registrado para esta cédula',
        });
      }
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email },
    });

    if (usuarioExistente && usuarioExistente.email_verificado) {
      return res.status(400).json({
        success: false,
        message: 'Este correo ya está registrado y verificado',
      });
    }

    // Generar código de verificación
    const codigo = generarCodigo();
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 10);

    // Guardar el código temporalmente (después procesar en verificarRegistro)
    // Se almacena la información del registro para luego verificar
    const datosRegistro = {
      nombre,
      apellidos,
      email,
      password,
      codigo_estudiante: rolFinal === 'ESTUDIANTE' ? codigo_estudiante : null,
      cedula: rolFinal === 'EMPLEADO' ? cedula : null,
      universidad: universidad || null,
      rol: rolFinal,
      cargo: cargo || null,
    };

    // Crear código de verificación de registro
    await VerificacionCodigo.create({
      usuario_id: 0, // Temporal, sin usuario aún
      codigo,
      correo: correoRegistro,
      cedula: identificador,
      tipo: rolFinal,
      fecha_expiracion: fechaExpiracion,
      usado: false,
    });

    // Guardar datos en sesión o caché (o enviar al frontend para que reenviélos)
    // Por ahora usaremos VerificacionCodigo como almacenamiento temporal
    
    // Enviar código por correo
    const resultadoEmail = await enviarCodigoVerificacion(correoRegistro, codigo, `Registro - ${rolFinal}`);

    if (!resultadoEmail.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el código al correo',
      });
    }

    // Encriptar datos para enviar al frontend
    const datosEncriptados = Buffer.from(JSON.stringify(datosRegistro)).toString('base64');

    const responseData = {
      correo: correoRegistro.replace(/(.{2})(.*)(@.*)/, '$1****$3'),
      tiempoExpiracion: 10,
      datosTemp: datosEncriptados, // Enviar al frontend para después
    };

    // En desarrollo, mostrar el código en consola
    if (process.env.NODE_ENV === 'development') {
      responseData.codigo = codigo; // Agregar código solo en desarrollo
      responseData.requiereVerificacion = true;
      responseData.usuarioTemp = datosEncriptados; // Para que puedas reutilizar los datos
    }

    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado al correo',
      data: responseData,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el registro',
      error: error.message,
    });
  }
};

// Verificar código de registro (Paso 2: Confirmar correo y crear cuenta)
const verificarRegistro = async (req, res) => {
  try {
    const { codigo, nombre, apellidos, email, password, codigo_estudiante, cedula, universidad, rol, cargo, datosTemp } = req.body;

    // Validar campos
    if (!codigo || !nombre || !apellidos || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
      });
    }

    const identificador = rol === 'ESTUDIANTE' ? codigo_estudiante : cedula;

    // Buscar el código de verificación no usado y no expirado
    const verificacion = await VerificacionCodigo.findOne({
      where: {
        codigo,
        cedula: identificador,
        tipo: rol,
        usado: false,
        fecha_expiracion: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!verificacion) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido, expirado o ya utilizado',
      });
    }

    // Marcar código como usado
    await verificacion.update({ usado: true });

    // Verificar si el usuario ya existe
    let usuarioFinal = await Usuario.findOne({
      where: { email },
    });

    if (!usuarioFinal) {
      // Hashear contraseña
      const passwordHasheada = await hashPassword(password);

      // Crear usuario verificado
      usuarioFinal = await Usuario.create({
        nombre,
        apellidos,
        codigo_estudiante: rol === 'ESTUDIANTE' ? codigo_estudiante : null,
        email,
        contrasena: passwordHasheada,
        universidad: universidad || null,
        cedula: rol === 'EMPLEADO' ? cedula : null,
        rol,
        email_verificado: true, // Marcado como verificado
      });
    } else {
      // Si el usuario existe pero no está verificado, actualizar
      if (!usuarioFinal.email_verificado) {
        await usuarioFinal.update({ email_verificado: true });
      }
    }

    // Crear carnet inicial
    const qrPayload = JSON.stringify({
      id: usuarioFinal.id,
      identificador,
      rol,
    });

    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      type: 'png',
      width: 300,
      margin: 1,
    });

    const carnetCreado = await Carnet.create({
      usuario_id: usuarioFinal.id,
      codigo_estudiante: identificador,
      rol,
      numero: `${rol}-${identificador}`,
      codigo_qr: qrBuffer,
    });

    // Generar token
    const token = generateToken(usuarioFinal);
    const qrBase64 = qrBuffer.toString('base64');

    res.status(201).json({
      success: true,
      message: '¡Registro completado exitosamente! Tu correo ha sido verificado.',
      data: {
        id: usuarioFinal.id,
        nombre: usuarioFinal.nombre,
        apellidos: usuarioFinal.apellidos,
        email: usuarioFinal.email,
        rol: usuarioFinal.rol,
        email_verificado: usuarioFinal.email_verificado,
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
    console.error('Error al verificar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el registro',
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

    // Verificar si el email está verificado
    if (!usuario.email_verificado) {
      return res.status(401).json({
        success: false,
        message: 'Tu correo no ha sido verificado. Por favor verifica tu correo antes de continuar.',
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
  verificarRegistro,
  login,
  obtenerPerfil,
};
