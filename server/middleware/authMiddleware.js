const jwt  = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.user.id).select('-password');
    if (!req.user) throw new Error('user_deleted');
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
}

function admin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ success: false, error: 'Admin access required' });
}

module.exports = { protect, admin };
