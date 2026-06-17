// backend/controllers/materialMovementController.js
const pool = require('../config/db');

// ==========================================
// 1. GET ALL MATERIAL MOVEMENTS LOGS
// ==========================================
exports.getAllMovements = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        material_id,
        material_name,
        type,
        quantity,
        from_location,
        to_location,
        performed_by,
        notes,
        created_at
      FROM movements
      ORDER BY created_at DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Get movements server layer crash:', error.message);
    res.status(500).json({
      success: false,
      message: `Database read failed: ${error.message}`
    });
  }
};

// ==========================================
// 2. CREATE NEW MATERIAL MOVEMENT RECORD
// ==========================================
exports.createMovement = async (req, res) => {
  try {
    const {
      material_id,
      material_name,
      type,
      quantity,
      from_location,
      to_location,
      performed_by,
      notes
    } = req.body;

    // Defensive Layer: Force valid formats to prevent column constraint 500 errors
    const clean_material_id = parseInt(material_id, 10) || 0;
    const clean_quantity = parseFloat(quantity) || 0.00;

    await pool.query(`
      INSERT INTO movements
      (
        material_id,
        material_name,
        type,
        quantity,
        from_location,
        to_location,
        performed_by,
        notes,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        clean_material_id,
        material_name || '',
        type || 'Inbound',
        clean_quantity,
        from_location || '',
        to_location || '',
        performed_by || '',
        notes || ''
      ]);

    res.status(201).json({
      success: true,
      message: 'Material transit parameters logged successfully into historical ledger.'
    });

  } catch (error) {
    console.error('Create movement server layer crash:', error.message);
    res.status(500).json({
      success: false,
      message: `Database write failed: ${error.message}`
    });
  }
};