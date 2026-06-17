// backend/controllers/attendanceController.js
const pool = require('../config/db');

// Helper function to resolve employee relation references
const getEmployeeIdFromUser = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
};

// ==========================================
// 1. GET TODAY'S ATTENDANCE STATUS
// ==========================================
exports.getTodayAttendance = async (req, res) => {
  try {
    const employeeId = await getEmployeeIdFromUser(req.user.id);
    if (!employeeId) {
      return res.status(404).json({ message: 'Employee record not found for user' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = ? AND DATE(attendance_date) = CURDATE() LIMIT 1`,
      [employeeId]
    );

    // 🟢 FRONTEND MAPPING FIX: Ensures keys match the component expectations
    const record = rows[0] || null;
    res.json({
      success: true,
      punchedIn: record ? !!record.check_in : false,
      punchedOut: record ? !!record.check_out : false,
      attendance: record
    });
  } catch (error) {
    console.error('Get today attendance error', error);
    res.status(500).json({ message: 'Unable to fetch today attendance' });
  }
};

// ==========================================
// 2. GET ATTENDANCE HISTORY (ROLES ADAPTIVE)
// ==========================================
exports.getAttendanceHistory = async (req, res) => {
  try {
    // 🟢 ENHANCED: Joint query resolves human-readable names for Managers automatically
    let query = `
      SELECT a.*, e.name as employee_name, e.department 
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
    `;
    const params = [];

    // If standard Employee, isolate down to their specific database mapping array index
    if (req.user.role === 'Employee') {
      const employeeId = await getEmployeeIdFromUser(req.user.id);
      if (!employeeId) {
        return res.status(404).json({ message: 'Employee record not found for user' });
      }
      query += ' WHERE a.employee_id = ?';
      params.push(employeeId);
    } else {
      // Admin, HR, or Manager can pass a query string filter parameter
      const { employeeId } = req.query;
      if (employeeId) {
        query += ' WHERE a.employee_id = ?';
        params.push(employeeId);
      }
    }

    query += ' ORDER BY a.attendance_date DESC, a.check_in DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get attendance history error', error);
    res.status(500).json({ message: 'Unable to fetch attendance history' });
  }
};

// ==========================================
// 3. PUNCH IN SESSION REGISTRATION
// ==========================================
exports.punchIn = async (req, res) => {
  try {
    const employeeId = await getEmployeeIdFromUser(req.user.id);
    if (!employeeId) {
      return res.status(404).json({ message: 'Employee record not found for user' });
    }

    const [existing] = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = ? AND DATE(attendance_date) = CURDATE() LIMIT 1`,
      [employeeId]
    );

    if (existing.length) {
      return res.status(400).json({ message: 'Already punched in for today' });
    }

    const [result] = await pool.query(
      'INSERT INTO attendance (employee_id, attendance_date, check_in, status, created_at) VALUES (?, CURDATE(), NOW(), ?, NOW())',
      [employeeId, 'Present']
    );

    const [rows] = await pool.query('SELECT * FROM attendance WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Punched in smoothly! Shift session tracking initialized.',
      record: rows[0]
    });
  } catch (error) {
    console.error('Punch in error', error);
    res.status(500).json({ message: 'Unable to punch in' });
  }
};

// ==========================================
// 4. PUNCH OUT SESSION REGISTRATION
// ==========================================
exports.punchOut = async (req, res) => {
  try {
    const employeeId = await getEmployeeIdFromUser(req.user.id);
    if (!employeeId) {
      return res.status(404).json({ message: 'Employee record not found for user' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = ? AND DATE(attendance_date) = CURDATE() LIMIT 1`,
      [employeeId]
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'Punch in first before punching out' });
    }

    const attendance = rows[0];
    if (attendance.check_out) {
      return res.status(400).json({ message: 'Already punched out for today' });
    }

    await pool.query('UPDATE attendance SET check_out = NOW() WHERE id = ?', [attendance.id]);
    const [updatedRows] = await pool.query('SELECT * FROM attendance WHERE id = ?', [attendance.id]);

    res.json({
      success: true,
      message: 'Shift closed smoothly! Punched out successfully.',
      record: updatedRows[0]
    });
  } catch (error) {
    console.error('Punch out error', error);
    res.status(500).json({ message: 'Unable to punch out' });
  }
};