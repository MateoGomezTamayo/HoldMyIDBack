const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VerificacionCodigo = sequelize.define('VerificacionCodigo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  codigo: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  cedula: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('ESTUDIANTE', 'EMPLEADO'),
    allowNull: false,
  },
  usado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'verificacion_codigos',
  timestamps: false,
});

module.exports = VerificacionCodigo;
