const pool = require('../config/db');

// Helper to get employee ID from user ID
const getEmployeeIdFromUser = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
};

// ==========================================
// 1. PERFORMANCE REVIEWS
// ==========================================
exports.getPerformanceReviews = async (req, res) => {
  try {
    let query = `
      SELECT pr.*, e.name as employee_name, u.name as reviewer_name 
      FROM performance_reviews pr
      LEFT JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN users u ON pr.reviewer_id = u.id
    `;
    const params = [];

    if (req.user.role === 'Employee') {
      const employeeId = await getEmployeeIdFromUser(req.user.id);
      if (!employeeId) {
        return res.status(404).json({ message: 'Employee record not found for user' });
      }
      query += ' WHERE pr.employee_id = ?';
      params.push(employeeId);
    }

    query += ' ORDER BY pr.review_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get performance reviews error', error);
    res.status(500).json({ message: 'Unable to fetch performance reviews' });
  }
};

exports.createPerformanceReview = async (req, res) => {
  try {
    const { employee_id, review_date, rating, feedback, goals, kpi_score, attendance_score, targets_met, teamwork, appraisal } = req.body;
    if (!employee_id || !rating) {
      return res.status(400).json({ message: 'Missing required review fields (employee_id, rating)' });
    }

    const reviewer_id = req.user.id;
    const finalDate = review_date || new Date().toISOString().split('T')[0];
    const finalFeedback = feedback || 'Performance reviewed based on core KPIs.';

    const [result] = await pool.query(
      `INSERT INTO performance_reviews (employee_id, reviewer_id, review_date, rating, feedback, goals, kpi_score, attendance_score, targets_met, teamwork, appraisal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id, reviewer_id, finalDate, rating, finalFeedback, goals || '', 
        kpi_score || 85, attendance_score || 96, targets_met || 88, teamwork || 84, appraisal || '10%'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Performance review logged successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create performance review error', error);
    res.status(500).json({ message: 'Unable to log performance review' });
  }
};

exports.updatePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, rating, feedback, goals, kpi_score, attendance_score, targets_met, teamwork, appraisal } = req.body;
    
    const finalFeedback = feedback || 'Performance reviewed based on core KPIs.';

    await pool.query(
      `UPDATE performance_reviews 
       SET employee_id = ?, rating = ?, feedback = ?, goals = ?, kpi_score = ?, attendance_score = ?, targets_met = ?, teamwork = ?, appraisal = ?
       WHERE id = ?`,
      [employee_id, rating, finalFeedback, goals || '', kpi_score || 85, attendance_score || 96, targets_met || 88, teamwork || 84, appraisal || '10%', id]
    );
    res.json({ success: true, message: 'Review updated successfully' });
  } catch (error) {
    console.error('Update performance review error', error);
    res.status(500).json({ message: 'Unable to update performance review' });
  }
};

exports.deletePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM performance_reviews WHERE id = ?', [id]);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete performance review error', error);
    res.status(500).json({ message: 'Unable to delete performance review' });
  }
};

// ==========================================
// 2. RECRUITMENT CANDIDATES
// ==========================================
exports.getCandidates = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recruitment_candidates ORDER BY applied_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get candidates error', error);
    res.status(500).json({ message: 'Unable to fetch candidates' });
  }
};

exports.createCandidate = async (req, res) => {
  try {
    const { name, email, phone, position, experience, resume_url, notes, applied_date } = req.body;
    if (!name || !email || !position || !applied_date) {
      return res.status(400).json({ message: 'Missing required candidate fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO recruitment_candidates (name, email, phone, position, status, experience, resume_url, notes, applied_date) 
       VALUES (?, ?, ?, ?, 'Applied', ?, ?, ?, ?)`,
      [name, email, phone || '', position, experience || '', resume_url || '', notes || '', applied_date]
    );

    res.status(201).json({
      success: true,
      message: 'Candidate application added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create candidate error', error);
    res.status(500).json({ message: 'Unable to register candidate application' });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    await pool.query('UPDATE recruitment_candidates SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Candidate status updated successfully' });
  } catch (error) {
    console.error('Update candidate status error', error);
    res.status(500).json({ message: 'Unable to update candidate status' });
  }
};

// ==========================================
// 3. TRAININGS
// ==========================================
exports.getTrainings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trainings ORDER BY scheduled_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get trainings error', error);
    res.status(500).json({ message: 'Unable to fetch trainings' });
  }
};

exports.createTraining = async (req, res) => {
  try {
    const { title, description, department, trainer, scheduled_date, status = 'Upcoming' } = req.body;
    if (!title || !scheduled_date) {
      return res.status(400).json({ message: 'Missing required training fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO trainings (title, description, department, trainer, scheduled_date, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || '', department || 'All', trainer || '', scheduled_date, status]
    );

    res.status(201).json({
      success: true,
      message: 'Training scheduled successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create training error', error);
    res.status(500).json({ message: 'Unable to schedule training' });
  }
};

exports.updateTrainingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    await pool.query('UPDATE trainings SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Training status updated successfully' });
  } catch (error) {
    console.error('Update training status error', error);
    res.status(500).json({ message: 'Unable to update training status' });
  }
};

// ==========================================
// 4. HOLIDAYS
// ==========================================
exports.getHolidays = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM holidays ORDER BY holiday_date ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get holidays error', error);
    res.status(500).json({ message: 'Unable to fetch holidays' });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const { name, holiday_date, description, type = 'National' } = req.body;
    if (!name || !holiday_date) {
      return res.status(400).json({ message: 'Missing required holiday fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO holidays (name, holiday_date, description, type) VALUES (?, ?, ?, ?)',
      [name, holiday_date, description || '', type]
    );

    res.status(201).json({
      success: true,
      message: 'Holiday added to calendar successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create holiday error', error);
    res.status(500).json({ message: 'Unable to create holiday record' });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { name, holiday_date, description, type } = req.body;
    await pool.query(
      'UPDATE holidays SET name=?, holiday_date=?, description=?, type=? WHERE id=?',
      [name, holiday_date, description || '', type || 'National', req.params.id]
    );
    res.json({ success: true, message: 'Holiday updated' });
  } catch (error) {
    console.error('Update holiday error', error);
    res.status(500).json({ message: 'Unable to update holiday' });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    await pool.query('DELETE FROM holidays WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Holiday deleted' });
  } catch (error) {
    console.error('Delete holiday error', error);
    res.status(500).json({ message: 'Unable to delete holiday' });
  }
};

// ==========================================
// 5. DOCUMENTS
// ==========================================
exports.getDocuments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, u.name as uploaded_by_name 
      FROM hr_documents d 
      LEFT JOIN users u ON d.uploaded_by = u.id 
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Get documents error', error);
    res.status(500).json({ message: 'Unable to fetch documents' });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { title, category, file_name, description } = req.body;
    if (!title || !category || !file_name) {
      return res.status(400).json({ message: 'Missing required document fields' });
    }

    const uploaded_by = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO hr_documents (title, category, file_name, file_path, description, uploaded_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, category, file_name, `/documents/${file_name}`, description || '', uploaded_by]
    );

    res.status(201).json({
      success: true,
      message: 'Document cataloged successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create document error', error);
    res.status(500).json({ message: 'Unable to register document' });
  }
};

exports.incrementDocumentDownload = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE hr_documents SET downloads = downloads + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Download count incremented' });
  } catch (error) {
    console.error('Increment download error', error);
    res.status(500).json({ message: 'Unable to update download count' });
  }
};

