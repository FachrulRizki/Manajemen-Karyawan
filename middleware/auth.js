const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Extracts and verifies Bearer token from Authorization header.
 * Sets req.user to decoded payload if valid, otherwise returns HTTP 401.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token diperlukan' });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).json({ error: 'Token diperlukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token telah kedaluwarsa' });
    }
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

module.exports = authMiddleware;
