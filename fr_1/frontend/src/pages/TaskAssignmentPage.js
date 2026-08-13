// src/pages/TaskAssignmentPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchEmployees } from '../services/employeeService';
import { fetchTasks, createTask, deleteTask, updateTaskStatus } from '../services/managerService';

// ── SAME PALETTE AS MaterialsPage.js FOR VISUAL CONSISTENCY ────────────────
const COLORS = {
  indigo: '#5B8DEF',
  emerald: '#2ED9C3',
  amber: '#FFC542',
  rose: '#FF6B9D',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#FF7A45',
  alert: '#FF6B6B'
};

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX FOR METRIC CARDS ────────────────────
const THIN_ICONS = {
  clipboard: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect vectorEffect="non-scaling-stroke" x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  refresh: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 4 23 10 17 10" />
      <polyline vectorEffect="non-scaling-stroke" points="1 20 1 14 7 14" />
      <path vectorEffect="non-scaling-stroke" d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="5" x2="12" y2="19" />
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="3 6 5 6 21 6" />
      <path vectorEffect="non-scaling-stroke" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  arrowRight: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
      <polyline vectorEffect="non-scaling-stroke" points="12 5 19 12 12 19" />
    </svg>
  )
};

const STATUS_STYLES = {
  Todo: { bg: '#F1F5F9', color: '#64748B' },
  Pending: { bg: '#F1F5F9', color: '#64748B' },
  'In Progress': { bg: '#E0F2FE', color: '#0369A1' },
  Completed: { bg: '#D1FAE5', color: '#047857' },
  Done: { bg: '#D1FAE5', color: '#047857' }
};

const PRIORITY_STYLES = {
  High: { bg: '#FEE2E2', color: '#DC2626' },
  Medium: { bg: '#FEF3C7', color: '#B45309' },
  Low: { bg: '#F1F5F9', color: '#64748B' }
};

const TaskAssignmentPage = () => {
  const user = getCurrentUser();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const defaultMockEmployees = [
    { id: 101, name: 'Arjun Sharma', role: 'Site Engineer', department: 'Operations' },
    { id: 102, name: 'Priya Nair', role: 'Procurement Officer', department: 'Procurement' },
    { id: 103, name: 'Ravi Kumar', role: 'Warehouse Supervisor', department: 'Logistics' },
    { id: 104, name: 'Suresh Patel', role: 'Quality Inspector', department: 'Quality' }
  ];

  const defaultMockTasks = [
    { id: 1, title: 'Inspect Steel Delivery - Site A', assignee: 'Arjun Sharma', initials: 'AS', category: 'Inspection', priority: 'High', dueDate: 'Jun 18, 2026', status: 'In Progress', overdue: true },
    { id: 2, title: 'Verify Vendor PO #4412 Invoices', assignee: 'Priya Nair', initials: 'PN', category: 'Procurement', priority: 'Medium', dueDate: 'Jun 24, 2026', status: 'Pending', overdue: false },
    { id: 3, title: 'Audit Material Inventory Warehouse B', assignee: 'Ravi Kumar', initials: 'RK', category: 'Audit', priority: 'High', dueDate: 'Jun 22, 2026', status: 'Completed', overdue: false },
    { id: 4, title: 'Safety Equipment Clearance Checklist', assignee: 'Suresh Patel', initials: 'SP', category: 'Compliance', priority: 'Low', dueDate: 'Jun 28, 2026', status: 'Pending', overdue: false }
  ];

  const [taskForm, setTaskForm] = useState({ title: '', assigned_to: '', category: 'Inspection', priority: 'Medium', dueDate: '2026-06-30' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, taskData] = await Promise.all([
        fetchEmployees().catch(() => defaultMockEmployees),
        fetchTasks().catch(() => defaultMockTasks)
      ]);

      const empList = empData && empData.length ? empData : defaultMockEmployees;
      setEmployees(empList);

      const rawTasks = taskData && taskData.length ? taskData : defaultMockTasks;
      const formattedTasks = rawTasks.map(t => {
        const assigneeName = t.assignee_name || t.assignee || t.employee_name || t.assigned_to_name || 'Staff Member';
        const initials = assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return {
          ...t,
          title: t.title || t.task_name,
          assignee: assigneeName,
          initials: initials,
          category: t.category || 'Operations',
          priority: t.priority || 'Medium',
          dueDate: t.dueDate || t.due_date ? new Date(t.dueDate || t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jun 30, 2026',
          status: t.status || 'Pending'
        };
      });

      setTasks(formattedTasks);
      if (empList.length) {
        setTaskForm(prev => ({ ...prev, assigned_to: empList[0].id || empList[0].name }));
      }
    } catch (err) {
      console.error('Error loading task assignment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = searchTerm.toLowerCase();
      const matchSearch = (t.title || '').toLowerCase().includes(q) || (t.assignee || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const selectedEmp = employees.find(emp => String(emp.id) === String(taskForm.assigned_to) || emp.name === taskForm.assigned_to) || employees[0];
    const assigneeName = selectedEmp ? selectedEmp.name : 'Staff Member';
    const initials = assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const payload = {
      title: taskForm.title,
      assigned_to: selectedEmp ? selectedEmp.id : null,
      assignee_name: assigneeName,
      category: taskForm.category,
      priority: taskForm.priority,
      due_date: taskForm.dueDate,
      status: 'Pending'
    };

    try {
      await createTask(payload);
    } catch (err) {
      console.warn('API create task fallback to local state:', err);
    }

    const newTask = {
      id: Date.now(),
      title: taskForm.title,
      assignee: assigneeName,
      initials: initials,
      category: taskForm.category,
      priority: taskForm.priority,
      dueDate: new Date(taskForm.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
      overdue: false
    };

    setTasks([newTask, ...tasks]);
    setShowModal(false);
    setTaskForm({ title: '', assigned_to: employees.length ? (employees[0].id || employees[0].name) : '', category: 'Inspection', priority: 'Medium', dueDate: '2026-06-30' });
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await deleteTask(id);
    } catch (err) {
      console.warn('API delete task fallback:', err);
    }
    setTasks(tasks.filter(t => t.id !== id));
  };

  // 🟢 ADVANCE TASK TO NEXT STATUS IN THE SEQUENCE — triggered by the arrow (→) action button
  const handleAdvanceStatus = async (task) => {
    let nextStatus = '';
    
    if (task.status === 'Todo' || task.status === 'Pending') {
      nextStatus = 'In Progress';
    } else if (task.status === 'In Progress') {
      nextStatus = 'Completed';
    } else {
      alert(`This task is already "${task.status}" — no further status to advance to.`);
      return;
    }
    
    // Optimistically update the UI
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));

    try {
      await updateTaskStatus(task.id, nextStatus);
    } catch (error) {
      alert('Failed to update status. Reverting change.');
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  // ── METRIC CARD — MATCHES MaterialsPage.js EXACTLY (white bg, outlined icon circle) ──
  const MetricCard = ({ label, value, sub, icon, color }) => (
    <div className="card border-0 h-100 metric-card-lux" style={{ borderRadius: '22px', background: '#ffffff' }}>
      <div className="p-3 d-flex align-items-start gap-2">
        <div className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: '#ffffff', color: color, fontSize: '1.1rem',
            border: `2px solid ${color}40`
          }}>
          {icon}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h3 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</h3>
          <span className="d-block fw-semibold" style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.25 }}>{label}</span>
        </div>
      </div>
      {sub && (
        <div className="px-3 pb-3">
          <small className="fw-medium" style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block' }}>{sub}</small>
        </div>
      )}
    </div>
  );

  return (
    <div className="theme-tasks container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        /* Premium Card Configurations — matches MaterialsPage.js */
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          background-color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(31,41,55,0.06) !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(31,41,55,0.09) !important;
        }
        .metric-card-lux {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          box-shadow: 0 8px 22px rgba(31,41,55,0.05) !important;
        }
        .metric-card-lux:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 26px rgba(31,41,55,0.09) !important;
        }
        .hover-btn-lux { transition: all 0.2s ease !important; }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* TASK REGISTER TABLE — MATCHES MaterialsPage.js */
        .theme-tasks table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-tasks th {
          background-color: #FAF8FF !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 0.72rem !important;
          letter-spacing: 0.05em !important;
          padding: 14px 20px !important;
          border: none !important;
          text-align: left !important;
        }
        .theme-tasks td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-tasks tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-tasks tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-tasks tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-tasks tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
          background-color: #ffffff !important;
        }

        /* ── ACTION BUTTON STRUCTURAL OVERRIDES — MATCHES MaterialsPage.js ── */
        .theme-tasks td .btn-action-del {
          background-color: #fff1f2 !important;
          color: #f43f5e !important;
          border: none !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .theme-tasks td .btn-action-del:hover {
          filter: brightness(0.95) !important;
        }

        .theme-tasks td .btn-action-advance {
          background-color: #eff6ff !important;
          color: ${COLORS.indigo} !important;
          border: none !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .theme-tasks td .btn-action-advance:hover {
          filter: brightness(0.95) !important;
        }
      `}</style>

      {/* MATCHED HEADER — icon + title left, + Assign New Task button top-right (like OrderManagementPage) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.clipboard}
          </div>
          <div>
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Task Assignment
              <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>TASKS</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Assign, track and manage tasks dynamically across your recorded employees</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span> Assign New Task</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS ROW */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Tasks', value: tasks.length.toString(), sub: 'Active workforce tasks', icon: THIN_ICONS.clipboard, color: COLORS.indigo },
          { label: 'Pending', value: tasks.filter(t => t.status === 'Pending').length.toString(), sub: 'Awaiting action', icon: THIN_ICONS.clock, color: COLORS.slate },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length.toString(), sub: 'Currently active', icon: THIN_ICONS.refresh, color: COLORS.sky },
          { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length.toString(), sub: 'Tasks finished', icon: THIN_ICONS.checkCircle, color: COLORS.emerald }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="position-relative" style={{ minWidth: '280px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 small"
              placeholder="Search tasks, assignee or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            {['All', 'Pending', 'In Progress', 'Completed'].map(st => (
              <button
                key={st}
                className={`btn btn-sm rounded-pill px-3 fw-bold ${statusFilter === st ? 'text-white' : 'bg-white text-dark'}`}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined,
                  border: statusFilter === st ? '1px solid transparent' : '1px solid #cbd5e1'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing live task registries...
          </div>
        ) : (
          <div className="table-responsive p-4 pt-2">
            <table>
              <thead>
                <tr>
                  <th>TASK</th>
                  <th>ASSIGNEE</th>
                  <th>CATEGORY</th>
                  <th>PRIORITY</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => {
                  const statusStyle = STATUS_STYLES[t.status] || STATUS_STYLES.Pending;
                  const priorityStyle = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.Medium;
                  return (
                    <tr key={t.id}>
                      <td className="fw-bold" style={{ color: '#1e293b' }}>{t.title}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '0.7rem', background: `${COLORS.indigo}1A`, color: COLORS.indigo }}>{t.initials}</span>
                          <span className="fw-bold">{t.assignee}</span>
                        </div>
                      </td>
                      <td><span className="badge rounded-pill bg-light border px-3" style={{ color: '#64748b' }}>{t.category}</span></td>
                      <td>
                        <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: priorityStyle.bg, color: priorityStyle.color }}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold" style={{ color: t.overdue ? COLORS.alert : '#475569' }}>
                          {t.dueDate}
                          {t.overdue && <small className="d-block fw-bold" style={{ fontSize: '0.65rem', color: COLORS.alert }}>OVERDUE</small>}
                        </span>
                      </td>
                      <td>
                        <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          ● {t.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {(t.status !== 'Completed' && t.status !== 'Done') && (
                            <button className="btn-action-advance" title="Advance Status" onClick={() => handleAdvanceStatus(t)}>
                              {THIN_ICONS.arrowRight}
                            </button>
                          )}
                          <button className="btn-action-del" title="Delete Task" onClick={() => handleDeleteTask(t.id)}>
                            {THIN_ICONS.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center" style={{ color: '#94a3b8' }}>No tasks match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DYNAMIC ASSIGN TASK MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3" style={{ borderLeft: `4px solid ${COLORS.primary}` }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  <span style={{ color: COLORS.indigo }}>{THIN_ICONS.clipboard}</span> Assign New Task
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>Task Title *</label>
                    <input type="text" className="form-control rounded-3" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>Assignee (Recorded Employee) *</label>
                      <select
                        className="form-select rounded-3"
                        value={taskForm.assigned_to}
                        onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                        required
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name || emp.full_name} ({emp.role || emp.department || 'Employee'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>Category</label>
                      <input type="text" className="form-control rounded-3" value={taskForm.category} onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>Priority</label>
                      <select className="form-select rounded-3" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>Due Date</label>
                      <input type="date" className="form-control rounded-3" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="submit" className="btn rounded-3 px-4 py-2 border-0 text-white fw-bold hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`, flex: 1 }}>
                    Assign Task
                  </button>
                  <button type="button" className="btn rounded-3 px-4 py-2 bg-light border fw-bold text-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAssignmentPage;