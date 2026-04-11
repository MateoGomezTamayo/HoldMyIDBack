// Middleware para limitar intentos y proteger contra fuerza bruta
const rateLimit = require('express-rate-limit');
const { getClientIp } = require('../utils/clientIp');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  keyGenerator: (req) => getClientIp(req),
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
