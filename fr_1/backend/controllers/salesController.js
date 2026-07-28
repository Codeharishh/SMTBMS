const pool = require('../config/db');

exports.getAllSales = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, 
              COALESCE(c.customer_name, s.product_name, 'Valued Customer') as customer_name,
              COALESCE(s.payment_status, 'Processing') as status
       FROM sales s 
       LEFT JOIN customers c ON s.customer_id = c.id 
       ORDER BY s.sales_date DESC`
    );

    res.json(rows);

  } catch (error) {

    console.error('Get sales error', error);

    res.status(500).json({
      message: 'Unable to fetch sales'
    });
  }
};

exports.getSaleById = async (req, res) => {
  try {

    const [rows] = await pool.query(
      'SELECT * FROM sales WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'Sale not found'
      });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error('Get sale error', error);

    res.status(500).json({
      message: 'Unable to fetch sale'
    });
  }
};

exports.createSale = async (req, res) => {
  try {

    const {
      customer_id,
      sales_person_id,
      product_name,
      quantity,
      amount,
      sales_date,
      payment_status
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO sales
      (
        customer_id,
        sales_person_id,
        product_name,
        quantity,
        amount,
        sales_date,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id || null,
        sales_person_id || null,
        product_name,
        quantity || 0,
        amount || 0,
        sales_date || null,
        payment_status || 'Completed'
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM sales WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);

  } catch (error) {

    console.error('Create sale error', error);

    res.status(500).json({
      message: 'Unable to create sale'
    });
  }
};

exports.updateSale = async (req, res) => {
  try {

    const {
      customer_id,
      sales_person_id,
      product_name,
      quantity,
      amount,
      sales_date,
      payment_status
    } = req.body;

    await pool.query(
      `UPDATE sales SET
        customer_id = ?,
        sales_person_id = ?,
        product_name = ?,
        quantity = ?,
        amount = ?,
        sales_date = ?,
        payment_status = ?
      WHERE id = ?`,
      [
        customer_id || null,
        sales_person_id || null,
        product_name,
        quantity || 0,
        amount || 0,
        sales_date || null,
        payment_status || 'Completed',
        req.params.id
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM sales WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);

  } catch (error) {

    console.error('Update sale error', error);

    res.status(500).json({
      message: 'Unable to update sale'
    });
  }
};

exports.deleteSale = async (req, res) => {
  try {

    await pool.query(
      'DELETE FROM sales WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Sale deleted successfully'
    });

  } catch (error) {

    console.error('Delete sale error', error);

    res.status(500).json({
      message: 'Unable to delete sale'
    });
  }
};

exports.getSalesSummary = async (req, res) => {
  try {

    const [[{ total_revenue }]] = await pool.query(
      'SELECT SUM(amount) as total_revenue FROM sales'
    );

    const [[{ total_orders }]] = await pool.query(
      'SELECT COUNT(*) as total_orders FROM sales'
    );

    const [[{ total_customers }]] = await pool.query(
      'SELECT COUNT(DISTINCT customer_id) as total_customers FROM sales'
    );

    const [topCustomers] = await pool.query(
      `SELECT
    c.customer_name,
    COUNT(s.id) as orders,
    SUM(s.amount) as revenue
  FROM sales s
  LEFT JOIN customers c
  ON s.customer_id = c.id
  GROUP BY c.customer_name
  ORDER BY revenue DESC
  LIMIT 5`
    );

    const average_deal_size =
      total_orders
        ? Math.round((total_revenue || 0) / total_orders)
        : 0;

    res.json({
      total_revenue: total_revenue || 0,
      total_orders: total_orders || 0,
      total_customers: total_customers || 0,
      average_deal_size,
      topCustomers,
    });

  } catch (error) {

    console.error('Sales summary error', error);

    res.status(500).json({
      message: 'Unable to fetch sales summary'
    });
  }
};

// =========================================================================
// 🟢 NEW CRM EXPANSION MODULES (PERFECTLY MAPPED TO YOUR ASYNC POOL QUERIES)
// =========================================================================

// 1. Fetch Quotations joined cleanly with your leads data index
exports.getQuotations = async (req, res) => {
  try {
    let query = `
      SELECT q.*, l.company as company_name, l.contact_name 
      FROM quotations q
      JOIN leads l ON q.lead_id = l.id
    `;
    let params = [];

    // Filter by assigned user profile details if logged in as a Sales Rep
    if (req.user && req.user.role === 'Sales') {
      query += ' WHERE l.assigned_to = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY q.id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Fetch CRM quotations error:', error);
    res.status(500).json({
      message: 'Unable to fetch quotations ledger indexes'
    });
  }
};

// 2. Commit a new generated Quotation record to storage
exports.createQuotation = async (req, res) => {
  try {
    const { lead_id, total_amount, valid_until } = req.body;
    const quote_number = `QT-${Date.now()}`;

    // 🟢 FIXED: Ensured all 4 columns cleanly match the 4 array values (?, ?, ?, ?)
    await pool.query(
      'INSERT INTO quotations (lead_id, quote_number, total_amount, valid_until) VALUES (?, ?, ?, ?)',
      [
        parseInt(lead_id, 10),
        quote_number,
        parseFloat(total_amount) || 0.00,
        valid_until || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Quotation matrix logged successfully'
    });
  } catch (error) {
    console.error('Create CRM quotation error:', error);
    res.status(500).json({
      message: 'Unable to create quotation entry link'
    });
  }
};
// backend/controllers/salesController.js

exports.getQuotations = async (req, res) => {
  try {
    // 🟢 FIXED: Changed JOIN to LEFT JOIN so quotes show up even if the lead match is tricky
    let query = `
      SELECT q.*, l.company as company_name, l.contact_name 
      FROM quotations q
      LEFT JOIN leads l ON q.lead_id = l.id
    `;
    let params = [];

    if (req.user && req.user.role === 'Sales') {
      query += ' WHERE l.assigned_to = ? OR q.lead_id IS NOT NULL';
      params.push(req.user.id);
    }
    query += ' ORDER BY q.id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Fetch CRM quotations error:', error);
    res.status(500).json({
      message: 'Unable to fetch quotations ledger indexes'
    });
  }
};

// 3. Telemetry Aggregations: Computes monthly quota thresholds vs revenue won
exports.getSalesTelemetry = async (req, res) => {
  try {
    const userId = req.user?.id || 0;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Pull current period performance caps
    const [targets] = await pool.query(
      'SELECT * FROM sales_targets WHERE user_id = ? AND target_month = ? AND target_year = ?',
      [userId, currentMonth, currentYear]
    );

    // Compute metrics matching the structural variations of your single leads schema
    const [[revenueMetrics]] = await pool.query(
      `SELECT 
         SUM(CASE WHEN stage = 'Closed Won' OR stage = 'Won' THEN value ELSE 0 END) as revenue_won,
         SUM(value) as pipeline_total 
       FROM leads 
       WHERE assigned_to = ?`,
      [userId]
    );

    res.json({
      target: targets[0] || { target_amount: 500000, achieved_amount: revenueMetrics?.revenue_won || 0 },
      telemetry: {
        won: revenueMetrics?.revenue_won || 0,
        pipeline: revenueMetrics?.pipeline_total || 0
      }
    });
  } catch (error) {
    console.error('Fetch sales target telemetry error:', error);
    res.status(500).json({
      message: 'Unable to evaluate workspace financial telemetry indexes'
    });
  }
};