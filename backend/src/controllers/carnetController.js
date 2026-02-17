const { Carnet, Usuario, Empleado, Estudiante } = require('../models');
const { Op } = require('sequelize');
const QRCode = require('qrcode');

const mapCarnet = (carnet) => {
  const data = carnet.toJSON();
  return {
    ...data,
    codigo_qr: undefined,
    qr_base64: data.codigo_qr ? data.codigo_qr.toString('base64') : null,
    foto_perfil: undefined,
    foto_base64: data.foto_perfil ? data.foto_perfil.toString('base64') : null,
  };
};

// Obtener todos los carnets del usuario autenticado
const obtenerCarnets = async (req, res) => {
  try {
    const userId = req.usuario.id;

    const carnets = await Carnet.findAll({
      where: {
        usuario_id: userId,
      },
      attributes: {
        exclude: ['archivo_pdf'],
      },
    });

    // Enriquecer carnets con información de carrera si es estudiante o cargo si es empleado
    const carnetEnriquecidos = await Promise.all(
      carnets.map(async (carnet) => {
        const mapped = mapCarnet(carnet);
        
        if (carnet.rol === 'ESTUDIANTE') {
          const estudiante = await Estudiante.findOne({
            where: { codigo_estudiante: carnet.codigo_estudiante },
            attributes: ['codigo_estudiante', 'carrera'],
            raw: true,
          });
          if (estudiante) {
            mapped.carrera = estudiante.carrera || null;
          }
        } else if (carnet.rol === 'EMPLEADO') {
          const empleado = await Empleado.findOne({
            where: { cedula: carnet.codigo_estudiante },
            attributes: ['cedula', 'cargo'],
            raw: true,
          });
          if (empleado && empleado.cargo) {
            mapped.cargo = empleado.cargo;
          } else {
            mapped.cargo = null;
          }
        }
        
        return mapped;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Carnets obtenidos correctamente',
      data: carnetEnriquecidos,
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
      data: mapCarnet(carnet),
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
          id: { [Op.ne]: id },
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

// Agregar carnet de empleado
const agregarEmpleado = async (req, res) => {
  try {
    const { cedula, cargo } = req.body;
    const userId = req.usuario.id;

    // Validar campos requeridos
    if (!cedula) {
      return res.status(400).json({
        success: false,
        message: 'La cédula es requerida',
      });
    }

    // Verificar que el usuario existe y es el usuario autenticado
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // VERIFICACIÓN DE SEGURIDAD: Comprobar que la cédula no pertenezca a otro usuario
    const cedulaUsuarioOtro = await Usuario.findOne({
      where: {
        cedula: cedula,
        id: { [Op.ne]: userId },
      },
    });

    if (cedulaUsuarioOtro) {
      return res.status(403).json({
        success: false,
        message: 'Esta cédula ya está registrada bajo otro usuario. No puedes agregar un carnet con datos de otra persona.',
      });
    }

    // Validar que la cédula existe en la tabla empleados y actualizar cargo
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

    // Verificar si ya existe un carnet de empleado para este usuario
    const carnetExistente = await Carnet.findOne({
      where: {
        usuario_id: userId,
        rol: 'EMPLEADO',
        codigo_estudiante: cedula,
      },
    });

    if (carnetExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un carnet de empleado para esta cédula',
      });
    }

    // Generar QR
    const qrPayload = JSON.stringify({
      id: userId,
      identificador: cedula,
      rol: 'EMPLEADO',
    });

    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      type: 'png',
      width: 300,
      margin: 1,
    });

    // Crear carnet
    const carnetCreado = await Carnet.create({
      usuario_id: userId,
      codigo_estudiante: cedula,
      rol: 'EMPLEADO',
      numero: `EMPLEADO-${cedula}`,
      codigo_qr: qrBuffer,
    });

    // Guardar cedula en Usuario si no la tiene
    if (!usuario.cedula) {
      await usuario.update({ cedula });
    }

    res.status(201).json({
      success: true,
      message: 'Carnet de empleado agregado exitosamente',
      data: mapCarnet(carnetCreado),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar carnet de empleado',
      error: error.message,
    });
  }
};

// Agregar carnet de estudiante
const agregarEstudiante = async (req, res) => {
  try {
    const { codigo_estudiante } = req.body;
    const userId = req.usuario.id;

    // Validar campos requeridos
    if (!codigo_estudiante) {
      return res.status(400).json({
        success: false,
        message: 'El código de estudiante es requerido',
      });
    }

    // Verificar que el usuario existe y es el usuario autenticado
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // VERIFICACIÓN DE SEGURIDAD: Comprobar que el código no pertenezca a otro usuario
    const codigoUsuarioOtro = await Usuario.findOne({
      where: {
        codigo_estudiante: codigo_estudiante,
        id: { [Op.ne]: userId },
      },
    });

    if (codigoUsuarioOtro) {
      return res.status(403).json({
        success: false,
        message: 'Este código de estudiante ya está registrado bajo otro usuario. No puedes agregar un carnet con datos de otra persona.',
      });
    }

    // Validar que el código existe en la tabla estudiantes
    const estudianteValido = await Estudiante.findOne({
      where: { codigo_estudiante },
    });

    if (!estudianteValido) {
      return res.status(400).json({
        success: false,
        message: 'El código de estudiante no está autorizado',
      });
    }

    // Verificar si ya existe un carnet de estudiante para este usuario
    const carnetExistente = await Carnet.findOne({
      where: {
        usuario_id: userId,
        rol: 'ESTUDIANTE',
        codigo_estudiante: codigo_estudiante,
      },
    });

    if (carnetExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un carnet de estudiante con este código',
      });
    }

    // Generar QR
    const qrPayload = JSON.stringify({
      id: userId,
      identificador: codigo_estudiante,
      rol: 'ESTUDIANTE',
    });

    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      type: 'png',
      width: 300,
      margin: 1,
    });

    // Crear carnet
    const carnetCreado = await Carnet.create({
      usuario_id: userId,
      codigo_estudiante: codigo_estudiante,
      rol: 'ESTUDIANTE',
      numero: `ESTUDIANTE-${codigo_estudiante}`,
      codigo_qr: qrBuffer,
    });

    // Guardar código_estudiante en Usuario si no lo tiene
    if (!usuario.codigo_estudiante) {
      await usuario.update({ codigo_estudiante });
    }

    res.status(201).json({
      success: true,
      message: 'Carnet de estudiante agregado exitosamente',
      data: mapCarnet(carnetCreado),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar carnet de estudiante',
      error: error.message,
    });
  }
};

// Actualizar foto del carnet
const actualizarFotoCarnet = async (req, res) => {
  try {
    const { carnetId } = req.params;
    const userId = req.usuario.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se envió archivo de foto',
      });
    }

    const carnet = await Carnet.findOne({
      where: {
        id: carnetId,
        usuario_id: userId,
      },
    });

    if (!carnet) {
      return res.status(404).json({
        success: false,
        message: 'Carnet no encontrado',
      });
    }

    // Guardar la foto como buffer
    carnet.foto_perfil = req.file.buffer;
    await carnet.save();

    // Convertir a base64 para la respuesta
    const fotoBase64 = req.file.buffer.toString('base64');

    res.status(200).json({
      success: true,
      message: 'Foto actualizada exitosamente',
      data: {
        id: carnet.id,
        foto_url: `data:image/jpeg;base64,${fotoBase64}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar foto',
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
  agregarEmpleado,
  agregarEstudiante,
  actualizarFotoCarnet,
};
