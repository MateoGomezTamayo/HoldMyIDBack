const jwt = require('jsonwebtoken');

// Generar token JWT
const generateToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      codigo_estudiante: usuario.codigo_estudiante,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Decodificar token sin verificar (opcional)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
