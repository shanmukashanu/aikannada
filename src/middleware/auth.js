const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  // Bypass all auth if explicitly disabled
  if (process.env.DISABLE_AUTH === 'true') {
    return next();
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authRequired };
