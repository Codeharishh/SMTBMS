// src/pages/LeaveManagementPage.js
import React, { useEffect, useState } from 'react';
import { applyLeave, fetchMyLeaves } from '../services/leaveService';

const LeaveManagementPage = () => {
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaves, setLeaves] = useState([]);

  // LOAD EMPLOYEE LEAVES
  const loadLeaves = async () => {
    try {
      const data = await fetchMyLeaves();
      setLeaves(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // APPLY LEAVE
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyLeave({
        leave_type: leaveType,
        start_date: fromDate,
        end_date: toDate,
        reason,
      });

      alert('Leave Applied Successfully');
      setLeaveType('');
      setReason('');
      setFromDate('');
      setToDate('');
      loadLeaves();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="theme-hrms container-fluid px-4 py-4" style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>

      <style>{`
        .hover-premium-card {
          transition: transform 0.22s ease-in-out, box-shadow 0.22s ease-in-out !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08) !important;
        }
        .hover-row-lux {
          transition: background-color 0.15s ease !important;
        }
        .hover-row-lux:hover {
          background-color: var(--surface-alt) !important;
        }
        .hover-input-lux {
          transition: all 0.18s ease-in-out !important;
        }
        .hover-input-lux:focus {
          border-color: var(--page-accent, #f97316) !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15) !important;
          outline: none;
        }
      `}</style>

      {/* Header Panel */}
      <div className="mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--card-border)' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">🏝️</span>
          <h3 className="fw-bold text-dark mb-0" style={{ color: 'var(--text)' }}>Leave Management</h3>
        </div>
        <p className="text-muted mb-0">Apply for time off and review history of logged leave schedules.</p>
      </div>

      <div className="row g-4">
        {/* APPLY FORM */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 premium-card-lux p-4" style={{ backgroundColor: 'var(--surface)' }}>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--text)' }}>Request Time Off</h5>
            <p className="text-muted small mb-4">Input parameters to request casual or medical leaves.</p>

            <form onSubmit={handleSubmit}>
              {/* Leave Type */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">Leave Type</label>
                <select
                  className="form-select rounded-3 hover-input-lux fw-medium"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                  style={{ height: '42px', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="">Select Leave Type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                </select>
              </div>

              {/* From Date */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">From Date</label>
                <input
                  type="date"
                  className="form-control rounded-3 hover-input-lux"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                />
              </div>

              {/* To Date */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">To Date</label>
                <input
                  type="date"
                  className="form-control rounded-3 hover-input-lux"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                />
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary mb-1">Reason / Notes</label>
                <textarea
                  className="form-control rounded-3 hover-input-lux"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context details here..."
                  required
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold shadow-sm"
              >
                ✉️ Apply Leave Request
              </button>
            </form>
          </div>
        </div>

        {/* LEAVE HISTORY */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 premium-card-lux p-4" style={{ backgroundColor: 'var(--surface)' }}>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--text)' }}>My Leave Requests</h5>
            <p className="text-muted small mb-4">Monitor verification state logs of your time-off applications.</p>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 mt-2 border rounded-3 overflow-hidden" style={{ borderColor: 'var(--card-border)' }}>
                <thead style={{ backgroundColor: 'var(--surface-alt)' }}>
                  <tr className="small text-secondary text-uppercase tracking-wider">
                    <th className="py-3 ps-3">Leave Type</th>
                    <th className="py-3">From Date</th>
                    <th className="py-3">To Date</th>
                    <th className="py-3">Reason</th>
                    <th className="py-3 pe-3 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves && leaves.length > 0 ? (
                    leaves.map((leave) => (
                      <tr key={leave.id} className="hover-row-lux">
                        <td className="fw-bold ps-3 py-3" style={{ color: 'var(--text)' }}>{leave.leave_type}</td>
                        <td className="text-secondary small">{leave.start_date}</td>
                        <td className="text-secondary small">{leave.end_date}</td>
                        <td className="text-muted small text-truncate" style={{ maxWidth: '180px' }} title={leave.reason}>{leave.reason}</td>
                        <td className="text-end pe-3">
                          <span
                            className={`badge rounded-pill px-3 py-1.5 ${leave.status === 'Approved'
                                ? 'bg-success-subtle text-success'
                                : leave.status === 'Rejected'
                                  ? 'bg-danger-subtle text-danger'
                                  : 'bg-warning-subtle text-warning-emphasis'
                              }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted small">
                        No active leave requests logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagementPage;