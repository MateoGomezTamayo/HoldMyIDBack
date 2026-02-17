const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'holdmyidback',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false
  }
);

// Prueba de conexión
sequelize.authenticate()
  .then(() => {
    console.log(' Conexión a MySQL establecida correctamente');
  })
  .catch((error) => {
    console.error(' Error de conexión a MySQL:', error.message);
  });

module.exports = sequelize;
