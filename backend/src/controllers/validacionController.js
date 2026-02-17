const { VerificacionCodigo, Estudiante, Empleado, Usuario } = require('../models');
const { generarCodigo, enviarCodigoVerificacion } = require('../utils/emailService');
const { Op } = require('sequelize');

// Enviar código de verificación
const enviarCodigo = async (req, res) => {
  try {
    const { cedula, tipo } = req.body;
    const userId = req.usuario.id;
    const emailUsuario = req.usuario.email;

    // Validar que tipo sea ESTUDIANTE o EMPLEADO
    if (!['ESTUDIANTE', 'EMPLEADO'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser ESTUDIANTE o EMPLEADO',
      });
    }

    let registro;
    let correo;

    if (tipo === 'ESTUDIANTE') {
      // Buscar en tabla Estudiante (cedula es código_estudiante)
      registro = await Estudiante.findOne({
        where: { codigo_estudiante: cedula },
      });
      if (!registro || !registro.correo) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró estudiante registrado con ese código',
        });
      }
      correo = registro.correo;
    } else {
      // Buscar en tabla Empleado
      registro = await Empleado.findOne({
        where: { cedula },
      });
      if (!registro || !registro.correo) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró empleado registrado con esa cédula',
        });
      }
      correo = registro.correo;
    }

    // Verificar que el correo del usuario coincida con el correo registrado para esta credencial
    if (emailUsuario.toLowerCase() !== correo.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'El correo de tu cuenta no coincide con el correo registrado para esta credencial. No puedes agregar una credencial que no te pertenece.',
      });
    }

    // Generar código de 6 dígitos
    const codigo = generarCodigo();
    
    // Fecha de expiración (10 minutos)
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 10);

    // Guardar código en base de datos
    await VerificacionCodigo.create({
      usuario_id: userId,
      codigo,
      correo,
      cedula,
      tipo,
      fecha_expiracion: fechaExpiracion,
    });

    // Enviar correo con el código
    const resultadoEmail = await enviarCodigoVerificacion(correo, codigo, tipo);

    if (!resultadoEmail.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el código al correo',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado al correo',
      data: {
        correo: correo.replace(/(.{2})(.*)(@.*)/, '$1****$3'), // Ocultar parcialmente el correo
        tiempoExpiracion: 10, // minutos
      },
    });
  } catch (error) {
    console.error('Error al enviar código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el código',
      error: error.message,
    });
  }
};

// Verificar código
const verificarCodigo = async (req, res) => {
  try {
    const { cedula, tipo, codigo } = req.body;
    const userId = req.usuario.id;

    // Validar que tipo sea ESTUDIANTE o EMPLEADO
    if (!['ESTUDIANTE', 'EMPLEADO'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser ESTUDIANTE o EMPLEADO',
      });
    }

    // Buscar el código no usado y no expirado
    const verificacion = await VerificacionCodigo.findOne({
      where: {
        usuario_id: userId,
        cedula,
        tipo,
        codigo,
        usado: false,
        fecha_expiracion: {
          [Op.gt]: new Date(), // Mayor a la fecha actual
        },
      },
    });

    if (!verificacion) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado',
      });
    }

    // Marcar el código como usado
    await verificacion.update({ usado: true });

    // Obtener información de la credencial
    let infoCredencial;
    if (tipo === 'ESTUDIANTE') {
      infoCredencial = await Estudiante.findOne({
        where: { codigo_estudiante: cedula },
      });
    } else {
      infoCredencial = await Empleado.findOne({
        where: { cedula },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Código verificado correctamente',
      data: {
        cedula,
        tipo,
        verificado: true,
        infoCredencial,
      },
    });
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el código',
      error: error.message,
    });
  }
};

module.exports = {
  enviarCodigo,
  verificarCodigo,
};
