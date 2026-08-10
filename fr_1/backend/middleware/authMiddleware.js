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

    let rows;
    try {
      [rows] = await pool.query(
        'SELECT id, name, email, role, department, phone FROM users WHERE id = ?',
        [decoded.id]
      );
    } catch (dbErr) {
      if (['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT'].includes(dbErr.code)) {
        console.warn('Retrying DB query in auth middleware due to:', dbErr.code);
        [rows] = await pool.query(
          'SELECT id, name, email, role, department, phone FROM users WHERE id = ?',
          [decoded.id]
        );
      } else {
        throw dbErr;
      }
    }

    if (!rows.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    if (['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT'].includes(error.code)) {
      console.error('Auth middleware DB error:', error.message);
      return res.status(503).json({ message: 'Service temporarily unavailable due to database connection issue' });
    }
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