// backend/controllers/materialMovementController.js
const pool = require('../config/db');
const { sendNotification, getUsersByRoles } = require('../utils/notificationUtils');

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
    // If material_id contains text (e.g., MAT-123), extract the digits
    let clean_material_id = parseInt(String(material_id).replace(/\D/g, ''), 10);
    if (isNaN(clean_material_id)) {
      clean_material_id = 0;
    }
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

    // Movement Trigger
    const movementIds = await getUsersByRoles(['Admin', 'Manager']);
    await sendNotification(movementIds, `Material Movement: ${type || 'Inbound'}`, `${clean_quantity} units of ${material_name || 'Item'} recorded.`, 'movement');

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

// ==========================================
// 3. UPDATE MATERIAL MOVEMENT RECORD
// ==========================================
exports.updateMovement = async (req, res) => {
  try {
    const { id } = req.params;
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

    let clean_material_id = parseInt(String(material_id).replace(/\D/g, ''), 10);
    if (isNaN(clean_material_id)) {
      clean_material_id = 0;
    }
    const clean_quantity = parseFloat(quantity) || 0.00;

    await pool.query(`
      UPDATE movements SET
        material_id = ?,
        material_name = ?,
        type = ?,
        quantity = ?,
        from_location = ?,
        to_location = ?,
        performed_by = ?,
        notes = ?
      WHERE id = ?
    `, [
      clean_material_id,
      material_name || '',
      type || 'Inbound',
      clean_quantity,
      from_location || '',
      to_location || '',
      performed_by || '',
      notes || '',
      id
    ]);

    // Movement Trigger
    const movementIds = await getUsersByRoles(['Admin', 'Manager']);
    await sendNotification(movementIds, `Material Movement Updated: ${type || 'Inbound'}`, `${clean_quantity} units of ${material_name || 'Item'} updated.`, 'movement');

    res.status(200).json({
      success: true,
      message: 'Material transit parameters updated successfully.'
    });
  } catch (error) {
    console.error('Update movement server layer crash:', error.message);
    res.status(500).json({
      success: false,
      message: `Database update failed: ${error.message}`
    });
  }
};

// ==========================================
// 4. DELETE MATERIAL MOVEMENT RECORD
// ==========================================
exports.deleteMovement = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM movements WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Movement record deleted successfully.'
    });
  } catch (error) {
    console.error('Delete movement server layer crash:', error.message);
    res.status(500).json({
      success: false,
      message: `Database deletion failed: ${error.message}`
    });
  }
};