const crypto = require('crypto');

/**
 * Analyst Authorization Middleware
 * Protects administrative actions (confirming fraud, dismissing transactions, seeding database)
 * Requires a valid Analyst API Key passed in 'x-analyst-key' header or 'Authorization: Bearer <key>'
 */
const requireAnalystAuth = (req, res, next) => {
  const configuredKey = process.env.ANALYST_API_KEY || 'fraudradar-analyst-secret-key-2026';

  // Extract key from x-analyst-key header or Authorization: Bearer <key>
  let providedKey = req.headers['x-analyst-key'];

  if (!providedKey && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'ApiKey')) {
      providedKey = parts[1];
    }
  }

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Analyst credentials (x-analyst-key header or Bearer token) required.',
    });
  }

  // Timing-safe comparison to prevent timing attacks
  const keyBuffer = Buffer.from(providedKey);
  const configBuffer = Buffer.from(configuredKey);

  if (keyBuffer.length !== configBuffer.length || !crypto.timingSafeEqual(keyBuffer, configBuffer)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid Analyst credentials provided.',
    });
  }

  req.analyst = {
    role: 'ANALYST',
    authenticated: true,
  };

  next();
};

module.exports = {
  requireAnalystAuth,
};
