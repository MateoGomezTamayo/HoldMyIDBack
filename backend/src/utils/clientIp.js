const normalizeIp = (ip) => {
  if (!ip) {
    return 'unknown';
  }

  if (ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }

  if (ip === '::1') {
    return '127.0.0.1';
  }

  return ip;
};

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    const firstIp = forwardedFor.split(',')[0].trim();
    return normalizeIp(firstIp);
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return normalizeIp(realIp.trim());
  }

  return normalizeIp(req.ip || req.socket?.remoteAddress || 'unknown');
};

module.exports = {
  getClientIp,
};
