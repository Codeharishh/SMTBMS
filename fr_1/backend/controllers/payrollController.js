const pool = require('../config/db');

exports.getPayrollSummary = async (req, res) => {
  try {
    const [[{ total_payroll }]] = await pool.query('SELECT SUM(salary) as total_payroll FROM employees');
    const [[{ avg_salary }]] = await pool.query('SELECT AVG(salary) as avg_salary FROM employees');
    const [[{ employee_count }]] = await pool.query('SELECT COUNT(*) as employee_count FROM employees');
    const [payslips] = await pool.query('SELECT * FROM payroll ORDER BY pay_date DESC LIMIT 10');

    res.json({
      total_payroll: total_payroll || 0,
      avg_salary: Math.round(avg_salary || 0),
      employee_count: employee_count || 0,
      payslips,
    });
  } catch (error) {
    console.error('Payroll summary error', error);
    res.status(500).json({ message: 'Unable to fetch payroll summary' });
  }
};

exports.generatePayslip = async (req, res) => {
  try {
    const { employee_id, amount, pay_date, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO payroll (employee_id, amount, pay_date, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [employee_id, amount || 0, pay_date || new Date(), status || 'Paid']
    );
    const [rows] = await pool.query('SELECT * FROM payroll WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Generate payslip error', error);
    res.status(500).json({ message: 'Unable to generate payslip' });
  }
};
