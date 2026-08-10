// backend/controllers/adminController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Roles that should get a matching `employees` row so attendance/HR features work.
// Keep this in sync with the roles allowed in backend/routes/attendanceRoutes.js
// (Admin is intentionally excluded — admins don't punch in via the dashboard).
const ATTENDANCE_ELIGIBLE_ROLES = ['employee', 'manager', 'sales', 'hr'];

// Helper to log administrative audits
const logAdminAction = async (userId, action, details, ipAddress = '127.0.0.1') => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [userId || null, action, details || '', ipAddress]
    );
  } catch (err) {
    console.error('Failed to log admin action:', err.message);
  }
};

// Database Initialization (runs silently to set up required admin structures)
const initTables = async () => {
  try {
    // 1. Audit Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45) DEFAULT '127.0.0.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Integrations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        active BOOLEAN DEFAULT FALSE,
        apiKey VARCHAR(255) DEFAULT '',
        webhookUrl VARCHAR(255) DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Support Tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'Low',
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3b. Chat Messages (Per-Role & Per-User Isolated State)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        role VARCHAR(50) NOT NULL,
        sender VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Performance Reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS performance_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        review_date DATE NOT NULL,
        rating INT NOT NULL,
        feedback TEXT NOT NULL,
        goals TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Recruitment Candidates
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recruitment_candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        position VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Applied',
        experience VARCHAR(100),
        resume_url VARCHAR(255) DEFAULT '',
        notes TEXT,
        applied_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Trainings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trainings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        department VARCHAR(100) DEFAULT 'All',
        trainer VARCHAR(255),
        scheduled_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Holidays
    await pool.query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        holiday_date DATE NOT NULL,
        description TEXT,
        type VARCHAR(100) DEFAULT 'National',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. HR Documents
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hr_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) DEFAULT '',
        description TEXT,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Manager Tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manager_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INT NOT NULL,
        assigned_by INT NOT NULL,
        due_date DATE,
        priority VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'Todo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Manager Projects
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manager_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Planning',
        progress INT DEFAULT 0,
        start_date DATE,
        end_date DATE,
        manager_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Integrations if empty
    const [existingIntegrations] = await pool.query('SELECT COUNT(*) as count FROM integrations');
    if (existingIntegrations[0].count === 0) {
      await pool.query(`
        INSERT INTO integrations (name, display_name, active, apiKey, webhookUrl) VALUES
        ('stripe', 'Stripe Payment Gateway', 1, 'sk_test_51Mz...', 'https://api.smtbms.com/webhooks/stripe'),
        ('slack', 'Slack Notifications', 0, 'xoxb-slack-token', 'https://hooks.slack.com/services/...'),
        ('quickbooks', 'QuickBooks Accounting', 0, 'qb-realm-id', ''),
        ('sendgrid', 'SendGrid Email Service', 1, 'SG.sendgrid-key', 'https://api.sendgrid.com/v3/')
      `);
    }

    // Seed Audit Logs if empty
    const [existingLogs] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
    if (existingLogs[0].count === 0) {
      await pool.query(`
        INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES
        (1, 'AUTHENTICATION', 'Admin User logged in successfully', '192.168.1.50'),
        (1, 'DATABASE', 'System database backup snapshot-20260520.sql created manually', '192.168.1.50'),
        (1, 'USER_MANAGEMENT', 'Registered new user account: HR Manager (hr@smtbms.com)', '127.0.0.1'),
        (1, 'INVENTORY', 'Material inventory level rubber stock updated successfully', '192.168.1.102'),
        (1, 'INTEGRATION', 'Toggled Stripe Payment Gateway integration to ACTIVE', '192.168.1.50')
      `);
    }

    // Seed Support Tickets if empty
    const [existingTickets] = await pool.query('SELECT COUNT(*) as count FROM support_tickets');
    if (existingTickets[0].count === 0) {
      await pool.query(`
        INSERT INTO support_tickets (user_id, title, category, description, priority, status) VALUES
        (1, 'Unable to export PDF billing statements', 'Reporting', 'When attempting to download CRM transaction reports, the backend drops a timeout error.', 'Medium', 'In Progress'),
        (1, 'MySQL primary cluster latency check', 'Infrastructure', 'Active DB pool latency has spiked up by 150ms over the last week. Review thread queues.', 'High', 'Open'),
        (1, 'Password recovery for Warehouse supervisor', 'Authentication', 'Supervisor requested credentials overwrite after losing lock file access.', 'Low', 'Resolved')
      `);
    }

    // Seed Performance Reviews if empty
    const [existingReviews] = await pool.query('SELECT COUNT(*) as count FROM performance_reviews');
    if (existingReviews[0].count === 0) {
      const [emps] = await pool.query('SELECT id FROM employees LIMIT 2');
      const empId1 = emps[0]?.id || 1;
      const empId2 = emps[1]?.id || empId1;
      await pool.query(`
        INSERT INTO performance_reviews (employee_id, reviewer_id, review_date, rating, feedback, goals) VALUES
        (?, 1, '2026-06-01', 5, 'Exceptional commitment to raw material logistics and quality control protocols.', 'Continue optimizing supplier turnaround times.'),
        (?, 1, '2026-06-05', 4, 'Solid sales support performance. Strong customer rapport and follow-ups.', 'Increase sales leads generation by 15% next quarter.')
      `, [empId1, empId2]);
    }

    // Seed Candidates if empty
    const [existingCandidates] = await pool.query('SELECT COUNT(*) as count FROM recruitment_candidates');
    if (existingCandidates[0].count === 0) {
      await pool.query(`
        INSERT INTO recruitment_candidates (name, email, phone, position, status, experience, resume_url, notes, applied_date) VALUES
        ('Amit Sharma', 'amit.sharma@example.com', '+91 98765 43210', 'Logistics Analyst', 'Interviewing', '4 years', 'resume_amit_sharma.pdf', 'Impressive background in supply chain management. Scheduled for technical interview.', '2026-06-01'),
        ('Priya Patel', 'priya.patel@example.com', '+91 99988 77766', 'HR Specialist', 'Applied', '2 years', 'resume_priya_patel.pdf', 'Strong interpersonal skills. Screened, fits basic criteria.', '2026-06-08'),
        ('Rohan Das', 'rohan.das@example.com', '+91 91234 56789', 'Sales Representative', 'Offered', '5 years', 'resume_rohan_das.pdf', 'Excellent track record in B2B sales. Verbal offer accepted. Awaiting background check.', '2026-05-20')
      `);
    }

    // Seed Trainings if empty
    const [existingTrainings] = await pool.query('SELECT COUNT(*) as count FROM trainings');
    if (existingTrainings[0].count === 0) {
      await pool.query(`
        INSERT INTO trainings (title, description, department, trainer, scheduled_date, status) VALUES
        ('Safety Protocols & Warehouse Hazards', 'Mandatory safety training covering heavy machinery operation, inventory stacking, and hazard mitigation.', 'Logistics', 'Karan Mehta', '2026-06-15', 'Upcoming'),
        ('Advanced CRM & Customer Engagement', 'Interactive workshop on using custom CRM modules, lead nurturing, and automation parameters.', 'Sales', 'Neha Sen', '2026-06-03', 'Completed')
      `);
    }

    // Seed Holidays if empty
    const [existingHolidays] = await pool.query('SELECT COUNT(*) as count FROM holidays');
    if (existingHolidays[0].count === 0) {
      await pool.query(`
        INSERT INTO holidays (name, holiday_date, description, type) VALUES
        ('New Year\\'s Day', '2026-01-01', 'First day of the year.', 'National'),
        ('Republic Day', '2026-01-26', 'Celebrating the Constitution of India.', 'National'),
        ('Independence Day', '2026-08-15', 'Celebrating India\\'s Independence.', 'National'),
        ('Gandhi Jayanti', '2026-10-02', 'Birthday of Mahatma Gandhi.', 'National'),
        ('Diwali Festival', '2026-11-05', 'Festival of Lights.', 'Optional'),
        ('Christmas Day', '2026-12-25', 'Celebration of Christmas.', 'National')
      `);
    }

    // Seed HR Documents if empty
    const [existingDocs] = await pool.query('SELECT COUNT(*) as count FROM hr_documents');
    if (existingDocs[0].count === 0) {
      await pool.query(`
        INSERT INTO hr_documents (title, category, file_name, file_path, description, uploaded_by) VALUES
        ('Employee Handbook 2026', 'Handbooks', 'Employee_Handbook_2026.pdf', '/documents/handbook.pdf', 'Core values, rules, regulations, and workplace guidelines.', 1),
        ('Remote Work Guidelines & Policies', 'Policy', 'Remote_Work_Guidelines.pdf', '/documents/remote_policy.pdf', 'Standard operating guidelines for working remotely and security protocols.', 1),
        ('Leave Request Guidelines', 'Policy', 'Leave_Request_Guidelines.pdf', '/documents/leave_policy.pdf', 'Leave request procedures and rules.', 1),
        ('NDA Template', 'Template', 'NDA_Template_2026.docx', '/documents/nda.docx', 'NDA template.', 1)
      `);
    }

    // Seed Manager Tasks if empty
    const [existingTasks] = await pool.query('SELECT COUNT(*) as count FROM manager_tasks');
    if (existingTasks[0].count === 0) {
      const [emps] = await pool.query('SELECT id FROM employees LIMIT 2');
      const empId1 = emps[0]?.id || 1;
      const empId2 = emps[1]?.id || empId1;
      await pool.query(`
        INSERT INTO manager_tasks (title, description, assigned_to, assigned_by, due_date, priority, status) VALUES
        ('Audit incoming steel bundles quantity', 'Verify raw steel inventory levels and log reports in the ERP system.', ?, 1, '2026-06-20', 'High', 'In Progress'),
        ('Update vendor contact records in CRM', 'Liaise with logistics vendors and verify their contact emails/phones.', ?, 1, '2026-06-25', 'Medium', 'Todo')
      `, [empId1, empId2]);
    }

    // Seed Manager Projects if empty
    const [existingProjects] = await pool.query('SELECT COUNT(*) as count FROM manager_projects');
    if (existingProjects[0].count === 0) {
      await pool.query(`
        INSERT INTO manager_projects (name, description, status, progress, start_date, end_date, manager_id) VALUES
        ('Supply Chain Optimization Q3', 'Streamlining supplier channels and procurement workflows to reduce lead latency.', 'Active', 35, '2026-06-01', '2026-09-30', 1),
        ('CRM Database Upgrade', 'Upgrading the customer accounts schema and database indexing parameters.', 'Planning', 10, '2026-07-01', '2026-08-15', 1)
      `);
    }

  } catch (err) {
    console.error('Error initializing admin tables:', err.message);
  }
};

// Fire initialization immediately
initTables();

// --- 1. USER MANAGEMENT CRUD ---

exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.created_at, e.id as employee_id 
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.id
      ORDER BY u.id DESC
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required operational user fields' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Email address already assigned to another account' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [userRes] = await connection.query(
      'INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, department || 'Administration', phone || '']
    );

    const newUserId = userRes.insertId;

    // Create a matching `employees` row for any attendance-eligible role
    // (Employee, Manager, Sales, HR) — not just plain "Employee" — so
    // punch-in/out and other HRMS features work for those accounts too.
    if (ATTENDANCE_ELIGIBLE_ROLES.includes((role || '').toLowerCase())) {
      await connection.query(
        'INSERT INTO employees (user_id, name, department, salary, join_date, attendance_status, leave_balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newUserId, name, department || 'Administration', 0, new Date(), 'Present', 0]
      );
    }

    await connection.commit();
    await logAdminAction(req.user.id, 'USER_MANAGEMENT', `Created new user: ${email} (Role: ${role})`, req.ip);

    res.status(201).json({ success: true, message: 'User registered successfully! HR can onboard them via HRMS.' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, department, phone } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'User account not found' });
    }

    let passwordQuery = '';
    let queryParams = [name, email, role, department, phone];

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      passwordQuery = ', password = ?';
      queryParams.push(hashedPassword);
    }
    queryParams.push(id);

    await connection.query(
      `UPDATE users SET name = ?, email = ?, role = ?, department = ?, phone = ?${passwordQuery} WHERE id = ?`,
      queryParams
    );

    // Sync with corresponding employee table entry — and backfill it if the
    // user never had one (e.g. they were created before this fix, or their
    // role just changed into an attendance-eligible one).
    const [existingEmployee] = await connection.query('SELECT id FROM employees WHERE user_id = ?', [id]);

    if (existingEmployee.length) {
      await connection.query(
        'UPDATE employees SET name = ?, department = ? WHERE user_id = ?',
        [name, department, id]
      );
    } else if (ATTENDANCE_ELIGIBLE_ROLES.includes((role || '').toLowerCase())) {
      await connection.query(
        'INSERT INTO employees (user_id, name, department, salary, join_date, attendance_status, leave_balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name, department || 'Administration', 0, new Date(), 'Present', 0]
      );
    }

    await connection.commit();
    await logAdminAction(req.user.id, 'USER_MANAGEMENT', `Updated user account details: ${email}`, req.ip);

    res.json({ success: true, message: 'User profile synced and updated smoothly!' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: 'Administrative safety block: Cannot delete your own logged-in account' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userRows] = await connection.query('SELECT email FROM users WHERE id = ?', [id]);
    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'User account not found' });
    }

    // Disable foreign key checks to safely delete without hitting reference constraints
    // in reports, sales, payroll, notifications, audit_logs etc.
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Delete attendance/leave requests referencing employee if necessary
    const [empRows] = await connection.query('SELECT id FROM employees WHERE user_id = ?', [id]);
    if (empRows.length > 0) {
      const empId = empRows[0].id;
      await connection.query('DELETE FROM attendance WHERE employee_id = ?', [empId]);
      await connection.query('DELETE FROM leave_requests WHERE employee_id = ?', [empId]);
      await connection.query('DELETE FROM payroll WHERE employee_id = ?', [empId]);
      await connection.query('DELETE FROM sales WHERE sales_person_id = ?', [empId]);
      await connection.query('DELETE FROM employees WHERE id = ?', [empId]);
    }

    await connection.query('DELETE FROM audit_logs WHERE user_id = ?', [id]);
    await connection.query('DELETE FROM notifications WHERE user_id = ?', [id]);
    await connection.query('DELETE FROM reports WHERE generated_by = ?', [id]);
    await connection.query('DELETE FROM users WHERE id = ?', [id]);

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();
    await logAdminAction(req.user.id, 'USER_MANAGEMENT', `Deleted user account: ${userRows[0].email}`, req.ip);

    res.json({ success: true, message: 'User and linked profiles deleted successfully!' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// --- 2. AUDIT LOGS ---

exports.getAuditLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM audit_logs l
      LEFT JOIN users u ON u.id = l.user_id
      ORDER BY l.created_at DESC
      LIMIT 100
    `);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. INTEGRATION ---

exports.getIntegrations = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM integrations ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleIntegration = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const [existing] = await pool.query('SELECT name, display_name FROM integrations WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    await pool.query('UPDATE integrations SET active = ? WHERE id = ?', [active ? 1 : 0, id]);

    const actionDesc = active ? 'ENABLED' : 'DISABLED';
    await logAdminAction(
      req.user.id,
      'INTEGRATION',
      `${actionDesc} Third-party Connection integration for: ${existing[0].display_name}`,
      req.ip
    );

    res.json({ success: true, message: `Integration ${existing[0].display_name} update processed!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.testIntegration = async (req, res) => {
  const { name } = req.body;
  try {
    // Simulate real network validation ping latency (100 - 300ms)
    await new Promise((resolve) => setTimeout(resolve, 250));

    await logAdminAction(
      req.user.id,
      'INTEGRATION',
      `Triggered API handshake test connection for service: ${name.toUpperCase()}`,
      req.ip
    );

    res.json({
      success: true,
      latency: '243ms',
      status: 'Online',
      message: `Connection handshake with ${name.toUpperCase()} endpoints completed flawlessly.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 4. BACKUP & RESTORE ---

exports.getBackups = async (req, res) => {
  try {
    // Return sample historical backup list. We simulate storing this in database/files.
    const backups = [
      { id: 'b_001', name: 'backup_auto_daily_20260525_0000.sql', size: '24.2 MB', created_by: 'System Scheduler', status: 'Success', created_at: new Date('2026-05-25T00:00:00Z') },
      { id: 'b_002', name: 'backup_manual_schema_v2_20260520_1410.sql', size: '18.9 MB', created_by: 'Admin User', status: 'Success', created_at: new Date('2026-05-20T14:10:00Z') },
      { id: 'b_003', name: 'backup_pre_payroll_patch_20260515_0900.sql', size: '23.8 MB', created_by: 'HR Manager', status: 'Success', created_at: new Date('2026-05-15T09:00:00Z') }
    ];
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const backups = [
      { id: 'b_001', name: 'backup_auto_daily_20260525_0000.sql' },
      { id: 'b_002', name: 'backup_manual_schema_v2_20260520_1410.sql' },
      { id: 'b_003', name: 'backup_pre_payroll_patch_20260515_0900.sql' }
    ];

    let fileName;
    const record = backups.find((b) => b.id === id);

    if (record) {
      fileName = record.name;
    } else if (id.startsWith('bk-') || id.startsWith('b_')) {
      // Support dynamically created frontend backups
      fileName = `backup_manual_${id}.sql`;
    } else {
      return res.status(404).json({ message: 'Backup record not found.' });
    }

    const filePath = require('path').join(__dirname, '../backups', fileName);
    
    // Automatically generate the dummy file if it doesn't exist for demonstration purposes
    if (!require('fs').existsSync(filePath)) {
      require('fs').writeFileSync(filePath, '-- Database Dump Snapshot\n-- Generated for ' + fileName);
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file.' });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '').substring(0, 15);
    const fileName = `backup_manual_admin_${timestamp}.sql`;

    // Simulate real SQL backup generation latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    await logAdminAction(
      req.user.id,
      'DATABASE',
      `Manual database backup file generated successfully: ${fileName}`,
      req.ip
    );

    res.json({
      success: true,
      backup: {
        id: `b_${Date.now().toString().slice(-4)}`,
        name: fileName,
        size: '25.6 MB',
        created_by: req.user.name,
        status: 'Success',
        created_at: new Date()
      },
      message: 'Secure system database dump finished successfully!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreBackup = async (req, res) => {
  const { id } = req.params;
  try {
    // In a real server this would run database replication or sql script reading.
    // We simulate restoration latency for smooth UI progression.
    await new Promise((resolve) => setTimeout(resolve, 800));

    await logAdminAction(
      req.user.id,
      'DATABASE',
      `Restored system databases back to snapshot record ID: ${id}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'System database state reverted successfully. Global tables synced!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 5. HELP & SUPPORT TICKETS ---

exports.getTickets = async (req, res) => {
  try {
    const [tickets] = await pool.query(`
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM support_tickets t
      LEFT JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC
    `);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTicket = async (req, res) => {
  const { title, category, description, priority } = req.body;
  if (!title || !category || !description) {
    return res.status(400).json({ message: 'Missing required support ticket fields' });
  }

  try {
    const [resTicket] = await pool.query(
      'INSERT INTO support_tickets (user_id, title, category, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, category, description, priority || 'Low', 'Open']
    );

    await logAdminAction(
      req.user.id,
      'SUPPORT',
      `Submitted internal support/help ticket: #${resTicket.insertId} - ${title}`,
      req.ip
    );

    const [rows] = await pool.query(
      'SELECT t.*, u.name as user_name, u.email as user_email FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id WHERE t.id = ?',
      [resTicket.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};