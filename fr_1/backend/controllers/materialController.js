const pool = require('../config/db');

exports.getAllMaterials = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM materials';
    const params = [];

    if (search || category) {
      const conditions = [];
      if (search) {
        conditions.push('(material_name LIKE ? OR material_code LIKE ? OR supplier LIKE ? OR location LIKE ?)');
        const likeValue = `%${search}%`;
        params.push(likeValue, likeValue, likeValue, likeValue);
      }
      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get materials error', error);
    res.status(500).json({ message: 'Unable to fetch materials' });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM materials WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get material error', error);
    res.status(500).json({ message: 'Unable to fetch material' });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { material_name, material_code, category, quantity, supplier, location, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO materials (material_name, material_code, category, quantity, supplier, location, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [material_name, material_code, category, quantity || 0, supplier, location, status || 'Active']
    );
    const [rows] = await pool.query('SELECT * FROM materials WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create material error', error);
    res.status(500).json({ message: 'Unable to create material' });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { material_name, material_code, category, quantity, supplier, location, status } = req.body;
    await pool.query(
      'UPDATE materials SET material_name = ?, material_code = ?, category = ?, quantity = ?, supplier = ?, location = ?, status = ? WHERE id = ?',
      [material_name, material_code, category, quantity || 0, supplier, location, status || 'Active', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM materials WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update material error', error);
    res.status(500).json({ message: 'Unable to update material' });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    await pool.query('DELETE FROM materials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error', error);
    res.status(500).json({ message: 'Unable to delete material' });
  }
};

exports.lowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold, 10) || 10;
    const [rows] = await pool.query('SELECT * FROM materials WHERE quantity <= ? ORDER BY quantity ASC', [threshold]);
    res.json(rows);
  } catch (error) {
    console.error('Low stock error', error);
    res.status(500).json({ message: 'Unable to fetch low stock materials' });
  }
};
