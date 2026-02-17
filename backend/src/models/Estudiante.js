const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estudiante = sequelize.define('Estudiante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo_estudiante: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  carrera: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'estudiantes',
  timestamps: false,
});

module.exports = Estudiante;
