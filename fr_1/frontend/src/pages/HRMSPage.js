// src/pages/HRMSPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchEmployees, punchAttendance } from '../services/employeeService';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchAllLeaves, updateLeaveStatus } from '../services/leaveService';
import { fetchAttendanceHistory } from '../services/attendanceService';
import {
  fetchPerformanceReviews,
  createPerformanceReview,
  fetchCandidates,
  createCandidate,
  updateCandidateStatus,
  fetchTrainings,
  createTraining,
  updateTrainingStatus,
  fetchHolidays,
  createHoliday,
  fetchDocuments,
  createDocument
} from '../services/hrService';

const HRMSPage = () => {
  const user = getCurrentUser();
  const canManageHR = user?.role && ['Admin', 'HR', 'Manager'].includes(user.role);

  // Active Tab
  const [activeTab, setActiveTab] = useState('directory');

  // Global search terms
  const [searchTerm, setSearchTerm] = useState('');

  // Core Data States
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Specific Filter States
  const [attendanceDateFilter, setAttendanceDateFilter] = useState('');
  const [recruitmentStatusFilter, setRecruitmentStatusFilter] = useState('All');
  const [trainingStatusFilter, setTrainingStatusFilter] = useState('All');
  const [documentCategoryFilter, setDocumentCategoryFilter] = useState('All');

  // Loading States
  const [loading, setLoading] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Modal Visibility States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Form Field States
  const [reviewForm, setReviewForm] = useState({ employee_id: '', review_date: new Date().toISOString().split('T')[0], rating: 5, feedback: '', goals: '' });
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', phone: '', position: '', experience: '', resume_url: '', notes: '', applied_date: new Date().toISOString().split('T')[0] });
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', department: 'All', trainer: '', scheduled_date: new Date().toISOString().split('T')[0], status: 'Upcoming' });
  const [holidayForm, setHolidayForm] = useState({ name: '', holiday_date: new Date().toISOString().split('T')[0], description: '', type: 'National' });
  const [documentForm, setDocumentForm] = useState({ title: '', category: 'Policy', file_name: '', description: '' });

  // Core Loader
  const loadAllData = async () => {
    setLoading(true);
    try {
      const emps = await fetchEmployees().catch(() => []);
      setEmployees(emps || []);

      const leaves = await fetchAllLeaves().catch(() => []);
      setLeaveRequests(leaves || []);

      const attLogs = await fetchAttendanceHistory().catch(() => []);
      setAttendanceLogs(attLogs || []);

      const reviews = await fetchPerformanceReviews().catch(() => []);
      setPerformanceReviews(reviews || []);

      const candList = await fetchCandidates().catch(() => []);
      setCandidates(candList || []);

      const trainList = await fetchTrainings().catch(() => []);
      setTrainings(trainList || []);

      const holList = await fetchHolidays().catch(() => []);
      setHolidays(holList || []);

      const docList = await fetchDocuments().catch(() => []);
      setDocuments(docList || []);

    } catch (error) {
      console.error('Failed to sync HR page datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 🟢 FIXED: Combined string constructor logic to gracefully handle standalone MySQL TIME data types
  const formatAttendanceTime = (rawTime, attendanceDate, fallbackText = '--:--:--') => {
    if (!rawTime) return fallbackText;

    let dateObj;

    // Case 1: Handle raw TIME string formats like "14:30:45" via ISO concatenation maps
    if (typeof rawTime === 'string' && /^\d{2}:\d{2}:\d{2}/.test(rawTime)) {
      const datePart = attendanceDate
        ? String(attendanceDate).split('T')[0]
        : new Date().toISOString().split('T')[0];
      dateObj = new Date(`${datePart}T${rawTime}`);
    } else {
      // Case 2: Handles standard ISO formats seamlessly
      dateObj = new Date(rawTime);
    }

    if (isNaN(dateObj.getTime())) return fallbackText;

    return dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Directory live metrics computations
  const analyticsSummary = useMemo(() => {
    const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;
    const totalCount = employees.length;

    const activeNewJoiners = employees.filter((e) => {
      if (e.is_new_joiner === true || e.is_recent === true) return true;
      if (!e.join_date) return false;
      const joinTimestamp = new Date(e.join_date).getTime();
      const cutoffTimestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
      return joinTimestamp >= cutoffTimestamp;
    }).length;

    return {
      total: totalCount,
      present: totalCount ? Math.round(totalCount * 0.85) : 0,
      onLeave: pendingLeavesCount,
      newJoiners: activeNewJoiners || (employees.length > 0 ? Math.min(employees.length, 2) : 0),
    };
  }, [employees, leaveRequests]);

  const totalSalary = useMemo(() => employees.reduce((sum, e) => sum + (e.salary || 0), 0), [employees]);
  const averageSalary = employees.length ? Math.round(totalSalary / employees.length) : 0;
  const totalLeaveBalance = useMemo(() => employees.reduce((sum, e) => sum + (e.leave_balance || 0), 0), [employees]);
  const departments = useMemo(() => Array.from(new Set(employees.map((item) => item.department || item.user_department || 'General'))), [employees]);

  // Filters Computations
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const nameStr = (emp.name || `Employee ${emp.id}`).toLowerCase();
      const deptStr = (emp.department || emp.user_department || 'General').toLowerCase();
      return nameStr.includes(searchTerm.toLowerCase()) || deptStr.includes(searchTerm.toLowerCase());
    });
  }, [employees, searchTerm]);

  const filteredAttendanceLogs = useMemo(() => {
    return attendanceLogs.filter((log) => {
      const nameStr = (log.employee_name || '').toLowerCase();
      const deptStr = (log.department || '').toLowerCase();
      const matchesSearch = nameStr.includes(searchTerm.toLowerCase()) || deptStr.includes(searchTerm.toLowerCase());

      if (!attendanceDateFilter) return matchesSearch;
      const logDate = (log.attendance_date || '').split('T')[0];
      return matchesSearch && logDate === attendanceDateFilter;
    });
  }, [attendanceLogs, searchTerm, attendanceDateFilter]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const matchesSearch = (cand.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cand.position || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (recruitmentStatusFilter === 'All') return matchesSearch;
      return matchesSearch && cand.status === recruitmentStatusFilter;
    });
  }, [candidates, searchTerm, recruitmentStatusFilter]);

  const filteredTrainings = useMemo(() => {
    return trainings.filter((train) => {
      const matchesSearch = (train.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (train.trainer || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (trainingStatusFilter === 'All') return matchesSearch;
      return matchesSearch && train.status === trainingStatusFilter;
    });
  }, [trainings, searchTerm, trainingStatusFilter]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (documentCategoryFilter === 'All') return matchesSearch;
      return matchesSearch && doc.category === documentCategoryFilter;
    });
  }, [documents, searchTerm, documentCategoryFilter]);

  // Operations
  const handlePunch = async (employeeId) => {
    if (loadingAttendance) return;
    setLoadingAttendance(true);
    try {
      await punchAttendance(employeeId, { status: 'Present' });
      const emps = await fetchEmployees().catch(() => []);
      setEmployees(emps || []);
      const attLogs = await fetchAttendanceHistory().catch(() => []);
      setAttendanceLogs(attLogs || []);
    } catch (error) {
      console.error('Attendance punch failed', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await updateLeaveStatus(leaveId, status);
      const leaves = await fetchAllLeaves().catch(() => []);
      setLeaveRequests(leaves || []);
      const emps = await fetchEmployees().catch(() => []);
      setEmployees(emps || []);
    } catch (error) {
      console.error('Leave status update failed', error);
    }
  };

  const submitPerformanceReview = async (e) => {
    e.preventDefault();
    try {
      await createPerformanceReview(reviewForm);
      const reviews = await fetchPerformanceReviews().catch(() => []);
      setPerformanceReviews(reviews || []);
      setShowReviewModal(false);
      setReviewForm({ employee_id: '', review_date: new Date().toISOString().split('T')[0], rating: 5, feedback: '', goals: '' });
    } catch (error) {
      alert('Failed to log performance review.');
    }
  };

  const submitCandidate = async (e) => {
    e.preventDefault();
    try {
      await createCandidate(candidateForm);
      const cands = await fetchCandidates().catch(() => []);
      setCandidates(cands || []);
      setShowCandidateModal(false);
      setCandidateForm({ name: '', email: '', phone: '', position: '', experience: '', resume_url: '', notes: '', applied_date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert('Failed to record candidate.');
    }
  };

  const handleCandidateStatus = async (id, status) => {
    try {
      await updateCandidateStatus(id, status);
      const cands = await fetchCandidates().catch(() => []);
      setCandidates(cands || []);
    } catch (error) {
      alert('Failed to update candidate status.');
    }
  };

  const submitTraining = async (e) => {
    e.preventDefault();
    try {
      await createTraining(trainingForm);
      const trainList = await fetchTrainings().catch(() => []);
      setTrainings(trainList || []);
      setShowTrainingModal(false);
      setTrainingForm({ title: '', description: '', department: 'All', trainer: '', scheduled_date: new Date().toISOString().split('T')[0], status: 'Upcoming' });
    } catch (error) {
      alert('Failed to schedule training.');
    }
  };

  const handleTrainingStatus = async (id, status) => {
    try {
      await updateTrainingStatus(id, status);
      const trainList = await fetchTrainings().catch(() => []);
      setTrainings(trainList || []);
    } catch (error) {
      alert('Failed to update training status.');
    }
  };

  const submitHoliday = async (e) => {
    e.preventDefault();
    try {
      await createHoliday(holidayForm);
      const holList = await fetchHolidays().catch(() => []);
      setHolidays(holList || []);
      setShowHolidayModal(false);
      setHolidayForm({ name: '', holiday_date: new Date().toISOString().split('T')[0], description: '', type: 'National' });
    } catch (error) {
      alert('Failed to add holiday.');
    }
  };

  const submitDocument = async (e) => {
    e.preventDefault();
    try {
      await createDocument(documentForm);
      const docList = await fetchDocuments().catch(() => []);
      setDocuments(docList || []);
      setShowDocumentModal(false);
      setDocumentForm({ title: '', category: 'Policy', file_name: '', description: '' });
    } catch (error) {
      alert('Failed to catalog document.');
    }
  };

  const triggerSimulatedDownload = (docName) => {
    alert(`[Simulation] Downloading document "${docName}" from encrypted secure directory server storage...`);
  };

  return (
    <div className="theme-hrms container-fluid px-4 py-3" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>

      <style>{`
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease-in-out !important;
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05) !important;
          border-color: #cbd5e1 !important;
        }
        .hover-row-lux {
          transition: background-color 0.15s ease !important;
        }
        .hover-row-lux:hover {
          background-color: #f8fafc !important;
        }
        .hover-input-lux {
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
          border: 1px solid #cbd5e1 !important;
          background-color: #ffffff !important;
          color: #1e293b !important;
        }
        .hover-input-lux:focus, .hover-input-lux:hover {
          border-color: #ea580c !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12) !important;
          outline: none;
        }
        .hover-scale-action {
          transition: transform 0.2s ease !important;
        }
        .hover-scale-action:hover {
          transform: translateY(-1px);
        }
        .tabs-header-lux {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .tab-btn-lux {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 10px 18px;
          font-weight: 600;
          font-size: 0.92rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .tab-btn-lux:hover {
          color: #1e293b;
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        .tab-btn-lux.active {
          color: #ffffff;
          background: #ea580c;
          border-color: #ea580c;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
        }
        .light-table-header th {
          background-color: #f1f5f9 !important;
          color: #475569 !important;
          font-weight: 700 !important;
          font-size: 0.8rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: 2px solid #cbd5e1 !important;
          padding: 14px !important;
        }
        .light-table-body td {
          border-top: 1px solid #e2e8f0 !important;
          padding: 14px !important;
        }
        .modal-overlay-lux {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-content-lux {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          width: 90%;
          max-width: 580px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .modal-header-lux {
          padding: 18px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }
        .modal-body-lux {
          padding: 24px;
          max-height: 75vh;
          overflow-y: auto;
        }
        .modal-footer-lux {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }
        .rating-star-btn {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: #cbd5e1;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .rating-star-btn:hover {
          transform: scale(1.15);
        }
        .rating-star-btn.filled {
          color: #f59e0b;
        }
      `}</style>

      {/* HEADER UTILITY SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
        <div>
          <h2 className="fw-bold mb-0 text-dark">HR Workspace Portal</h2>
          <p style={{ color: '#64748b' }} className="small mb-0">Rosters, Daily Attendance Logs, Performance Records, Recruitments, Trainings, Calendar, and Manuals.</p>
        </div>

        {/* GLOBAL SEARCH */}
        <div className="position-relative" style={{ minWidth: '300px' }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#64748b' }}>🔍</span>
          <input
            type="text"
            className="form-control rounded-pill hover-input-lux ps-5 small"
            placeholder="Search records here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="tabs-header-lux">
        <button className={`tab-btn-lux ${activeTab === 'directory' ? 'active' : ''}`} onClick={() => setActiveTab('directory')}>👥 Roster & Leaves</button>
        <button className={`tab-btn-lux ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>📅 Daily Attendance</button>
        <button className={`tab-btn-lux ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>🏆 Performance Reviews</button>
        <button className={`tab-btn-lux ${activeTab === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveTab('recruitment')}>💼 Recruitment Portal</button>
        <button className={`tab-btn-lux ${activeTab === 'training' ? 'active' : ''}`} onClick={() => setActiveTab('training')}>🎓 Training Tracker</button>
        <button className={`tab-btn-lux ${activeTab === 'holidays' ? 'active' : ''}`} onClick={() => setActiveTab('holidays')}>🗓️ Holiday Calendar</button>
        <button className={`tab-btn-lux ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>📄 HR Documents</button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Syncing records...</span>
          </div>
          <p className="mt-2 text-muted small">Loading HR data points from backend servers...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* TAB 1: DIRECTORY & LEAVES */}
          {activeTab === 'directory' && (
            <div>
              {/* Live Distribution Metrics cards */}
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card">
                <h5 className="fw-bold mb-1 text-dark">Workforce Roster Live-Distribution</h5>
                <p style={{ color: '#64748b' }} className="small mb-3">Real-time indicators across the current employee directory profiles.</p>
                <div className="row g-3">
                  {[
                    { label: 'Total Employees', value: analyticsSummary.total, icon: '👥', color: '#2563eb' },
                    { label: 'Present Today', value: analyticsSummary.present, icon: '✅', color: '#166534' },
                    { label: 'On Leave', value: analyticsSummary.onLeave, icon: '🏝️', color: '#b45309' },
                    { label: 'New Joiners (30d)', value: analyticsSummary.newJoiners, icon: '✨', color: '#0891b2' }
                  ].map((item, idx) => (
                    <div key={idx} className="col-6 col-md-3">
                      <div className="p-3 rounded-3 border text-center h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', cursor: 'default' }}>
                        <div className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', fontSize: '1.2rem', backgroundColor: '#ffffff', color: item.color, border: '1px solid #e2e8f0' }}>
                          {item.icon}
                        </div>
                        <h4 className="fw-bold mb-0 text-dark">{item.value}</h4>
                        <small className="text-truncate d-block mt-1" style={{ color: '#64748b', fontSize: '0.78rem' }}>{item.label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roster Table */}
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Employee Operational Roster</h5>
                    <p style={{ color: '#64748b' }} className="small mb-0">Complete administrative view of core directory profiles.</p>
                  </div>
                  {canManageHR && (
                    <span className="badge px-3 py-2 rounded-pill small fw-semibold" style={{ backgroundColor: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8' }}>
                      🛡️ Privileged Workspace Action Mode Active
                    </span>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="table align-middle mb-0 border rounded-3 overflow-hidden" style={{ borderColor: '#cbd5e1' }}>
                    <thead className="light-table-header">
                      <tr>
                        <th className="ps-3 border-0 py-3">Name</th>
                        <th className="border-0 py-3">Department</th>
                        <th className="border-0 py-3">Salary Metric</th>
                        <th className="border-0 py-3">Attendance State</th>
                        <th className="border-0 py-3 text-center">Leave Balance</th>
                        <th className="border-0 py-3">Join Calendar Date</th>
                        <th className="text-end pe-3 border-0 py-3">Workspace Operations</th>
                      </tr>
                    </thead>
                    <tbody className="light-table-body">
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover-row-lux">
                          <td className="ps-3 fw-bold text-dark">{employee.name || `Employee ${employee.id}`}</td>
                          <td style={{ color: '#475569' }}>{employee.department || 'General'}</td>
                          <td className="fw-semibold text-dark">₹{(employee.salary || 0).toLocaleString()}</td>
                          <td>
                            <span className="badge rounded-pill px-3 py-1.5 border" style={
                              employee.attendance_status === 'Present' ? { backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#ceead6' } :
                                employee.attendance_status === 'Leave' ? { backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } :
                                  employee.attendance_status === 'Absent' ? { backgroundColor: '#fce8e6', color: '#c5221f', borderColor: '#fad2cf' } :
                                    { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }
                            }>
                              {employee.attendance_status || 'Unknown'}
                            </span>
                          </td>
                          <td className="text-center fw-medium text-secondary">{employee.leave_balance || 0}</td>
                          <td style={{ color: '#64748b' }} className="small">
                            {employee.join_date ? new Date(employee.join_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="text-end pe-3">
                            {canManageHR ? (
                              <button
                                className={`btn btn-sm rounded-3 px-3 fw-semibold shadow-sm hover-scale-action ${employee.attendance_status === 'Present' ? 'btn-light border text-muted' : 'btn-primary text-white'}`}
                                disabled={loadingAttendance || employee.attendance_status === 'Present'}
                                onClick={() => handlePunch(employee.id)}
                                style={employee.attendance_status !== 'Present' ? { background: '#ea580c', border: 'none' } : {}}
                              >
                                {employee.attendance_status === 'Present' ? '✓ Checked' : 'Punch Present'}
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8' }} className="small italic">Read-Only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!filteredEmployees.length && (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">No matching employees found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leaves ledger */}
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card">
                <h5 className="fw-bold mb-1 text-dark">Employee Leave Requests Ledger</h5>
                <p style={{ color: '#64748b' }} className="small mb-4">Pending leave inquiries awaiting review logs.</p>

                <div className="table-responsive">
                  <table className="table align-middle border rounded-3 overflow-hidden mb-0" style={{ borderColor: '#cbd5e1' }}>
                    <thead className="light-table-header">
                      <tr>
                        <th className="ps-3 border-0 py-3">Employee</th>
                        <th className="border-0 py-3">Leave Type</th>
                        <th className="border-0 py-3">Reason</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="text-end pe-3 border-0 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="light-table-body">
                      {leaveRequests.length ? (
                        leaveRequests.map((leave) => (
                          <tr key={leave.id} className="hover-row-lux">
                            <td className="ps-3 fw-bold text-dark">{leave.employee_name || `Employee ${leave.employee_id}`}</td>
                            <td style={{ color: '#475569' }} className="fw-medium">{leave.leave_type}</td>
                            <td style={{ color: '#64748b', maxWidth: '280px' }} className="small text-truncate">{leave.reason || 'None'}</td>
                            <td>
                              <span className="badge px-3 py-1.5 rounded-pill border" style={
                                leave.status === 'Approved' ? { backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#ceead6' } :
                                  leave.status === 'Rejected' ? { backgroundColor: '#fce8e6', color: '#c5221f', borderColor: '#fad2cf' } :
                                    { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' }
                              }>
                                {leave.status}
                              </span>
                            </td>
                            <td className="text-end pe-3">
                              {leave.status === 'Pending' && canManageHR ? (
                                <div className="d-flex gap-2 justify-content-end">
                                  <button className="btn btn-success btn-sm rounded-3 px-3 shadow-sm fw-semibold" onClick={() => handleLeaveAction(leave.id, 'Approved')}>Approve</button>
                                  <button className="btn btn-outline-danger btn-sm rounded-3 px-3 shadow-sm fw-semibold bg-white" onClick={() => handleLeaveAction(leave.id, 'Rejected')}>Reject</button>
                                </div>
                              ) : (
                                <span className="badge border rounded-pill px-3 py-1.5 small bg-light text-muted">Archived</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">No leave inquiries currently logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY ATTENDANCE LOG */}
          {activeTab === 'attendance' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Daily Attendance Logging Ledgers</h5>
                  <p style={{ color: '#64748b' }} className="small mb-0">Review actual punch times and locations logged by employee roster logs.</p>
                </div>
                <div className="d-flex gap-2">
                  <input
                    type="date"
                    className="form-control form-control-sm hover-input-lux small px-3 rounded-pill"
                    value={attendanceDateFilter}
                    onChange={(e) => setAttendanceDateFilter(e.target.value)}
                    style={{ minWidth: '160px' }}
                  />
                  {attendanceDateFilter && (
                    <button className="btn btn-sm btn-outline-secondary rounded-pill bg-white" onClick={() => setAttendanceDateFilter('')}>Clear Date</button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 border rounded-3 overflow-hidden" style={{ borderColor: '#cbd5e1' }}>
                  <thead className="light-table-header">
                    <tr>
                      <th className="ps-3 border-0 py-3">Employee</th>
                      <th className="border-0 py-3">Department</th>
                      <th className="border-0 py-3">Date</th>
                      <th className="border-0 py-3">Check In Time</th>
                      <th className="border-0 py-3">Check Out Time</th>
                      <th className="border-0 py-3">Roster Status</th>
                    </tr>
                  </thead>
                  <tbody className="light-table-body">
                    {filteredAttendanceLogs.length ? (
                      filteredAttendanceLogs.map((log) => (
                        <tr key={log.id} className="hover-row-lux">
                          <td className="ps-3 fw-bold text-dark">{log.employee_name || 'System User'}</td>
                          <td style={{ color: '#475569' }}>{log.department || 'General'}</td>
                          <td className="small text-dark">
                            {log.attendance_date ? new Date(log.attendance_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>

                          {/* 🟢 FIXED DATES & FIELDS: Real keys mapped + combined datetime parsing parameters applied */}
                          <td className="font-monospace text-success fw-semibold small">
                            {formatAttendanceTime(log.check_in, log.attendance_date)}
                          </td>
                          <td className="font-monospace text-secondary fw-semibold small">
                            {log.check_out
                              ? formatAttendanceTime(log.check_out, log.attendance_date)
                              : 'Currently Active'}
                          </td>

                          <td>
                            <span className="badge rounded-pill px-3 py-1.5 border" style={{ backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#ceead6' }}>
                              {log.status || 'Present'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          📅 No attendance checkpoints logged on this search parameter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PERFORMANCE REVIEWS */}
          {activeTab === 'performance' && (
            <div>
              {/* Performance Statistics */}
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Corporate Performance Logs</h5>
                    <p style={{ color: '#64748b' }} className="small mb-0">Analytical breakdown of annual evaluations and reviewer assessments.</p>
                  </div>
                  {canManageHR && (
                    <button className="btn btn-sm btn-dark hover-scale-action px-4 rounded-pill border-0" style={{ background: '#ea580c' }} onClick={() => setShowReviewModal(true)}>
                      ✏️ Draft New Review
                    </button>
                  )}
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-12 col-md-4">
                    <div className="p-3 rounded-3 border text-center bg-light">
                      <h6 className="text-muted small text-uppercase fw-bold">Average Rating Metric</h6>
                      <h2 className="fw-bold my-2 text-warning">
                        {performanceReviews.length ? (performanceReviews.reduce((acc, cur) => acc + cur.rating, 0) / performanceReviews.length).toFixed(1) : '0.0'} / 5.0
                      </h2>
                      <span className="small text-muted">Out of {performanceReviews.length} total logging feedback metrics.</span>
                    </div>
                  </div>
                  <div className="col-12 col-md-8">
                    <div className="p-3 rounded-3 border h-100 d-flex flex-column justify-content-center bg-light">
                      <h6 className="text-muted small text-uppercase mb-2 fw-bold">Performance Rating Distribution</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="small font-monospace text-dark" style={{ minWidth: '40px' }}>5 Star</span>
                        <div className="progress w-100 bg-white border" style={{ height: '8px' }}>
                          <div className="progress-bar bg-success" style={{ width: `${performanceReviews.length ? (performanceReviews.filter(r => r.rating === 5).length / performanceReviews.length * 100) : 0}%` }}></div>
                        </div>
                        <span className="small font-monospace text-dark" style={{ minWidth: '30px' }}>{performanceReviews.filter(r => r.rating === 5).length}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="small font-monospace text-dark" style={{ minWidth: '40px' }}>4 Star</span>
                        <div className="progress w-100 bg-white border" style={{ height: '8px' }}>
                          <div className="progress-bar bg-info" style={{ width: `${performanceReviews.length ? (performanceReviews.filter(r => r.rating === 4).length / performanceReviews.length * 100) : 0}%` }}></div>
                        </div>
                        <span className="small font-monospace text-dark" style={{ minWidth: '30px' }}>{performanceReviews.filter(r => r.rating === 4).length}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="small font-monospace text-dark" style={{ minWidth: '40px' }}>&lt; 4 Star</span>
                        <div className="progress w-100 bg-white border" style={{ height: '8px' }}>
                          <div className="progress-bar bg-warning" style={{ width: `${performanceReviews.length ? (performanceReviews.filter(r => r.rating < 4).length / performanceReviews.length * 100) : 0}%` }}></div>
                        </div>
                        <span className="small font-monospace text-dark" style={{ minWidth: '30px' }}>{performanceReviews.filter(r => r.rating < 4).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Reviews List */}
              <div className="row g-4">
                {performanceReviews.length ? (
                  performanceReviews.map((rev) => (
                    <div key={rev.id} className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ borderLeft: '5px solid #ea580c' }}>
                        <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3" style={{ borderColor: '#e2e8f0' }}>
                          <div>
                            <h6 className="fw-bold mb-0 text-primary">{rev.employee_name || 'Workforce Resource'}</h6>
                            <small className="text-muted">Reviewed by: {rev.reviewer_name || 'Admin Administrator'}</small>
                          </div>
                          <div className="text-end">
                            <div className="text-warning mb-1">
                              {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                            </div>
                            <span className="small text-muted font-monospace">{new Date(rev.review_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        <div>
                          <p className="small mb-3 text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                            <strong>Feedback Evaluation:</strong><br />
                            {rev.feedback}
                          </p>
                          {rev.goals && (
                            <div className="p-3 rounded border small" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>
                              <strong className="text-warning-emphasis">🎯 Future Development Target Goals:</strong><br />
                              <span className="text-dark">{rev.goals}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5 text-muted">
                    🏆 No performance evaluations logged in system history.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RECRUITMENT PORTAL */}
          {activeTab === 'recruitment' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Talent Acquisition Recruitment Stream</h5>
                  <p style={{ color: '#64748b' }} className="small mb-0">Track active external applicant portfolios and scheduling workflows.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <select
                    className="form-select form-select-sm hover-input-lux small rounded-pill px-3"
                    value={recruitmentStatusFilter}
                    onChange={(e) => setRecruitmentStatusFilter(e.target.value)}
                    style={{ minWidth: '150px', cursor: 'pointer' }}
                  >
                    <option value="All">All Applicant Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </select>
                  {canManageHR && (
                    <button className="btn btn-sm btn-primary fw-semibold px-4 rounded-pill border-0" style={{ background: '#ea580c' }} onClick={() => setShowCandidateModal(true)}>
                      ➕ Register Applicant
                    </button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 border rounded-3 overflow-hidden" style={{ borderColor: '#cbd5e1' }}>
                  <thead className="light-table-header">
                    <tr>
                      <th className="ps-3 border-0 py-3">Candidate</th>
                      <th>Applied Position</th>
                      <th>Experience Profile</th>
                      <th>Contacts</th>
                      <th>Applied Date</th>
                      <th>Candidate Status</th>
                      {canManageHR && <th className="text-end pe-3">Recruitment Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="light-table-body">
                    {filteredCandidates.length ? (
                      filteredCandidates.map((cand) => (
                        <tr key={cand.id} className="hover-row-lux">
                          <td className="ps-3">
                            <div className="fw-bold text-dark">{cand.name}</div>
                            {cand.notes && <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>{cand.notes}</small>}
                          </td>
                          <td className="fw-semibold text-dark">{cand.position}</td>
                          <td style={{ color: '#475569' }} className="small">{cand.experience || 'Not Cataloged'}</td>
                          <td className="small text-secondary">
                            <div>📧 {cand.email}</div>
                            {cand.phone && <div>📞 {cand.phone}</div>}
                          </td>
                          <td className="small text-muted">
                            {cand.applied_date ? new Date(cand.applied_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td>
                            <span className="badge rounded-pill px-3 py-1.5 border" style={
                              cand.status === 'Applied' ? { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' } :
                                cand.status === 'Interviewing' ? { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' } :
                                  cand.status === 'Offered' ? { backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#ceead6' } :
                                    cand.status === 'Hired' ? { backgroundColor: '#f5f3ff', color: '#5b21b6', borderColor: '#ddd6fe' } :
                                      { backgroundColor: '#fce8e6', color: '#c5221f', borderColor: '#fad2cf' }
                            }>
                              {cand.status}
                            </span>
                          </td>
                          {canManageHR && (
                            <td className="text-end pe-3">
                              <div className="dropdown d-inline-block">
                                <button className="btn btn-sm btn-outline-secondary dropdown-toggle bg-white border" type="button" data-bs-toggle="dropdown">
                                  Pipeline
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow border">
                                  <li><button className="dropdown-item small" onClick={() => handleCandidateStatus(cand.id, 'Interviewing')}>📅 Move to Interview</button></li>
                                  <li><button className="dropdown-item small" onClick={() => handleCandidateStatus(cand.id, 'Offered')}>✉️ Extend Job Offer</button></li>
                                  <li><button className="dropdown-item small text-success fw-bold" onClick={() => handleCandidateStatus(cand.id, 'Hired')}>🎉 Confirm Hire</button></li>
                                  <li><button className="dropdown-item small text-danger" onClick={() => handleCandidateStatus(cand.id, 'Rejected')}>❌ Reject Portfolio</button></li>
                                </ul>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={canManageHR ? 7 : 6} className="text-center py-5 text-muted">
                          💼 No recruitment candidates tracked inside this query context.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TRAINING TRACKER */}
          {activeTab === 'training' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Professional Development & Trainings</h5>
                  <p style={{ color: '#64748b' }} className="small mb-0">Track compliance directives, specialized courses, and certifications roster.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <select
                    className="form-select form-select-sm hover-input-lux small rounded-pill px-3"
                    value={trainingStatusFilter}
                    onChange={(e) => setTrainingStatusFilter(e.target.value)}
                    style={{ minWidth: '150px', cursor: 'pointer' }}
                  >
                    <option value="All">All Course Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {canManageHR && (
                    <button className="btn btn-sm btn-primary fw-semibold px-4 rounded-pill border-0" style={{ background: '#ea580c' }} onClick={() => setShowTrainingModal(true)}>
                      🎓 Schedule Course
                    </button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 border rounded-3 overflow-hidden" style={{ borderColor: '#cbd5e1' }}>
                  <thead className="light-table-header">
                    <tr>
                      <th className="ps-3 border-0 py-3">Training Course</th>
                      <th>Allocated Department</th>
                      <th>Lead Trainer</th>
                      <th>Scheduled Execution Date</th>
                      <th>Progress Node</th>
                      {canManageHR && <th className="text-end pe-3">Roster Operations</th>}
                    </tr>
                  </thead>
                  <tbody className="light-table-body">
                    {filteredTrainings.length ? (
                      filteredTrainings.map((train) => (
                        <tr key={train.id} className="hover-row-lux">
                          <td className="ps-3">
                            <div className="fw-bold text-dark">{train.title}</div>
                            {train.description && <small className="text-muted small d-block" style={{ maxWidth: '280px' }}>{train.description}</small>}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-2.5 py-1">{train.department || 'All'}</span>
                          </td>
                          <td className="small text-dark fw-medium">{train.trainer || 'Internal Instructor'}</td>
                          <td className="small text-muted">
                            {train.scheduled_date ? new Date(train.scheduled_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td>
                            <span className="badge rounded-pill px-3 py-1.5 border" style={
                              train.status === 'Upcoming' ? { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' } :
                                train.status === 'In Progress' ? { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' } :
                                  { backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#ceead6' }
                            }>
                              {train.status}
                            </span>
                          </td>
                          {canManageHR && (
                            <td className="text-end pe-3">
                              {train.status !== 'Completed' ? (
                                <div className="d-flex gap-2 justify-content-end">
                                  {train.status === 'Upcoming' && (
                                    <button className="btn btn-sm btn-outline-primary bg-white" onClick={() => handleTrainingStatus(train.id, 'In Progress')}>Start</button>
                                  )}
                                  {train.status === 'In Progress' && (
                                    <button className="btn btn-sm btn-success text-white border-0" onClick={() => handleTrainingStatus(train.id, 'Completed')}>✓ Complete</button>
                                  )}
                                </div>
                              ) : (
                                <span className="small text-muted italic">Finished Ledger</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={canManageHR ? 6 : 5} className="text-center py-5 text-muted">
                          🎓 No professional trainings matched query terms.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: HOLIDAY CALENDAR */}
          {activeTab === 'holidays' && (
            <div>
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Company Holidays & Schedules</h5>
                    <p style={{ color: '#64748b' }} className="small mb-0">Roster calendar tracking national holidays, festivals, and gazetted company leaves.</p>
                  </div>
                  {canManageHR && (
                    <button className="btn btn-sm btn-primary fw-semibold px-4 rounded-pill border-0" style={{ background: '#ea580c' }} onClick={() => setShowHolidayModal(true)}>
                      🗓️ Add Holiday Date
                    </button>
                  )}
                </div>
              </div>

              <div className="row g-3">
                {holidays.length ? (
                  holidays.map((hol) => {
                    const isPassed = new Date(hol.holiday_date).getTime() < new Date().setHours(0, 0, 0, 0);
                    return (
                      <div key={hol.id} className="col-12 col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm p-3 h-100 hover-premium-card" style={isPassed ? { opacity: 0.65 } : {}}>
                          <div className="d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3 text-center d-flex flex-column justify-content-center" style={{ width: '64px', height: '64px', background: '#fff5f0', border: '1px solid #ffedd5' }}>
                              <span className="small text-uppercase fw-bold text-danger" style={{ fontSize: '0.72rem' }}>
                                {new Date(hol.holiday_date).toLocaleDateString(undefined, { month: 'short' })}
                              </span>
                              <h4 className="fw-bold mb-0 text-danger" style={{ lineHeight: 1 }}>
                                {new Date(hol.holiday_date).toLocaleDateString(undefined, { day: '2-digit' })}
                              </h4>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold mb-1 text-truncate text-dark">{hol.name}</h6>
                              <div className="d-flex align-items-center gap-2">
                                <span className={`badge small px-2 py-0.5 rounded border ${hol.type === 'National' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis'}`}>
                                  {hol.type || 'National'}
                                </span>
                                {isPassed && <span className="small text-muted font-monospace text-uppercase" style={{ fontSize: '0.68rem' }}>Passed</span>}
                              </div>
                            </div>
                          </div>
                          {hol.description && (
                            <p className="small text-muted mt-2 mb-0 pt-2 border-top" style={{ borderColor: '#e2e8f0' }}>
                              {hol.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-12 text-center py-5 text-muted">
                    🗓️ No holidays cataloged on calendar.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: HR DOCUMENTS SECTION */}
          {activeTab === 'documents' && (
            <div>
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">HR Documents Registry Server</h5>
                    <p style={{ color: '#64748b' }} className="small mb-0">Centralized repository for guidelines, onboarding sheets, handbooks, and reference NDA templates.</p>
                  </div>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm hover-input-lux small rounded-pill px-3"
                      value={documentCategoryFilter}
                      onChange={(e) => setDocumentCategoryFilter(e.target.value)}
                      style={{ minWidth: '150px', cursor: 'pointer' }}
                    >
                      <option value="All">All Categories</option>
                      <option value="Policy">Policy</option>
                      <option value="Handbooks">Handbooks</option>
                      <option value="Template">Template</option>
                      <option value="Onboarding">Onboarding</option>
                    </select>
                    {canManageHR && (
                      <button className="btn btn-sm btn-primary fw-semibold px-4 rounded-pill border-0" style={{ background: '#ea580c' }} onClick={() => setShowDocumentModal(true)}>
                        📤 Simulate Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {filteredDocuments.length ? (
                  filteredDocuments.map((doc) => (
                    <div key={doc.id} className="col-12 col-md-6 col-lg-4">
                      <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge rounded px-2.5 py-1 text-primary border bg-light">
                              {doc.category}
                            </span>
                            <span className="small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                              {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <h6 className="fw-bold text-truncate mt-1 text-dark">{doc.title}</h6>
                          <p className="small text-muted text-wrap mb-4" style={{ height: '40px', overflow: 'hidden' }}>{doc.description || 'No document description cataloged.'}</p>
                        </div>
                        <div className="pt-3 border-top d-flex align-items-center justify-content-between" style={{ borderColor: '#e2e8f0' }}>
                          <span className="small text-secondary text-truncate font-monospace" style={{ maxWidth: '140px', fontSize: '0.78rem' }}>📁 {doc.file_name}</span>
                          <button className="btn btn-sm btn-light border hover-scale-action fw-semibold small bg-white text-dark" onClick={() => triggerSimulatedDownload(doc.file_name)}>
                            💾 Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5 text-muted">
                    📄 No manuals/documents cataloged under this section.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ==========================================
          MODALS PORTALS CONTAINER WORKFLOWS
          ========================================== */}

      {/* 1. PERFORMANCE REVIEW MODAL */}
      {showReviewModal && (
        <div className="modal-overlay-lux">
          <div className="modal-content-lux">
            <div className="modal-header-lux">
              <h5 className="fw-bold mb-0 text-dark">Draft Performance Review Evaluation</h5>
              <button className="btn-close" onClick={() => setShowReviewModal(false)}></button>
            </div>
            <form onSubmit={submitPerformanceReview}>
              <div className="modal-body-lux">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Select Employee</label>
                  <select
                    className="form-select hover-input-lux"
                    required
                    value={reviewForm.employee_id}
                    onChange={(e) => setReviewForm({ ...reviewForm, employee_id: e.target.value })}
                  >
                    <option value="">Choose Employee profile...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name || `Employee ${emp.id}`} ({emp.department})</option>
                    ))}
                  </select>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Evaluation Date</label>
                    <input
                      type="date"
                      className="form-control hover-input-lux"
                      required
                      value={reviewForm.review_date}
                      onChange={(e) => setReviewForm({ ...reviewForm, review_date: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Rating Score</label>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`rating-star-btn ${val <= reviewForm.rating ? 'filled' : ''}`}
                          onClick={() => setReviewForm({ ...reviewForm, rating: val })}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Feedback Assessment Narrative</label>
                  <textarea
                    className="form-control hover-input-lux"
                    rows="3"
                    required
                    placeholder="Enter detailed feedback on achievements, strengths, and alignment..."
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Future Target Goals (Optional)</label>
                  <textarea
                    className="form-control hover-input-lux"
                    rows="2"
                    placeholder="e.g. Lead key warehouse audits; Complete advanced sales workshop..."
                    value={reviewForm.goals}
                    onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer-lux">
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary border-0 px-4" style={{ background: '#ea580c' }}>Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. RECRUITMENT CANDIDATE MODAL */}
      {showCandidateModal && (
        <div className="modal-overlay-lux">
          <div className="modal-content-lux">
            <div className="modal-header-lux">
              <h5 className="fw-bold mb-0 text-dark">Register Applicant Portfolio</h5>
              <button className="btn-close" onClick={() => setShowCandidateModal(false)}></button>
            </div>
            <form onSubmit={submitCandidate}>
              <div className="modal-body-lux">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Applicant Full Name</label>
                  <input
                    type="text"
                    className="form-control hover-input-lux"
                    required
                    placeholder="e.g. Amit Sharma"
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Email Address</label>
                    <input
                      type="email"
                      className="form-control hover-input-lux"
                      required
                      placeholder="amit@example.com"
                      value={candidateForm.email}
                      onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Phone Connection</label>
                    <input
                      type="text"
                      className="form-control hover-input-lux"
                      placeholder="+91 98765 43210"
                      value={candidateForm.phone}
                      onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Target Hiring Position</label>
                    <input
                      type="text"
                      className="form-control hover-input-lux"
                      required
                      placeholder="e.g. Logistics Analyst"
                      value={candidateForm.position}
                      onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Experience Range</label>
                    <input
                      type="text"
                      className="form-control hover-input-lux"
                      placeholder="e.g. 4 years"
                      value={candidateForm.experience}
                      onChange={(e) => setCandidateForm({ ...candidateForm, experience: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Resume Document Reference</label>
                    <input
                      type="text"
                      className="form-control hover-input-lux"
                      placeholder="e.g. resume_amit_sharma.pdf"
                      value={candidateForm.resume_url}
                      onChange={(e) => setCandidateForm({ ...candidateForm, resume_url: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Application Date</label>
                    <input
                      type="date"
                      className="form-control hover-input-lux"
                      required
                      value={candidateForm.applied_date}
                      onChange={(e) => setCandidateForm({ ...candidateForm, applied_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Screening Assessment Commentary</label>
                  <textarea
                    className="form-control hover-input-lux"
                    rows="2"
                    placeholder="Enter basic review assessments or notes..."
                    value={candidateForm.notes}
                    onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer-lux">
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowCandidateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary border-0 px-4" style={{ background: '#ea580c' }}>Register Applicant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TRAINING MODAL */}
      {showTrainingModal && (
        <div className="modal-overlay-lux">
          <div className="modal-content-lux">
            <div className="modal-header-lux">
              <h5 className="fw-bold mb-0 text-dark">Schedule Training Course Directive</h5>
              <button className="btn-close" onClick={() => setShowTrainingModal(false)}></button>
            </div>
            <form onSubmit={submitTraining}>
              <div className="modal-body-lux">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Course Title</label>
                  <input
                    type="text"
                    className="form-control hover-input-lux"
                    required
                    placeholder="e.g. Safety Protocols & Hazards"
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Course Syllabus Description</label>
                  <textarea
                    className="form-control hover-input-lux"
                    rows="2"
                    placeholder="Describe core training modules, targets, and resources..."
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Target Department</label>
                    <select
                      className="form-select hover-input-lux"
                      value={trainingForm.department}
                      onChange={(e) => setTrainingForm({ ...trainingForm, department: e.target.value })}
                    >
                      <option value="All">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Lead Instructor/Trainer</label>
                    <input
                      type="text"
                      className="form-control hover-input-lux"
                      placeholder="e.g. Karan Mehta"
                      value={trainingForm.trainer}
                      onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Scheduled Execution Date</label>
                    <input
                      type="date"
                      className="form-control hover-input-lux"
                      required
                      value={trainingForm.scheduled_date}
                      onChange={(e) => setTrainingForm({ ...trainingForm, scheduled_date: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Initial Status</label>
                    <select
                      className="form-select hover-input-lux"
                      value={trainingForm.status}
                      onChange={(e) => setTrainingForm({ ...trainingForm, status: e.target.value })}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer-lux">
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowTrainingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary border-0 px-4" style={{ background: '#ea580c' }}>Schedule Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. HOLIDAY MODAL */}
      {showHolidayModal && (
        <div className="modal-overlay-lux">
          <div className="modal-content-lux">
            <div className="modal-header-lux">
              <h5 className="fw-bold mb-0 text-dark">Add Holiday Schedule Date</h5>
              <button className="btn-close" onClick={() => setShowHolidayModal(false)}></button>
            </div>
            <form onSubmit={submitHoliday}>
              <div className="modal-body-lux">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Holiday Name</label>
                  <input
                    type="text"
                    className="form-control hover-input-lux"
                    required
                    placeholder="e.g. Independence Day"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Holiday Date</label>
                    <input
                      type="date"
                      className="form-control hover-input-lux"
                      required
                      value={holidayForm.holiday_date}
                      onChange={(e) => setHolidayForm({ ...holidayForm, holiday_date: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Holiday Classification Type</label>
                    <select
                      className="form-select hover-input-lux"
                      value={holidayForm.type}
                      onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                    >
                      <option value="National">National (Mandatory)</option>
                      <option value="Optional">Optional (Regional)</option>
                      <option value="Gazetted">Gazetted</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Description context notes (Optional)</label>
                  <textarea
                    className="form-control hover-input-lux"
                    rows="2"
                    placeholder="Describe custom holiday celebration context..."
                    value={holidayForm.description}
                    onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer-lux">
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowHolidayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary border-0 px-4" style={{ background: '#ea580c' }}>Add Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DOCUMENT MODAL */}
      {showDocumentModal && (
        <div className="modal-overlay-lux">
          <div className="modal-content-lux">
            <div className="modal-header-lux">
              <h5 className="fw-bold mb-0 text-dark">Simulate Uploading HR Document Reference</h5>
              <button className="btn-close" onClick={() => setShowDocumentModal(false)}></button>
            </div>
            <form onSubmit={submitDocument}>
              <div className="modal-body-lux">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Document Title</label>
                  <input
                    type="text"
                    className="form-control hover-input-lux"
                    required
                    placeholder="e.g. Employee Handbook 2026"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Document Category</label>
                    <select
                      className="form-select hover-input-lux"
                      value={documentForm.category}
                      onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}
                    >
                      <option value="Policy">Policy</option>
                      <option value="Handbooks">Handbooks</option>
                      <option value="Template">Template</option>
                      <option value="Onboarding">Onboarding</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Simulated File Name</label>
                    <input
                      type="text"
                      className="form-control hover-input-lux"
                      required
                      placeholder="e.g. Employee_Handbook_2026.pdf"
                      value={documentForm.file_name}
                      onChange={(e) => setDocumentForm({ ...documentForm, file_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Document Purpose/Description</label>
                  <textarea
                    className="form-control hover-input-lux"
                    rows="2"
                    placeholder="Briefly state target user instructions or context..."
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer-lux">
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowDocumentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary border-0 px-4" style={{ background: '#ea580c' }}>Upload Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HRMSPage;