/**
 * Auth Middleware - JWT verification, role-based access control
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
async function protect(req, res, next) {
  let token;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) token = header.split(' ')[1];
  else if (req.cookies?.token) token = req.cookies.token;

  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'modern-selfdrive' });
    req.user = await User.findById(decoded.user.id).select('-password -resetOtp -resetOtpExpiry').lean();
    if (!req.user) return res.status(401).json({ success: false, error: 'Account not found' });
    req.user.id = req.user._id.toString();
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    return res.status(401).json({ success: false, error: 'Invalid authentication token' });
  }
}

/**
 * Verify user has admin role
 */
function admin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ success: false, error: 'Admin access required' });
}

/**
 * Verify user has specific role(s)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    next();
  };
}

module.exports = { protect, admin, authorize };

