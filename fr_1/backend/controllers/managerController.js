const pool = require('../config/db');

// ==========================================
// 1. TEAM MONITORING
// ==========================================
exports.getTeam = async (req, res) => {
  try {
    let query = `
      SELECT e.*, u.email, u.phone,
             a.check_in, a.check_out, a.status as today_status
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN attendance a ON e.id = a.employee_id AND DATE(a.attendance_date) = CURDATE()
    `;
    const params = [];
    if (req.user.role === 'Manager' && req.user.department) {
      query += ' WHERE e.department = ?';
      params.push(req.user.department);
    }
    query += ' ORDER BY e.name ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get team monitoring error', error);
    res.status(500).json({ message: 'Unable to fetch team monitoring data' });
  }
};

// ==========================================
// 2. TASK ASSIGNMENT
// ==========================================
exports.getTasks = async (req, res) => {
  try {
    let query = `
      SELECT t.*, e.name as assignee_name, e.department as assignee_department
      FROM manager_tasks t
      LEFT JOIN employees e ON t.assigned_to = e.id
    `;
    const params = [];
    if (req.user.role === 'Manager' && req.user.department) {
      query += ' WHERE e.department = ? OR t.assigned_by = ?';
      params.push(req.user.department, req.user.id);
    }
    query += ' ORDER BY t.due_date ASC, t.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get manager tasks error', error);
    res.status(500).json({ message: 'Unable to fetch tasks' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, due_date, priority } = req.body;
    if (!title || !assigned_to) {
      return res.status(400).json({ message: 'Title and assignee are required' });
    }
    const assigned_by = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO manager_tasks (title, description, assigned_to, assigned_by, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', assigned_to, assigned_by, due_date || null, priority || 'Medium', 'Todo']
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Task assigned successfully'
    });
  } catch (error) {
    console.error('Create manager task error', error);
    res.status(500).json({ message: 'Unable to assign task' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    await pool.query('UPDATE manager_tasks SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Task status updated' });
  } catch (error) {
    console.error('Update task status error', error);
    res.status(500).json({ message: 'Unable to update task status' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM manager_tasks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error', error);
    res.status(500).json({ message: 'Unable to delete task' });
  }
};

// ==========================================
// 3. PROJECT TRACKING
// ==========================================
exports.getProjects = async (req, res) => {
  try {
    let query = 'SELECT * FROM manager_projects';
    const params = [];
    if (req.user.role === 'Manager') {
      query += ' WHERE manager_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get projects error', error);
    res.status(500).json({ message: 'Unable to fetch projects' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, status, progress, start_date, end_date } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    const manager_id = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO manager_projects (name, description, status, progress, start_date, end_date, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', status || 'Planning', progress || 0, start_date || null, end_date || null, manager_id]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Create project error', error);
    res.status(500).json({ message: 'Unable to create project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, progress, start_date, end_date } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    await pool.query(
      'UPDATE manager_projects SET name = ?, description = ?, status = ?, progress = ?, start_date = ?, end_date = ? WHERE id = ?',
      [name, description || '', status || 'Planning', progress || 0, start_date || null, end_date || null, id]
    );

    res.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error', error);
    res.status(500).json({ message: 'Unable to update project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM manager_projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error', error);
    res.status(500).json({ message: 'Unable to delete project' });
  }
};

// ==========================================
// 4. APPROVALS HUB
// ==========================================
exports.getPendingApprovals = async (req, res) => {
  try {
    // 1. Fetch pending leaves
    const [leaves] = await pool.query(`
      SELECT lr.*, u.name as employee_name, e.department
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE lr.status = 'Pending'
      ORDER BY lr.id DESC
    `);

    // 2. Fetch pending procurements
    const [procurements] = await pool.query(`
      SELECT p.*, v.name as supplier_name
      FROM procurements p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.status = 'Pending'
      ORDER BY p.created_at DESC
    `);

    res.json({ leaves, procurements });
  } catch (error) {
    console.error('Get approvals error', error);
    res.status(500).json({ message: 'Unable to fetch pending approvals' });
  }
};
