// src/pages/DashboardPage.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchReportSummary } from '../services/reportService';
import { fetchPayrollSummary } from '../services/payrollService';
import { fetchSalesSummary } from '../services/salesService';
import { fetchEmployeeProfile, fetchMyTasks } from '../services/employeeService';
import { fetchTodayAttendance, fetchAttendanceHistory, punchIn, punchOut } from '../services/attendanceService';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, ArcElement, Filler);

// 🎨 Vibrant gradient palette
const GRADIENTS = {
  indigo: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  emerald: 'linear-gradient(135deg, #10b981 0%, #06d6a0 100%)',
  amber: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
  rose: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  sky: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
  violet: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
  slate: 'linear-gradient(135deg, #475569 0%, #0f172a 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
};

const DashboardPage = () => {
  const user = getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [topMaterials, setTopMaterials] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});
  const [payrollSummary, setPayrollSummary] = useState({});
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');

  const formattedTodayDate = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
  }), []);

  const getRawTimeValues = (dateInput) => {
    if (!dateInput) return null;
    try {
      let timeString = '';
      if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) timeString = dateInput.split('T')[1];
        else if (dateInput.includes(' ')) timeString = dateInput.split(' ')[1];
        else timeString = dateInput;
      } else {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return null;
        return { hours: d.getHours(), minutes: d.getMinutes() };
      }
      const parts = timeString.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (isNaN(hours) || isNaN(minutes)) return null;
      return { hours, minutes };
    } catch (e) { return null; }
  };

  const formatExactTime = (dateInput) => {
    const t = getRawTimeValues(dateInput);
    if (!t) return '--:--';
    let h = t.hours % 12; h = h === 0 ? 12 : h;
    const ampm = t.hours >= 12 ? 'PM' : 'AM';
    return `${h}:${t.minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const calculateAttendanceStatus = (checkInStr, checkOutStr) => {
    const pIn = getRawTimeValues(checkInStr);
    if (!pIn) return { label: 'Not punched in', color: '#fff', bg: GRADIENTS.slate };
    const pOut = getRawTimeValues(checkOutStr);
    if (!pOut) {
      try {
        const rawInDate = checkInStr.includes('T') ? checkInStr.split('T')[0] : checkInStr.split(' ')[0];
        const todayDate = new Date().toISOString().split('T')[0];
        if (rawInDate === todayDate) {
          return (pIn.hours > 9 || (pIn.hours === 9 && pIn.minutes > 0))
            ? { label: 'Punched In Late', color: '#fff', bg: GRADIENTS.amber }
            : { label: 'Active Shift', color: '#fff', bg: GRADIENTS.emerald };
        }
      } catch (err) { }
      return { label: 'Punch Out Missed', color: '#fff', bg: GRADIENTS.rose };
    }
    if (pIn.hours > 9 || (pIn.hours === 9 && pIn.minutes > 0))
      return { label: 'Punched In Late', color: '#fff', bg: GRADIENTS.amber };
    if (pOut.hours < 18)
      return { label: 'Punched Early', color: '#fff', bg: GRADIENTS.sky };
    return { label: 'Present', color: '#fff', bg: GRADIENTS.emerald };
  };

  const loadSummary = async () => {
    try {
      const summary = await fetchReportSummary();
      setStats(summary);
      setTopMaterials(summary.topMaterials || []);
      loadRecentActivities(summary);
    } catch (e) { console.error(e); }
  };
  const loadPayroll = async () => { try { setPayrollSummary(await fetchPayrollSummary()); } catch (e) { console.error(e); } };
  const loadSales = async () => { try { setSalesSummary(await fetchSalesSummary()); } catch (e) { console.error(e); } };
  const loadEmployeeProfile = async () => {
    if (['Employee', 'Manager', 'Sales'].includes(user?.role)) {
      try { setEmployeeProfile(await fetchEmployeeProfile()); } catch (e) { console.error(e); }
    }
  };
  const loadAttendance = async () => {
    if (!['Employee', 'Manager', 'Sales'].includes(user?.role)) return;
    setAttendanceLoading(true); setAttendanceError('');
    try {
      const today = await fetchTodayAttendance();
      const hist = await fetchAttendanceHistory();
      setTodayAttendance(today.attendance || null);
      setAttendanceHistory(hist || []);
    } catch (e) { console.error(e); }
    finally { setAttendanceLoading(false); }
  };
  const loadMyTasks = async () => {
    setTasksLoading(true); setTasksError('');
    try {
      const data = await fetchMyTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) { setTasksError('Unable to load tasks.'); setTasks([]); }
    finally { setTasksLoading(false); }
  };
  const loadRecentActivities = (s) => {
    const a = [];
    (s.recent_employees || []).forEach(emp => a.push({
      icon: '👤', message: `Employee joined: ${emp.name}`,
      time: emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'Today',
      gradient: GRADIENTS.indigo
    }));
    (s.recent_materials || []).forEach(mat => a.push({
      icon: '📦', message: `Material added: ${mat.material_name}`,
      time: mat.created_at ? new Date(mat.created_at).toLocaleDateString() : 'Today',
      gradient: GRADIENTS.amber
    }));
    setRecentActivities(a);
  };

  useEffect(() => {
    loadSummary(); loadEmployeeProfile(); loadAttendance(); loadMyTasks();
    if (['Admin', 'HR', 'Manager'].includes(user?.role)) loadPayroll();
    if (['Admin', 'Manager', 'Sales'].includes(user?.role)) loadSales();
  }, [user?.role]);

  const handlePunchIn = async () => {
    setAttendanceActionLoading(true); setAttendanceError('');
    try { await punchIn(); await loadAttendance(); }
    catch (e) { setAttendanceError(e.response?.data?.message || 'Unable to punch in'); }
    finally { setAttendanceActionLoading(false); }
  };
  const handlePunchOut = async () => {
    setAttendanceActionLoading(true); setAttendanceError('');
    try { await punchOut(); await loadAttendance(); }
    catch (e) { setAttendanceError(e.response?.data?.message || 'Unable to punch out'); }
    finally { setAttendanceActionLoading(false); }
  };

  const chartLabels = useMemo(() => topMaterials.map(i => i.material_name || `Item ${i.id}`), [topMaterials]);
  const chartQuantities = useMemo(() => topMaterials.map(i => i.quantity || 0), [topMaterials]);
  const stockChartColors = useMemo(() => chartQuantities.map(q => q <= 10 ? '#f43f5e' : '#10b981'), [chartQuantities]);

  const materialChartDataValues = useMemo(() => [
    stats.total_materials || 140, stats.in_transit_materials || 45,
    stats.issued_materials || 85, stats.returned_materials || 12
  ], [stats]);
  const materialTotalSum = useMemo(() => materialChartDataValues.reduce((a, b) => a + b, 0), [materialChartDataValues]);

  const salesPipelineValues = useMemo(() => [
    salesSummary.leads_count || 45, salesSummary.qualified_count || 28,
    salesSummary.proposal_count || 18, salesSummary.negotiation_count || 12,
    salesSummary.won_count || 24
  ], [salesSummary]);
  const salesPipelineTotal = useMemo(() => salesPipelineValues.reduce((a, b) => a + b, 0), [salesPipelineValues]);

  const currentTodayStatusObj = useMemo(
    () => calculateAttendanceStatus(todayAttendance?.check_in, todayAttendance?.check_out),
    [todayAttendance?.check_in, todayAttendance?.check_out]
  );

  const roleCards = useMemo(() => {
    if (user?.role === 'HR') return [
      { title: 'Employee Count', value: stats.total_employees || 0, gradient: GRADIENTS.indigo, icon: '👥' },
      { title: 'Payroll Total', value: payrollSummary.total_payroll ? `₹${payrollSummary.total_payroll.toLocaleString()}` : '₹0', gradient: GRADIENTS.emerald, icon: '💰' },
      { title: 'Average Salary', value: payrollSummary.avg_salary ? `₹${payrollSummary.avg_salary.toLocaleString()}` : '₹0', gradient: GRADIENTS.sky, icon: '📈' },
      { title: 'Leave Management', value: stats.pending_leaves || 0, gradient: GRADIENTS.amber, note: 'Pending leave approvals', icon: '📝' },
    ];
    if (user?.role === 'Manager') return [
      { title: 'Inventory Items', value: stats.total_materials || 0, gradient: GRADIENTS.indigo, icon: '📦' },
      { title: 'Team Size', value: stats.total_employees || 0, gradient: GRADIENTS.emerald, icon: '👥' },
      { title: 'Active Vendors', value: stats.total_vendors || 0, gradient: GRADIENTS.amber, note: 'Global partners', icon: '🏢' },
      { title: 'Open Orders', value: stats.pending_orders || 0, gradient: GRADIENTS.sky, note: 'Awaiting dispatch', icon: '🛒' },
    ];
    if (user?.role === 'Sales') return [
      { title: 'Revenue', value: salesSummary.total_revenue ? `₹${salesSummary.total_revenue.toLocaleString()}` : '₹0', gradient: GRADIENTS.emerald, icon: '💵' },
      { title: 'Orders', value: salesSummary.total_orders || 0, gradient: GRADIENTS.indigo, icon: '🛒' },
      { title: 'Customers', value: stats.total_customers || 0, gradient: GRADIENTS.amber, icon: '👤' },
      { title: 'Lead Activities', value: salesSummary.topCustomers?.length || 0, gradient: GRADIENTS.sky, icon: '⚡' },
    ];
    if (user?.role === 'Employee') return [
      { title: 'Assigned Materials', value: stats.total_materials || 0, gradient: GRADIENTS.indigo, icon: '🛠️' },
      { title: 'System Notifications', value: stats.total_users || 0, gradient: GRADIENTS.sky, note: 'Check notifications tab', icon: '🔔' },
      { title: 'Attendance Status', value: currentTodayStatusObj.label, gradient: GRADIENTS.amber, icon: '⏰' },
      { title: 'Leave Balance', value: employeeProfile?.leave_balance != null ? employeeProfile.leave_balance : '0', gradient: GRADIENTS.emerald, icon: '🏝️' },
    ];
    return [];
  }, [stats, salesSummary, payrollSummary, user?.role, currentTodayStatusObj, employeeProfile]);

  // KPI Card component
  const KPI = ({ title, value, sub, icon, gradient }) => (
    <div className="card border-0 h-100 hover-premium-card position-relative overflow-hidden"
      style={{ borderRadius: '22px', background: '#ffffff', boxShadow: '0 8px 28px rgba(15, 23, 42, 0.06)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: gradient }} />
      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '110px', height: '110px', background: gradient, opacity: 0.08, borderRadius: '50%' }} />
      <div className="p-3 position-relative">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="text-uppercase fw-bold tracking-wider" style={{ fontSize: '0.68rem', color: '#64748b', letterSpacing: '1px' }}>{title}</span>
          <span className="d-flex align-items-center justify-content-center"
            style={{ width: '42px', height: '42px', borderRadius: '12px', background: gradient, color: '#fff', fontSize: '1.2rem', boxShadow: '0 6px 16px rgba(99,102,241,0.25)' }}>
            {icon}
          </span>
        </div>
        <h3 className="mb-1" style={{ letterSpacing: '-0.8px', fontWeight: '800', background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {value || 0}
        </h3>
        {sub && <small className="text-muted text-truncate d-block fw-medium">{sub}</small>}
      </div>
    </div>
  );

  return (
    <div className="theme-dashboard container-fluid px-4 py-4"
      style={{
        background: 'linear-gradient(135deg, #f5f7ff 0%, #fdf4ff 50%, #ecfeff 100%)',
        minHeight: '100vh', color: '#0f172a', fontFamily: '"Inter", sans-serif'
      }}>

      <style>{`
        .hover-premium-card { transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s ease !important; }
        .hover-premium-card:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(99,102,241,0.15) !important; }
        .hover-row-lux { transition: background-color .18s ease, transform .15s ease !important; }
        .hover-row-lux:hover { background: linear-gradient(90deg, rgba(99,102,241,0.06), rgba(236,72,153,0.04)) !important; }
        .hover-input-lux { transition: all .2s ease !important; }
        .hover-input-lux:focus, .hover-input-lux:hover { box-shadow: 0 0 0 4px rgba(99,70,229,0.15) !important; outline: none; border-color: #6366f1 !important; }
        .hover-btn-lux { transition: transform .2s ease, filter .2s ease, box-shadow .2s ease !important; }
        .hover-btn-lux:hover { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 10px 22px rgba(99,102,241,0.3) !important; }
        .hover-action-node { transition: all .2s ease !important; border: 1px solid transparent !important; }
        .hover-action-node:hover { transform: translateX(4px); background: #fff !important; border-color: #e0e7ff !important; box-shadow: 0 6px 18px rgba(99,102,241,0.08) !important; }
        .glass-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); }
        .gradient-text { background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
      `}</style>

      {/* TOP BAR */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <div className="d-flex align-items-center gap-3 flex-grow-1 flex-md-grow-0" style={{ maxWidth: '460px' }}>
          <div className="position-relative flex-grow-1">
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ zIndex: 10, color: '#6366f1' }}>🔍</span>
            <input
              type="text"
              className="form-control glass-card ps-5 hover-input-lux"
              placeholder="Search directory records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: '14px', padding: '0.7rem 1rem', border: '1px solid rgba(99,102,241,0.15)', color: '#0f172a' }}
            />
          </div>
          <div className="position-relative d-flex align-items-center justify-content-center hover-btn-lux"
            style={{ width: '46px', height: '46px', borderRadius: '14px', cursor: 'pointer', background: GRADIENTS.indigo, color: '#fff', boxShadow: '0 6px 16px rgba(99,102,241,0.3)' }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            <span className="position-absolute top-0 start-100 translate-middle border border-2 border-white rounded-circle pulse-dot"
              style={{ width: '12px', height: '12px', marginTop: '10px', marginLeft: '-10px', background: GRADIENTS.rose }}></span>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="d-flex align-items-center glass-card px-3 py-2 small fw-bold hover-premium-card"
            style={{ borderRadius: '14px', color: '#475569' }}>
            <span className="me-2" style={{ background: GRADIENTS.indigo, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📅</span>
            {formattedTodayDate}
          </div>
          <span className="badge px-3 py-2 text-uppercase fw-bold hover-btn-lux"
            style={{ background: GRADIENTS.slate, color: '#fff', borderRadius: '12px', fontSize: '0.78rem', letterSpacing: '1px', boxShadow: '0 6px 16px rgba(15,23,42,0.2)' }}>
            ✨ {user?.role || 'Guest'} Control Desk
          </span>
        </div>
      </div>

      {/* METRICS GRID */}
      {user?.role === 'Admin' ? (
        <div className="row g-3 mb-4">
          {[
            { label: 'Materials', value: stats.total_materials, sub: `${stats.low_stock_count || 0} low stock items`, icon: '📦', gradient: GRADIENTS.indigo },
            { label: 'Employees', value: stats.total_employees, sub: `${stats.pending_leaves || 0} pending logs`, icon: '👥', gradient: GRADIENTS.emerald },
            { label: 'Vendors', value: stats.total_vendors, sub: `Active partnerships`, icon: '🏢', gradient: GRADIENTS.amber },
            { label: 'Customers', value: stats.total_customers, sub: `${stats.total_leads || 0} leads index`, icon: '🎯', gradient: GRADIENTS.sky },
            { label: 'Total Revenue', value: stats.total_revenue ? `₹${stats.total_revenue.toLocaleString()}` : `₹${(salesSummary.total_revenue || 248900).toLocaleString()}`, sub: 'Gross Revenue Output', icon: '💵', gradient: GRADIENTS.rose },
            { label: 'Open Orders', value: stats.pending_orders || 0, sub: 'Awaiting dispatch', icon: '🛒', gradient: GRADIENTS.violet }
          ].map((card, i) => (
            <div key={i} className="col-12 col-sm-6 col-md-4 col-xl-2 flex-grow-1">
              <KPI title={card.label} value={card.value} sub={card.sub} icon={card.icon} gradient={card.gradient} />
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {roleCards.map((card) => (
            <div key={card.title} className="col-12 col-sm-6 col-lg-3">
              <KPI title={card.title} value={card.value} sub={card.note} icon={card.icon} gradient={card.gradient} />
            </div>
          ))}
        </div>
      )}

      {/* TASKS + ATTENDANCE */}
      {['Employee', 'Manager', 'Sales'].includes(user?.role) && (
        <div className="row g-4 mb-4">
          <div className={user?.role === 'Employee' ? "col-12 col-lg-6" : "col-12"}>
            <div className="card border-0 p-4 glass-card h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1 gradient-text">🎯 Operational Tasks Workspace</h5>
                  <p className="text-muted small mb-0">Tasks allocated to your current credential tier.</p>
                </div>
                <span className="badge rounded-pill px-3 py-2 fw-bold"
                  style={{ background: GRADIENTS.indigo, color: '#fff', boxShadow: '0 6px 16px rgba(99,102,241,0.3)' }}>
                  {tasks.filter(t => t.status !== 'Completed').length} Pending
                </span>
              </div>

              <div className="d-flex flex-column gap-3">
                {tasks.length > 0 ? tasks.map((task) => (
                  <div key={task.id} className="p-3 d-flex align-items-center justify-content-between gap-3 hover-action-node"
                    style={{ borderRadius: '14px', background: 'rgba(248,250,252,0.8)' }}>
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex align-items-center justify-content-center"
                        style={{ width: '44px', height: '44px', borderRadius: '12px', background: GRADIENTS.violet, color: '#fff', fontSize: '1.2rem' }}>📋</span>
                      <div>
                        <p className="mb-1 fw-bold text-dark" style={{ fontSize: '0.92rem' }}>{task.title}</p>
                        <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
                          <span className="badge rounded px-2 py-1 fw-bold" style={
                            task.priority === 'High' ? { background: GRADIENTS.rose, color: '#fff' } :
                              task.priority === 'Medium' ? { background: GRADIENTS.amber, color: '#fff' } :
                                { background: GRADIENTS.slate, color: '#fff' }
                          }>{task.priority} Priority</span>
                          <span style={{ fontSize: '0.78rem' }}>• Due: {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="badge px-3 py-2 rounded-pill fw-bold" style={
                      task.status === 'Completed' ? { background: GRADIENTS.emerald, color: '#fff' } :
                        task.status === 'In Progress' ? { background: GRADIENTS.sky, color: '#fff' } :
                          { background: GRADIENTS.slate, color: '#fff' }
                    }>{task.status}</span>
                  </div>
                )) : (
                  <div className="text-center py-5 text-muted">
                    <span className="fs-1 d-block mb-2">🎉</span> No operational entries in workspace bounds.
                  </div>
                )}
              </div>
            </div>
          </div>

          {user?.role === 'Employee' && (
            <div className="col-12 col-lg-6">
              <div className="card border-0 p-4 glass-card h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 gradient-text">⏱️ Live Punch Workstation</h5>
                    <p className="text-muted small mb-0">Standard shift: 9:00 AM - 6:00 PM</p>
                  </div>
                  {attendanceLoading && <div className="spinner-border spinner-border-sm" style={{ color: '#6366f1' }} role="status"></div>}
                </div>

                {attendanceError && <div className="alert p-2.5 small mb-3 border-0 fw-medium" style={{ background: GRADIENTS.rose, color: '#fff', borderRadius: '12px' }}>{attendanceError}</div>}

                <div className="p-3 mb-4 d-flex justify-content-around text-center align-items-center hover-premium-card"
                  style={{ borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(236,72,153,0.05))', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div>
                    <small className="d-block text-uppercase fw-bold mb-2" style={{ fontSize: '0.62rem', letterSpacing: '1px', color: '#64748b' }}>Status</small>
                    <span className="badge px-3 py-2 rounded-pill" style={{ background: currentTodayStatusObj.bg, color: currentTodayStatusObj.color, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {currentTodayStatusObj.label}
                    </span>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, transparent, #cbd5e1, transparent)' }}></div>
                  <div>
                    <small className="d-block text-uppercase fw-bold mb-2" style={{ fontSize: '0.62rem', letterSpacing: '1px', color: '#64748b' }}>Punched In</small>
                    <strong className="d-block font-monospace fs-5 fw-bold" style={{ background: GRADIENTS.emerald, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {todayAttendance?.check_in ? formatExactTime(todayAttendance.check_in) : '--:--'}
                    </strong>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, transparent, #cbd5e1, transparent)' }}></div>
                  <div>
                    <small className="d-block text-uppercase fw-bold mb-2" style={{ fontSize: '0.62rem', letterSpacing: '1px', color: '#64748b' }}>Punched Out</small>
                    <strong className="d-block font-monospace fs-5 fw-bold" style={{ background: GRADIENTS.rose, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {todayAttendance?.check_out ? formatExactTime(todayAttendance.check_out) : '--:--'}
                    </strong>
                  </div>
                </div>

                <div className="d-flex gap-3 mt-auto">
                  <button
                    className="btn rounded-3 py-2 flex-grow-1 fw-bold border-0 hover-btn-lux text-white"
                    onClick={handlePunchIn}
                    disabled={attendanceActionLoading || !!getRawTimeValues(todayAttendance?.check_in)}
                    style={{ background: GRADIENTS.emerald, boxShadow: '0 6px 16px rgba(16,185,129,0.3)' }}>
                    🚀 Core Clock-In
                  </button>
                  <button
                    className="btn rounded-3 py-2 flex-grow-1 fw-bold border-0 hover-btn-lux text-white"
                    onClick={handlePunchOut}
                    disabled={attendanceActionLoading || !getRawTimeValues(todayAttendance?.check_in) || !!getRawTimeValues(todayAttendance?.check_out)}
                    style={{ background: GRADIENTS.rose, boxShadow: '0 6px 16px rgba(244,63,94,0.3)' }}>
                    🔒 Shift Sign-Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANAGER / SALES ANALYTICS */}
      {['Manager', 'Sales'].includes(user?.role) && (
        <div className="row g-4 d-flex align-items-stretch mb-4">
          <div className="col-12 col-xl-6 d-flex flex-column">
            <div className="card border-0 p-4 glass-card h-100 flex-grow-1 hover-premium-card" style={{ borderRadius: '22px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold mb-0 gradient-text">📈 Revenue Horizon Tracking</h5>
                <span className="small fw-bold px-2 py-1 rounded-pill" style={{ background: GRADIENTS.emerald, color: '#fff' }}>▲ Live</span>
              </div>
              <p className="text-muted small mb-3">Gross financial tracking ledger graphs.</p>
              <div className="w-100 mt-auto" style={{ height: '240px', position: 'relative' }}>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'Revenue (₹)',
                      data: [
                        salesSummary.total_revenue ? salesSummary.total_revenue * 0.4 : 5000,
                        salesSummary.total_revenue ? salesSummary.total_revenue * 0.6 : 8500,
                        salesSummary.total_revenue ? salesSummary.total_revenue * 0.5 : 7000,
                        salesSummary.total_revenue ? salesSummary.total_revenue * 0.8 : 12000,
                        salesSummary.total_revenue ? salesSummary.total_revenue * 0.9 : 14500,
                        salesSummary.total_revenue || 18000
                      ],
                      backgroundColor: (ctx) => {
                        const c = ctx.chart.ctx.createLinearGradient(0, 0, 0, 240);
                        c.addColorStop(0, 'rgba(99,102,241,0.35)');
                        c.addColorStop(1, 'rgba(236,72,153,0.02)');
                        return c;
                      },
                      borderColor: '#6366f1', borderWidth: 3,
                      pointBackgroundColor: '#ec4899', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
                      fill: true, tension: 0.4
                    }]
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(99,102,241,0.08)' } }, x: { grid: { display: false } } }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3 d-flex flex-column">
            <div className="card border-0 p-4 glass-card h-100 flex-grow-1 hover-premium-card" style={{ borderRadius: '22px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold mb-0 gradient-text">🎯 Sales Pipeline</h5>
                <span className="badge px-2 py-1 rounded-3 small fw-bold" style={{ background: GRADIENTS.indigo, color: '#fff' }}>{salesPipelineTotal}</span>
              </div>
              <p className="text-muted small mb-3">Active funnel snapshot.</p>
              <div className="w-100 d-flex justify-content-center align-items-center mt-auto" style={{ height: '240px', position: 'relative' }}>
                <Pie
                  data={{
                    labels: ['Leads', 'Qualified', 'Proposal', 'Negotiation', 'Won'],
                    datasets: [{ data: salesPipelineValues, backgroundColor: ['#6366f1', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'], borderWidth: 3, borderColor: '#fff' }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 8, font: { size: 11, weight: '600' } } } } }}
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3 d-flex flex-column">
            <div className="card border-0 p-4 glass-card h-100 flex-grow-1 hover-premium-card" style={{ borderRadius: '22px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold mb-0 gradient-text">📦 Inventory Volume</h5>
                <span className="badge px-2 py-1 rounded-3 small fw-bold" style={{ background: GRADIENTS.violet, color: '#fff' }}>{materialTotalSum}</span>
              </div>
              <p className="text-muted small mb-3">Warehouse allocation summary.</p>
              <div className="w-100 d-flex justify-content-center align-items-center mt-auto" style={{ height: '240px', position: 'relative' }}>
                <Pie
                  data={{
                    labels: ['In Stock', 'In Transit', 'Issued', 'Returned'],
                    datasets: [{ data: materialChartDataValues, backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#a855f7'], borderWidth: 3, borderColor: '#fff' }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 8, font: { size: 11, weight: '600' } } } } }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN / HR */}
      {['Admin', 'HR'].includes(user?.role) && (
        <div className="row g-4">
          <div className="col-12 col-lg-6 col-xl-7">
            <div className="card border-0 p-4 mb-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
              <h5 className="fw-bold mb-1 gradient-text">👥 Workforce Allocation Profile</h5>
              <p className="text-muted small mb-3">Roster operational indexes.</p>
              <div className="row g-3">
                {[
                  { label: 'Total Staff', value: stats.total_employees || 0, icon: '👥', gradient: GRADIENTS.indigo },
                  { label: 'Active Today', value: stats.present_today || (stats.total_employees ? Math.round(stats.total_employees * 0.85) : 0), icon: '✅', gradient: GRADIENTS.emerald },
                  { label: 'On Leave', value: stats.pending_leaves || 0, icon: '🏝️', gradient: GRADIENTS.amber },
                  { label: 'New Starters', value: (stats.recent_employees || []).length, icon: '✨', gradient: GRADIENTS.sky }
                ].map((hrCard, idx) => (
                  <div key={idx} className="col-6 col-sm-3">
                    <div className="p-3 text-center h-100 hover-premium-card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.08)' }}>
                      <div className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '46px', height: '46px', fontSize: '1.3rem', background: hrCard.gradient, color: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}>
                        {hrCard.icon}
                      </div>
                      <h4 className="fw-bold mb-0" style={{ background: hrCard.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{hrCard.value}</h4>
                      <small className="d-block text-truncate mt-1 text-muted" style={{ fontSize: '0.75rem' }}>{hrCard.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {user?.role === 'Admin' && (
              <>
                <div className="card border-0 p-4 mb-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0 gradient-text">🛡️ Audited System Action Logs</h5>
                    <span className="badge rounded-pill px-3 py-2" style={{ background: GRADIENTS.sky, color: '#fff' }}>{recentActivities.length} Logged</span>
                  </div>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {recentActivities.length ? recentActivities.map((activity, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between p-3 hover-action-node" style={{ borderRadius: '12px', background: 'rgba(248,250,252,0.8)' }}>
                        <div className="d-flex align-items-center gap-3">
                          <span className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', borderRadius: '10px', background: activity.gradient, color: '#fff' }}>{activity.icon}</span>
                          <div>
                            <p className="mb-0 fw-bold text-dark text-capitalize" style={{ fontSize: '0.86rem' }}>{activity.message}</p>
                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>Event recorded cleanly</small>
                          </div>
                        </div>
                        <small className="px-2 py-1 rounded font-monospace fw-bold" style={{ fontSize: '0.72rem', background: '#fff', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>{activity.time}</small>
                      </div>
                    )) : <div className="text-center py-4 text-muted">No security actions audited.</div>}
                  </div>
                </div>

                <div className="card border-0 p-4 mb-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
                  <h5 className="fw-bold mb-3 gradient-text">⚠️ Inventory Replenishment Warnings</h5>
                  <div className="d-flex flex-column gap-2">
                    {(topMaterials.length ? topMaterials : [{ id: 0, material_name: 'All hardware inventory components operating healthily', quantity: 0 }]).map((item) => (
                      <div key={item.id} className="d-flex justify-content-between align-items-center p-3 hover-action-node" style={{ borderRadius: '12px', background: 'rgba(248,250,252,0.8)' }}>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ color: item.id === 0 ? '#10b981' : '#f43f5e', fontSize: '1.1rem' }}>{item.id === 0 ? '✅' : '⚠️'}</span>
                          <span className="fw-bold text-dark" style={{ fontSize: '0.86rem' }}>{item.material_name}</span>
                        </div>
                        {item.id !== 0 && <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: GRADIENTS.rose, color: '#fff', fontSize: '0.72rem' }}>{item.quantity} left</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {user?.role === 'HR' && (
              <div className="card border-0 p-4 mb-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
                <h5 className="fw-bold mb-1 gradient-text">🏢 Employee Department Breakdown</h5>
                <p className="text-muted small mb-3">Roster breakdown extracted from remote schemas.</p>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr className="text-uppercase small" style={{ color: '#64748b' }}>
                        <th className="border-0 py-3 ps-3">Department</th>
                        <th className="border-0 py-3 text-end pe-3">Strength</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.employee_department_counts || []).map((item, i) => (
                        <tr key={i} className="hover-row-lux">
                          <td className="fw-bold text-dark py-3 ps-3" style={{ fontSize: '0.88rem' }}>{item.department || 'General Operations'}</td>
                          <td className="text-end fw-bold py-3 pe-3" style={{ fontSize: '0.88rem', background: GRADIENTS.indigo, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{item.count || 0} members</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {user?.role === 'Admin' && (
            <div className="col-12 col-lg-6 col-xl-5">
              <div className="d-flex flex-column gap-4">
                <div className="card border-0 p-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="fw-bold mb-0 gradient-text">💹 Revenue Overview</h5>
                    <span className="small fw-bold px-2 py-1 rounded-pill" style={{ background: GRADIENTS.emerald, color: '#fff' }}>▲ Live</span>
                  </div>
                  <p className="text-muted small mb-3">Gross periodic system billings.</p>
                  <div style={{ height: '180px', position: 'relative' }}>
                    <Line
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          data: [
                            salesSummary.total_revenue ? salesSummary.total_revenue * 0.4 : 5000,
                            salesSummary.total_revenue ? salesSummary.total_revenue * 0.6 : 8500,
                            salesSummary.total_revenue ? salesSummary.total_revenue * 0.5 : 7000,
                            salesSummary.total_revenue ? salesSummary.total_revenue * 0.8 : 12000,
                            salesSummary.total_revenue ? salesSummary.total_revenue * 0.9 : 14500,
                            salesSummary.total_revenue || 18000
                          ],
                          backgroundColor: (ctx) => {
                            const c = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
                            c.addColorStop(0, 'rgba(16,185,129,0.35)');
                            c.addColorStop(1, 'rgba(16,185,129,0.02)');
                            return c;
                          },
                          borderColor: '#10b981', borderWidth: 3,
                          pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4,
                          fill: true, tension: 0.4
                        }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(16,185,129,0.08)' } }, x: { grid: { display: false } } } }}
                    />
                  </div>
                </div>

                <div className="card border-0 p-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
                  <h5 className="fw-bold mb-1 gradient-text">📊 Stock Level Thresholds</h5>
                  <p className="text-muted small mb-3">Items in <span style={{ background: GRADIENTS.rose, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>Red</span> require restock.</p>
                  <div style={{ height: '180px', position: 'relative' }}>
                    <Bar data={{
                      labels: chartLabels.length ? chartLabels : ['No Materials'],
                      datasets: [{ data: chartQuantities.length ? chartQuantities : [0], backgroundColor: stockChartColors.length ? stockChartColors : ['#94a3b8'], borderRadius: 8, barThickness: 18 }]
                    }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(99,102,241,0.08)' } }, x: { grid: { display: false } } } }} />
                  </div>
                </div>

                <div className="card border-0 p-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
                  <h5 className="fw-bold mb-0 gradient-text">🎨 Material Distributions</h5>
                  <p className="text-muted small mb-3">Supply chain context indices.</p>
                  <div style={{ height: '180px' }} className="d-flex justify-content-center">
                    <Pie data={{
                      labels: ['In Stock', 'In Transit', 'Issued', 'Returned'],
                      datasets: [{ data: materialChartDataValues, backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#a855f7'], borderWidth: 3, borderColor: '#fff' }]
                    }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { weight: '600' } } } } }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTENDANCE HISTORY */}
      {user?.role === 'Employee' && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 p-4 glass-card hover-premium-card" style={{ borderRadius: '22px' }}>
              <h5 className="fw-bold mb-3 gradient-text">🗓️ Your Complete Shift History</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-uppercase small" style={{ color: '#64748b' }}>
                      <th className="border-0 py-3 ps-3">Date</th>
                      <th className="border-0 py-3">Check-In</th>
                      <th className="border-0 py-3">Check-Out</th>
                      <th className="border-0 py-3 pe-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.length ? attendanceHistory.map((record) => {
                      const s = calculateAttendanceStatus(record.check_in, record.check_out);
                      return (
                        <tr key={record.id} className="hover-row-lux">
                          <td className="fw-bold text-dark py-3 ps-3" style={{ fontSize: '0.88rem' }}>{new Date(record.attendance_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                          <td className="font-monospace fw-bold py-3" style={{ fontSize: '0.84rem', background: GRADIENTS.emerald, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatExactTime(record.check_in)}</td>
                          <td className="font-monospace fw-bold py-3" style={{ fontSize: '0.84rem', background: GRADIENTS.rose, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatExactTime(record.check_out)}</td>
                          <td className="py-3 pe-3">
                            <span className="badge px-3 py-2 rounded-pill fw-bold" style={{ background: s.bg, color: s.color, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>{s.label}</span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="4" className="text-center text-muted py-5">No historic logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
