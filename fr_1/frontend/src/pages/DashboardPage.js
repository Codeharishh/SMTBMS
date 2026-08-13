// src/pages/DashboardPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Bar as BarChart, Line as LineChart, Pie as PieChart, Doughnut as DoughnutChart } from 'react-chartjs-2';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchReportSummary } from '../services/reportService';
import { fetchPayrollSummary } from '../services/payrollService';
import { fetchSalesSummary } from '../services/salesService';
import { fetchEmployeeProfile, fetchMyTasks, updateMyTaskStatus } from '../services/employeeService';
import { fetchTodayAttendance, fetchAttendanceHistory, punchIn, punchOut } from '../services/attendanceService';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, ArcElement, Filler);

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

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX FOR METRIC/KPI CARDS ─────────────────
// Same visual language as MaterialsPage.js THIN_ICONS, extended with the
// glyphs needed across the different role dashboards.
const THIN_ICONS = {
  box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline vectorEffect="non-scaling-stroke" points="3.27 6.96 12 12.01 20.73 6.96" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="22.08" x2="12" y2="12" />
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
  userPlus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="8.5" cy="7" r="4" />
      <line vectorEffect="non-scaling-stroke" x1="20" y1="8" x2="20" y2="14" />
      <line vectorEffect="non-scaling-stroke" x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="4" y="9" width="7" height="12" />
      <rect vectorEffect="non-scaling-stroke" x="13" y="3" width="7" height="18" />
      <line vectorEffect="non-scaling-stroke" x1="7" y1="13" x2="7" y2="13.01" />
      <line vectorEffect="non-scaling-stroke" x1="7" y1="17" x2="7" y2="17.01" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="7" x2="16" y2="7.01" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="11" x2="16" y2="11.01" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="15" x2="16" y2="15.01" />
    </svg>
  ),
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="9" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="5" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="1.4" />
    </svg>
  ),
  rupee: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4.5 4.5 0 0 0 0-9" />
    </svg>
  ),
  rupeeSmall: (
    <span style={{ fontWeight: '800', fontSize: '1rem', lineHeight: 1 }}>₹</span>
  ),
  cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="21" r="1" />
      <circle vectorEffect="non-scaling-stroke" cx="20" cy="21" r="1" />
      <path vectorEffect="non-scaling-stroke" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
    </svg>
  ),
  clipboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect vectorEffect="non-scaling-stroke" x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path vectorEffect="non-scaling-stroke" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="5" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="1" x2="12" y2="3" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="21" x2="12" y2="23" />
      <line vectorEffect="non-scaling-stroke" x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line vectorEffect="non-scaling-stroke" x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line vectorEffect="non-scaling-stroke" x1="1" y1="12" x2="3" y2="12" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="12" x2="23" y2="12" />
      <line vectorEffect="non-scaling-stroke" x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line vectorEffect="non-scaling-stroke" x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  tool: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  zap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  sparkles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
    </svg>
  ),
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path vectorEffect="non-scaling-stroke" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
};

// ── QUICK ACTIONS SHORTCUT MAP ──
// Update these `path` values to match your actual react-router route
// definitions for each destination page if they differ.
const QUICK_ACTIONS = [
  { label: 'Add New Employee', desc: 'Onboard to the workforce roster', icon: THIN_ICONS.userPlus, color: COLORS.indigo, path: '/admin/users' },
  { label: 'Add New Material', desc: 'Log new inventory stock', icon: THIN_ICONS.box, color: COLORS.emerald, path: '/materials' },
  { label: 'Add New Lead', desc: 'Register a CRM prospect', icon: THIN_ICONS.target, color: COLORS.rose, path: '/crm/leads' },
  { label: 'Add New Customer', desc: 'Register a CRM Customer', icon: THIN_ICONS.briefcase, color: COLORS.violet, path: '/customers' },
];

const DashboardPage = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const userRole = useMemo(() => (user?.role || 'GUEST').toUpperCase(), [user]);

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
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);

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
    if (!pIn) return { label: 'Not punched in', color: 'var(--muted)', bg: '#f1f5f9' };
    const pOut = getRawTimeValues(checkOutStr);
    if (!pOut) {
      try {
        const rawInDate = checkInStr.includes('T') ? checkInStr.split('T')[0] : checkInStr.split(' ')[0];
        const todayDate = new Date().toISOString().split('T')[0];
        if (rawInDate === todayDate) {
          return (pIn.hours > 9 || (pIn.hours === 9 && pIn.minutes > 0))
            ? { label: 'Punched In Late', color: '#92400e', bg: '#fef3c7' }
            : { label: 'Active Shift', color: '#065f46', bg: '#d1fae5' };
        }
      } catch (err) { }
      return { label: 'Punch Out Missed', color: '#991b1b', bg: '#fee2e2' };
    }
    if (pIn.hours > 9 || (pIn.hours === 9 && pIn.minutes > 0))
      return { label: 'Punched In Late', color: '#92400e', bg: '#fef3c7' };
    if (pOut.hours < 18)
      return { label: 'Punched Early', color: '#0369a1', bg: '#e0f2fe' };
    return { label: 'Present', color: '#065f46', bg: '#d1fae5' };
  };

  const loadSummary = async () => {
    try {
      const summary = await fetchReportSummary();
      setStats(summary || {});
      setTopMaterials(summary?.topMaterials || []);
      loadRecentActivities(summary || {});
    } catch (e) { console.error('Error in loadSummary:', e); }
  };

  const loadPayroll = async () => { try { const p = await fetchPayrollSummary(); setPayrollSummary(p || {}); } catch (e) { console.error(e); } };
  const loadSales = async () => { try { const s = await fetchSalesSummary(); setSalesSummary(s || {}); } catch (e) { console.error(e); } };

  const loadEmployeeProfile = async () => {
    if (['EMPLOYEE', 'MANAGER', 'SALES'].includes(userRole)) {
      try { const prof = await fetchEmployeeProfile(); setEmployeeProfile(prof); } catch (e) { console.error(e); }
    }
  };

  // ── Attendance now also loads for HR, in addition to EMPLOYEE/MANAGER/SALES ──
  const loadAttendance = async () => {
    if (!['EMPLOYEE', 'MANAGER', 'SALES', 'HR'].includes(userRole)) return;
    setAttendanceLoading(true); setAttendanceError('');
    try {
      const today = await fetchTodayAttendance();
      const hist = await fetchAttendanceHistory();
      setTodayAttendance(today?.attendance || null);
      setAttendanceHistory(hist || []);
    } catch (e) { console.error(e); }
    finally { setAttendanceLoading(false); }
  };

  const loadMyTasks = async () => {
    if (!['EMPLOYEE', 'MANAGER', 'SALES'].includes(userRole)) return;
    setTasksLoading(true); setTasksError('');
    try {
      const data = await fetchMyTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) { setTasksError('Unable to load tasks.'); setTasks([]); }
    finally { setTasksLoading(false); }
  };

  const loadRecentActivities = (s) => {
    const a = [];
    (s?.recent_employees || []).forEach(emp => a.push({
      icon: THIN_ICONS.users, message: `Employee joined: ${emp.name}`,
      time: emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'Today',
      color: COLORS.indigo
    }));
    (s?.recent_materials || []).forEach(mat => a.push({
      icon: THIN_ICONS.box, message: `Material added: ${mat.material_name}`,
      time: mat.created_at ? new Date(mat.created_at).toLocaleDateString() : 'Today',
      color: COLORS.amber
    }));
    setRecentActivities(a);
  };

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

  useEffect(() => {
    if (!userRole || userRole === 'GUEST') return;

    loadSummary();
    loadEmployeeProfile();
    loadAttendance();
    loadMyTasks();

    if (['ADMIN', 'HR', 'MANAGER'].includes(userRole)) loadPayroll();
    if (['ADMIN', 'MANAGER', 'SALES'].includes(userRole)) loadSales();
  }, [userRole]);

  const chartLabels = useMemo(() => (topMaterials || []).map(i => i.material_name || `Item ${i.id}`), [topMaterials]);
  const chartQuantities = useMemo(() => (topMaterials || []).map(i => i.quantity || 0), [topMaterials]);
  const stockChartColors = useMemo(() => chartQuantities.map(q => q <= 10 ? COLORS.alert : COLORS.emerald), [chartQuantities]);

  const materialChartDataValues = useMemo(() => [
    stats?.total_materials || 140, stats?.in_transit_materials || 45,
    stats?.issued_materials || 85, stats?.returned_materials || 12
  ], [stats]);
  const materialTotalSum = useMemo(() => materialChartDataValues.reduce((a, b) => a + b, 0), [materialChartDataValues]);

  const salesPipelineValues = useMemo(() => [
    salesSummary?.leads_count || 45, salesSummary?.qualified_count || 28,
    salesSummary?.proposal_count || 18, salesSummary?.negotiation_count || 12,
    salesSummary?.won_count || 24
  ], [salesSummary]);
  const salesPipelineTotal = useMemo(() => salesPipelineValues.reduce((a, b) => a + b, 0), [salesPipelineValues]);

  const hrActiveToday = useMemo(
    () => stats?.present_today || (stats?.total_employees ? Math.round(stats.total_employees * 0.85) : 0),
    [stats]
  );
  const hrNewJoiners = useMemo(() => (stats?.recent_employees || []).length, [stats]);
  const hrOnLeave = useMemo(() => stats?.pending_leaves || 0, [stats]);

  const hrEmployeeOverviewValues = useMemo(() => ([
    stats?.total_employees || 0,
    hrActiveToday,
    hrNewJoiners,
    hrOnLeave
  ]), [stats, hrActiveToday, hrNewJoiners, hrOnLeave]);

  const hrLeaveSummaryValues = useMemo(() => ([
    stats?.approved_leaves ?? Math.max((stats?.total_employees || 0) - hrOnLeave - (stats?.rejected_leaves || 0), 0),
    stats?.pending_leaves || 0,
    stats?.rejected_leaves ?? 0
  ]), [stats, hrOnLeave]);
  const hrLeaveSummaryTotal = useMemo(() => hrLeaveSummaryValues.reduce((a, b) => a + b, 0), [hrLeaveSummaryValues]);

  const hrDepartmentBreakdown = useMemo(() => (
    (stats?.employee_department_counts || []).map((item) => {
      const total = item.count || 0;
      const present = item.present ?? Math.round(total * 0.85);
      const onLeave = item.on_leave ?? Math.max(total - present, 0);
      return { department: item.department || 'General Operations', total, present, onLeave };
    })
  ), [stats]);

  const hrRecentActivities = useMemo(
    () => (recentActivities && recentActivities.length > 0) ? recentActivities : [],
    [recentActivities]
  );

  const currentTodayStatusObj = useMemo(
    () => calculateAttendanceStatus(todayAttendance?.check_in, todayAttendance?.check_out),
    [todayAttendance?.check_in, todayAttendance?.check_out]
  );

  const adminAttendanceRate = useMemo(() => {
    const total = stats?.total_employees || 0;
    const present = stats?.present_today || (total ? Math.round(total * 0.85) : 0);
    return total ? Math.round((present / total) * 100) : 0;
  }, [stats]);

  const hrAttendanceRate = useMemo(() => {
    const total = stats?.total_employees || 0;
    return total ? Math.round((hrActiveToday / total) * 100) : 0;
  }, [stats, hrActiveToday]);

  const managerTeamUtilization = useMemo(() => {
    const total = stats?.total_employees || 0;
    const present = stats?.present_today || (total ? Math.round(total * 0.85) : 0);
    return total ? Math.round((present / total) * 100) : 0;
  }, [stats]);

  const salesWinRate = useMemo(() => {
    const totalLeads = salesPipelineValues[0] || 0;
    const won = salesPipelineValues[4] || 0;
    return totalLeads ? Math.round((won / totalLeads) * 100) : 0;
  }, [salesPipelineValues]);

  const employeeTaskCompletionRate = useMemo(() => {
    const total = (tasks || []).length;
    const completed = (tasks || []).filter(t => t.status === 'Completed').length;
    return total ? Math.round((completed / total) * 100) : 0;
  }, [tasks]);

  const gaugeConfig = useMemo(() => {
    switch (userRole) {
      case 'ADMIN': return { title: 'Workforce Attendance', subtitle: 'Present vs total staff, today', value: adminAttendanceRate, color: COLORS.primary };
      case 'HR': return { title: 'Attendance Rate', subtitle: 'Active employees today', value: hrAttendanceRate, color: COLORS.primary };
      case 'MANAGER': return { title: 'Team Utilization', subtitle: 'Team presence today', value: managerTeamUtilization, color: COLORS.primary };
      case 'SALES': return { title: 'Lead Win Rate', subtitle: 'Won vs total leads', value: salesWinRate, color: COLORS.primary };
      case 'EMPLOYEE': return { title: 'Task Completion', subtitle: 'Completed vs assigned tasks', value: employeeTaskCompletionRate, color: COLORS.primary };
      default: return null;
    }
  }, [userRole, adminAttendanceRate, hrAttendanceRate, managerTeamUtilization, salesWinRate, employeeTaskCompletionRate]);

  const roleCards = useMemo(() => {
    if (userRole === 'HR') return [
      { title: 'Employee Count', value: stats?.total_employees || 0, color: COLORS.indigo, note: 'Total workforce size', icon: THIN_ICONS.users },
      { title: 'Payroll Total', value: payrollSummary?.total_payroll ? `₹${payrollSummary.total_payroll.toLocaleString()}` : '₹0', color: COLORS.emerald, note: 'Monthly disbursement', icon: THIN_ICONS.rupee },
      { title: 'Present Today', value: hrActiveToday, color: COLORS.sky, note: 'Active staff on site', icon: THIN_ICONS.checkCircle },
      { title: 'On Leave', value: hrOnLeave, color: COLORS.amber, note: 'Employees currently off', icon: THIN_ICONS.sun },
    ];
    if (userRole === 'MANAGER') return [
      { title: 'Inventory Items', value: stats?.total_materials || 0, color: COLORS.indigo, note: 'Current stock', icon: THIN_ICONS.box },
      { title: 'Active Vendors', value: stats?.total_vendors || 0, color: COLORS.amber, note: 'Global partners', icon: THIN_ICONS.building },
      { title: 'Total Revenue', value: salesSummary?.total_revenue ? `₹${salesSummary.total_revenue.toLocaleString()}` : '₹0', color: COLORS.sky, note: 'Overall income', icon: THIN_ICONS.rupee },
      { title: 'Pending Approvals', value: 1, color: COLORS.rose, note: 'Awaiting action', icon: THIN_ICONS.clipboard },
    ];
    if (userRole === 'SALES') return [
      { title: 'Revenue', value: salesSummary?.total_revenue ? `₹${salesSummary.total_revenue.toLocaleString()}` : '₹0', color: COLORS.emerald, icon: THIN_ICONS.rupee },
      { title: 'Orders', value: salesSummary?.total_orders || 0, color: COLORS.indigo, icon: THIN_ICONS.cart },
      { title: 'Customers', value: stats?.total_customers || 0, color: COLORS.amber, icon: THIN_ICONS.users },
      { title: 'Lead Activities', value: salesSummary?.topCustomers ? salesSummary.topCustomers.length : 0, color: COLORS.sky, icon: THIN_ICONS.zap },
    ];
    if (userRole === 'EMPLOYEE') return [
      { title: 'Days Present', value: stats?.present_days != null ? stats.present_days : 18, sub: '3 absences', color: COLORS.indigo, icon: THIN_ICONS.clock },
      { title: 'Leave Balance', value: employeeProfile?.leave_balance != null ? employeeProfile.leave_balance : 14, sub: 'out of 38 total', color: COLORS.sky, icon: THIN_ICONS.sun },
      { title: 'Net Salary', value: '₹30.0K', sub: (payrollSummary?.data && payrollSummary.data.length > 0 && payrollSummary.data[0].payroll_month) ? `For ${payrollSummary.data[0].payroll_month}` : 'Disbursed on 31 May', color: COLORS.emerald, icon: THIN_ICONS.rupee },
      { title: 'Performance', value: employeeProfile?.performance_score ? `${employeeProfile.performance_score}%` : '87%', sub: '↑ 4% vs last quarter', color: COLORS.violet, icon: THIN_ICONS.trendingUp },
    ];
    return [];
  }, [stats, salesSummary, payrollSummary, userRole, currentTodayStatusObj, employeeProfile]);

  // ── FIX 1: KPI card — smaller icon, wrapping labels instead of truncation ──
  const KPI = ({ title, value, sub, icon, color }) => (
    <div className="card border-0 h-100 kpi-card-lux" style={{ borderRadius: '22px', background: '#ffffff' }}>
      <div className="p-3 d-flex align-items-start gap-2">
        <div className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: `${color}1A`, color: color, fontSize: '1.1rem',
            border: `2px solid ${color}33`
          }}>
          {icon}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h3 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</h3>
          <span className="d-block fw-semibold" style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.25, whiteSpace: 'normal', wordBreak: 'break-word' }}>{title}</span>
        </div>
      </div>
      {sub && (
        <div className="px-3 pb-3">
          <small className="fw-medium" style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block', whiteSpace: 'normal' }}>{sub}</small>
        </div>
      )}
    </div>
  );

  const GaugeCard = ({ title, subtitle, value, color }) => {
    const pct = Math.max(0, Math.min(100, value || 0));
    return (
      <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
          <span style={{ color }}>{userRole === 'SALES' ? THIN_ICONS.target : userRole === 'EMPLOYEE' ? THIN_ICONS.checkCircle : THIN_ICONS.users}</span> {title}
        </h5>
        <p className="text-muted small mb-3">{subtitle}</p>
        <div className="position-relative d-flex justify-content-center" style={{ height: '160px' }}>
          <div style={{ width: '100%', maxWidth: '260px' }}>
            <DoughnutChart
              data={{
                datasets: [{
                  data: [pct, 100 - pct],
                  backgroundColor: [color, '#eef1f6'],
                  borderWidth: 0,
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                rotation: -90, circumference: 180, cutout: '75%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
              }}
              height={160}
            />
          </div>
          <div className="position-absolute d-flex flex-column align-items-center" style={{ bottom: '20px', left: 0, right: 0 }}>
            <span className="fw-bold" style={{ fontSize: '1.9rem', color: 'var(--text)', letterSpacing: '-1px' }}>{pct}%</span>
          </div>
          <div className="position-absolute d-flex justify-content-between px-3" style={{ bottom: '2px', left: 0, right: 0, fontSize: '0.66rem', color: '#9ca3af', fontWeight: 700 }}>
            <span>0%</span><span>100%</span>
          </div>
        </div>
      </div>
    );
  };

  // ── QUICK ACTIONS CARD — admin-only shortcut panel that sits beside the gauge ──
  const QuickActionsCard = () => (
    <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
      <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
        <span style={{ color: COLORS.amber }}>{THIN_ICONS.zap}</span> Quick Actions
      </h5>
      <p className="text-muted small mb-3">Jump straight into common admin workflows.</p>
      <div className="d-flex flex-column gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            className="d-flex align-items-center gap-3 p-2 rounded-3 border-0 text-start hover-action-node"
            style={{ background: 'var(--surface-alt)', width: '100%', cursor: 'pointer' }}
            onClick={() => navigate(action.path)}
          >
            <span className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: `${action.color}1A`, color: action.color, fontSize: '1.1rem',
              border: `2px solid ${action.color}33`
            }}>
              {action.icon}
            </span>
            <span className="flex-grow-1" style={{ minWidth: 0 }}>
              <span className="d-block fw-bold" style={{ fontSize: '0.86rem', color: 'var(--text)' }}>{action.label}</span>
              <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>{action.desc}</span>
            </span>
            <span style={{ color: action.color, fontSize: '1rem', flexShrink: 0 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── ATTENDANCE SHIFT INTERACTION WORKBENCH ──
  const AttendanceCard = () => (
    <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
            <span style={{ color: COLORS.indigo }}>{THIN_ICONS.clock}</span> Live Punch Workstation
          </h5>
          <p className="text-muted small mb-0">Standard shift: 9:00 AM - 6:00 PM</p>
        </div>
        {attendanceLoading && <div className="spinner-border spinner-border-sm" role="status" style={{ color: COLORS.primary }}></div>}
      </div>

      {attendanceError && <div className="alert alert-danger p-2.5 small mb-3 border-0 fw-medium" style={{ borderRadius: '10px' }}>{attendanceError}</div>}

      <div className="p-3 mb-4 d-flex justify-content-around text-center align-items-center border rounded-3" style={{ background: 'var(--surface-alt)' }}>
        <div>
          <small className="d-block text-uppercase fw-bold mb-2 text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>Status</small>
          <span className="badge px-3 py-1.5 rounded-pill border fw-bold" style={{ backgroundColor: '#ffffff', color: 'var(--text)' }}>{currentTodayStatusObj.label}</span>
        </div>
        <div style={{ width: '1px', height: '35px', background: 'var(--card-border)' }}></div>
        <div>
          <small className="d-block text-uppercase fw-bold mb-2 text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>Punched In</small>
          <strong className="d-block font-monospace fs-5 fw-bold text-success">{todayAttendance?.check_in ? formatExactTime(todayAttendance.check_in) : '--:--'}</strong>
        </div>
        <div style={{ width: '1px', height: '35px', background: 'var(--card-border)' }}></div>
        <div>
          <small className="d-block text-uppercase fw-bold mb-2 text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>Punched Out</small>
          <strong className="d-block font-monospace fs-5 fw-bold text-danger">{todayAttendance?.check_out ? formatExactTime(todayAttendance.check_out) : '--:--'}</strong>
        </div>
      </div>

      <div className="d-flex gap-3 mt-auto">
        <button className="btn btn-success rounded-3 py-2 flex-grow-1 fw-bold" onClick={handlePunchIn} disabled={attendanceActionLoading || !!getRawTimeValues(todayAttendance?.check_in)}>Core Clock-In</button>
        <button className="btn btn-danger rounded-3 py-2 flex-grow-1 fw-bold" onClick={handlePunchOut} disabled={attendanceActionLoading || !getRawTimeValues(todayAttendance?.check_in) || !!getRawTimeValues(todayAttendance?.check_out)}>Shift Sign-Out</button>
      </div>
    </div>
  );

  return (
    <div className="theme-dashboard container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: 'var(--text)'
    }}>

      <style>{`
        .hover-premium-card { transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s ease !important; box-shadow: 0 8px 24px rgba(31,41,55,0.06) !important; }
        .hover-premium-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(31,41,55,0.09) !important; }
        .kpi-card-lux { transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s ease !important; box-shadow: 0 8px 22px rgba(31,41,55,0.05) !important; }
        .kpi-card-lux:hover { transform: translateY(-3px); box-shadow: 0 14px 26px rgba(31,41,55,0.09) !important; }
        .hover-row-lux { transition: background-color .15s ease !important; }
        .hover-row-lux:hover { background-color: var(--surface-alt) !important; }
        .hover-input-lux { transition: all .2s ease !important; background: var(--surface) !important; color: var(--text) !important; border: 1px solid var(--card-border) !important; }
        .hover-input-lux:focus { box-shadow: 0 0 0 4px rgba(255, 122, 69, 0.12) !important; outline: none; border-color: ${COLORS.primary} !important; }
        .hover-action-node { transition: all .2s ease !important; border: 1px solid transparent !important; }
        .hover-action-node:hover { transform: translateX(3px); background: var(--surface) !important; border-color: var(--card-border) !important; }
        .section-eyebrow { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; }
      `}</style>

      {/* ── GREETING BANNER ─────────────────────────────────────────────── */}
      {(() => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
        const greetIcon = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';
        const accentGrad = `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`;
        const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return (
          <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(31,41,55,0.06)' }}>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div style={{
                width: '54px', height: '54px', borderRadius: '18px',
                background: accentGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.7rem', flexShrink: 0,
                boxShadow: '0 8px 20px rgba(255,122,69,0.28)'
              }}>
                {greetIcon}
              </div>
              <div>
                <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.6px', lineHeight: 1.2 }}>
                  {greeting}, {user?.name || 'there'}!
                </h3>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <small className="fw-medium" style={{ color: '#94a3b8' }}>📅 {todayStr}</small>
                  <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }} />
                  <small style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', padding: '3px 12px', borderRadius: '20px', color: '#fff', background: accentGrad }}>
                    {user?.role || 'Guest'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {userRole !== 'GUEST' && <div className="section-eyebrow">Overview</div>}

      {/* KPI METRICS GRID */}
      {userRole === 'ADMIN' ? (
        <div className="row g-3 mb-4">
          {[
            { label: 'Materials', value: stats?.total_materials || 0, sub: `${stats?.low_stock_count || 0} low stock items`, icon: THIN_ICONS.box, color: COLORS.indigo },
            { label: 'Employees', value: stats?.total_employees || 0, sub: `${stats?.pending_leaves || 0} pending logs`, icon: THIN_ICONS.users, color: COLORS.emerald },
            { label: 'Vendors', value: stats?.total_vendors || 0, sub: `Active partnerships`, icon: THIN_ICONS.building, color: COLORS.amber },
            { label: 'Customers', value: stats?.total_customers || 0, sub: `${stats?.total_leads || 0} leads index`, icon: THIN_ICONS.target, color: COLORS.sky },
            { label: 'Total Revenue', value: stats?.total_revenue ? `₹${stats.total_revenue.toLocaleString()}` : `₹${(salesSummary?.total_revenue || 0).toLocaleString()}`, sub: 'Gross Revenue Output', icon: THIN_ICONS.rupee, color: COLORS.rose }
          ].map((card, i) => (
            <div key={i} className="col-12 col-sm-6 col-md-4 col-xl-2 flex-grow-1">
              <KPI title={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {roleCards.map((card) => (
            <div key={card.title} className="col-12 col-sm-6 col-lg-3">
              <KPI title={card.title} value={card.value} sub={card.sub || card.note} icon={card.icon} color={card.color} />
            </div>
          ))}
        </div>
      )}

      {/* ── FIX 2: GAUGE — flex container capped at max-width, no more empty row space ──
          Admins get a Quick Actions shortcut card riding alongside the gauge.
          HR, Manager and Sales get the Live Punch Workstation riding alongside their gauge instead,
          so the punch card lines up with Team Utilization / Attendance Rate / Lead Win Rate. */}
      {gaugeConfig && (
        <div className="d-flex flex-wrap gap-4 mb-4 align-items-stretch">
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <GaugeCard title={gaugeConfig.title} subtitle={gaugeConfig.subtitle} value={gaugeConfig.value} color={gaugeConfig.color} />
          </div>
          {userRole === 'ADMIN' && (
            <div style={{ flex: '1 1 320px', minWidth: '300px' }}>
              <QuickActionsCard />
            </div>
          )}
          {['HR', 'MANAGER', 'SALES', 'EMPLOYEE'].includes(userRole) && (
            <div style={{ flex: '1 1 320px', minWidth: '300px' }}>
              <AttendanceCard />
            </div>
          )}
        </div>
      )}

      {/* CORE OPERATIONAL TASK LAYOUT NODES — tasks workspace (punch card now lives in the gauge row above) */}
      {['EMPLOYEE', 'MANAGER', 'SALES'].includes(userRole) && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                    <span style={{ color: COLORS.indigo }}>{THIN_ICONS.target}</span> Operational Tasks Workspace
                  </h5>
                  <p className="text-muted small mb-0">Tasks allocated to your current credential tier.</p>
                </div>
                <span className="badge rounded-pill px-3 py-2 fw-bold border-0 text-white" style={{ fontSize: '0.75rem', background: COLORS.primary }}>
                  {(tasks || []).filter(t => t.status !== 'Completed').length} Pending
                </span>
              </div>

              <div className="d-flex flex-column gap-2">
                {tasks && tasks.filter(t => t.status !== 'Completed').length > 0 ? tasks.filter(t => t.status !== 'Completed').map((task) => (
                  <div key={task.id} className="p-3 d-flex align-items-center justify-content-between gap-3 hover-action-node border rounded-3" style={{ background: 'var(--surface-alt)' }}>
                    <div className="d-flex align-items-center gap-3">
                      <button 
                        onClick={async () => {
                          try { await updateMyTaskStatus(task.id, 'Completed'); loadMyTasks(); } catch(e) { console.error(e); }
                        }}
                        className="btn btn-sm d-flex align-items-center justify-content-center border rounded-3 hover-btn-lux" 
                        style={{ width: '38px', height: '38px', background: 'var(--surface)', fontSize: '1.2rem', color: COLORS.emerald, padding: 0 }} 
                        title="Mark as Completed"
                      >
                        {THIN_ICONS.checkCircle || '✓'}
                      </button>
                      <div>
                        <p className="mb-0 fw-bold" style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{task.title}</p>
                        <div className="d-flex flex-wrap align-items-center gap-2 small text-muted mt-1">
                          <span className={`badge rounded px-2 py-0.5 fw-bold ${task.priority === 'High' ? 'bg-danger-subtle text-danger' : 'bg-light text-dark border'}`} style={{ fontSize: '0.68rem' }}>{task.priority} Priority</span>
                          <span style={{ fontSize: '0.75rem' }}>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`badge px-2.5 py-1.5 rounded-pill small fw-bold border ${task.status === 'Completed' ? 'bg-success-subtle text-success border-success-subtle' : 'bg-light text-dark border-secondary-subtle'}`}>{task.status}</span>
                  </div>
                )) : (
                  <div className="text-center py-4 text-muted small">No active tasks assigned inside workspace bounds.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SALES MANAGER / SALES REP DASHBOARD (MATCHES USER SCREENSHOT EXACTLY) ── */}
      {userRole === 'SALES' && (
        <>
          {/* TOP SECTION: 3 COLUMNS (REVENUE & ORDERS + PIPELINE, QUICK ACTIONS, RECENT ACTIVITIES) */}
          <div className="row g-4 mb-4">
            {/* COLUMN 1: REVENUE & ORDERS COMBINED WITH LEAD PIPELINE DONUT */}
            <div className="col-12 col-xl-6">
              <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Revenue & Orders</h5>
                    <small className="text-muted">Jan – Jun 2026 · Monthly trend</small>
                  </div>
                  <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.78rem' }}>
                    <span className="d-flex align-items-center gap-1.5 fw-bold" style={{ color: COLORS.amber }}>
                      <span style={{ width: 10, height: 3, background: COLORS.amber, borderRadius: 2, display: 'inline-block' }}></span> Revenue
                    </span>
                    <span className="d-flex align-items-center gap-1.5 fw-bold" style={{ color: COLORS.violet }}>
                      <span style={{ width: 10, height: 3, background: COLORS.violet, borderRadius: 2, display: 'inline-block' }}></span> Orders
                    </span>
                  </div>
                </div>

                <div className="row align-items-center mt-3 g-3">
                  {/* DONUT CHART WITH CENTER TOTAL */}
                  <div className="col-12 col-sm-5 d-flex flex-column align-items-center justify-content-center">
                    <span className="fw-bold mb-2 text-muted" style={{ fontSize: '0.75rem' }}>Lead Pipeline</span>
                    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                      <DoughnutChart
                        data={{
                          labels: ['New', 'Contacted', 'Qualified', 'Closed Won'],
                          datasets: [{
                            data: [98, 78, 52, 28],
                            backgroundColor: [COLORS.indigo, COLORS.sky, COLORS.violet, COLORS.emerald],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                          }]
                        }}
                        options={{
                          responsive: true, maintainAspectRatio: false, cutout: '74%',
                          plugins: { legend: { display: false }, tooltip: { enabled: true } }
                        }}
                      />
                      <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ pointerEvents: 'none' }}>
                        <h4 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.4rem', lineHeight: 1 }}>256</h4>
                        <small className="text-muted fw-semibold" style={{ fontSize: '0.68rem' }}>Leads</small>
                      </div>
                    </div>

                    {/* LEGEND BADGES BELOW DONUT */}
                    <div className="w-100 mt-3 d-flex flex-column gap-1" style={{ fontSize: '0.74rem' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="d-flex align-items-center gap-1.5 text-muted">
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.indigo, display: 'inline-block' }}></span> New
                        </span>
                        <span className="fw-bold" style={{ color: '#1e293b' }}>98</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="d-flex align-items-center gap-1.5 text-muted">
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.sky, display: 'inline-block' }}></span> Contacted
                        </span>
                        <span className="fw-bold" style={{ color: '#1e293b' }}>78</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="d-flex align-items-center gap-1.5 text-muted">
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.violet, display: 'inline-block' }}></span> Qualified
                        </span>
                        <span className="fw-bold" style={{ color: '#1e293b' }}>52</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="d-flex align-items-center gap-1.5 text-muted">
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.emerald, display: 'inline-block' }}></span> Closed Won
                        </span>
                        <span className="fw-bold" style={{ color: '#1e293b' }}>28</span>
                      </div>
                    </div>
                  </div>

                  {/* BAR CHART FOR MONTHLY TREND */}
                  <div className="col-12 col-sm-7" style={{ height: '220px' }}>
                    <BarChart
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [
                          {
                            label: 'Revenue',
                            data: [42000, 58000, 50000, 68000, 62000, 95000],
                            backgroundColor: COLORS.amber,
                            borderRadius: 4,
                            barThickness: 10
                          },
                          {
                            label: 'Orders',
                            data: [20000, 25000, 22000, 31000, 28000, 45000],
                            backgroundColor: COLORS.violet,
                            borderRadius: 4,
                            barThickness: 10
                          }
                        ]
                      }}
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.04)' }, ticks: { font: { size: 10 } } },
                          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: QUICK ACTIONS (EXACT DESIGN + CUSTOMER HUB & PIPELINE ROUTES) */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  <span style={{ color: COLORS.amber }}>{THIN_ICONS.zap}</span> Quick Actions
                </h5>
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Add New Lead', icon: THIN_ICONS.userPlus, color: COLORS.amber, path: '/crm/leads' },
                    { label: 'View Pipeline', icon: THIN_ICONS.trendingUp, color: COLORS.violet, path: '/crm/pipeline' },
                    { label: 'Customer Data', icon: THIN_ICONS.users, color: COLORS.sky, path: '/customers' },
                    { label: 'Reports', icon: THIN_ICONS.clipboard, color: COLORS.emerald, path: '/reports' }
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className="d-flex align-items-center justify-content-between p-3 rounded-4 border-0 text-start w-100 hover-action-node"
                      style={{ background: '#FAF8FF', cursor: 'pointer' }}
                      onClick={() => navigate(action.path)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
                          width: '42px', height: '42px', borderRadius: '14px',
                          background: `${action.color}18`, color: action.color, fontSize: '1.1rem',
                          border: `1.5px solid ${action.color}35`
                        }}>
                          {action.icon}
                        </div>
                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem', color: '#1e293b' }}>{action.label}</h6>
                      </div>
                      <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '28px', height: '28px', background: '#F1F5F9', color: '#64748b', fontSize: '0.85rem' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 3: RECENT ACTIVITIES LIST (LIVE SYSTEM LOGS WITH POPUP MODAL) */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                    <span style={{ color: COLORS.indigo }}>{THIN_ICONS.clock}</span> Recent Activities
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm rounded-pill px-3 py-1 fw-bold border-0"
                    style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '0.75rem' }}
                    onClick={() => setShowActivitiesModal(true)}
                  >
                    View All
                  </button>
                </div>
                <div className="d-flex flex-column gap-3">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((act, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
                          width: '38px', height: '38px', borderRadius: '12px',
                          background: `${act.color || COLORS.sky}18`, color: act.color || COLORS.sky
                        }}>
                          {typeof act.icon === 'string' ? act.icon : (act.icon || THIN_ICONS.clipboard)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.82rem', color: '#1e293b' }}>{act.message || act.title || act.text}</p>
                          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{act.time}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted small">
                      No recent activities recorded inside workspace bounds.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: TOP CUSTOMERS RANKING TABLE */}
          <div className="card border-0 p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Top Customers</h5>
                <small className="text-muted">Ranked by revenue · This quarter</small>
              </div>
              <button className="btn btn-sm btn-outline-warning rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.75rem', borderColor: COLORS.amber, color: COLORS.amber }} onClick={() => navigate('/crm')}>
                ↗ View All
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {[
                { rank: 1, name: 'ABC Corporation', sub: '24 deals closed', rev: '₹2,45,000', status: 'Growing', color: COLORS.amber },
                { rank: 2, name: 'BuildWell Infrastructure', sub: '18 deals closed', rev: '₹1,85,000', status: 'Active', color: COLORS.sky },
                { rank: 3, name: 'Apex Construction Pvt Ltd', sub: '14 deals closed', rev: '₹1,20,000', status: 'Stable', color: COLORS.violet }
              ].map((cust) => (
                <div key={cust.rank} className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ background: '#FAF8FF', border: '1px solid #F1F5F9' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center fw-bold text-white rounded-3" style={{ width: '36px', height: '36px', background: cust.color, fontSize: '0.95rem' }}>
                      {cust.rank}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{cust.name}</h6>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{cust.sub}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <h5 className="fw-bold mb-0" style={{ color: COLORS.emerald, fontSize: '1.05rem' }}>{cust.rev}</h5>
                    <small className="fw-bold" style={{ color: COLORS.emerald, fontSize: '0.7rem' }}>▲ {cust.status}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {userRole === 'MANAGER' && (
        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-8">
            <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span className="text-primary">{THIN_ICONS.trendingUp}</span> Revenue Horizon Tracking
                </h5>
                <span className="badge small border-0 px-2 py-0.5 rounded-pill fw-bold text-white" style={{ background: COLORS.emerald }}>▲ Live</span>
              </div>
              <p className="text-muted small mb-4">Gross financial tracking ledger graphs.</p>
              <div className="w-100" style={{ height: '230px', position: 'relative' }}>
                <LineChart
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'Revenue (₹)',
                      data: [
                        salesSummary?.total_revenue ? salesSummary.total_revenue * 0.4 : 5000,
                        salesSummary?.total_revenue ? salesSummary.total_revenue * 0.6 : 8500,
                        salesSummary?.total_revenue ? salesSummary.total_revenue * 0.5 : 7000,
                        salesSummary?.total_revenue ? salesSummary.total_revenue * 0.8 : 12000,
                        salesSummary?.total_revenue ? salesSummary.total_revenue * 0.9 : 14500,
                        salesSummary?.total_revenue || 18000
                      ],
                      borderColor: COLORS.primary, borderWidth: 3, backgroundColor: 'rgba(255,122,69,0.12)',
                      pointBackgroundColor: COLORS.primary, pointRadius: 3, fill: true, tension: 0.42
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.04)' } }, x: { grid: { display: false } } } }}
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                <span style={{ color: COLORS.amber }}>{THIN_ICONS.zap}</span> Quick Actions
              </h5>
              <div className="d-flex flex-column gap-3">
                {[
                  { label: 'Add New Material', icon: THIN_ICONS.box, color: COLORS.emerald, path: '/materials' },
                  { label: 'Add New Lead', icon: THIN_ICONS.target, color: COLORS.violet, path: '/crm/leads' },
                  { label: 'Assign Task', icon: THIN_ICONS.clipboard, color: COLORS.amber, path: '/manager/tasks' },
                  { label: 'Reports', icon: THIN_ICONS.trendingUp, color: COLORS.sky, path: '/reports' }
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="d-flex align-items-center justify-content-between p-3 rounded-4 border-0 text-start w-100 hover-action-node"
                    style={{ background: '#FAF8FF', cursor: 'pointer' }}
                    onClick={() => navigate(action.path)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
                        width: '42px', height: '42px', borderRadius: '14px',
                        background: `${action.color}18`, color: action.color, fontSize: '1.1rem',
                        border: `1.5px solid ${action.color}35`
                      }}>
                        {action.icon}
                      </div>
                      <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem', color: '#1e293b' }}>{action.label}</h6>
                    </div>
                    <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '28px', height: '28px', background: '#F1F5F9', color: '#64748b', fontSize: '0.85rem' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span style={{ color: COLORS.violet }}>{THIN_ICONS.trendingUp}</span> Funnel Snapshot
                </h5>
                <span className="badge bg-light text-dark border rounded-3 small">{salesPipelineTotal}</span>
              </div>
              <p className="text-muted small mb-3">Active sales channel funnel snapshot.</p>
              <div className="w-100 d-flex justify-content-center align-items-center" style={{ height: '220px', position: 'relative' }}>
                <PieChart
                  data={{
                    labels: ['Leads', 'Qualified', 'Proposal', 'Negotiation', 'Won'],
                    datasets: [{ data: salesPipelineValues, backgroundColor: [COLORS.indigo, COLORS.violet, COLORS.amber, COLORS.rose, COLORS.emerald], borderWidth: 2, borderColor: '#ffffff' }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 6, font: { size: 10, weight: '600' } } } } }}
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span style={{ color: COLORS.emerald }}>{THIN_ICONS.box}</span> Inventory Volume
                </h5>
                <span className="badge bg-light text-dark border rounded-3 small">{materialTotalSum}</span>
              </div>
              <p className="text-muted small mb-3">Warehouse allocation summary.</p>
              <div className="w-100 d-flex justify-content-center align-items-center" style={{ height: '220px', position: 'relative' }}>
                <PieChart
                  data={{
                    labels: ['In Stock', 'In Transit', 'Issued', 'Returned'],
                    datasets: [{ data: materialChartDataValues, backgroundColor: [COLORS.emerald, COLORS.sky, COLORS.amber, COLORS.violet], borderWidth: 2, borderColor: '#ffffff' }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 6, font: { size: 10, weight: '600' } } } } }}
                />
              </div>
            </div>
          </div>

          {/* MANAGER RECENT ACTIVITIES CARD WITH VIEW ALL MODAL */}
          <div className="col-12 col-md-12 col-xl-4">
            <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                    <span style={{ color: COLORS.indigo }}>{THIN_ICONS.clock}</span> Recent Activities
                  </h5>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>Live manager audit logs</small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm rounded-pill px-3 py-1 fw-bold border-0"
                  style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '0.75rem' }}
                  onClick={() => setShowActivitiesModal(true)}
                >
                  View All
                </button>
              </div>
              <div className="d-flex flex-column gap-3">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.slice(0, 5).map((act, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
                        width: '40px', height: '40px', borderRadius: '14px',
                        background: `${act.color || COLORS.indigo}15`, color: act.color || COLORS.indigo, fontSize: '1rem',
                        border: `1px solid ${act.color || COLORS.indigo}30`
                      }}>
                        {typeof act.icon === 'string' ? act.icon : (act.icon || THIN_ICONS.clipboard)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.83rem', color: '#1e293b', lineHeight: 1.25 }}>{act.message || act.title || act.text}</p>
                        <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>{act.time}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small">
                    No recent activities recorded inside workspace bounds.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECENT ACTIVITIES FULL POPUP MODAL (POPUP CARD STYLE) */}
      {showActivitiesModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowActivitiesModal(false);
          }}
        >
          <div
            className="card border-0 shadow-lg p-4 animate__animated animate__fadeInUp"
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '34px', height: '34px', background: '#EFF6FF', color: '#2563EB' }}>
                  {THIN_ICONS.clock}
                </span>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.2rem' }}>
                  All Recent Activities
                </h5>
              </div>
              <button
                type="button"
                className="btn-close rounded-circle p-2"
                style={{ backgroundColor: '#F1F5F9' }}
                onClick={() => setShowActivitiesModal(false)}
                aria-label="Close"
              ></button>
            </div>

            <div className="d-flex flex-column gap-3 py-2">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 p-3 rounded-4" style={{ background: '#FAF8FF', border: '1px solid #F1F5F9' }}>
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
                      width: '42px', height: '42px', borderRadius: '14px',
                      background: `${act.color || COLORS.indigo}18`, color: act.color || COLORS.indigo, fontSize: '1.1rem',
                      border: `1.5px solid ${act.color || COLORS.indigo}35`
                    }}>
                      {typeof act.icon === 'string' ? act.icon : (act.icon || THIN_ICONS.clipboard)}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="mb-0 fw-bold" style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.3 }}>{act.message || act.title || act.text}</p>
                      <small className="text-muted d-block" style={{ fontSize: '0.74rem' }}>{act.time}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">No historical activities found.</div>
              )}
            </div>

            <div className="mt-3 text-end">
              <button
                type="button"
                className="btn px-4 py-2 rounded-3 fw-bold border-0"
                style={{ background: '#F1F5F9', color: '#475569' }}
                onClick={() => setShowActivitiesModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE SECURE ADMIN AUDITING WORKSPACES */}
      {['ADMIN', 'HR'].includes(userRole) && (
        <div className="row g-4">
          <div className="col-12 col-lg-6 col-xl-7">
            {userRole === 'ADMIN' && (
              <div className="card border-0 p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span style={{ color: COLORS.indigo }}>{THIN_ICONS.users}</span> Workforce Allocation Profile
                </h5>
                <p className="text-muted small mb-3">Roster operational indexes.</p>
                <div className="row g-3">
                  {[
                    { label: 'Total Staff', value: stats?.total_employees || 0, icon: THIN_ICONS.users, color: COLORS.indigo },
                    { label: 'Active Today', value: stats?.present_today || (stats?.total_employees ? Math.round(stats.total_employees * 0.85) : 0), icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
                    { label: 'On Leave', value: stats?.pending_leaves || 0, icon: THIN_ICONS.sun, color: COLORS.amber },
                    { label: 'New Starters', value: (stats?.recent_employees || []).length, icon: THIN_ICONS.sparkles, color: COLORS.sky }
                  ].map((hrCard, idx) => (
                    <div key={idx} className="col-6 col-sm-3">
                      <div className="p-3 text-center h-100 border-0 rounded-3" style={{ background: 'var(--surface-alt)' }}>
                        <div className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', fontSize: '1.2rem', background: `${hrCard.color}1A`, color: hrCard.color, border: `2px solid ${hrCard.color}33` }}>{hrCard.icon}</div>
                        <h4 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>{hrCard.value}</h4>
                        <small className="d-block text-truncate mt-1 text-muted" style={{ fontSize: '0.72rem' }}>{hrCard.label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userRole === 'HR' && (
              <div className="card border-0 p-3 mb-3 hover-premium-card" style={{ borderRadius: '18px', backgroundColor: '#ffffff' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '0.95rem' }}>Quick Actions</h6>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>Jump to any module instantly</small>
                  </div>
                </div>
                <div className="row g-2 mt-1">
                  {[
                    { label: 'Employee Directory', icon: THIN_ICONS.users, color: COLORS.indigo, path: '/hrms/directory' },
                    { label: 'Run Payroll', icon: THIN_ICONS.rupee, color: COLORS.emerald, path: '/payroll' },
                    { label: 'Calendar', icon: THIN_ICONS.sun, color: COLORS.amber, path: '/hrms/holidays' },
                    { label: 'Doc Centre', icon: THIN_ICONS.clipboard, color: COLORS.sky, path: '/hrms/documents' }
                  ].map((act, i) => (
                    <div key={i} className="col-6 col-sm-3">
                      <button
                        type="button"
                        className="btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center justify-content-center gap-1.5 hover-premium-card border-0"
                        style={{ background: `${act.color}0D`, border: `1px solid ${act.color}20`, cursor: 'pointer', transition: 'transform 0.18s ease' }}
                        onClick={() => navigate(act.path)}
                      >
                        <div className="d-flex align-items-center justify-content-center rounded-2 text-white" style={{ background: act.color, width: '34px', height: '34px', fontSize: '0.95rem' }}>
                          {act.icon}
                        </div>
                        <span className="fw-bold text-center text-truncate w-100" style={{ fontSize: '0.75rem', color: '#1e293b', lineHeight: 1.1 }}>
                          {act.label}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userRole === 'ADMIN' && (
              <>
                <div className="card border-0 p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span style={{ color: COLORS.emerald }}>{THIN_ICONS.checkCircle}</span> Audited System Action Logs
                    </h5>
                    <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 small">{recentActivities ? recentActivities.length : 0} Logged</span>
                  </div>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {recentActivities && recentActivities.length ? recentActivities.map((activity, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between p-3 border rounded-3" style={{ background: 'var(--surface-alt)' }}>
                        <div className="d-flex align-items-center gap-3">
                          <span className="d-flex align-items-center justify-content-center border rounded-3" style={{ width: '36px', height: '36px', background: 'var(--surface)' }}>{activity.icon}</span>
                          <div>
                            <p className="mb-0 fw-bold text-capitalize" style={{ fontSize: '0.86rem', color: 'var(--text)' }}>{activity.message}</p>
                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>Event logged clean</small>
                          </div>
                        </div>
                        <small className="px-2 py-1 rounded border font-monospace fw-bold" style={{ fontSize: '0.72rem', background: 'var(--surface)', color: COLORS.primary }}>{activity.time}</small>
                      </div>
                    )) : <div className="text-center py-4 text-muted small">No security actions audited.</div>}
                  </div>
                </div>

                <div className="card border-0 p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <h5 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                    <span style={{ color: COLORS.alert }}>{THIN_ICONS.alertTriangle}</span> Inventory Replenishment Warnings
                  </h5>
                  <div className="d-flex flex-column gap-2">
                    {(topMaterials && topMaterials.length ? topMaterials : [{ id: 0, material_name: 'All hardware inventory components operating healthily', quantity: 0 }]).map((item) => (
                      <div key={item.id} className="d-flex justify-content-between align-items-center p-3 border rounded-3" style={{ background: 'var(--surface-alt)' }}>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ color: item.id === 0 ? COLORS.emerald : COLORS.alert, fontSize: '1.05rem' }}>{item.id === 0 ? '✅' : '⚠️'}</span>
                          <span className="fw-bold" style={{ fontSize: '0.86rem', color: 'var(--text)' }}>{item.material_name}</span>
                        </div>
                        {item.id !== 0 && <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1.5 rounded-pill small fw-bold">{item.quantity} left</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {userRole === 'HR' && (
              <div className="card border-0 p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                    <span style={{ color: COLORS.indigo }}>{THIN_ICONS.building}</span> Employee Department Breakdown
                  </h5>
                  <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 small">{hrDepartmentBreakdown ? hrDepartmentBreakdown.length : 0} Departments</span>
                </div>
                <p className="text-muted small mb-3">Roster breakdown with present / leave split, per department.</p>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr className="text-uppercase small">
                        <th className="py-2 ps-2">Department</th>
                        <th className="py-2 text-end">Total</th>
                        <th className="py-2 text-end">Present</th>
                        <th className="py-2 text-end pe-2">Leave</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hrDepartmentBreakdown && hrDepartmentBreakdown.length ? hrDepartmentBreakdown.map((item, i) => (
                        <tr key={i} className="hover-row-lux">
                          <td className="fw-bold py-2.5 ps-2" style={{ fontSize: '0.88rem' }}>{item.department}</td>
                          <td className="text-end fw-bold py-2.5" style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{item.total}</td>
                          <td className="text-end fw-bold py-2.5" style={{ fontSize: '0.88rem', color: COLORS.emerald }}>{item.present}</td>
                          <td className="text-end fw-bold py-2.5 pe-2" style={{ fontSize: '0.88rem', color: COLORS.amber }}>{item.onLeave}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="text-center text-muted py-4 small">No department roster data available.</td></tr>
                      )}
                    </tbody>
                    {hrDepartmentBreakdown && hrDepartmentBreakdown.length > 0 && (
                      <tfoot>
                        <tr style={{ borderTop: '2px solid var(--card-border)' }}>
                          <td className="fw-bold py-2.5 ps-2" style={{ fontSize: '0.86rem' }}>Total</td>
                          <td className="text-end fw-bold py-2.5" style={{ fontSize: '0.86rem', color: 'var(--text)' }}>{hrDepartmentBreakdown.reduce((a, b) => a + b.total, 0)}</td>
                          <td className="text-end fw-bold py-2.5" style={{ fontSize: '0.86rem', color: COLORS.emerald }}>{hrDepartmentBreakdown.reduce((a, b) => a + b.present, 0)}</td>
                          <td className="text-end fw-bold py-2.5 pe-2" style={{ fontSize: '0.86rem', color: COLORS.amber }}>{hrDepartmentBreakdown.reduce((a, b) => a + b.onLeave, 0)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}
          </div>

          {userRole === 'ADMIN' && (
            <div className="col-12 col-lg-6 col-xl-5">
              <div className="d-flex flex-column gap-4">
                <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span style={{ color: COLORS.emerald }}>{THIN_ICONS.trendingUp}</span> Revenue Overview
                    </h5>
                    <span className="badge small border-0 px-2 py-0.5 rounded-pill fw-bold text-white" style={{ background: COLORS.emerald }}>▲ Live</span>
                  </div>
                  <p className="text-muted small mb-4">Gross periodic system billings.</p>
                  <div style={{ height: '170px', position: 'relative' }}>
                    <LineChart
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          data: [
                            salesSummary?.total_revenue ? salesSummary.total_revenue * 0.4 : 5000,
                            salesSummary?.total_revenue ? salesSummary.total_revenue * 0.6 : 8500,
                            salesSummary?.total_revenue ? salesSummary.total_revenue * 0.5 : 7000,
                            salesSummary?.total_revenue ? salesSummary.total_revenue * 0.8 : 12000,
                            salesSummary?.total_revenue ? salesSummary.total_revenue * 0.9 : 14500,
                            salesSummary?.total_revenue || 18000
                          ],
                          borderColor: COLORS.emerald, borderWidth: 2.5, backgroundColor: 'rgba(46,217,195,0.12)',
                          pointBackgroundColor: COLORS.emerald, pointRadius: 3, fill: true, tension: 0.42
                        }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.04)' } }, x: { grid: { display: false } } } }}
                    />
                  </div>
                </div>

                <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                    <span style={{ color: COLORS.violet }}>{THIN_ICONS.box}</span> Stock Level Thresholds
                  </h5>
                  <p className="text-muted small mb-4">Items requiring instant replenishment attention flags.</p>
                  <div style={{ height: '170px', position: 'relative' }}>
                    <BarChart
                      data={{
                        labels: chartLabels.length ? chartLabels : ['No Materials'],
                        datasets: [{ data: chartQuantities.length ? chartQuantities : [0], backgroundColor: stockChartColors.length ? stockChartColors : ['#94a3b8'], borderRadius: 8, barThickness: 14 }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.04)' } }, x: { grid: { display: false } } } }}
                    />
                  </div>
                </div>

                <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                    <span style={{ color: COLORS.sky }}>{THIN_ICONS.box}</span> Material Distributions
                  </h5>
                  <p className="text-muted small mb-3">Supply chain warehouse context indices mappings.</p>
                  <div style={{ height: '170px' }} className="d-flex justify-content-center">
                    <PieChart data={{
                      labels: ['In Stock', 'In Transit', 'Issued', 'Returned'],
                      datasets: [{ data: materialChartDataValues, backgroundColor: [COLORS.emerald, COLORS.sky, COLORS.amber, COLORS.violet], borderWidth: 1.5, borderColor: '#ffffff' }]
                    }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 8, font: { weight: '600', size: 10 } } } } }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {userRole === 'HR' && (
            <div className="col-12 col-lg-6 col-xl-5">
              <div className="d-flex flex-column gap-4">

                <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span style={{ color: COLORS.indigo }}>{THIN_ICONS.users}</span> Employee Overview
                    </h5>
                    <span className="badge border small px-2 py-0.5 rounded-pill fw-bold" style={{ color: COLORS.primary, borderColor: `${COLORS.primary}55`, background: `${COLORS.primary}12` }}>{stats?.total_employees || 0} Total</span>
                  </div>
                  <p className="text-muted small mb-4">Active workforce vs. new joiners this period.</p>
                  <div style={{ height: '190px', position: 'relative' }}>
                    <BarChart
                      data={{
                        labels: ['Total Staff', 'Active Today', 'New Joiners', 'On Leave'],
                        datasets: [{
                          data: hrEmployeeOverviewValues,
                          backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.sky, COLORS.amber],
                          borderRadius: 8,
                          barThickness: 26
                        }]
                      }}
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.04)' } }, x: { grid: { display: false } } }
                      }}
                    />
                  </div>
                </div>

                <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span style={{ color: COLORS.amber }}>{THIN_ICONS.sun}</span> Leave Summary
                    </h5>
                    <span className="badge bg-light text-dark border rounded-3 small">{hrLeaveSummaryTotal}</span>
                  </div>
                  <p className="text-muted small mb-3">Approved, pending and rejected leave requests.</p>
                  <div className="w-100 d-flex justify-content-center align-items-center" style={{ height: '200px', position: 'relative' }}>
                    <PieChart
                      data={{
                        labels: ['Approved', 'Pending', 'Rejected'],
                        datasets: [{
                          data: hrLeaveSummaryValues,
                          backgroundColor: [COLORS.emerald, COLORS.amber, COLORS.alert],
                          borderWidth: 2, borderColor: '#ffffff'
                        }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 6, font: { size: 10, weight: '600' } } } } }}
                    />
                  </div>
                </div>

                <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span style={{ color: COLORS.indigo }}>{THIN_ICONS.clock}</span> Recent HR Activity
                    </h5>
                    <button
                      type="button"
                      className="btn btn-sm rounded-pill px-3 py-1 fw-bold border-0"
                      style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '0.75rem' }}
                      onClick={() => setShowActivitiesModal(true)}
                    >
                      View All
                    </button>
                  </div>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {hrRecentActivities && hrRecentActivities.length ? hrRecentActivities.map((activity, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between p-3 border rounded-3" style={{ background: 'var(--surface-alt)' }}>
                        <div className="d-flex align-items-center gap-3">
                          <span className="d-flex align-items-center justify-content-center border rounded-3" style={{ width: '36px', height: '36px', background: 'var(--surface)' }}>{activity.icon}</span>
                          <div>
                            <p className="mb-0 fw-bold" style={{ fontSize: '0.86rem', color: 'var(--text)' }}>{activity.message}</p>
                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>Workforce update logged</small>
                          </div>
                        </div>
                        <small className="px-2 py-1 rounded border font-monospace fw-bold" style={{ fontSize: '0.72rem', background: 'var(--surface)', color: COLORS.primary }}>{activity.time}</small>
                      </div>
                    )) : <div className="text-center py-4 text-muted small">No recent HR activity to display.</div>}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* SHIFT HISTORY */}
      {['EMPLOYEE', 'MANAGER', 'SALES', 'HR'].includes(userRole) && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text)' }}>
                <span style={{ color: COLORS.indigo }}>{THIN_ICONS.clock}</span> Your Complete Shift History
              </h5>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr className="text-uppercase small">
                      <th className="py-2 ps-2">Date</th>
                      <th className="py-2">Check-In</th>
                      <th className="py-2">Check-Out</th>
                      <th className="py-2 pe-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory && attendanceHistory.length ? attendanceHistory.map((record) => {
                      const s = calculateAttendanceStatus(record.check_in, record.check_out);
                      return (
                        <tr key={record.id} className="hover-row-lux">
                          <td className="fw-bold py-3 ps-2" style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{new Date(record.attendance_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                          <td className="font-monospace fw-bold py-3 text-success" style={{ fontSize: '0.84rem' }}>{formatExactTime(record.check_in)}</td>
                          <td className="font-monospace fw-bold py-3 text-danger" style={{ fontSize: '0.84rem' }}>{formatExactTime(record.check_out)}</td>
                          <td className="py-3 pe-2">
                            <span className="badge px-3 py-1.5 rounded-pill small fw-bold border" style={{ backgroundColor: s.bg, color: s.color, borderColor: 'transparent' }}>{s.label}</span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="4" className="text-center text-muted py-4 small">No historic logs found inside this profile account.</td></tr>
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