const pool = require('../config/db');


// APPLY LEAVE
exports.applyLeave = async (req, res) => {

  try {

    const {
      leave_type,
      start_date,
      end_date,
      reason,
    } = req.body;


    // FIND EMPLOYEE USING USER ID
    const [employeeRows] = await pool.query(
      `
      SELECT id
      FROM employees
      WHERE user_id = ?
      `,
      [req.user.id]
    );

    let employee_id;
    if (!employeeRows.length) {
      const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      const name = userRows.length ? userRows[0].name : 'Admin';
      const [insertResult] = await pool.query(
        'INSERT INTO employees (user_id, name, department, designation, salary) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, name, 'Admin', req.user.role || 'Admin', 0]
      );
      employee_id = insertResult.insertId;
    } else {
      employee_id = employeeRows[0].id;
    }


    // INSERT LEAVE REQUEST
    await pool.query(
      `
      INSERT INTO leave_requests
      (
        employee_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        employee_id,
        leave_type,
        start_date,
        end_date,
        reason,
        'Pending',
      ]
    );

    res.status(201).json({
      message: 'Leave applied successfully',
    });

  } catch (error) {

    console.error('Apply leave error', error);

    res.status(500).json({
      message: 'Unable to apply leave',
    });

  }
};


// GET EMPLOYEE LEAVES
exports.getEmployeeLeaves = async (req, res) => {

  try {

    const [employeeRows] = await pool.query(
      `
      SELECT id
      FROM employees
      WHERE user_id = ?
      `,
      [req.user.id]
    );

    let employee_id;
    if (!employeeRows.length) {
      const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      const name = userRows.length ? userRows[0].name : 'Admin';
      const [insertResult] = await pool.query(
        'INSERT INTO employees (user_id, name, department, designation, salary) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, name, 'Admin', req.user.role || 'Admin', 0]
      );
      employee_id = insertResult.insertId;
    } else {
      employee_id = employeeRows[0].id;
    }


    const [rows] = await pool.query(
      `
      SELECT *
      FROM leave_requests
      WHERE employee_id = ?
      ORDER BY id DESC
      `,
      [employee_id]
    );

    res.json(rows);

  } catch (error) {

    console.error('Get employee leaves error', error);

    res.status(500).json({
      message: 'Unable to fetch leaves',
    });

  }
};


// GET ALL LEAVES
exports.getAllLeaves = async (req, res) => {

  try {

    const [rows] = await pool.query(`
      SELECT 
        leave_requests.*,
        users.name AS employee_name

      FROM leave_requests

      LEFT JOIN employees
      ON leave_requests.employee_id = employees.id

      LEFT JOIN users
      ON employees.user_id = users.id

      ORDER BY leave_requests.id DESC
    `);

    res.json(rows);

  } catch (error) {

    console.error('Get all leaves error', error);

    res.status(500).json({
      message: 'Unable to fetch leave requests',
    });

  }
};


// UPDATE LEAVE STATUS
exports.updateLeaveStatus = async (req, res) => {

  try {

    const { status } = req.body;

    await pool.query(
      `
      UPDATE leave_requests
      SET status = ?
      WHERE id = ?
      `,
      [status, req.params.id]
    );

    res.json({
      message: 'Leave updated successfully',
    });

  } catch (error) {

    console.error('Update leave error', error);

    res.status(500).json({
      message: 'Unable to update leave',
    });

  }
};