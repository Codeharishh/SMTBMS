const pool = require('../config/db');

const getEmployeeIdFromUser = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
};

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

    res.json({ attendance: rows[0] || null });
  } catch (error) {
    console.error('Get today attendance error', error);
    res.status(500).json({ message: 'Unable to fetch today attendance' });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    let query = 'SELECT a.* FROM attendance a';
    const params = [];

    if (req.user.role === 'Employee') {
      const employeeId = await getEmployeeIdFromUser(req.user.id);
      if (!employeeId) {
        return res.status(404).json({ message: 'Employee record not found for user' });
      }
      query += ' WHERE a.employee_id = ?';
      params.push(employeeId);
    } else {
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
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Punch in error', error);
    res.status(500).json({ message: 'Unable to punch in' });
  }
};

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
    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Punch out error', error);
    res.status(500).json({ message: 'Unable to punch out' });
  }
};
