const pool = require('../config/db');

exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY customer_name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get customers error', error);
    res.status(500).json({ message: 'Unable to fetch customers' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get customer error', error);
    res.status(500).json({ message: 'Unable to fetch customer' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { customer_name, email, phone, company, address } = req.body;
    const [result] = await pool.query(
      'INSERT INTO customers (customer_name, email, phone, company, address) VALUES (?, ?, ?, ?, ?)',
      [customer_name, email, phone, company, address]
    );
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create customer error', error);
    res.status(500).json({ message: 'Unable to create customer' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { customer_name, email, phone, company, address } = req.body;
    await pool.query(
      'UPDATE customers SET customer_name = ?, email = ?, phone = ?, company = ?, address = ? WHERE id = ?',
      [customer_name, email, phone, company, address, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update customer error', error);
    res.status(500).json({ message: 'Unable to update customer' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error', error);
    res.status(500).json({ message: 'Unable to delete customer' });
  }
};
