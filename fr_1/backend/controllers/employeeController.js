const pool = require('../config/db');

exports.getAllEmployees = async (req, res) => {
  try {
    await pool.query(
      `UPDATE employees e
       JOIN users u ON e.user_id = u.id
       SET e.department = u.department
       WHERE (e.department IS NULL OR e.department = '')
         AND (u.department IS NOT NULL AND u.department != '')`
    );

    const [rows] = await pool.query(
      `SELECT e.*, u.name as name, u.email as email, u.role as user_role,
              COALESCE(NULLIF(e.department,''), NULLIF(u.department,''), 'General') as department
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       ORDER BY e.join_date DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get employees error', error);
    res.status(500).json({ message: 'Unable to fetch employees' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.id as user_id, u.name as name, u.email as email, u.role as user_role,
              COALESCE(NULLIF(e.department,''), NULLIF(u.department,''), 'General') as department
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = rows[0];
    if (req.user.role === 'Employee' && req.user.id !== employee.user_id) {
      return res.status(403).json({ message: 'Employees can only access their own profile' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error', error);
    res.status(500).json({ message: 'Unable to fetch employee' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.id as user_id, u.name as name, u.email as email, u.role as user_role,
              COALESCE(NULLIF(e.department,''), NULLIF(u.department,''), 'General') as department
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get my profile error', error);
    res.status(500).json({ message: 'Unable to fetch your profile' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { user_id, department, designation, salary, join_date, attendance_status, leave_balance } = req.body;
    const [result] = await pool.query(
      'INSERT INTO employees (user_id, department, designation, salary, join_date, attendance_status, leave_balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, department, designation, salary || 0, join_date || new Date(), attendance_status || 'Present', leave_balance || 0]
    );
    const [rows] = await pool.query(
      `SELECT e.*, u.name as name, u.email as email, u.role as user_role,
              COALESCE(NULLIF(e.department,''), NULLIF(u.department,''), 'General') as department
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create employee error', error);
    res.status(500).json({ message: 'Unable to create employee' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { department, designation, salary, join_date, attendance_status, leave_balance } = req.body;
    await pool.query(
      'UPDATE employees SET department = ?, designation = ?, salary = ?, join_date = ?, attendance_status = ?, leave_balance = ? WHERE id = ?',
      [department, designation, salary || 0, join_date, attendance_status || 'Present', leave_balance || 0, req.params.id]
    );
    const [rows] = await pool.query(
      `SELECT e.*, u.name as name, u.email as email, u.role as user_role,
              COALESCE(NULLIF(e.department,''), NULLIF(u.department,''), 'General') as department
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Update employee error', error);
    res.status(500).json({ message: 'Unable to update employee' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    console.error('Delete employee error', error);
    res.status(500).json({ message: 'Unable to delete employee' });
  }
};

exports.punchAttendance = async (req, res) => {
  try {
    const { status = 'Present' } = req.body;
    const employeeId = req.params.id;
    const [employeeRows] = await pool.query('SELECT user_id, attendance_status FROM employees WHERE id = ?', [employeeId]);
    if (!employeeRows.length) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = employeeRows[0];
    if (req.user.role === 'Employee' && req.user.id !== employee.user_id) {
      return res.status(403).json({ message: 'Employees can only punch their own attendance' });
    }

    const updatedStatus = status || 'Present';
    await pool.query('UPDATE employees SET attendance_status = ? WHERE id = ?', [updatedStatus, employeeId]);

    const [updatedRows] = await pool.query(
      `SELECT e.*, u.name as name, u.email as email, u.role as user_role,
              COALESCE(NULLIF(e.department,''), NULLIF(u.department,''), 'General') as department
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [employeeId]
    );

    res.json({ message: 'Attendance updated', employee: updatedRows[0] });
  } catch (error) {
    console.error('Punch attendance error', error);
    res.status(500).json({ message: 'Unable to update attendance' });
  }
};
