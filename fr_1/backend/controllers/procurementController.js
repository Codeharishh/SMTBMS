const pool = require('../config/db');

exports.getAllProcurements = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM procurements ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get procurements error', error);
    res.status(500).json({ message: 'Unable to fetch procurements' });
  }
};

exports.getProcurementById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM procurements WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Procurement not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get procurement error', error);
    res.status(500).json({ message: 'Unable to fetch procurement' });
  }
};

exports.createProcurement = async (req, res) => {
  try {
    const { procurement_code, vendor_id, material_id, quantity, total_cost, status, expected_delivery_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO procurements (procurement_code, vendor_id, material_id, quantity, total_cost, status, expected_delivery_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [procurement_code, vendor_id, material_id, quantity || 0, total_cost || 0, status || 'Pending', expected_delivery_date || null]
    );
    const [rows] = await pool.query('SELECT * FROM procurements WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create procurement error', error);
    res.status(500).json({ message: 'Unable to create procurement' });
  }
};

exports.updateProcurement = async (req, res) => {
  try {
    const { procurement_code, vendor_id, material_id, quantity, total_cost, status, expected_delivery_date } = req.body;
    await pool.query(
      'UPDATE procurements SET procurement_code = ?, vendor_id = ?, material_id = ?, quantity = ?, total_cost = ?, status = ?, expected_delivery_date = ? WHERE id = ?',
      [procurement_code, vendor_id, material_id, quantity || 0, total_cost || 0, status || 'Pending', expected_delivery_date || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM procurements WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update procurement error', error);
    res.status(500).json({ message: 'Unable to update procurement' });
  }
};

exports.deleteProcurement = async (req, res) => {
  try {
    await pool.query('DELETE FROM procurements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Procurement deleted successfully' });
  } catch (error) {
    console.error('Delete procurement error', error);
    res.status(500).json({ message: 'Unable to delete procurement' });
  }
};
