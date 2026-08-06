const pool = require('../config/db');

// procurement_date is a plain MySQL DATE column — it rejects full ISO
// datetime strings like '2026-06-07T18:30:00.000Z' outright. Normalize
// anything we receive down to 'YYYY-MM-DD' before it hits the query.
//
// NOTE: if the incoming value already has a 'T18:30:00.000Z'-style suffix,
// that's very likely an IST date that got shifted back a calendar day by
// a client-side `new Date(...).toISOString()` conversion (UTC+5:30 rolling
// midnight IST back to the previous day in UTC). Truncating here avoids the
// crash, but the *correct* fix is on the frontend — see the note below.
const normalizeDateOnly = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value.split('T')[0];
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return value;
};

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
    const { 
      vendor_id, material_id, quantity, total_cost, status, procurement_date,
      po_code, vendor_name, item_name, unit, delivery_date, priority, department, approver
    } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO procurements 
        (vendor_id, material_id, quantity, total_cost, status, procurement_date, 
         po_code, vendor_name, item_name, unit, delivery_date, priority, department, approver, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        vendor_id, material_id, quantity || 0, total_cost || 0, status || 'Pending', normalizeDateOnly(procurement_date),
        po_code, vendor_name, item_name, unit, delivery_date, priority, department, approver
      ]
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
    const { 
      vendor_id, material_id, quantity, total_cost, status, procurement_date,
      po_code, vendor_name, item_name, unit, delivery_date, priority, department, approver
    } = req.body;
    
    await pool.query(
      `UPDATE procurements SET 
        vendor_id = ?, material_id = ?, quantity = ?, total_cost = ?, status = ?, procurement_date = ?,
        po_code = ?, vendor_name = ?, item_name = ?, unit = ?, delivery_date = ?, priority = ?, department = ?, approver = ?
       WHERE id = ?`,
      [
        vendor_id, material_id, quantity || 0, total_cost || 0, status || 'Pending', normalizeDateOnly(procurement_date),
        po_code, vendor_name, item_name, unit, delivery_date, priority, department, approver,
        req.params.id
      ]
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