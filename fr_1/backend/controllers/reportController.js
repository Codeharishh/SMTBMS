const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_materials }]] = await pool.query('SELECT COUNT(*) as total_materials FROM materials');
    const [[{ total_employees }]] = await pool.query('SELECT COUNT(*) as total_employees FROM employees');
    const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) as total_customers FROM customers');
    const [[{ total_sales }]] = await pool.query('SELECT COUNT(*) as total_sales FROM sales');
    const [[{ total_revenue }]] = await pool.query('SELECT SUM(amount) as total_revenue FROM sales');
    const [[{ total_vendors }]] = await pool.query('SELECT COUNT(*) as total_vendors FROM vendors');
    const [[{ total_procurements }]] = await pool.query('SELECT COUNT(*) as total_procurements FROM procurements');
    const [[{ users_with_role }]] = await pool.query("SELECT COUNT(*) as users_with_role FROM users WHERE role IS NOT NULL AND role != ''");
    const [[{ users_with_department }]] = await pool.query("SELECT COUNT(*) as users_with_department FROM users WHERE department IS NOT NULL AND department != ''");
    const [users_by_role] = await pool.query("SELECT COALESCE(role,'General') as role, COUNT(*) as count FROM users GROUP BY COALESCE(role,'General') ORDER BY count DESC");
    const [users_by_department] = await pool.query("SELECT COALESCE(NULLIF(TRIM(department),''),'General') as department, COUNT(*) as count FROM users GROUP BY COALESCE(NULLIF(TRIM(department),''),'General') ORDER BY count DESC");
    const [employee_department_counts] = await pool.query("SELECT COALESCE(NULLIF(TRIM(department),''),'General') as department, COUNT(*) as count FROM employees GROUP BY COALESCE(NULLIF(TRIM(department),''),'General') ORDER BY count DESC");
    const [topMaterials] = await pool.query('SELECT * FROM materials ORDER BY quantity ASC LIMIT 5');
    const [[{ supplier_score }]] = await pool.query('SELECT AVG(rating) as supplier_score FROM vendors');

    const retention_rate = total_customers ? Math.round((total_customers / (total_customers + 1)) * 100) : 0;

    res.json({
      total_users,
      total_materials,
      total_employees,
      total_customers,
      total_sales,
      total_revenue: total_revenue || 0,
      total_vendors,
      total_procurements,
      users_with_role,
      users_with_department,
      users_by_role,
      users_by_department,
      employee_department_counts,
      supplier_score: supplier_score ? Math.round(supplier_score) : 0,
      retention_rate,
      topMaterials,
    });
  } catch (error) {
    console.error('Report error', error);
    res.status(500).json({ message: 'Unable to fetch report data' });
  }
};
