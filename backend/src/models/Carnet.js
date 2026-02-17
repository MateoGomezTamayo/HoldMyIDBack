const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Carnet = sequelize.define('Carnet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id',
    },
  },
  codigo_estudiante: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  tipo_credencial: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Carnet Universitario',
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  fecha_expedicion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fecha_vencimiento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  codigo_qr: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  archivo_pdf: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  foto_perfil: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ultima_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'carnets',
  timestamps: false,
});

// Relación: Un usuario puede tener muchos carnets
Usuario.hasMany(Carnet, {
  foreignKey: 'usuario_id',
  onDelete: 'CASCADE',
});

Carnet.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
});

module.exports = Carnet;
