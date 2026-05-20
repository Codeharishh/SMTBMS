const pool = require('../config/db');

exports.getAllSales = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get sales error', error);
    res.status(500).json({ message: 'Unable to fetch sales' });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get sale error', error);
    res.status(500).json({ message: 'Unable to fetch sale' });
  }
};

exports.createSale = async (req, res) => {
  try {
    const { customer_id, product_name, quantity, total_amount, status, sale_date, salesperson_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO sales (customer_id, product_name, quantity, total_amount, status, sale_date, salesperson_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [customer_id || null, product_name, quantity || 0, total_amount || 0, status || 'Confirmed', sale_date || null, salesperson_id || null]
    );
    const [rows] = await pool.query('SELECT * FROM sales WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create sale error', error);
    res.status(500).json({ message: 'Unable to create sale' });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { customer_id, product_name, quantity, total_amount, status, sale_date, salesperson_id } = req.body;
    await pool.query(
      'UPDATE sales SET customer_id = ?, product_name = ?, quantity = ?, total_amount = ?, status = ?, sale_date = ?, salesperson_id = ? WHERE id = ?',
      [customer_id || null, product_name, quantity || 0, total_amount || 0, status || 'Confirmed', sale_date || null, salesperson_id || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update sale error', error);
    res.status(500).json({ message: 'Unable to update sale' });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    await pool.query('DELETE FROM sales WHERE id = ?', [req.params.id]);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error', error);
    res.status(500).json({ message: 'Unable to delete sale' });
  }
};

exports.getSalesSummary = async (req, res) => {
  try {
    const [[{ total_revenue }]] = await pool.query('SELECT SUM(total_amount) as total_revenue FROM sales');
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) as total_orders FROM sales');
    const [[{ total_customers }]] = await pool.query('SELECT COUNT(DISTINCT customer_id) as total_customers FROM sales');
    const [topCustomers] = await pool.query(
      `SELECT c.customer_name, COUNT(s.id) as orders, SUM(s.total_amount) as revenue
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       GROUP BY c.customer_name
       ORDER BY revenue DESC
       LIMIT 5`
    );
    const average_deal_size = total_orders ? Math.round((total_revenue || 0) / total_orders) : 0;
    res.json({
      total_revenue: total_revenue || 0,
      total_orders: total_orders || 0,
      total_customers: total_customers || 0,
      average_deal_size,
      topCustomers,
    });
  } catch (error) {
    console.error('Sales summary error', error);
    res.status(500).json({ message: 'Unable to fetch sales summary' });
  }
};
