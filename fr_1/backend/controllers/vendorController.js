const pool = require('../config/db');

exports.getAllVendors = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vendors ORDER BY vendor_name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get vendors error', error);
    res.status(500).json({ message: 'Unable to fetch vendors' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get vendor error', error);
    res.status(500).json({ message: 'Unable to fetch vendor' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { vendor_name, contact_person, email, phone, address, status, rating } = req.body;
    const [result] = await pool.query(
      'INSERT INTO vendors (vendor_name, contact_person, email, phone, address, status, rating, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [vendor_name, contact_person, email, phone, address, status || 'Active', rating || null]
    );
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create vendor error', error);
    res.status(500).json({ message: 'Unable to create vendor' });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { vendor_name, contact_person, email, phone, address, status, rating } = req.body;
    await pool.query(
      'UPDATE vendors SET vendor_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, status = ?, rating = ? WHERE id = ?',
      [vendor_name, contact_person, email, phone, address, status || 'Active', rating || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update vendor error', error);
    res.status(500).json({ message: 'Unable to update vendor' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    await pool.query('DELETE FROM vendors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error', error);
    res.status(500).json({ message: 'Unable to delete vendor' });
  }
};
