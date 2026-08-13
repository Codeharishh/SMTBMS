const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {

    // TOTAL COUNTS

    let total_users = 0;
    let total_materials = 0;
    let total_employees = 0;
    let total_customers = 0;
    let total_sales = 0;
    let total_revenue = 0;
    let total_vendors = 0;
    let total_procurements = 0;

    try { const [[r]] = await pool.query('SELECT COUNT(*) as c FROM users'); total_users = r?.c || 0; } catch (e) { }
    try { const [[r]] = await pool.query('SELECT COUNT(*) as c FROM materials'); total_materials = r?.c || 0; } catch (e) { }
    try { const [[r]] = await pool.query('SELECT COUNT(*) as c FROM employees'); total_employees = r?.c || 0; } catch (e) { }
    if (total_employees === 0) total_employees = total_users;
    try { const [[r]] = await pool.query('SELECT COUNT(*) as c FROM customers'); total_customers = r?.c || 0; } catch (e) { }
    try { const [[r]] = await pool.query('SELECT COUNT(*) as c FROM sales'); total_sales = r?.c || 0; } catch (e) { }
    try { const [[r]] = await pool.query('SELECT SUM(amount) as s FROM sales'); total_revenue = r?.s || 0; } catch (e) { }
    try { const [[r]] = await pool.query('SELECT COUNT(*) as c FROM vendors'); total_vendors = r?.c || 0; } catch (e) { }
    try { const [[r]] = await pool.query('SELECT COUNT(*) as c FROM procurements'); total_procurements = r?.c || 0; } catch (e) { }

    // USER ANALYTICS
    let users_with_role = 0;
    let users_with_department = 0;
    let users_by_role = [];
    let users_by_department = [];
    let employee_department_counts = [];

    try { const [[r]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role IS NOT NULL AND role != ''"); users_with_role = r?.c || 0; } catch (e) { }
    try { const [[r]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE department IS NOT NULL AND department != ''"); users_with_department = r?.c || 0; } catch (e) { }
    try { const [r] = await pool.query("SELECT COALESCE(role, 'General') as role, COUNT(*) as count FROM users GROUP BY COALESCE(role, 'General') ORDER BY count DESC"); users_by_role = r; } catch (e) { }
    try { const [r] = await pool.query("SELECT COALESCE(NULLIF(TRIM(department), ''), 'General') as department, COUNT(*) as count FROM users GROUP BY COALESCE(NULLIF(TRIM(department), ''), 'General') ORDER BY count DESC"); users_by_department = r; } catch (e) { }
    try { const [r] = await pool.query("SELECT COALESCE(NULLIF(TRIM(department), ''), 'General') as department, COUNT(*) as count FROM employees GROUP BY COALESCE(NULLIF(TRIM(department), ''), 'General') ORDER BY count DESC"); employee_department_counts = r; } catch (e) { }

    // LOW STOCK MATERIALS
    let topMaterials = [];
    let low_stock_count = 0;
    try { const [r] = await pool.query("SELECT * FROM materials ORDER BY quantity ASC LIMIT 5"); topMaterials = r; } catch (e) { }
    try { const [[r]] = await pool.query("SELECT COUNT(*) as c FROM materials WHERE quantity <= 10"); low_stock_count = r?.c || 0; } catch (e) { }

    // RECENT EMPLOYEES & MATERIALS
    let recentEmployees = [];
    let recentMaterials = [];
    try { const [r] = await pool.query("SELECT u.name, e.join_date FROM employees e JOIN users u ON e.user_id = u.id ORDER BY e.id DESC LIMIT 3"); recentEmployees = r; } catch (e) { }
    try { const [r] = await pool.query("SELECT material_name, created_at FROM materials ORDER BY created_at DESC LIMIT 3"); recentMaterials = r; } catch (e) { }

    // PENDING LEAVES & ACTIVE CUSTOMERS
    let pending_leaves = 0;
    let active_customers = 0;
    try { const [[r]] = await pool.query("SELECT COUNT(*) as c FROM leave_requests WHERE status = 'Pending'"); pending_leaves = r?.c || 0; } catch (e) { }
    try { const [[r]] = await pool.query("SELECT COUNT(*) as c FROM customers"); active_customers = r?.c || 0; } catch (e) { }

    // RETENTION RATE

    const retention_rate = total_customers
      ? Math.round(
          (total_customers / (total_customers + 1)) * 100
        )
      : 0;

    // FINAL RESPONSE

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

      retention_rate,

      topMaterials,

      low_stock_count,

      pending_leaves,

      active_customers,

      recent_employees: recentEmployees,

      recent_materials: recentMaterials,
    });

  } catch (error) {

    console.error('Report error', error);

    res.status(500).json({
      message: 'Unable to fetch report data'
    });

  }
};

exports.generateReport = async (req, res) => {
  try {
    const { format, report_type } = req.body;
    const { sendNotification } = require('../utils/notificationUtils');
    
    // Send a notification to the user who requested the report
    await sendNotification([req.user.id], 'Report Generated', `Your ${report_type || 'system'} report has been generated in ${format || 'PDF'} format.`, 'report');

    res.json({ message: 'Report generation logged successfully' });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Failed to log report generation' });
  }
};