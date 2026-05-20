import { useEffect, useMemo, useState } from 'react';
import { fetchEmployees, punchAttendance } from '../services/employeeService';
import { getCurrentUser } from '../utils/authHelpers';

const HRMSPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const user = getCurrentUser();

  const canManageAttendance = user?.role && ['Admin', 'HR', 'Manager'].includes(user.role);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchEmployees();
        setEmployees(response);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const attendanceCounts = useMemo(() => ({
    present: employees.filter((item) => item.attendance_status === 'Present').length,
    absent: employees.filter((item) => item.attendance_status === 'Absent').length,
    leave: employees.filter((item) => item.attendance_status === 'Leave').length,
  }), [employees]);

  const totalSalary = useMemo(() => employees.reduce((sum, e) => sum + (e.salary || 0), 0), [employees]);
  const averageSalary = employees.length ? Math.round(totalSalary / employees.length) : 0;
  const totalLeaveBalance = useMemo(() => employees.reduce((sum, e) => sum + (e.leave_balance || 0), 0), [employees]);
  const departments = useMemo(() => Array.from(new Set(employees.map((item) => item.department || 'Unassigned'))), [employees]);

  const handlePunch = async (employeeId) => {
    setLoadingAttendance(true);
    try {
      await punchAttendance(employeeId, { status: 'Present' });
      const response = await fetchEmployees();
      setEmployees(response);
    } catch (error) {
      console.error('Attendance punch failed', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="page-title">HRMS</h3>
          <p className="text-muted">Employee management, attendance, leave tracking and payroll overview.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Attendance Summary</h5>
            <p className="text-muted">Monitor workforce presence and absence trends.</p>
            <div className="d-flex flex-column gap-2">
              <span>Present: {attendanceCounts.present}</span>
              <span>Absent: {attendanceCounts.absent}</span>
              <span>On Leave: {attendanceCounts.leave}</span>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Payroll Overview</h5>
            <p className="text-muted">Real-time salary and payroll health metrics.</p>
            <div className="d-flex flex-column gap-2">
              <span>Total Payroll: ${totalSalary.toLocaleString()}</span>
              <span>Average Salary: ${averageSalary.toLocaleString()}</span>
              <span>Leave Balance Total: {totalLeaveBalance}</span>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Employee Coverage</h5>
            <p className="text-muted">Department distribution and team size details.</p>
            <ul className="list-group list-group-flush">
              {departments.map((department) => (
                <li key={department} className="list-group-item d-flex justify-content-between align-items-center">
                  {department}
                  <span>{employees.filter((item) => (item.department || 'Unassigned') === department).length}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card card-custom p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5>Employee Roster</h5>
            <p className="text-muted mb-0">Quick view of attendance, salary, designation, and leave status.</p>
          </div>
          {canManageAttendance && (
            <div>
              <button className="btn btn-sm btn-outline-primary" disabled>
                Admin/HR/Manager attendance punch mode
              </button>
            </div>
          )}
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Attendance</th>
                <th>Leave Balance</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name || `Employee ${employee.id}`}</td>
                  <td>{employee.department || 'Unassigned'}</td>
                  <td>{employee.designation || 'N/A'}</td>
                  <td>${(employee.salary || 0).toLocaleString()}</td>
                  <td>{employee.attendance_status || 'Unknown'}</td>
                  <td>{employee.leave_balance || 0}</td>
                  <td>{employee.join_date ? new Date(employee.join_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {canManageAttendance ? (
                      <button
                        className="btn btn-sm btn-success"
                        disabled={loadingAttendance || employee.attendance_status === 'Present'}
                        onClick={() => handlePunch(employee.id)}
                      >
                        {employee.attendance_status === 'Present' ? 'Punched' : 'Punch Present'}
                      </button>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
              {!employees.length && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No employee records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRMSPage;
