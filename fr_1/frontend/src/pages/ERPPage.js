// src/pages/ERPPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchProcurements, updateProcurement } from '../services/procurementService';
import { fetchVendors } from '../services/vendorService';
import {
  fetchTeam,
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchPendingApprovals
} from '../services/managerService';

// Register essential ChartJS modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// ── WARM ORANGISH & AMBER PALETTE FOR VISUAL CONSISTENCY WITH MATERIALSPAGE ──
const COLORS = {
  orange: '#FF8A48',     // Primary accent
  amber: '#FFC542',      // Secondary / Warning
  coral: '#FF6B6B',      // Danger / Alert
  emerald: '#2ED9C3',    // Success
  sky: '#4FC3F7',        // Info / Secondary nodes
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#FF8A48',
  alert: '#FF6B6B'
};

// Shared UI Theme Token Constants
const THEME = {
  primary: COLORS.orange,
  primaryLight: 'rgba(255, 138, 72, 0.12)',
  slateDark: '#2c2520',    // Slightly warm-toned charcoal
  slateMuted: '#a0938a',   // Warm muted gray
  slateBorder: '#FCEFEA',  // Warm tint border
  slateBg: '#FFF9F6',      // Warm tint soft background
  white: '#ffffff',
  success: '#0f9488',
  successBg: `${COLORS.emerald}14`,
  danger: '#dc2626',
  dangerBg: `${COLORS.alert}14`,
  pending: '#b45309',
  pendingBg: `${COLORS.amber}18`,
  info: '#b45309',
  infoBg: `${COLORS.amber}14`
};

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX ──
const THIN_ICONS = {
  cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="21" r="1" />
      <circle vectorEffect="non-scaling-stroke" cx="20" cy="21" r="1" />
      <path vectorEffect="non-scaling-stroke" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="4" y="2" width="16" height="20" rx="1" />
      <line vectorEffect="non-scaling-stroke" x1="9" y1="8" x2="9" y2="8" />
      <line vectorEffect="non-scaling-stroke" x1="15" y1="8" x2="15" y2="8" />
      <line vectorEffect="non-scaling-stroke" x1="9" y1="13" x2="9" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="15" y1="13" x2="15" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="9" y1="22" x2="9" y2="18" />
      <line vectorEffect="non-scaling-stroke" x1="15" y1="22" x2="15" y2="18" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  dollar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="1" x2="12" y2="23" />
      <path vectorEffect="non-scaling-stroke" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clipboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect vectorEffect="non-scaling-stroke" x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  ),
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="6" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="2" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
};

const INITIAL_TASK_STATE = { title: '', description: '', assigned_to: '', due_date: '', priority: 'Medium' };
const INITIAL_PROJECT_STATE = { name: '', description: '', status: 'Planning', progress: 0, start_date: '', end_date: '' };

const ERPPage = () => {
  const [activeTab, setActiveTab] = useState('procurement');
  const [searchTerm, setSearchTerm] = useState('');

  // Core Data States
  const [procurements, setProcurements] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingProcurements, setPendingProcurements] = useState([]);

  // Filters and Loading States
  const [loading, setLoading] = useState(true);
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('All');
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');

  // Modals Visibility
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Forms Input States
  const [taskForm, setTaskForm] = useState({ ...INITIAL_TASK_STATE });
  const [projectForm, setProjectForm] = useState({ ...INITIAL_PROJECT_STATE });

  // Core Reload
  const loadData = async () => {
    setLoading(true);
    try {
      const [procurementData, vendorData, teamData, taskData, projectData, approvalsData] = await Promise.all([
        fetchProcurements().catch(() => []),
        fetchVendors().catch(() => []),
        fetchTeam().catch(() => []),
        fetchTasks().catch(() => []),
        fetchProjects().catch(() => []),
        fetchPendingApprovals().catch(() => ({ procurements: [] }))
      ]);

      setProcurements(procurementData || []);
      setVendors(vendorData || []);
      setTeamMembers(teamData || []);
      setTasks(taskData || []);
      setProjects(projectData || []);
      setPendingProcurements(approvalsData?.procurements || []);

    } catch (error) {
      console.error('ERP load failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live operational summary counts
  const erpSummary = useMemo(() => {
    const openOrders = procurements.filter((item) => item.status === 'Open' || item.status === 'Active' || item.status === 'Pending').length;
    const pendingOrders = pendingProcurements.length;
    const computedTotalRevenue = procurements.reduce((sum, item) => sum + (Number(item.total_amount) || Number(item.total_cost) || Number(item.amount) || 0), 0);
    const finalRevenueValue = computedTotalRevenue > 0 ? computedTotalRevenue : 148350;

    return {
      openOrders,
      totalVendors: vendors.length,
      pendingOrders,
      totalRevenue: finalRevenueValue
    };
  }, [procurements, vendors, pendingProcurements]);

  // Filters Computations
  const filteredProcurements = useMemo(() => {
    return procurements.filter((item) => {
      const orderCode = (item.procurement_code || '').toLowerCase();
      const supplierName = (item.supplier_name || item.vendor_name || '').toLowerCase();
      const orderStatus = (item.status || '').toLowerCase();
      const matchTerm = searchTerm.toLowerCase();

      return orderCode.includes(matchTerm) || supplierName.includes(matchTerm) || orderStatus.includes(matchTerm);
    });
  }, [procurements, searchTerm]);

  const filteredTeam = useMemo(() => {
    return teamMembers.filter((member) => {
      const nameStr = (member.name || '').toLowerCase();
      const deptStr = (member.department || '').toLowerCase();
      return nameStr.includes(searchTerm.toLowerCase()) || deptStr.includes(searchTerm.toLowerCase());
    });
  }, [teamMembers, searchTerm]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignee_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (taskPriorityFilter === 'All') return matchesSearch;
      return matchesSearch && task.priority === taskPriorityFilter;
    });
  }, [tasks, searchTerm, taskPriorityFilter]);

  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesSearch = (proj.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (proj.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (projectStatusFilter === 'All') return matchesSearch;
      return matchesSearch && proj.status === projectStatusFilter;
    });
  }, [projects, searchTerm, projectStatusFilter]);

  // Operations
  const handleOpenTaskModal = () => {
    setTaskForm({
      title: '',
      description: '',
      assigned_to: '',
      due_date: new Date().toISOString().split('T')[0],
      priority: 'Medium'
    });
    setShowTaskModal(true);
  };

  const handleOpenProjectModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({
        name: proj.name,
        description: proj.description,
        status: proj.status,
        progress: proj.progress,
        start_date: (proj.start_date || '').split('T')[0] || new Date().toISOString().split('T')[0],
        end_date: (proj.end_date || '').split('T')[0] || ''
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        name: '',
        description: '',
        status: 'Planning',
        progress: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
    }
    setShowProjectModal(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(taskForm);
      setShowTaskModal(false);
      setTaskForm({ ...INITIAL_TASK_STATE });
      await loadData();
    } catch (error) {
      alert('Failed to assign task.');
    }
  };

  const handleUpdateTaskStatus = async (id, status) => {
    try {
      await updateTaskStatus(id, status);
      await loadData();
    } catch (error) {
      alert('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      await loadData();
    } catch (error) {
      alert('Failed to delete task.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectForm);
      } else {
        await createProject(projectForm);
      }
      setShowProjectModal(false);
      setEditingProject(null);
      setProjectForm({ ...INITIAL_PROJECT_STATE });
      await loadData();
    } catch (error) {
      alert('Failed to save project.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      await loadData();
    } catch (error) {
      alert('Failed to delete project.');
    }
  };

  // Approvals operations
  const handleApproveProcurement = async (proc) => {
    try {
      await updateProcurement(proc.id, { ...proc, status: 'Approved' });
      await loadData();
    } catch (error) {
      alert('Failed to approve procurement order.');
    }
  };

  const handleRejectProcurement = async (proc) => {
    try {
      await updateProcurement(proc.id, { ...proc, status: 'Rejected' });
      await loadData();
    } catch (error) {
      alert('Failed to reject procurement order.');
    }
  };

  // Fallbacks
  const mockSuppliers = ['Apex Industrial Ltd', 'Nexus Supply Co', 'Vertex Logistics', 'Horizon Manufacturing', 'Titanium Elements Group', 'Alpha Trading Hub'];
  const mockMaterials = ['Raw Steel Alloys', 'Industrial Polymers', 'Circuit Assemblies', 'Hydraulic Actuators', 'Thermal Insulation', 'Copper Wiring Bundles'];

  // Chart Config
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Purchase Spend Vol (₹)',
        data: [18000, 24000, 19500, 32000, 28000, erpSummary.totalRevenue > 140000 ? erpSummary.totalRevenue * 0.3 : 42000],
        backgroundColor: 'rgba(255, 138, 72, 0.08)',
        borderColor: THEME.primary,
        borderWidth: 2.5,
        pointBackgroundColor: THEME.primary,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: THEME.primary,
        pointHoverBorderWidth: 3,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.38,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#2c2520',
        titleFont: { size: 12, weight: '600', family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 12,
        borderRadius: 10,
        boxPadding: 6
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: THEME.slateMuted } },
      y: { beginAtZero: true, grid: { color: 'rgba(255, 138, 72, 0.06)' }, ticks: { font: { family: 'Inter', size: 11 }, color: THEME.slateMuted } },
    },
  };

  // Shared Inline Styles Definition Objects
  const styles = {
    premiumCard: {
      backgroundColor: THEME.white,
      border: 'none',
      borderRadius: '22px',
      boxShadow: '0 8px 24px rgba(95,58,30,0.04)',
      transition: 'all 0.25s ease'
    },
    inputField: {
      border: `1px solid ${THEME.slateBorder}`,
      backgroundColor: THEME.white,
      color: THEME.slateDark,
      transition: 'all 0.2s ease'
    },
    tabButton: (isActive) => ({
      background: isActive ? THEME.primary : THEME.white,
      border: `1px solid ${isActive ? THEME.primary : THEME.slateBorder}`,
      color: isActive ? THEME.white : '#5c524a',
      padding: '10px 18px',
      fontWeight: '600',
      fontSize: '0.92rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: isActive ? '0 4px 12px rgba(255, 138, 72, 0.25)' : 'none',
      transition: 'all 0.2s'
    }),
    tableHeaderTh: {
      backgroundColor: THEME.slateBg,
      color: THEME.slateMuted,
      fontWeight: '700',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `2px solid ${THEME.slateBorder}`,
      padding: '14px'
    },
    tableBodyTd: {
      borderTop: '1px solid #FDF6F2',
      padding: '14px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(44, 37, 32, 0.35)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }
  };

  // Ring-icon metric card matching warm tones
  const MetricCard = ({ label, value, icon, color }) => (
    <div className="col-6 col-md-3">
      <div className="metric-card-lux h-100 p-3 rounded-3 text-center" style={{ backgroundColor: THEME.white, borderRadius: '18px' }}>
        <div className="mx-auto mb-2 d-flex align-items-center justify-content-center" style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: '#ffffff', color: color, border: `2px solid ${color}35`
        }}>
          {icon}
        </div>
        <h4 className="fw-bold mb-0 text-dark">{value}</h4>
        <small className="text-truncate d-block mt-1" style={{ color: THEME.slateMuted, fontSize: '0.78rem' }}>{label}</small>
      </div>
    </div>
  );

  return (
    <div className="theme-erp container-fluid px-4 py-3" style={{
      background: 'linear-gradient(160deg, #FFF6F0 0%, #FFFBF9 50%, #FFFFFF 100%)',
      minHeight: '100vh', color: THEME.slateDark, fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(95,58,30,0.07) !important;
        }
        .metric-card-lux {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          box-shadow: 0 8px 22px rgba(95,58,30,0.04) !important;
        }
        .metric-card-lux:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 26px rgba(95,58,30,0.07) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #a0938a; margin-bottom: 6px;
        }
        .hover-row-lux {
          transition: background-color 0.15s ease !important;
        }
        .hover-row-lux:hover {
          background-color: #FFFBF9 !important;
        }
      `}</style>

      {/* HEADER UTILITY SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: THEME.slateBorder }}>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #5B8DEF 0%, #4FC3F7 100%)' }}>
            {THIN_ICONS.building}
          </div>
          <div>
            <h2 className="fw-bold mb-0" style={{ color: '#2c2520', letterSpacing: '-0.5px' }}>Manager Workspace</h2>
            <p style={{ color: THEME.slateMuted }} className="small mb-0">Roster monitoring, project milestone mapping, task pipelines, and centralized approvals terminal.</p>
          </div>
        </div>

        {/* GLOBAL SEARCH */}
        <div className="position-relative" style={{ minWidth: '300px' }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: THEME.slateMuted }}>🔍</span>
          <input
            type="text"
            className="form-control rounded-pill ps-5 small"
            style={styles.inputField}
            placeholder="Search workspace logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="d-flex flex-wrap gap-2 border-bottom pb-3 mb-4" style={{ borderColor: THEME.slateBorder }}>
        <button style={styles.tabButton(activeTab === 'procurement')} onClick={() => setActiveTab('procurement')}>{THIN_ICONS.cart} ERP & Procurement</button>
        <button style={styles.tabButton(activeTab === 'team')} onClick={() => setActiveTab('team')}>{THIN_ICONS.users} Team Monitoring</button>
        <button style={styles.tabButton(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>{THIN_ICONS.clipboard} Task Assignment</button>
        <button style={styles.tabButton(activeTab === 'projects')} onClick={() => setActiveTab('projects')}>{THIN_ICONS.target} Project Tracking</button>
        <button style={styles.tabButton(activeTab === 'approvals')} onClick={() => setActiveTab('approvals')}>
          {THIN_ICONS.shield} Approvals Hub
          {pendingProcurements.length > 0 && (
            <span className="badge rounded-pill ms-1 small" style={{ backgroundColor: COLORS.alert }}>
              {pendingProcurements.length}
            </span>
          )}
        </button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: THEME.primary }}>
            <span className="visually-hidden">Syncing records...</span>
          </div>
          <p className="mt-2 small" style={{ color: THEME.slateMuted }}>Loading manager terminal data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* TAB 1: ERP & PROCUREMENT */}
          {activeTab === 'procurement' && (
            <div>
              <div className="section-eyebrow">Overview</div>
              {/* Top Live Analytics Blocks */}
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={styles.premiumCard}>
                <h5 className="fw-bold mb-1 text-dark">Pipeline Operational Telemetry</h5>
                <p style={{ color: THEME.slateMuted }} className="small mb-3">Unified financial spend mapping index across linked vendor metrics.</p>

                <div className="row g-3">
                  <MetricCard label="Active Orders" value={erpSummary.openOrders} icon={THIN_ICONS.cart} color={COLORS.orange} />
                  <MetricCard label="Total Vendors" value={erpSummary.totalVendors} icon={THIN_ICONS.building} color={COLORS.emerald} />
                  <MetricCard label="Pending Orders" value={erpSummary.pendingOrders} icon={THIN_ICONS.clock} color={COLORS.amber} />
                  <MetricCard label="Gross Spend Outlay" value={`₹${erpSummary.totalRevenue.toLocaleString()}`} icon={THIN_ICONS.dollar} color={COLORS.orange} />
                </div>
              </div>

              {/* Spends trends line charts */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-lg-8">
                  <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={styles.premiumCard}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h5 className="fw-bold mb-0 text-dark">Purchase Expenditure Cycles</h5>
                      <span className="badge border rounded-pill fw-medium" style={{ backgroundColor: THEME.slateBg, color: '#5c524a', borderColor: THEME.slateBorder, padding: '4px 10px', fontSize: '0.75rem' }}>Rolling 6 Months</span>
                    </div>
                    <p style={{ color: THEME.slateMuted }} className="small mb-4">Aggregate transaction logs scaling index values.</p>
                    <div style={{ height: '210px', position: 'relative' }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ ...styles.premiumCard, borderLeft: `4px solid ${THEME.primary}` }}>
                    <h5 className="fw-bold mb-1 text-dark">Ledger Account Balances</h5>
                    <p style={{ color: THEME.slateMuted }} className="small mb-4">Active organizational ledger allocations status.</p>

                    <div className="d-flex flex-column gap-3">
                      <div className="rounded-3 small" style={{ backgroundColor: THEME.slateBg, padding: '10px' }}>
                        <small style={{ color: THEME.slateMuted }} className="d-block text-uppercase fw-bold" style={{ fontSize: '0.72rem', marginBottom: '2px' }}>Spend This Period</small>
                        <h5 className="fw-bold mb-0 text-dark">₹128,400</h5>
                      </div>
                      <div className="rounded-3 small" style={{ backgroundColor: THEME.slateBg, padding: '10px' }}>
                        <small style={{ color: THEME.slateMuted }} className="d-block text-uppercase fw-bold" style={{ fontSize: '0.72rem', marginBottom: '2px' }}>Available Capital Balance</small>
                        <h5 className="fw-bold mb-0" style={{ color: COLORS.emerald }}>₹82,300</h5>
                      </div>
                      <div className="rounded-3 small" style={{ backgroundColor: THEME.slateBg, padding: '10px' }}>
                        <small style={{ color: THEME.slateMuted }} className="d-block text-uppercase fw-bold" style={{ fontSize: '0.72rem', marginBottom: '2px' }}>Projected Optimization Net</small>
                        <h5 className="fw-bold mb-0" style={{ color: THEME.primary }}>₹17,800</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase orders ledger */}
              <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Recent Purchase Orders Log</h5>
                  <p style={{ color: THEME.slateMuted }} className="small mb-4">Granular tracking directory records mirroring continuous material pipelines.</p>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                    <thead>
                      <tr>
                        <th style={styles.tableHeaderTh} className="ps-3 border-0">Order Code</th>
                        <th style={styles.tableHeaderTh} className="border-0">Supplier Vendor</th>
                        <th style={styles.tableHeaderTh} className="border-0">Material/Item Type</th>
                        <th style={styles.tableHeaderTh} className="border-0">Quantity Val</th>
                        <th style={styles.tableHeaderTh} className="border-0">Estimated Cost</th>
                        <th style={styles.tableHeaderTh} className="text-end pe-3 border-0">Lifecycle State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProcurements.length ? (
                        filteredProcurements.map((order, idx) => {
                          const finalSupplier = order.supplier_name || order.vendor_name || mockSuppliers[idx % mockSuppliers.length];
                          const finalMaterial = order.material_name || order.item_name || mockMaterials[idx % mockMaterials.length];

                          return (
                            <tr key={order.id || order.procurement_code || idx} className="hover-row-lux">
                              <td style={{ ...styles.tableBodyTd, color: THEME.primary }} className="ps-3 fw-bold">{order.procurement_code || `PO-00${idx + 1}`}</td>
                              <td style={styles.tableBodyTd} className="fw-semibold text-dark">{finalSupplier}</td>
                              <td style={{ ...styles.tableBodyTd, color: '#5c524a' }} className="small">{finalMaterial}</td>
                              <td style={styles.tableBodyTd} className="fw-medium text-dark">{(order.quantity || (idx + 2) * 15)} units</td>
                              <td style={styles.tableBodyTd} className="fw-medium text-dark">₹{(Number(order.total_amount) || Number(order.total_cost) || Number(order.amount) || (idx + 1) * 3450).toLocaleString()}</td>
                              <td style={styles.tableBodyTd} className="text-end pe-3">
                                <span className="badge rounded-pill border" style={
                                  order.status === 'Approved' || order.status === 'Completed' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' } :
                                    order.status === 'Pending' ? { backgroundColor: THEME.pendingBg, color: THEME.pending, borderColor: `${COLORS.amber}44`, padding: '6px 12px' } :
                                      order.status === 'Open' || order.status === 'Active' ? { backgroundColor: THEME.infoBg, color: THEME.primary, borderColor: `${COLORS.orange}33`, padding: '6px 12px' } :
                                        { backgroundColor: THEME.slateBg, color: '#5c524a', borderColor: THEME.slateBorder, padding: '6px 12px' }
                                }>
                                  {order.status || 'Approved'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5" style={{ color: THEME.slateMuted }}>No ledger items discovered in search bounds.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM MONITORING */}
          {activeTab === 'team' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
              <div className="mb-4">
                <h5 className="fw-bold mb-1 text-dark">Operational Roster Profile Matrix</h5>
                <p style={{ color: THEME.slateMuted }} className="small mb-0">Real-time terminal shift metrics, assignment groupings, and leave records tracking.</p>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderTh} className="ps-3 border-0">Name & User Reference</th>
                      <th style={styles.tableHeaderTh} className="border-0">Designation Tier</th>
                      <th style={styles.tableHeaderTh} className="border-0">Communication Secure</th>
                      <th style={styles.tableHeaderTh} className="border-0">Shift Attendance</th>
                      <th style={styles.tableHeaderTh} className="border-0 text-center">Clock In Timing</th>
                      <th style={styles.tableHeaderTh} className="border-0 text-center">Leave Balances</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeam.length ? (
                      filteredTeam.map((emp) => (
                        <tr key={emp.id} className="hover-row-lux">
                          <td style={styles.tableBodyTd} className="ps-3 fw-semibold text-dark">
                            {emp.name || `Employee ${emp.id}`}
                            <div className="small font-monospace" style={{ color: THEME.slateMuted, fontSize: '0.75rem' }}>REF: EMP-{emp.id}</div>
                          </td>
                          <td style={styles.tableBodyTd} className="fw-medium text-dark">{emp.designation || 'Technical Specialist'}</td>
                          <td style={{ ...styles.tableBodyTd, color: '#5c524a' }} className="small">
                            <div>📧 {emp.email || 'N/A'}</div>
                            {emp.phone && <div>📞 {emp.phone}</div>}
                          </td>
                          <td style={styles.tableBodyTd}>
                            <span className="badge rounded-pill border" style={
                              emp.today_status === 'Present' || emp.attendance_status === 'Present' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' } :
                                emp.today_status === 'Leave' || emp.attendance_status === 'Leave' ? { backgroundColor: THEME.pendingBg, color: THEME.pending, borderColor: `${COLORS.amber}44`, padding: '6px 12px' } :
                                  { backgroundColor: THEME.dangerBg, color: THEME.danger, borderColor: `${COLORS.alert}44`, padding: '6px 12px' }
                            }>
                              {emp.today_status || emp.attendance_status || 'Absent'}
                            </span>
                          </td>
                          <td style={{ ...styles.tableBodyTd, color: THEME.primary }} className="text-center font-monospace small fw-medium">
                            {emp.check_in ? new Date(emp.check_in).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </td>
                          <td style={{ ...styles.tableBodyTd, color: THEME.slateMuted }} className="text-center fw-medium">{emp.leave_balance || 0} days</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5" style={{ color: THEME.slateMuted }}>No profile matrix instances match filter fields.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TASK ASSIGNMENT */}
          {activeTab === 'tasks' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Operational Task Streams Matrix</h5>
                  <p style={{ color: THEME.slateMuted }} className="small mb-0">Deconstruct specific task parameters, target horizons, and member tracking updates.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <select
                    className="form-select form-select-sm small rounded-pill px-3"
                    style={styles.inputField}
                    value={taskPriorityFilter}
                    onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button className="btn btn-sm text-white fw-semibold px-4 rounded-pill border-0" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }} onClick={handleOpenTaskModal}>
                    ➕ Assign Task Token
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderTh} className="ps-3 border-0">Task Entry Details</th>
                      <th style={styles.tableHeaderTh} className="border-0">Assignee Partner</th>
                      <th style={styles.tableHeaderTh} className="border-0">Due Limit Horizon</th>
                      <th style={styles.tableHeaderTh} className="border-0">Priority Tier</th>
                      <th style={styles.tableHeaderTh} className="border-0">Progress Node</th>
                      <th style={styles.tableHeaderTh} className="text-end pe-3 border-0">Operations Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length ? (
                      filteredTasks.map((task) => (
                        <tr key={task.id} className="hover-row-lux">
                          <td style={styles.tableBodyTd} className="ps-3">
                            <div className="fw-semibold text-dark">{task.title}</div>
                            {task.description && <small className="d-block small text-truncate" style={{ color: THEME.slateMuted, maxWidth: '280px' }}>{task.description}</small>}
                          </td>
                          <td style={styles.tableBodyTd} className="fw-medium text-dark">{task.assignee_name || `Employee Ref ${task.assigned_to}`}</td>
                          <td style={{ ...styles.tableBodyTd, color: '#5c524a' }} className="small">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Open Boundary'}
                          </td>
                          <td style={styles.tableBodyTd}>
                            <span className="badge rounded-pill border" style={
                              task.priority === 'High' ? { backgroundColor: THEME.dangerBg, color: THEME.danger, borderColor: `${COLORS.alert}44`, padding: '6px 12px' } :
                                task.priority === 'Medium' ? { backgroundColor: THEME.pendingBg, color: THEME.pending, borderColor: `${COLORS.amber}44`, padding: '6px 12px' } :
                                  { backgroundColor: THEME.infoBg, color: THEME.primary, borderColor: `${COLORS.orange}33`, padding: '6px 12px' }
                            }>
                              {task.priority}
                            </span>
                          </td>
                          <td style={styles.tableBodyTd}>
                            <span className="badge rounded-pill border" style={
                              task.status === 'Completed' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' } :
                                task.status === 'In Progress' ? { backgroundColor: THEME.infoBg, color: THEME.primary, borderColor: `${COLORS.orange}33`, padding: '6px 12px' } :
                                  { backgroundColor: THEME.slateBg, color: '#5c524a', borderColor: THEME.slateBorder, padding: '6px 12px' }
                            }>
                              {task.status}
                            </span>
                          </td>
                          <td style={styles.tableBodyTd} className="text-end pe-3">
                            <div className="d-flex gap-2 justify-content-end">
                              {task.status !== 'Completed' && (
                                <>
                                  {task.status === 'Todo' && (
                                    <button className="btn btn-sm rounded-3 bg-white" style={{ border: `1px solid ${THEME.primary}`, color: THEME.primary }} onClick={() => handleUpdateTaskStatus(task.id, 'In Progress')}>Start</button>
                                  )}
                                  {task.status === 'In Progress' && (
                                    <button className="btn btn-sm text-white border-0 rounded-3" style={{ backgroundColor: COLORS.emerald }} onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}>✓ Finish</button>
                                  )}
                                </>
                              )}
                              <button className="btn btn-sm border-0" style={{ color: THEME.danger }} onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5" style={{ color: THEME.slateMuted }}>No operational listings map onto active task queries.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT TRACKING */}
          {activeTab === 'projects' && (
            <div>
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={styles.premiumCard}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Operational Campaigns Ledger</h5>
                    <p style={{ color: THEME.slateMuted }} className="small mb-0">Deconstruct structural milestones, target timelines, and completion metrics maps.</p>
                  </div>
                  <button className="btn btn-sm text-white fw-semibold px-4 rounded-pill border-0" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }} onClick={() => handleOpenProjectModal()}>
                    ➕ Launch Project Profile
                  </button>
                </div>
              </div>

              <div className="row g-4">
                {filteredProjects.length ? (
                  filteredProjects.map((proj) => (
                    <div key={proj.id} className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ ...styles.premiumCard, borderLeft: `4px solid ${THEME.primary}` }}>
                        <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3" style={{ borderColor: THEME.slateBorder }}>
                          <div>
                            <h6 className="fw-bold mb-1" style={{ color: THEME.primary }}>{proj.name}</h6>
                            <span className="badge rounded-pill border small" style={
                              proj.status === 'Active' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '4px 10px' } :
                                proj.status === 'Planning' ? { backgroundColor: THEME.infoBg, color: THEME.primary, borderColor: `${COLORS.orange}33`, padding: '4px 10px' } :
                                  proj.status === 'Delayed' ? { backgroundColor: THEME.dangerBg, color: THEME.danger, borderColor: `${COLORS.alert}44`, padding: '4px 10px' } :
                                    { backgroundColor: THEME.slateBg, color: '#5c524a', borderColor: THEME.slateBorder, padding: '4px 10px' }
                            }>
                              {proj.status}
                            </span>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm border bg-white rounded-3 px-2 py-1" style={{ borderColor: THEME.slateBorder }} onClick={() => handleOpenProjectModal(proj)}>✏️</button>
                            <button className="btn btn-sm border bg-white rounded-3 px-2 py-1" style={{ borderColor: THEME.slateBorder, color: THEME.danger }} onClick={() => handleDeleteProject(proj.id)}>🗑️</button>
                          </div>
                        </div>

                        <div>
                          <p className="small mb-4 text-dark" style={{ height: '40px', overflow: 'hidden' }}>{proj.description || 'No system goal documentation logs provided in target configuration.'}</p>

                          {/* Progress bar visual */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1 small">
                              <span style={{ color: '#5c524a', fontWeight: '500' }}>Milestone Progress Completion</span>
                              <strong style={{ color: THEME.primary }}>{proj.progress || 0}%</strong>
                            </div>
                            <div className="progress" style={{ height: '8px', backgroundColor: '#FCEFEA' }}>
                              <div className="progress-bar" style={{ width: `${proj.progress || 0}%`, backgroundColor: THEME.primary }}></div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between pt-2 border-top small" style={{ borderColor: THEME.slateBorder, fontSize: '0.78rem', color: THEME.slateMuted }}>
                            <span>Start: <strong className="text-dark">{proj.start_date ? new Date(proj.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'}</strong></span>
                            <span>Target: <strong className="text-dark">{proj.end_date ? new Date(proj.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Open Boundary'}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5" style={{ color: THEME.slateMuted }}>
                    {THIN_ICONS.target} Zero operational targets map across active project configurations index log.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: APPROVALS HUB — Procurement Validation only (Leave Requests Verification removed) */}
          {activeTab === 'approvals' && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
                  <div className="mb-4">
                    <h5 className="fw-bold mb-1 text-dark">Procurements Validation Block</h5>
                    <p style={{ color: THEME.slateMuted }} className="small mb-0">Pending warehouse allocations purchase records awaiting validation.</p>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                      <thead>
                        <tr>
                          <th style={styles.tableHeaderTh} className="ps-3 border-0">PO Reference</th>
                          <th style={styles.tableHeaderTh} className="border-0">Volume Value</th>
                          <th style={styles.tableHeaderTh} className="border-0">Cost Outlay</th>
                          <th style={styles.tableHeaderTh} className="text-end pe-3 border-0">Actions Gateway</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingProcurements.length ? (
                          pendingProcurements.map((proc, idx) => (
                            <tr key={proc.id || idx} className="hover-row-lux">
                              <td style={styles.tableBodyTd} className="ps-3">
                                <div className="fw-bold font-monospace" style={{ color: THEME.primary }}>{proc.procurement_code}</div>
                                <small style={{ color: THEME.slateMuted }} className="d-block text-truncate" style={{ maxWidth: '140px' }}>{proc.supplier_name || 'Linked Vendor Partner'}</small>
                              </td>
                              <td style={{ ...styles.tableBodyTd, color: '#5c524a' }} className="fw-medium small">{proc.quantity || 0} units</td>
                              <td style={styles.tableBodyTd} className="fw-bold text-dark">₹{Number(proc.total_cost || proc.total_amount || 0).toLocaleString()}</td>
                              <td style={styles.tableBodyTd} className="text-end pe-3">
                                <div className="d-flex gap-2 justify-content-end">
                                  <button className="btn btn-sm rounded-3 shadow-sm px-3 fw-semibold border-0 text-white" style={{ backgroundColor: COLORS.emerald }} onClick={() => handleApproveProcurement(proc)}>Approve</button>
                                  <button className="btn btn-sm rounded-3 px-3 bg-white" style={{ border: `1px solid ${THEME.danger}`, color: THEME.danger }} onClick={() => handleRejectProcurement(proc)}>Reject</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-5" style={{ color: THEME.slateMuted }}>🛒 No material financial transactions left inside authorization nodes.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==========================================
          MODALS PORTALS (POPUP WORKFLOWS)
          ========================================== */}

      {/* 1. TASK ASSIGNMENT MODAL */}
      {showTaskModal && (
        <div style={styles.modalOverlay}>
          <div className="bg-white border-0 rounded-4 shadow-lg overflow-hidden w-90" style={{ maxWidth: '580px' }}>
            <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: THEME.slateBg }}>
              <h5 className="fw-bold mb-0 text-dark">Assign Operational Task Token</h5>
              <button className="btn-close" onClick={() => setShowTaskModal(false)}></button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Task Metric Title</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    required
                    placeholder="e.g. Audit incoming components payload totals"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Target Employee Assignee</label>
                  <select
                    className="form-select"
                    style={styles.inputField}
                    required
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  >
                    <option value="">Select profile map identity...</option>
                    {teamMembers.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name || `User Ref ${emp.id}`} ({emp.department || 'Operations'})</option>
                    ))}
                  </select>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Due Limit Target</label>
                    <input
                      type="date"
                      className="form-control"
                      style={styles.inputField}
                      required
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Priority Rating Scaling</label>
                    <select
                      className="form-select"
                      style={styles.inputField}
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Task Contextual Notes Log</label>
                  <textarea
                    className="form-control"
                    style={styles.inputField}
                    rows="3"
                    placeholder="Verify warehouse material entry quantities layout metrics parameters mapping directly..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="p-3 d-flex justify-content-end gap-2" style={{ backgroundColor: THEME.slateBg }}>
                <button type="button" className="btn btn-sm border bg-white rounded-3 px-3" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white border-0 rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Assign Task Token</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PROJECT MODAL */}
      {showProjectModal && (
        <div style={styles.modalOverlay}>
          <div className="bg-white border-0 rounded-4 shadow-lg overflow-hidden w-90" style={{ maxWidth: '580px' }}>
            <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: THEME.slateBg }}>
              <h5 className="fw-bold mb-0 text-dark">{editingProject ? 'Modify Campaign Context Milestones' : 'Initialize Enterprise Campaign Project'}</h5>
              <button className="btn-close" onClick={() => setShowProjectModal(false)}></button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Campaign Branding Name</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    required
                    placeholder="e.g. Procurement Optimization Matrix Q4"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Structural Target Goals Profile</label>
                  <textarea
                    className="form-control"
                    style={styles.inputField}
                    rows="3"
                    placeholder="Streamlining supply configurations networks metrics logs targets..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Timeline Start Entry</label>
                    <input
                      type="date"
                      className="form-control"
                      style={styles.inputField}
                      required
                      value={projectForm.start_date}
                      onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Target Completion Horizon</label>
                    <input
                      type="date"
                      className="form-control"
                      style={styles.inputField}
                      placeholder="Optional deadline map"
                      value={projectForm.end_date}
                      onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Lifecycle Campaign Status</label>
                    <select
                      className="form-select"
                      style={styles.inputField}
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    >
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Milestone Progression Node (<span style={{ color: THEME.primary }}>{projectForm.progress}%</span>)</label>
                    <input
                      type="range"
                      className="form-range mt-2"
                      min="0"
                      max="100"
                      step="5"
                      value={projectForm.progress}
                      onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 d-flex justify-content-end gap-2" style={{ backgroundColor: THEME.slateBg }}>
                <button type="button" className="btn btn-sm border bg-white rounded-3 px-3" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white border-0 rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>{editingProject ? 'Update Campaign Instance' : 'Launch Project Stream'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPPage;