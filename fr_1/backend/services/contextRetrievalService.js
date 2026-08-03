// backend/services/contextRetrievalService.js
// ── INTELLECTUAL CONTEXT RETRIEVAL ENGINE FOR DATA-GROUNDED AI CHAT ──
// Gathers real live records from MySQL database scoped dynamically by user role.
// Used by chatController to ground AI answers strictly in real application data.

const pool = require('../config/db');

// Helper to get employee record
const getEmployeeRecord = async (userId) => {
  try {
    const [rows] = await pool.query('SELECT id, department, designation, salary, leave_balance FROM employees WHERE user_id = ?', [userId]);
    return rows.length ? rows[0] : null;
  } catch (err) {
    return null;
  }
};

/**
 * Retrieves dynamic real-time context from database tables based on user request keywords & user role privileges.
 * @param {string} userQuery - User message text
 * @param {Object} user - Authenticated user object containing { id, role, name, department }
 * @returns {Promise<Object>} Object containing structured context data strings and summary maps.
 */
exports.gatherAppContext = async (userQuery, user) => {
  // Strip quotation marks and punctuation for clean intent keyword matching
  const cleanQuery = (userQuery || '').replace(/['"“View give me a summary of current CRM leads””]/gi, ' ');
  const queryLower = (cleanQuery + ' ' + (userQuery || '')).toLowerCase();
  const role = (user?.role || 'EMPLOYEE').toUpperCase();

  const contextData = {};

  try {
    // ── 1. MATERIALS & INVENTORY CONTEXT ──
    if (queryLower.includes('material') || queryLower.includes('stock') || queryLower.includes('inventory') || queryLower.includes('item') || queryLower.includes('quantity') || queryLower.includes('warehouse') || queryLower.includes('barcode') || queryLower.includes('qr')) {
      let materials = [];
      try {
        const [mRows] = await pool.query(
          'SELECT id, material_code, material_name, category, quantity, unit, location, created_at FROM materials ORDER BY id DESC LIMIT 20'
        );
        materials = mRows;
      } catch (mErr) { }

      const [[lowRes]] = await pool.query('SELECT COUNT(*) as low_stock_count FROM materials WHERE quantity <= 10').catch(() => [[{ low_stock_count: 0 }]]);
      
      contextData.materials = {
        total_types: materials.length,
        low_stock_items_count: lowRes?.low_stock_count || 0,
        items_sample: materials.map(m => `${m.material_name} (Code: ${m.material_code || 'MAT-' + m.id}, Category: ${m.category || 'General'}, Qty: ${m.quantity} ${m.unit || 'pcs'}, Location: ${m.location || 'Warehouse Main'})`)
      };
    }

    // ── 2. MATERIAL MOVEMENTS & LOGISTICS CONTEXT ──
    if (queryLower.includes('movement') || queryLower.includes('transfer') || queryLower.includes('inbound') || queryLower.includes('outbound') || queryLower.includes('shipment') || queryLower.includes('dispatch') || queryLower.includes('logistics')) {
      let movements = [];
      let stats = { total: 0, inbound: 0, outbound: 0, transfer: 0 };
      try {
        const [movRows] = await pool.query(
          'SELECT id, material_id, material_name, type, quantity, from_location, to_location, created_at FROM movements ORDER BY created_at DESC LIMIT 10'
        );
        movements = movRows;

        const [[tRes]] = await pool.query('SELECT COUNT(*) as c FROM movements');
        const [[iRes]] = await pool.query('SELECT COUNT(*) as c FROM movements WHERE type = "Inbound"');
        const [[oRes]] = await pool.query('SELECT COUNT(*) as c FROM movements WHERE type = "Outbound"');
        const [[trRes]] = await pool.query('SELECT COUNT(*) as c FROM movements WHERE type = "Transfer"');

        stats.total = tRes?.c || 0;
        stats.inbound = iRes?.c || 0;
        stats.outbound = oRes?.c || 0;
        stats.transfer = trRes?.c || 0;
      } catch (movErr) { 
        console.error('Material Movements context error:', movErr.message);
      }
      
      contextData.material_movements = {
        stats,
        records: movements.map(m => `🔵 ${m.type} — ${m.material_name} (ID: ${m.material_id}), Qty ${m.quantity}, ${m.from_location || 'Supplier'} → ${m.to_location || 'Warehouse'}, ${new Date(m.created_at).toLocaleString()}`)
      };
    }

    // ── 3. SALES & LEADS CONTEXT (Restricted to ADMIN, MANAGER, SALES) ──
    if (['ADMIN', 'MANAGER', 'SALES'].includes(role) && (queryLower.includes('sale') || queryLower.includes('lead') || queryLower.includes('pipeline') || queryLower.includes('deal') || queryLower.includes('customer') || queryLower.includes('revenue') || queryLower.includes('target') || queryLower.includes('opportunity') || queryLower.includes('crm') || queryLower.includes('management'))) {
      let leads = [];
      let customers = [];
      let total_revenue = 0;

      try {
        const [lRows] = await pool.query('SELECT id, COALESCE(contact_name, name) as name, company, email, COALESCE(stage, status) as status, value, created_at FROM leads ORDER BY id DESC LIMIT 15');
        leads = lRows;
      } catch (lErr) { }

      try {
        const [cRows] = await pool.query('SELECT id, name, company, email, phone, created_at FROM customers ORDER BY id DESC LIMIT 10');
        customers = cRows;
      } catch (cErr) { }

      try {
        const [[rRes]] = await pool.query('SELECT SUM(amount) as total_revenue FROM sales');
        total_revenue = rRes?.total_revenue || 0;
      } catch (rErr) { }

      contextData.sales_and_crm = {
        total_revenue_recorded: total_revenue || 0,
        leads_summary: leads.map(l => `Lead: ${l.name || 'Prospect'} (${l.company || 'Private'}), Stage: ${l.status || 'New Lead'}, Value: ₹${l.value || 0}`),
        top_customers: customers.map(c => `${c.name} (${c.company || 'Individual'}) - ${c.email}`)
      };
    }

    // ── 4. HRMS & WORKFORCE CONTEXT (Restricted to ADMIN, HR, MANAGER) ──
    if (['ADMIN', 'HR', 'MANAGER'].includes(role) && (queryLower.includes('hr') || queryLower.includes('employee') || queryLower.includes('staff') || queryLower.includes('department') || queryLower.includes('workforce') || queryLower.includes('roster') || queryLower.includes('leave') || queryLower.includes('attendance') || queryLower.includes('join') || queryLower.includes('personnel'))) {
      let employeeRows = [];
      try {
        const [empJoin] = await pool.query(
          'SELECT e.id, u.name, u.email, u.role, e.department, e.designation, e.salary, e.join_date FROM employees e JOIN users u ON e.user_id = u.id ORDER BY e.id DESC LIMIT 15'
        );
        employeeRows = empJoin;
      } catch (err) {
        console.warn('Employees join query failed, falling back to users table:', err.message);
      }

      if (!employeeRows || employeeRows.length === 0) {
        const [userRows] = await pool.query(
          'SELECT id, name, email, role, department, created_at FROM users ORDER BY id DESC LIMIT 15'
        );
        employeeRows = userRows.map(u => ({ ...u, designation: u.role, join_date: u.created_at }));
      }

      let leaveRows = [];
      try {
        const [lRows] = await pool.query('SELECT id, employee_id, leave_type, start_date, end_date, status, reason FROM leave_requests ORDER BY id DESC LIMIT 10');
        leaveRows = lRows;
      } catch (err) { }

      contextData.workforce_and_hrms = {
        total_employees_sample: employeeRows.map(e => `${e.name} (Dept: ${e.department || 'Operations'}, Role/Designation: ${e.designation || e.role || 'Staff'})`),
        recent_leave_requests: leaveRows.map(l => `Leave ID ${l.id}: Type ${l.leave_type}, Status: ${l.status}, Reason: ${l.reason || 'N/A'}`)
      };
    }

    // ── 5. PAYROLL CONTEXT (Restricted to ADMIN, HR) ──
    if (['ADMIN', 'HR'].includes(role) && (queryLower.includes('payroll') || queryLower.includes('disbursed') || queryLower.includes('disburse') || queryLower.includes('salary') || queryLower.includes('payslip') || queryLower.includes('bonus') || queryLower.includes('compensation') || queryLower.includes('pay') || queryLower.includes('wage') || queryLower.includes('total'))) {
      let grossPayroll = 0;
      let payrollStats = { baseSum: 0, bonusSum: 0, dedSum: 0, netSum: 0 };
      let recentDisbursements = [];

      try {
        const [[sumRes]] = await pool.query('SELECT SUM(basic_salary) as baseSum, SUM(bonus) as bonusSum, SUM(deductions) as dedSum, SUM(net_salary) as netSum FROM payroll');
        
        payrollStats = {
          baseSum: Number(sumRes?.baseSum || 0),
          bonusSum: Number(sumRes?.bonusSum || 0),
          dedSum: Number(sumRes?.dedSum || 0),
          netSum: Number(sumRes?.netSum || 0)
        };
        grossPayroll = payrollStats.netSum;

        const [pRows] = await pool.query(`
          SELECT p.*, u.name as emp_name 
          FROM payroll p 
          LEFT JOIN employees e ON p.employee_id = e.id 
          LEFT JOIN users u ON e.user_id = u.id 
          ORDER BY p.id DESC LIMIT 10
        `);
        recentDisbursements = pRows.map(p => `${p.emp_name || 'Staff'}: Net Salary ₹${p.net_salary || p.basic_salary || 0} (${p.payment_status || 'Paid'})`);
      } catch (pErr) {
        console.warn('Payroll query error:', pErr.message);
      }

      contextData.payroll_ledger = {
        gross_payroll_disbursed: grossPayroll,
        stats: payrollStats,
        recent_disbursements: recentDisbursements
      };
    }

    // ── 5.5 EMPLOYEE PERSONAL DATA CONTEXT ──
    if (role === 'EMPLOYEE') {
      const isSelfQuery = queryLower.includes('my') || queryLower.includes(' i ') || queryLower.includes('latest') || queryLower.includes('own') || queryLower.includes(user.name.toLowerCase()) || queryLower.includes('balance');
      const isOtherQuery = !isSelfQuery && (queryLower.includes('payslip') || queryLower.includes('leave') || queryLower.includes('training') || queryLower.includes('project') || queryLower.includes('task'));

      if (isOtherQuery) {
        contextData.unauthorized_cross_employee_query = true;
      } else {
        const empRecord = await getEmployeeRecord(user.id);
        if (empRecord) {
          const empId = empRecord.id;
          
          // Payslip
          if (queryLower.includes('payslip') || queryLower.includes('pay') || queryLower.includes('salary')) {
            try {
              const [pRows] = await pool.query('SELECT * FROM payroll WHERE employee_id = ? ORDER BY id DESC LIMIT 5', [empId]);
              contextData.personal_payslips = pRows;
            } catch (e) {}
          }

          // Leaves
          if (queryLower.includes('leave') || queryLower.includes('leaves')) {
            try {
              const [lRows] = await pool.query('SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY id DESC LIMIT 5', [empId]);
              contextData.personal_leaves = {
                balance: empRecord.leave_balance,
                requests: lRows
              };
            } catch (e) {}
          }

          // Projects / Assignments (Tasks)
          if (queryLower.includes('project') || queryLower.includes('task') || queryLower.includes('assignment')) {
            try {
              const [tRows] = await pool.query('SELECT * FROM manager_tasks WHERE assigned_to = ? ORDER BY due_date ASC LIMIT 5', [empId]);
              contextData.personal_assignments = tRows;
            } catch (e) {}
          }

          // Training
          if (queryLower.includes('training') || queryLower.includes('trainings')) {
             contextData.personal_training_requested = true;
          }
        }
      }
    }

    // ── 6. NOTIFICATIONS & AUDIT LOGS (ADMIN & HR Only) ──
    if (['ADMIN', 'HR'].includes(role) && (queryLower.includes('audit') || queryLower.includes('log') || queryLower.includes('notification') || queryLower.includes('alert') || queryLower.includes('activity'))) {
      const [notifications] = await pool.query('SELECT id, title, message, type, created_at FROM notifications ORDER BY created_at DESC LIMIT 10');
      contextData.system_logs = notifications.map(n => `[${n.type || 'SYSTEM'}] ${n.title}: ${n.message} (${new Date(n.created_at).toLocaleDateString()})`);
    }

    // ── 7. DEFAULT SYSTEM SUMMARY (ALWAYS ATTACHED AS GROUNDING BACKBONE) ──
    let total_materials = 0;
    let total_employees = 0;
    let total_leads = 0;
    let total_customers = 0;

    try { const [[m]] = await pool.query('SELECT COUNT(*) as c FROM materials'); total_materials = m?.c || 0; } catch (e) { }
    try { const [[e]] = await pool.query('SELECT COUNT(*) as c FROM employees'); total_employees = e?.c || 0; } catch (e) { }
    if (total_employees === 0) {
      try { const [[u]] = await pool.query('SELECT COUNT(*) as c FROM users'); total_employees = u?.c || 0; } catch (e) { }
    }
    try { const [[l]] = await pool.query('SELECT COUNT(*) as c FROM leads'); total_leads = l?.c || 0; } catch (e) { }
    try { const [[c]] = await pool.query('SELECT COUNT(*) as c FROM customers'); total_customers = c?.c || 0; } catch (e) { }

    contextData.system_overview_summary = {
      authenticated_user: { name: user.name, role: user.role, department: user.department || 'General' },
      system_totals: {
        total_materials_in_database: total_materials,
        total_employees_on_roster: total_employees,
        total_crm_leads: total_leads,
        total_active_customers: total_customers
      }
    };

    return contextData;
  } catch (error) {
    console.error('Error retrieving AI chat context from database:', error.message);
    return {
      error: 'Unable to query certain database tables.',
      system_overview_summary: { authenticated_user: { name: user.name, role: user.role } }
    };
  }
};
