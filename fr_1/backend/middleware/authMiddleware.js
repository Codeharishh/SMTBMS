const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, name, email, role, department, phone FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// RECTIFIED: Case-Insensitive Role Checking Engine
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'User role not authorized' });
    }

    // Convert both strings to lowercase to bypass sensitive casing loops
    const currentUserRole = req.user.role.toLowerCase();
    const targetedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!targetedRoles.includes(currentUserRole)) {
      return res.status(403).json({
        message: `Forbidden: Role (${req.user.role}) does not have access privileges.`
      });
    }

    next();
  };
};