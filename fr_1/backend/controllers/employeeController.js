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
      `SELECT e.*, COALESCE(e.name, u.name) as name, COALESCE(e.email, u.email) as email, u.role as user_role,
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
      `SELECT e.*, u.id as user_id, COALESCE(e.name, u.name) as name, COALESCE(e.email, u.email) as email, u.role as user_role,
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
      `SELECT e.*, u.id as user_id, COALESCE(e.name, u.name) as name, COALESCE(e.email, u.email) as email, u.role as user_role,
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
    const { user_id, name, email, department, designation, salary, base_salary, join_date, hire_date, attendance_status, leave_balance, employee_code, role } = req.body;
    const finalSalary = salary || base_salary || 0;
    const finalJoinDate = join_date || hire_date || new Date();

    if (user_id) {
      const [userCheck] = await pool.query('SELECT id, name FROM users WHERE id = ?', [user_id]);
      if (!userCheck.length) {
        return res.status(404).json({ message: `No user account found for user_id: ${user_id}. Register the user first.` });
      }

      const [dupCheck] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [user_id]);
      if (dupCheck.length > 0) {
        return res.status(409).json({ message: `Employee profile already exists for this user (Employee ID: ${dupCheck[0].id}). Use Edit to update their record.` });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO employees (user_id, name, email, department, designation, salary, join_date, attendance_status, leave_balance, employee_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, name || 'New Employee', email || null, department, designation || role, finalSalary, finalJoinDate, attendance_status || 'Present', leave_balance || 0, employee_code || null]
    );
    const [rows] = await pool.query(
      `SELECT e.*, COALESCE(e.name, u.name) as name, COALESCE(e.email, u.email) as email, u.role as user_role,
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
    const { name, email, department, designation, role, salary, base_salary, join_date, hire_date, attendance_status, leave_balance, employee_code } = req.body;
    const finalSalary = salary || base_salary || 0;
    const finalJoinDate = join_date || hire_date || null;
    
    await pool.query(
      'UPDATE employees SET name = ?, email = ?, department = ?, designation = ?, salary = ?, join_date = ?, attendance_status = ?, leave_balance = ?, employee_code = ? WHERE id = ?',
      [name || null, email || null, department, designation || role, finalSalary, finalJoinDate, attendance_status || 'Present', leave_balance || 0, employee_code || null, req.params.id]
    );
    const [rows] = await pool.query(
      `SELECT e.*, COALESCE(e.name, u.name) as name, COALESCE(e.email, u.email) as email, u.role as user_role,
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
      `SELECT e.*, COALESCE(e.name, u.name) as name, COALESCE(e.email, u.email) as email, u.role as user_role,
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

// ─── NEW: fetch tasks assigned to the logged-in employee ──────────────────────
// The manager_tasks table uses assigned_to = employees.id (not users.id),
// so we first resolve the employee row for the current user, then query tasks.
exports.getMyTasks = async (req, res) => {
  try {
    // Step 1: find the employee record that belongs to this user
    const [empRows] = await pool.query(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (!empRows.length) {
      // User exists but has no employee profile yet — return empty list gracefully
      return res.json([]);
    }

    const employeeId = empRows[0].id;

    // Step 2: fetch tasks assigned to that employee, joining assigner name
    const [tasks] = await pool.query(
      `SELECT
         t.id,
         t.title,
         t.description,
         t.priority,
         t.status,
         t.due_date,
         t.created_at,
         u.name AS assigned_by_name
       FROM manager_tasks t
       LEFT JOIN users u ON t.assigned_by = u.id
       WHERE t.assigned_to = ?
       ORDER BY
         FIELD(t.priority, 'High', 'Medium', 'Low'),
         t.due_date ASC,
         t.created_at DESC`,
      [employeeId]
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error', error);
    res.status(500).json({ message: 'Unable to fetch tasks' });
  }
};