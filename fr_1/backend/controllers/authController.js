// backend/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // npm install axios (if not already installed)

// ─── helpers ──────────────────────────────────────────────────────────────────

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
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

// ─── 2. LOGIN (email + password) ──────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];

    // Account was created with no password (Google-only account)
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
//
// Flow:
//   1. Frontend sends Google access_token (from useGoogleLogin)
//   2. We call Google's userinfo endpoint to get the real email + google sub ID
//   3. Look up users table by email
//      → FOUND:  link google_id if not already linked, return JWT (all records intact)
//      → NOT FOUND: reject — employees cannot self-register, admin must create them first
//
const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Google access token is required.' });
  }

  try {
    // Step 1 — verify the token with Google and get the user's profile
    let googleProfile;
    try {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      googleProfile = data;
    } catch {
      return res.status(401).json({ success: false, message: 'Google token verification failed. Please try again.' });
    }

    const { sub: googleId, email, name, email_verified } = googleProfile;

    if (!email_verified) {
      return res.status(401).json({ success: false, message: 'Google account email is not verified.' });
    }

    // Step 2 — find existing user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!rows.length) {
      // No account found for this Gmail — admin hasn't created one yet
      return res.status(403).json({
        success: false,
        message: `No account found for ${email}. Please contact your admin to create your account first.`
      });
    }

    const user = rows[0];

    // Step 3 — link google_id to existing account if not already linked
    // This is safe — it only stores the Google sub ID, never overwrites name/email/role/dept
    if (!user.google_id) {
      await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
      console.log(`Linked Google account to existing user: ${email} (ID: ${user.id})`);
    } else if (user.google_id !== googleId) {
      // Edge case: different Google account trying to link to this email
      return res.status(403).json({
        success: false,
        message: 'This email is already linked to a different Google account.'
      });
    }

    // Step 4 — issue JWT exactly like normal login — all existing records stay linked
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
      'SELECT id, name, email, role, department, phone FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, googleLogin, getMe };