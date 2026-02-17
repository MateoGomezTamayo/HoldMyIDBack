const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  codigo_estudiante: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  universidad: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  rol: {
    type: DataTypes.ENUM('ADMIN', 'ESTUDIANTE', 'EMPLEADO'),
    allowNull: false,
    defaultValue: 'ESTUDIANTE',
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
  tableName: 'usuarios',
  timestamps: false,
});

module.exports = Usuario;
