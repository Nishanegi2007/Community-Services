const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function requireAdmin(req, res, next) {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') !== allowedOrigin) {
    return res.status(403).json({ message: 'Request origin is not allowed.' });
  }

  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Please sign in as an admin.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const admin = await User.findOne({ _id: payload.id, role: 'admin' }).select('_id name email role');
    if (!admin) return res.status(401).json({ message: 'Admin account not found.' });
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    next(error);
  }
}

module.exports = requireAdmin;
