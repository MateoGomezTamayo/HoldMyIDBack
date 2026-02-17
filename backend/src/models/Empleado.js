const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empleado = sequelize.define('Empleado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'empleados',
  timestamps: false,
});

module.exports = Empleado;
