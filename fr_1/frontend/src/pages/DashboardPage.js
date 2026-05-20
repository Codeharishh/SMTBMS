import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchReportSummary } from '../services/reportService';
import { fetchPayrollSummary } from '../services/payrollService';
import { fetchSalesSummary } from '../services/salesService';
import { fetchEmployeeProfile } from '../services/employeeService';
import { fetchTodayAttendance, fetchAttendanceHistory, punchIn, punchOut } from '../services/attendanceService';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const DashboardPage = () => {
  const user = getCurrentUser();
  const [stats, setStats] = useState({});
  const [topMaterials, setTopMaterials] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});
  const [payrollSummary, setPayrollSummary] = useState({});
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');

  const loadSummary = async () => {
    try {
      const summary = await fetchReportSummary();
      setStats(summary);
      setTopMaterials(summary.topMaterials || []);
    } catch (error) {
      console.error('Summary load failed', error);
    }
  };

  const loadPayroll = async () => {
    try {
      const response = await fetchPayrollSummary();
      setPayrollSummary(response);
    } catch (error) {
      console.error('Payroll summary failed', error);
    }
  };

  const loadSales = async () => {
    try {
      const response = await fetchSalesSummary();
      setSalesSummary(response);
    } catch (error) {
      console.error('Sales summary failed', error);
    }
  };

  const loadEmployeeProfile = async () => {
    if (user?.role === 'Employee') {
      try {
        const profile = await fetchEmployeeProfile();
        setEmployeeProfile(profile);
      } catch (error) {
        console.error('Employee profile load failed', error);
      }
    }
  };

  const loadAttendance = async () => {
    if (user?.role !== 'Employee') {
      return;
    }

    setAttendanceLoading(true);
    setAttendanceError('');
    try {
      const todayData = await fetchTodayAttendance();
      const historyData = await fetchAttendanceHistory();
      setTodayAttendance(todayData.attendance || null);
      setAttendanceHistory(historyData || []);
    } catch (error) {
      console.error('Attendance load failed', error);
      setAttendanceError(error.response?.data?.message || 'Unable to load attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadEmployeeProfile();
    loadAttendance();

    if (['Admin', 'HR', 'Manager'].includes(user?.role)) {
      loadPayroll();
    }
    if (['Admin', 'Manager', 'Sales'].includes(user?.role)) {
      loadSales();
    }
  }, [user?.role]);

  const handlePunchIn = async () => {
    setAttendanceActionLoading(true);
    setAttendanceError('');
    try {
      await punchIn();
      await loadAttendance();
    } catch (error) {
      console.error('Punch in failed', error);
      setAttendanceError(error.response?.data?.message || 'Unable to punch in');
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setAttendanceActionLoading(true);
    setAttendanceError('');
    try {
      await punchOut();
      await loadAttendance();
    } catch (error) {
      console.error('Punch out failed', error);
      setAttendanceError(error.response?.data?.message || 'Unable to punch out');
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  const chartLabels = useMemo(() => topMaterials.map((item) => item.material_name || `Item ${item.id}`), [topMaterials]);
  const chartQuantities = useMemo(() => topMaterials.map((item) => item.quantity || 0), [topMaterials]);

  const roleCards = useMemo(() => {
    if (user?.role === 'HR') {
      return [
        { title: 'Employee Count', value: stats.total_employees || 0, variant: 'success' },
        { title: 'Payroll Total', value: payrollSummary.total_payroll ? `$${payrollSummary.total_payroll.toLocaleString()}` : '$0', variant: 'warning' },
        { title: 'Average Salary', value: payrollSummary.avg_salary ? `$${payrollSummary.avg_salary.toLocaleString()}` : '$0', variant: 'info' },
        { title: 'Leave Balance', value: stats.total_customers || 0, variant: 'secondary', note: 'Use HRMS for leave reports' },
      ];
    }

    if (user?.role === 'Manager') {
      return [
        { title: 'Inventory Items', value: stats.total_materials || 0, variant: 'primary' },
        { title: 'Team Size', value: stats.total_employees || 0, variant: 'success' },
        { title: 'Revenue', value: salesSummary.total_revenue ? `$${salesSummary.total_revenue.toLocaleString()}` : '$0', variant: 'warning' },
        { title: 'Customer Pipeline', value: stats.total_customers || 0, variant: 'info' },
      ];
    }

    if (user?.role === 'Sales') {
      return [
        { title: 'Revenue', value: salesSummary.total_revenue ? `$${salesSummary.total_revenue.toLocaleString()}` : '$0', variant: 'warning' },
        { title: 'Orders', value: salesSummary.total_orders || 0, variant: 'primary' },
        { title: 'Customers', value: stats.total_customers || 0, variant: 'success' },
        { title: 'Lead Activities', value: salesSummary.topCustomers?.length || 0, variant: 'info' },
      ];
    }

    if (user?.role === 'Employee') {
      return [
        { title: 'Assigned Materials', value: stats.total_materials || 0, variant: 'primary' },
        { title: 'Notifications', value: stats.total_users || 0, variant: 'info', note: 'Check your notifications tab' },
        {
          title: 'Attendance',
          value: employeeProfile?.attendance_status || 'Pending',
          variant: 'warning',
        },
        {
          title: 'Leave Balance',
          value: employeeProfile?.leave_balance != null ? employeeProfile.leave_balance : 'N/A',
          variant: 'success',
        },
      ];
    }

    return [
      { title: 'Materials', value: stats.total_materials || 0, variant: 'primary' },
      { title: 'Employees', value: stats.total_employees || 0, variant: 'success' },
      { title: 'Customers', value: stats.total_customers || 0, variant: 'warning' },
      { title: 'User Accounts', value: stats.total_users || 0, variant: 'info' },
    ];
  }, [stats, salesSummary, payrollSummary, user?.role]);

  return (
    <div>
      <div className="d-flex flex-wrap gap-3 mb-4">
        {roleCards.map((card) => (
          <div key={card.title} className={`card card-custom flex-fill border-${card.variant}`} style={{ minWidth: '220px' }}>
            <div className="card-body">
              <small className="text-uppercase text-muted">{card.title}</small>
              <h3 className="mt-2">{card.value}</h3>
              {card.note && <small className="text-muted d-block mt-2">{card.note}</small>}
            </div>
          </div>
        ))}
      </div>

      {user?.role === 'Employee' && (
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card card-custom p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Today's Attendance</h5>
                {attendanceLoading && <span className="text-muted">Loading...</span>}
              </div>
              {attendanceError && <div className="alert alert-danger">{attendanceError}</div>}
              <p className="text-muted">Track your daily attendance from the employee dashboard.</p>
              <div className="mb-3">
                <strong>Status:</strong>{' '}
                <span>{todayAttendance?.status || 'Not punched in'}</span>
              </div>
              <div className="mb-3">
                <div><strong>Check In:</strong> {todayAttendance?.check_in ? new Date(todayAttendance.check_in).toLocaleTimeString() : '--'}</div>
                <div><strong>Check Out:</strong> {todayAttendance?.check_out ? new Date(todayAttendance.check_out).toLocaleTimeString() : '--'}</div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handlePunchIn}
                  disabled={attendanceActionLoading || !!todayAttendance?.check_in}
                >
                  Punch In
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={handlePunchOut}
                  disabled={attendanceActionLoading || !todayAttendance?.check_in || !!todayAttendance?.check_out}
                >
                  Punch Out
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card card-custom p-4">
              <h5 className="card-title">Attendance History</h5>
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.length ? (
                      attendanceHistory.map((record) => (
                        <tr key={record.id}>
                          <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                          <td>{record.check_in ? new Date(record.check_in).toLocaleTimeString() : '--'}</td>
                          <td>{record.check_out ? new Date(record.check_out).toLocaleTimeString() : '--'}</td>
                          <td>{record.status || 'Present'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No attendance records yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card card-custom p-4">
            <h5 className="card-title">Inventory Trend</h5>
            <Line
              datasetIdKey="inventoryLine"
              data={{
                labels: chartLabels.length ? chartLabels : ['Item A', 'Item B', 'Item C'],
                datasets: [{ label: 'Quantity', data: chartQuantities.length ? chartQuantities : [20, 35, 15], backgroundColor: 'rgba(47,109,245,0.18)', borderColor: '#2f6df5', tension: 0.3 }],
              }}
            />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card card-custom p-4">
            <h5 className="card-title">Role Focus</h5>
            <p className="text-muted mb-3">
              {user?.role === 'HR' && 'HR metrics for attendance, payroll and employee management.'}
              {user?.role === 'Manager' && 'Manager dashboard highlights material, team and sales oversight.'}
              {user?.role === 'Sales' && 'Sales pipeline, customers and revenue performance in real-time.'}
              {user?.role === 'Employee' && 'Personal attendance, payroll and notifications available from your dashboard.'}
              {!user?.role && 'Use the side navigation to explore your role-specific area.'}
            </p>
            <Bar
              data={{
                labels: ['Procurement', 'Sales', 'HR', 'Support', 'Delivery'],
                datasets: [{ label: 'Weekly KPI', data: [68, 82, 74, 61, 71], backgroundColor: '#2f6df5' }],
              }}
            />
          </div>
        </div>
      </div>

      <div className="row gy-4 mt-4">
        <div className="col-lg-8">
          <div className="card card-custom p-4">
            <h5 className="card-title">Low Stock Alerts</h5>
            <ul className="list-group list-group-flush">
              {(topMaterials.length
                ? topMaterials
                : [{ id: 0, material_name: 'No low stock items available', quantity: 0 }]
              ).map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{item.material_name}</span>
                  <span className="badge bg-warning text-dark">{item.quantity} left</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5 className="card-title">Quick Navigation</h5>
            <p className="text-muted">Open modules that are most relevant to your role.</p>
            <div className="d-flex flex-column gap-2">
              {user?.role === 'HR' && <button className="btn btn-outline-primary">Open HRMS</button>}
              {user?.role === 'Manager' && <button className="btn btn-outline-primary">Open ERP</button>}
              {user?.role === 'Sales' && <button className="btn btn-outline-primary">Open CRM</button>}
              {user?.role === 'Employee' && <button className="btn btn-outline-primary">Open Notifications</button>}
              {user?.role === 'Admin' && <button className="btn btn-outline-primary">Review Reports</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
