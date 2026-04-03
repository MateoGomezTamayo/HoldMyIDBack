const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'holdmyidback',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '12345D',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false
  }
);

module.exports = sequelize;
