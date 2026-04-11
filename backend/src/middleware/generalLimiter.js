// Middleware para rate limiting general
const rateLimit = require('express-rate-limit');
const { getClientIp } = require('../utils/clientIp');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  keyGenerator: (req) => getClientIp(req),
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta nuevamente en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = generalLimiter;
