// backend/controllers/payrollController.js
const pool = require('../config/db');

// 1. [HR / MANAGER] Create a single custom payroll allocation entry
const createPayrollEntry = async (req, res) => {
  // Directly targets the auto-incremented primary key column 'id' from the employees table
  const { employee_id, basic_salary, bonus, deductions, payroll_month } = req.body;

  if (!employee_id || !basic_salary || !payroll_month) {
    return res.status(400).json({ success: false, message: 'Missing required payroll fields.' });
  }

  try {
    // Validate that the provided ID exists inside the employees table
    const [empCheck] = await pool.query('SELECT id FROM employees WHERE id = ?', [employee_id]);

    if (empCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No record found inside the employees table for Employee ID: ${employee_id}.`
      });
    }

    const net_salary = Number(basic_salary) + Number(bonus || 0) - Number(deductions || 0);

    const query = `
      INSERT INTO payroll (employee_id, basic_salary, bonus, deductions, net_salary, payroll_month, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')
    `;
    await pool.query(query, [employee_id, basic_salary, bonus || 0, deductions || 0, net_salary, payroll_month]);

    return res.status(201).json({ success: true, message: 'Payroll initialized and forwarded to Admin approval queue!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. [ADMIN / HR / MANAGER / EMPLOYEE] Fetch system records dynamically based on identity tier
const getPayrollRecords = async (req, res) => {
  const { role, id: loggedInUserId } = req.user; // 'id' represents the logged-in user's account ID from the users table

  try {
    let query;
    let params = [];

    if (role === 'Employee' || role === 'Sales') {
      // 🟢 THE ABSOLUTE RELATIONAL FIX: 
      // First, get the correct employee profile row matching the logged-in user's account ID
      const [employeeProfile] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [loggedInUserId]);

      if (employeeProfile.length === 0) {
        // If they don't have an onboarding row in the employees table yet, return empty data safely
        return res.status(200).json({ success: true, data: [] });
      }

      const realEmployeeId = employeeProfile[0].id;

      // Now query the payroll table matching ONLY the correct employee_id row
      query = `
        SELECT p.*, u.name AS employee_name, e.id AS employee_id, u.id AS user_account_id, u.role AS user_role
        FROM payroll p
        INNER JOIN employees e ON p.employee_id = e.id
        INNER JOIN users u ON e.user_id = u.id
        WHERE p.employee_id = ? AND p.payment_status = 'Paid'
        ORDER BY p.created_at DESC
      `;
      params = [realEmployeeId];
    } else {
      // Management roles view all global workforce rows cleanly
      query = `
        SELECT p.*, u.name AS employee_name, e.id AS employee_id, u.id AS user_account_id, u.role AS user_role 
        FROM payroll p
        INNER JOIN employees e ON p.employee_id = e.id
        INNER JOIN users u ON e.user_id = u.id
        ORDER BY p.created_at DESC
      `;
    }

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. [ADMIN / HR] Process adjustments or update full payment validation statuses
const updatePayrollStatus = async (req, res) => {
  const { id, payment_status, bonus, deductions } = req.body;

  try {
    const [record] = await pool.query('SELECT basic_salary FROM payroll WHERE id = ?', [id]);
    if (!record.length) return res.status(404).json({ message: 'Record not found' });

    const basic = Number(record[0].basic_salary);
    const net_salary = basic + Number(bonus || 0) - Number(deductions || 0);

    const query = `UPDATE payroll SET payment_status = ?, bonus = ?, deductions = ?, net_salary = ? WHERE id = ?`;
    await pool.query(query, [payment_status, bonus, deductions, net_salary, id]);

    return res.status(200).json({ success: true, message: 'Ledger record status updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPayrollEntry,
  getPayrollRecords,
  updatePayrollStatus
};