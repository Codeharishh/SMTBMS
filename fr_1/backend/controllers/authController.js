const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

// ─── 1. REGISTER ──────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, department, phone, role } = req.body;

  if (!name || !email || !password || !department) {
    return res.status(400).json({ success: false, message: 'Please fill in all required operational fields.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'This email is already linked to another staff account.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'Employee', department, phone || null]
    );

    // Create default notification preferences
    await connection.query(`
      INSERT INTO notification_preferences 
      (user_id, email, sms, inApp, lowStock, movements, hrEvents, payroll, crm, reports) 
      VALUES (?, 1, 0, 1, 1, 1, 1, 1, 1, 1)
    `, [userResult.insertId]);

    await connection.commit();
    console.log(`Registered: ${email} | ID: ${userResult.insertId}`);
    return res.status(201).json({ success: true, message: 'User profile registered successfully!' });

  } catch (error) {
    await connection.rollback();
    console.error('Register error:', error.message);
    return res.status(500).json({ success: false, message: `Database error: ${error.message}` });
  } finally {
    connection.release();
  }
};

// ─── 2. LOGIN (EMAIL + PASSWORD) ──────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'This account uses Google Sign-In. Please click "Continue with Google".' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    return res.status(200).json({ success: true, token, user });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── 3. GOOGLE LOGIN ──────────────────────────────────────────────────────────
const googleLogin = async (req, res) => {
  const { token, role } = req.body; // Grab selected client workspace interface target role

  if (!token) {
    return res.status(400).json({ success: false, message: 'Google access token is required.' });
  }

  try {
    let googleProfile;
    try {
      const { data } = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      googleProfile = data;
    } catch {
      return res.status(401).json({ success: false, message: 'Google token verification failed. Please try again.' });
    }

    const { sub: googleId, email, email_verified } = googleProfile;

    if (!email_verified) {
      return res.status(401).json({ success: false, message: 'Google account email is not verified.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!rows.length) {
      return res.status(403).json({
        success: false,
        message: `No account found for ${email}. Please contact your admin to create your account first.`
      });
    }

    let user = rows[0];

    // If a specific workspace role interface was passed, align the token context session runtime
    if (role && user.role !== role) {
      user.role = role;
    }

    if (!user.google_id) {
      await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
      console.log(`Linked Google account to existing user: ${email} (ID: ${user.id})`);
      
      // Also ensure they have a preferences row since they are logging in for the first time
      await pool.query(`
        INSERT IGNORE INTO notification_preferences 
        (user_id, email, sms, inApp, lowStock, movements, hrEvents, payroll, crm, reports) 
        VALUES (?, 1, 0, 1, 1, 1, 1, 1, 1, 1)
      `, [user.id]);
    } else if (user.google_id !== googleId) {
      return res.status(403).json({
        success: false,
        message: 'This email is already linked to a different Google account.'
      });
    }

    const jwtToken = signToken(user);
    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Google login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
  }
};

// ─── 4. GET PROFILE ───────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, department, phone, avatar FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateMe = async (req, res) => {
  const { fullName, phone, department, avatar } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name = ?, phone = ?, department = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
      [fullName || null, phone || null, department || null, avatar || null, req.user.id]
    );
    return res.status(200).json({ success: true, message: 'Profile updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, googleLogin, getMe, updateMe };