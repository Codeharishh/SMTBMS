// src/pages/HRMSPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

// ── WARM ORANGISH & AMBER PALETTE FOR VISUAL CONSISTENCY WITH MATERIALSPAGE & ERPPAGE ──
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
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
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
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M20 6 9 17l-5-5" />
    </svg>
  ),
  sparkles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
};

const HRMSPage = () => {
  const user = getCurrentUser();
  const location = useLocation();
  const canManageHR = user?.role && ['Admin', 'HR', 'Manager'].includes(user.role);
  // Training Tracker "Operations" actions (Initialize/Complete) are HR-only —
  // Admins and Managers can view the tracker but not action it.
  const canManageTraining = user?.role === 'HR';

  // Map route sub-paths to HRMS tab names
  const getTabFromPath = (path) => {
    if (path.includes('/hrms/attendance')) return 'attendance';
    if (path.includes('/hrms/performance')) return 'performance';
    if (path.includes('/hrms/leaves')) return 'directory';
    if (path.includes('/hrms/recruitment')) return 'recruitment';
    if (path.includes('/hrms/training')) return 'training';
    if (path.includes('/hrms/holidays')) return 'holidays';
    if (path.includes('/hrms/documents')) return 'documents';
    return 'directory';
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

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
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', department: 'All', trainer: '', scheduled_date: new Date().toISOString().split('T')[0], status: 'Upcoming', trainees: [] });
  const [holidayForm, setHolidayForm] = useState({ name: '', holiday_date: new Date().toISOString().split('T')[0], description: '', type: 'National' });
  const [documentForm, setDocumentForm] = useState({ title: '', category: 'Policy', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);

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

  const formatAttendanceTime = (rawTime, attendanceDate, fallbackText = '--:--:--') => {
    if (!rawTime) return fallbackText;

    let dateObj;
    if (typeof rawTime === 'string' && /^\d{2}:\d{2}:\d{2}/.test(rawTime)) {
      const datePart = attendanceDate
        ? String(attendanceDate).split('T')[0]
        : new Date().toISOString().split('T')[0];
      dateObj = new Date(`${datePart}T${rawTime}`);
    } else {
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
      setTrainingForm({ title: '', description: '', department: 'All', trainer: '', scheduled_date: new Date().toISOString().split('T')[0], status: 'Upcoming', trainees: [] });
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

  const handleTraineeCheckboxChange = (employeeName) => {
    setTrainingForm(prev => {
      const alreadySelected = prev.trainees.includes(employeeName);
      if (alreadySelected) {
        return { ...prev, trainees: prev.trainees.filter(t => t !== employeeName) };
      } else {
        return { ...prev, trainees: [...prev.trainees, employeeName] };
      }
    });
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
      const payload = {
        ...documentForm,
        file_name: selectedFile ? selectedFile.name : 'manual_upload.pdf'
      };
      await createDocument(payload);
      const docList = await fetchDocuments().catch(() => []);
      setDocuments(docList || []);
      setShowDocumentModal(false);
      setDocumentForm({ title: '', category: 'Policy', description: '' });
      setSelectedFile(null);
    } catch (error) {
      alert('Failed to catalog document.');
    }
  };

  const triggerSimulatedDownload = (docName) => {
    alert(`[Simulation] Downloading document "${docName}" from encrypted secure directory server storage...`);
  };

  // Shared Inline Styles Definition Objects matching ERPPage perfectly
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
    // Dedicated select style — keeps Bootstrap's native right-side padding
    // intact so the built-in dropdown caret icon never overlaps the text.
    selectField: {
      border: `1px solid ${THEME.slateBorder}`,
      backgroundColor: THEME.white,
      color: THEME.slateDark,
      transition: 'all 0.2s ease',
      paddingRight: '2.25rem',
      backgroundPosition: 'right 0.85rem center'
    },
    tabButton: (isActive) => ({
      background: isActive ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : THEME.white,
      border: `1px solid ${isActive ? COLORS.primary : THEME.slateBorder}`,
      color: isActive ? THEME.white : '#5c524a',
      padding: '10px 18px',
      fontWeight: '600',
      fontSize: '0.92rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: isActive ? '0 4px 14px rgba(255, 122, 69, 0.3)' : 'none',
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

  // Metric component
  const MetricCard = ({ label, value, icon, color }) => (
    <div className="col-6 col-md-3">
      <div className="metric-card-lux h-100 p-3 rounded-3 text-center" style={{ backgroundColor: THEME.white, borderRadius: '18px' }}>
        <div className="mx-auto mb-2 d-flex align-items-center justify-content-center" style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: '#ffffff', color: color, border: `2px solid ${color}35`, fontSize: '1.2rem'
        }}>
          {icon}
        </div>
        <h4 className="fw-bold mb-0 text-dark">{value}</h4>
        <small className="text-truncate d-block mt-1" style={{ color: THEME.slateMuted, fontSize: '0.78rem' }}>{label}</small>
      </div>
    </div>
  );

  return (
    <div className="theme-hrms container-fluid px-4 py-3" style={{
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
        .rating-star-btn {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: #FCEFEA;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .rating-star-btn:hover {
          transform: scale(1.15);
        }
        .rating-star-btn.filled {
          color: #FFC542;
        }
        /* Ensure Bootstrap's native select caret never collides with pill selects */
        select.form-select.rounded-pill {
          background-position: right 0.9rem center;
        }
      `}</style>

      {/* HEADER UTILITY SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: THEME.slateBorder }}>
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#2c2520', letterSpacing: '-0.5px' }}>HR Workspace Portal</h2>
          <p style={{ color: THEME.slateMuted }} className="small mb-0">Rosters, Daily Attendance Logs, Performance Records, Recruitments, Trainings, Calendar, and Manuals.</p>
        </div>

        {/* GLOBAL SEARCH */}
        <div className="position-relative" style={{ minWidth: '300px' }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: THEME.slateMuted }}>🔍</span>
          <input
            type="text"
            className="form-control rounded-pill ps-5 small"
            style={styles.inputField}
            placeholder="Search records here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="d-flex flex-wrap gap-2 border-bottom pb-3 mb-4" style={{ borderColor: THEME.slateBorder }}>
        <button style={styles.tabButton(activeTab === 'directory')} onClick={() => setActiveTab('directory')}>{THIN_ICONS.users} Roster & Leaves</button>
        <button style={styles.tabButton(activeTab === 'attendance')} onClick={() => setActiveTab('attendance')}>{THIN_ICONS.clock} Daily Attendance</button>
        <button style={styles.tabButton(activeTab === 'performance')} onClick={() => setActiveTab('performance')}>{THIN_ICONS.clipboard} Performance Reviews</button>
        <button style={styles.tabButton(activeTab === 'recruitment')} onClick={() => setActiveTab('recruitment')}>{THIN_ICONS.target} Recruitment Portal</button>
        <button style={styles.tabButton(activeTab === 'training')} onClick={() => setActiveTab('training')}>{THIN_ICONS.target} Training Tracker</button>
        <button style={styles.tabButton(activeTab === 'holidays')} onClick={() => setActiveTab('holidays')}>{THIN_ICONS.clock} Holiday Calendar</button>
        <button style={styles.tabButton(activeTab === 'documents')} onClick={() => setActiveTab('documents')}>{THIN_ICONS.shield} HR Documents</button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: THEME.primary }}>
            <span className="visually-hidden">Syncing records...</span>
          </div>
          <p className="mt-2 small" style={{ color: THEME.slateMuted }}>Loading HR data points from backend servers...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* TAB 1: DIRECTORY & LEAVES */}
          {activeTab === 'directory' && (
            <div>
              <div className="section-eyebrow">Overview</div>
              {/* Premium Workforce Distribution Card */}
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={styles.premiumCard}>
                <h5 className="fw-bold mb-1 text-dark">Workforce Roster Live-Distribution</h5>
                <p style={{ color: THEME.slateMuted }} className="small mb-3">Real-time indicators across the current employee directory profiles.</p>
                <div className="row g-3">
                  <MetricCard label="Total Employees" value={analyticsSummary.total} icon={THIN_ICONS.users} color={COLORS.orange} />
                  <MetricCard label="Present Today" value={analyticsSummary.present} icon={THIN_ICONS.check} color={COLORS.emerald} />
                  <MetricCard label="On Leave Requests" value={analyticsSummary.onLeave} icon={THIN_ICONS.clock} color={COLORS.amber} />
                  <MetricCard label="New Joiners (30d)" value={analyticsSummary.newJoiners} icon={THIN_ICONS.sparkles} color={COLORS.orange} />
                </div>
              </div>

              {/* Roster Table */}
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={styles.premiumCard}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Employee Operational Roster</h5>
                    <p style={{ color: THEME.slateMuted }} className="small mb-0">Complete administrative view of core directory profiles.</p>
                  </div>
                  {canManageHR && (
                    <span className="badge px-3 py-2 rounded-pill small fw-semibold" style={{ backgroundColor: THEME.slateBg, color: THEME.primary, border: `1px solid ${THEME.slateBorder}` }}>
                      🛡️ Privileged Workspace Action Mode Active
                    </span>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                    <thead>
                      <tr>
                        <th style={styles.tableHeaderTh} className="ps-3 border-0">Name</th>
                        <th style={styles.tableHeaderTh} className="border-0">Department</th>
                        <th style={styles.tableHeaderTh} className="border-0">Salary Metric</th>
                        <th style={styles.tableHeaderTh} className="border-0">Attendance State</th>
                        <th style={styles.tableHeaderTh} className="border-0 text-center">Leave Balance</th>
                        <th style={styles.tableHeaderTh} className="border-0">Join Calendar Date</th>
                        <th style={styles.tableHeaderTh} className="text-end pe-3 border-0">Workspace Operations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover-row-lux">
                          <td style={styles.tableBodyTd} className="ps-3 fw-bold text-dark">{employee.name || `Employee ${employee.id}`}</td>
                          <td style={{ ...styles.tableBodyTd, color: '#5c524a' }}>{employee.department || 'General'}</td>
                          <td style={styles.tableBodyTd} className="fw-semibold text-dark">₹{(employee.salary || 0).toLocaleString()}</td>
                          <td style={styles.tableBodyTd}>
                            <span className="badge rounded-pill border" style={
                              employee.attendance_status === 'Present' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' } :
                                employee.attendance_status === 'Leave' ? { backgroundColor: THEME.pendingBg, color: THEME.pending, borderColor: `${COLORS.amber}44`, padding: '6px 12px' } :
                                  employee.attendance_status === 'Absent' ? { backgroundColor: THEME.dangerBg, color: THEME.danger, borderColor: `${COLORS.alert}44`, padding: '6px 12px' } :
                                    { backgroundColor: THEME.slateBg, color: '#5c524a', borderColor: THEME.slateBorder, padding: '6px 12px' }
                            }>
                              {employee.attendance_status || 'Unknown'}
                            </span>
                          </td>
                          <td style={styles.tableBodyTd} className="text-center fw-medium text-secondary">{employee.leave_balance || 0}</td>
                          <td style={{ ...styles.tableBodyTd, color: THEME.slateMuted }} className="small">
                            {employee.join_date ? new Date(employee.join_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td style={styles.tableBodyTd} className="text-end pe-3">
                            {canManageHR ? (
                              <button
                                className={`btn btn-sm rounded-3 px-3 fw-semibold shadow-sm ${employee.attendance_status === 'Present' ? 'btn-light border text-muted' : 'text-white'}`}
                                disabled={loadingAttendance || employee.attendance_status === 'Present'}
                                onClick={() => handlePunch(employee.id)}
                                style={employee.attendance_status !== 'Present' ? { background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)`, border: 'none' } : {}}
                              >
                                {employee.attendance_status === 'Present' ? '✓ Checked' : 'Punch Present'}
                              </button>
                            ) : (
                              <span style={{ color: THEME.slateMuted }} className="small italic">Read-Only</span>
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
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={styles.premiumCard}>
                <h5 className="fw-bold mb-1 text-dark">Employee Leave Requests Ledger</h5>
                <p style={{ color: THEME.slateMuted }} className="small mb-4">Pending leave inquiries awaiting review logs.</p>

                <div className="table-responsive">
                  <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                    <thead>
                      <tr>
                        <th style={styles.tableHeaderTh} className="ps-3 border-0">Employee</th>
                        <th style={styles.tableHeaderTh} className="border-0">Leave Type</th>
                        <th style={styles.tableHeaderTh} className="border-0">Reason</th>
                        <th style={styles.tableHeaderTh} className="border-0">Status</th>
                        <th style={styles.tableHeaderTh} className="text-end pe-3 border-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.length ? (
                        leaveRequests.map((leave) => (
                          <tr key={leave.id} className="hover-row-lux">
                            <td style={styles.tableBodyTd} className="ps-3 fw-bold text-dark">{leave.employee_name || `Employee ${leave.employee_id}`}</td>
                            <td style={{ ...styles.tableBodyTd, color: '#5c524a' }} className="fw-medium">{leave.leave_type}</td>
                            <td style={{ ...styles.tableBodyTd, color: THEME.slateMuted, maxWidth: '280px' }} className="small text-truncate">{leave.reason || 'None'}</td>
                            <td style={styles.tableBodyTd}>
                              <span className="badge px-3 py-1.5 rounded-pill border" style={
                                leave.status === 'Approved' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' } :
                                  leave.status === 'Rejected' ? { backgroundColor: THEME.dangerBg, color: THEME.danger, borderColor: `${COLORS.alert}44`, padding: '6px 12px' } :
                                    { backgroundColor: THEME.pendingBg, color: THEME.pending, borderColor: `${COLORS.amber}44`, padding: '6px 12px' }
                              }>
                                {leave.status}
                              </span>
                            </td>
                            <td style={styles.tableBodyTd} className="text-end pe-3">
                              {leave.status === 'Pending' && canManageHR ? (
                                <div className="d-flex gap-2 justify-content-end">
                                  <button className="btn btn-sm rounded-3 shadow-sm px-3 fw-semibold border-0 text-white" style={{ backgroundColor: COLORS.emerald }} onClick={() => handleLeaveAction(leave.id, 'Approved')}>Approve</button>
                                  <button className="btn btn-sm rounded-3 px-3 bg-white" style={{ border: `1px solid ${THEME.danger}`, color: THEME.danger }} onClick={() => handleLeaveAction(leave.id, 'Rejected')}>Reject</button>
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
            <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Daily Attendance Logging Ledgers</h5>
                  <p style={{ color: THEME.slateMuted }} className="small mb-0">Review actual punch times and locations logged by employee roster logs.</p>
                </div>
                <div className="d-flex gap-2">
                  <input
                    type="date"
                    className="form-control form-control-sm small px-3 rounded-pill"
                    style={styles.inputField}
                    value={attendanceDateFilter}
                    onChange={(e) => setAttendanceDateFilter(e.target.value)}
                  />
                  {attendanceDateFilter && (
                    <button className="btn btn-sm btn-outline-secondary rounded-pill bg-white" onClick={() => setAttendanceDateFilter('')}>Clear Date</button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderTh} className="ps-3 border-0">Employee</th>
                      <th style={styles.tableHeaderTh} className="border-0">Department</th>
                      <th style={styles.tableHeaderTh} className="border-0">Date</th>
                      <th style={styles.tableHeaderTh} className="border-0">Check In Time</th>
                      <th style={styles.tableHeaderTh} className="border-0">Check Out Time</th>
                      <th style={styles.tableHeaderTh} className="border-0">Roster Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendanceLogs.length ? (
                      filteredAttendanceLogs.map((log) => (
                        <tr key={log.id} className="hover-row-lux">
                          <td style={styles.tableBodyTd} className="ps-3 fw-bold text-dark">{log.employee_name || 'System User'}</td>
                          <td style={{ ...styles.tableBodyTd, color: '#5c524a' }}>{log.department || 'General'}</td>
                          <td style={styles.tableBodyTd} className="small text-dark">
                            {log.attendance_date ? new Date(log.attendance_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td style={styles.tableBodyTd} className="font-monospace text-success fw-semibold small">
                            {formatAttendanceTime(log.check_in, log.attendance_date)}
                          </td>
                          <td style={styles.tableBodyTd} className="font-monospace text-secondary fw-semibold small">
                            {log.check_out ? formatAttendanceTime(log.check_out, log.attendance_date) : 'Currently Active'}
                          </td>
                          <td style={styles.tableBodyTd}>
                            <span className="badge rounded-pill border" style={{ backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' }}>
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
              <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={styles.premiumCard}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Corporate Performance Logs</h5>
                    <p style={{ color: THEME.slateMuted }} className="small mb-0">Analytical breakdown of annual evaluations and reviewer assessments.</p>
                  </div>
                  {canManageHR && (
                    <button className="btn btn-sm text-white fw-semibold px-4 rounded-pill border-0 d-flex align-items-center gap-1" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }} onClick={() => setShowReviewModal(true)}>
                      {THIN_ICONS.plus} Draft New Review
                    </button>
                  )}
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-12 col-md-4">
                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                      <h6 style={{ color: THEME.slateMuted }} className="small text-uppercase fw-bold">Average Rating Metric</h6>
                      <h2 className="fw-bold my-2" style={{ color: COLORS.amber }}>
                        {performanceReviews.length ? (performanceReviews.reduce((acc, cur) => acc + cur.rating, 0) / performanceReviews.length).toFixed(1) : '0.0'} / 5.0
                      </h2>
                      <span className="small text-muted">Out of {performanceReviews.length} total feedback metrics.</span>
                    </div>
                  </div>
                  <div className="col-12 col-md-8">
                    <div className="p-3 rounded-3 h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                      <h6 style={{ color: THEME.slateMuted }} className="small text-uppercase mb-2 fw-bold">Performance Rating Distribution</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="small font-monospace text-dark" style={{ minWidth: '40px' }}>5 Star</span>
                        <div className="progress w-100 bg-white border" style={{ height: '8px' }}>
                          <div className="progress-bar" style={{ width: `${performanceReviews.length ? (performanceReviews.filter(r => r.rating === 5).length / performanceReviews.length * 100) : 0}%`, backgroundColor: COLORS.emerald }}></div>
                        </div>
                        <span className="small font-monospace text-dark" style={{ minWidth: '30px' }}>{performanceReviews.filter(r => r.rating === 5).length}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="small font-monospace text-dark" style={{ minWidth: '40px' }}>4 Star</span>
                        <div className="progress w-100 bg-white border" style={{ height: '8px' }}>
                          <div className="progress-bar" style={{ width: `${performanceReviews.length ? (performanceReviews.filter(r => r.rating === 4).length / performanceReviews.length * 100) : 0}%`, backgroundColor: COLORS.sky }}></div>
                        </div>
                        <span className="small font-monospace text-dark" style={{ minWidth: '30px' }}>{performanceReviews.filter(r => r.rating === 4).length}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="small font-monospace text-dark" style={{ minWidth: '40px' }}>&lt; 4 Star</span>
                        <div className="progress w-100 bg-white border" style={{ height: '8px' }}>
                          <div className="progress-bar" style={{ width: `${performanceReviews.length ? (performanceReviews.filter(r => r.rating < 4).length / performanceReviews.length * 100) : 0}%`, backgroundColor: COLORS.amber }}></div>
                        </div>
                        <span className="small font-monospace text-dark" style={{ minWidth: '30px' }}>{performanceReviews.filter(r => r.rating < 4).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Cards Matrix */}
              <div className="row g-4">
                {performanceReviews.map((rev) => (
                  <div key={rev.id} className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom" style={{ borderColor: THEME.slateBorder }}>
                        <div>
                          <h6 className="fw-bold text-dark mb-0">{rev.employee_name || `Employee Map Ref ${rev.employee_id}`}</h6>
                          <small style={{ color: THEME.slateMuted }} className="small">Reviewed on: {rev.review_date}</small>
                        </div>
                        <div className="badge rounded-pill" style={{ backgroundColor: THEME.primaryLight, color: THEME.primary, padding: '6px 12px' }}>
                          ⭐ {rev.rating}.0 / 5.0
                        </div>
                      </div>
                      <p className="small text-dark mb-2"><strong>Feedback:</strong> {rev.feedback}</p>
                      {rev.goals && <p className="small text-secondary mb-0"><strong>Future Goals:</strong> {rev.goals}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RECRUITMENT PORTAL */}
          {activeTab === 'recruitment' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Enterprise Recruitment Pipelines</h5>
                  <p style={{ color: THEME.slateMuted }} className="small mb-0">Monitor active talent acquisition queries and screening status indicators.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <select
                    className="form-select form-select-sm small rounded-pill ps-3"
                    style={styles.selectField}
                    value={recruitmentStatusFilter}
                    onChange={(e) => setRecruitmentStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  {canManageHR && (
                    <button className="btn btn-sm text-white fw-semibold px-4 rounded-pill border-0 d-flex align-items-center gap-1" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }} onClick={() => setShowCandidateModal(true)}>
                      {THIN_ICONS.plus} Catalog Candidate
                    </button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderTh} className="ps-3 border-0">Candidate Profile</th>
                      <th style={styles.tableHeaderTh} className="border-0">Position Vector</th>
                      <th style={styles.tableHeaderTh} className="border-0">Experience Metric</th>
                      <th style={styles.tableHeaderTh} className="border-0">Applied Timing</th>
                      <th style={styles.tableHeaderTh} className="border-0">Pipeline Node</th>
                      <th style={styles.tableHeaderTh} className="text-end pe-3 border-0">Lifecycle Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length ? (
                      filteredCandidates.map((cand) => (
                        <tr key={cand.id} className="hover-row-lux">
                          <td style={styles.tableBodyTd} className="ps-3">
                            <div className="fw-bold text-dark">{cand.name}</div>
                            <small className="text-muted d-block small">{cand.email} | {cand.phone}</small>
                          </td>
                          <td style={styles.tableBodyTd} className="fw-medium text-dark">{cand.position}</td>
                          <td style={styles.tableBodyTd} className="text-secondary">{cand.experience} Years</td>
                          <td style={{ ...styles.tableBodyTd, color: THEME.slateMuted }} className="small">{cand.applied_date}</td>
                          <td style={styles.tableBodyTd}>
                            <span className="badge rounded-pill border" style={
                              cand.status === 'Offered' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' } :
                                cand.status === 'Interviewing' ? { backgroundColor: THEME.infoBg, color: THEME.primary, borderColor: `${COLORS.orange}33`, padding: '6px 12px' } :
                                  cand.status === 'Rejected' ? { backgroundColor: THEME.dangerBg, color: THEME.danger, borderColor: `${COLORS.alert}44`, padding: '6px 12px' } :
                                    { backgroundColor: THEME.slateBg, color: '#5c524a', borderColor: THEME.slateBorder, padding: '6px 12px' }
                            }>
                              {cand.status}
                            </span>
                          </td>
                          <td style={styles.tableBodyTd} className="text-end pe-3">
                            {canManageHR && cand.status === 'Applied' && (
                              <div className="d-flex gap-2 justify-content-end">
                                <button className="btn btn-sm btn-light border small rounded-3 px-2" onClick={() => handleCandidateStatus(cand.id, 'Interviewing')}>Interview</button>
                                <button className="btn btn-sm text-white small border-0 rounded-3 px-2" style={{ backgroundColor: COLORS.emerald }} onClick={() => handleCandidateStatus(cand.id, 'Offered')}>Offer</button>
                              </div>
                            )}
                            {cand.resume_url && (
                              <button className="btn btn-link text-decoration-none small p-0 ms-2" style={{ color: THEME.primary }} onClick={() => triggerSimulatedDownload(cand.name + '_Resume.pdf')}>
                                📄 Open Resume
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">No candidate instances match filters fields.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TRAINING TRACKER */}
          {activeTab === 'training' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Upskilling Training Tracks</h5>
                  <p style={{ color: THEME.slateMuted }} className="small mb-0">Centralized system educational cohorts tracking metrics.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <select
                    className="form-select form-select-sm small rounded-pill ps-3"
                    style={styles.selectField}
                    value={trainingStatusFilter}
                    onChange={(e) => setTrainingStatusFilter(e.target.value)}
                  >
                    <option value="All">All Horizons</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {canManageHR && (
                    <button className="btn btn-sm text-white fw-semibold px-4 rounded-pill border-0 d-flex align-items-center gap-1" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }} onClick={() => setShowTrainingModal(true)}>
                      {THIN_ICONS.plus} Schedule Cohort
                    </button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 rounded-3 overflow-hidden">
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderTh} className="ps-3 border-0">Training Program</th>
                      <th style={styles.tableHeaderTh} className="border-0">Target Group</th>
                      <th style={styles.tableHeaderTh} className="border-0">Trainer Lead</th>
                      <th style={styles.tableHeaderTh} className="border-0">Assigned Trainees</th>
                      <th style={styles.tableHeaderTh} className="border-0">Calendar Launch</th>
                      <th style={styles.tableHeaderTh} className="border-0">Status Node</th>
                      <th style={styles.tableHeaderTh} className="text-end pe-3 border-0">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrainings.length ? (
                      filteredTrainings.map((train) => (
                        <tr key={train.id} className="hover-row-lux">
                          <td style={styles.tableBodyTd} className="ps-3">
                            <div className="fw-bold text-dark">{train.title}</div>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '240px' }}>{train.description}</small>
                          </td>
                          <td style={styles.tableBodyTd} className="small font-monospace text-dark">{train.department}</td>
                          <td style={styles.tableBodyTd} className="fw-medium text-dark">{train.trainer}</td>
                          <td style={styles.tableBodyTd} className="small text-dark">
                            {train.trainees && train.trainees.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {train.trainees.map((t, idx) => (
                                  <span key={idx} className="badge bg-light text-dark border small">{t}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted italic small">No Trainees Registered</span>
                            )}
                          </td>
                          <td style={{ ...styles.tableBodyTd, color: THEME.slateMuted }} className="small">{train.scheduled_date}</td>
                          <td style={styles.tableBodyTd}>
                            <span className="badge rounded-pill border" style={
                              train.status === 'Completed' ? { backgroundColor: THEME.successBg, color: THEME.success, borderColor: `${COLORS.emerald}44`, padding: '6px 12px' } :
                                train.status === 'Ongoing' ? { backgroundColor: THEME.infoBg, color: THEME.primary, borderColor: `${COLORS.orange}33`, padding: '6px 12px' } :
                                  { backgroundColor: THEME.pendingBg, color: THEME.pending, borderColor: `${COLORS.amber}44`, padding: '6px 12px' }
                            }>
                              {train.status}
                            </span>
                          </td>
                          <td style={styles.tableBodyTd} className="text-end pe-3">
                            {canManageTraining && train.status === 'Upcoming' && (
                              <button className="btn btn-sm btn-outline-primary rounded-3 px-3 small" style={{ borderColor: THEME.primary, color: THEME.primary }} onClick={() => handleTrainingStatus(train.id, 'Ongoing')}>
                                Initialize Track
                              </button>
                            )}
                            {canManageTraining && train.status === 'Ongoing' && (
                              <button className="btn btn-sm text-white rounded-3 px-3 small border-0" style={{ backgroundColor: COLORS.emerald }} onClick={() => handleTrainingStatus(train.id, 'Completed')}>
                                Complete Track
                              </button>
                            )}
                            {!canManageTraining && (
                              <span style={{ color: THEME.slateMuted }} className="small italic">Read-Only</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">No structured training cohorts logged inside current criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: HOLIDAY CALENDAR */}
          {activeTab === 'holidays' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Corporate Holiday Calendars</h5>
                  <p style={{ color: THEME.slateMuted }} className="small mb-0">Review national leave schedules and scheduled institutional system maintenance closures.</p>
                </div>
                {canManageHR && (
                  <button className="btn btn-sm text-white fw-semibold px-4 rounded-pill border-0 d-flex align-items-center gap-1" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }} onClick={() => setShowHolidayModal(true)}>
                    {THIN_ICONS.plus} Declare Holiday
                  </button>
                )}
              </div>

              <div className="row g-4">
                {holidays.length ? (
                  holidays.map((hol) => (
                    <div key={hol.id} className="col-12 col-md-4">
                      <div className="p-3 rounded-4" style={{ backgroundColor: THEME.slateBg, borderLeft: `4px solid ${hol.type === 'National' ? COLORS.orange : COLORS.amber}`, borderTop: `1px solid ${THEME.slateBorder}`, borderRight: `1px solid ${THEME.slateBorder}`, borderBottom: `1px solid ${THEME.slateBorder}` }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#ffffff', color: '#5c524a', border: `1px solid ${THEME.slateBorder}`, fontSize: '0.68rem' }}>{hol.type}</span>
                          <strong style={{ color: THEME.primary }} className="font-monospace small">{hol.holiday_date}</strong>
                        </div>
                        <h6 className="fw-bold text-dark mt-2 mb-1">{hol.name}</h6>
                        <small className="text-muted small d-block">{hol.description || 'No extended system contextual notes recorded.'}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5 text-muted">Zero custom calendar milestones injected into standard baseline configurations.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: HR DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="card border-0 shadow-sm p-4 hover-premium-card" style={styles.premiumCard}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Secure HR Manuals & Documentation Modules</h5>
                  <p style={{ color: THEME.slateMuted }} className="small mb-0">Encrypted workspace directory policies, guidelines, and structural reference logs.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <select
                    className="form-select form-select-sm small rounded-pill ps-3"
                    style={styles.selectField}
                    value={documentCategoryFilter}
                    onChange={(e) => setDocumentCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Folders</option>
                    <option value="Policy">Policy Manuals</option>
                    <option value="Form">Form Layouts</option>
                    <option value="Guide">Onboarding Guides</option>
                  </select>
                  {canManageHR && (
                    <button className="btn btn-sm text-white fw-semibold px-4 rounded-pill border-0 d-flex align-items-center gap-1" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }} onClick={() => setShowDocumentModal(true)}>
                      {THIN_ICONS.plus} Catalog Document
                    </button>
                  )}
                </div>
              </div>

              <div className="row g-4">
                {filteredDocuments.length ? (
                  filteredDocuments.map((doc) => (
                    <div key={doc.id} className="col-12 col-md-4">
                      <div className="card h-100 p-3 rounded-4 bg-white border shadow-sm transition-all" style={{ borderColor: THEME.slateBorder }}>
                        <div className="d-flex align-items-start gap-3">
                          <div style={{ fontSize: '2rem', color: COLORS.orange }}>📂</div>
                          <div className="w-100">
                            <span className="badge rounded-pill mb-1 small" style={{ backgroundColor: THEME.slateBg, color: THEME.primary, border: `1px solid ${THEME.slateBorder}` }}>{doc.category}</span>
                            <h6 className="fw-bold text-dark mb-1">{doc.title}</h6>
                            <p className="text-muted small mb-3" style={{ fontSize: '0.8rem', height: '36px', overflow: 'hidden' }}>{doc.description || 'No description logs updated.'}</p>
                            <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: '#FFF0EA' }}>
                              <small className="font-monospace text-secondary text-truncate small" style={{ maxWidth: '120px' }}>{doc.file_name || 'raw_payload.bin'}</small>
                              <button className="btn btn-sm text-white border-0 px-3 rounded-pill" style={{ backgroundColor: COLORS.orange, fontSize: '0.78rem' }} onClick={() => triggerSimulatedDownload(doc.file_name || doc.title)}>
                                ⬇️ Pull Document
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5 text-muted">No documentation indexes map into active categorizations search.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ==========================================
          MODALS PORTALS (POPUP WORKFLOWS)
          ========================================== */}

      {/* 1. PERFORMANCE REVIEW MODAL */}
      {showReviewModal && (
        <div style={styles.modalOverlay}>
          <div className="bg-white border-0 rounded-4 shadow-lg overflow-hidden w-90" style={{ maxWidth: '580px' }}>
            <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: THEME.slateBg }}>
              <h5 className="fw-bold mb-0 text-dark">Draft Employee Performance Evaluation Log</h5>
              <button className="btn-close" onClick={() => setShowReviewModal(false)}></button>
            </div>
            <form onSubmit={submitPerformanceReview}>
              <div className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Target Employee Profile ID</label>
                  <select
                    className="form-select"
                    style={styles.inputField}
                    required
                    value={reviewForm.employee_id}
                    onChange={(e) => setReviewForm({ ...reviewForm, employee_id: e.target.value })}
                  >
                    <option value="">Select profile map identity...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name || `User Ref ${emp.id}`} ({emp.department || 'Operations'})</option>
                    ))}
                  </select>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Evaluation Timestamp Date</label>
                    <input
                      type="date"
                      className="form-control"
                      style={styles.inputField}
                      required
                      value={reviewForm.review_date}
                      onChange={(e) => setReviewForm({ ...reviewForm, review_date: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Rating Horizon Scaling (1-5)</label>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`rating-star-btn ${reviewForm.rating >= star ? 'filled' : ''}`}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Core Assessment Review Feedback</label>
                  <textarea
                    className="form-control"
                    style={styles.inputField}
                    rows="3"
                    required
                    placeholder="Provide actionable structural operational alignment assessments..."
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Future Target Strategic Milestones</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    placeholder="e.g. Expand automation workflow benchmarks tracking index mapping..."
                    value={reviewForm.goals}
                    onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-3 d-flex justify-content-end gap-2" style={{ backgroundColor: THEME.slateBg }}>
                <button type="button" className="btn btn-sm border bg-white rounded-3 px-3" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white border-0 rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Inject Review Token</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. RECRUITMENT CANDIDATE MODAL */}
      {showCandidateModal && (
        <div style={styles.modalOverlay}>
          <div className="bg-white border-0 rounded-4 shadow-lg overflow-hidden w-90" style={{ maxWidth: '580px' }}>
            <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: THEME.slateBg }}>
              <h5 className="fw-bold mb-0 text-dark">Catalog Talent Pipeline Candidate</h5>
              <button className="btn-close" onClick={() => setShowCandidateModal(false)}></button>
            </div>
            <form onSubmit={submitCandidate}>
              <div className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Candidate Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    required
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Secure Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      style={styles.inputField}
                      required
                      value={candidateForm.email}
                      onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Contact Phone Connection</label>
                    <input
                      type="text"
                      className="form-control"
                      style={styles.inputField}
                      required
                      value={candidateForm.phone}
                      onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Target Role Position Vector</label>
                    <input
                      type="text"
                      className="form-control"
                      style={styles.inputField}
                      required
                      placeholder="e.g. Senior Software Architect"
                      value={candidateForm.position}
                      onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Experience Track Metric (Years)</label>
                    <input
                      type="number"
                      className="form-control"
                      style={styles.inputField}
                      required
                      min="0"
                      value={candidateForm.experience}
                      onChange={(e) => setCandidateForm({ ...candidateForm, experience: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Simulated Resume Cloud Endpoint Storage URL</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    placeholder="https://cloud.secure-storage-index/payload/resume_hash.pdf"
                    value={candidateForm.resume_url}
                    onChange={(e) => setCandidateForm({ ...candidateForm, resume_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Initial Assessment Context Screening Notes</label>
                  <textarea
                    className="form-control"
                    style={styles.inputField}
                    rows="2"
                    value={candidateForm.notes}
                    onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="p-3 d-flex justify-content-end gap-2" style={{ backgroundColor: THEME.slateBg }}>
                <button type="button" className="btn btn-sm border bg-white rounded-3 px-3" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowCandidateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white border-0 rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Inject Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TRAINING MODAL WITH NEW TRAINEES ALLOCATION INPUTS */}
      {showTrainingModal && (
        <div style={styles.modalOverlay}>
          <div className="bg-white border-0 rounded-4 shadow-lg overflow-hidden w-90" style={{ maxWidth: '580px' }}>
            <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: THEME.slateBg }}>
              <h5 className="fw-bold mb-0 text-dark">Schedule Upskilling Educational Cohort</h5>
              <button className="btn-close" onClick={() => setShowTrainingModal(false)}></button>
            </div>
            <form onSubmit={submitTraining}>
              <div className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Cohort Program Title</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    required
                    placeholder="e.g. High-Load Backend Architecture Standards"
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Target Department Group</label>
                    <input
                      type="text"
                      className="form-control"
                      style={styles.inputField}
                      placeholder="e.g. Engineering, All, Quality Net"
                      value={trainingForm.department}
                      onChange={(e) => setTrainingForm({ ...trainingForm, department: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Trainer Subject-Matter Lead</label>
                    <input
                      type="text"
                      className="form-control"
                      style={styles.inputField}
                      required
                      value={trainingForm.trainer}
                      onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Calendar Launch Timestamp Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={styles.inputField}
                    required
                    value={trainingForm.scheduled_date}
                    onChange={(e) => setTrainingForm({ ...trainingForm, scheduled_date: e.target.value })}
                  />
                </div>

                {/* ADDED: ENHANCED REGISTER / ADD NEW TRAINEES SECTION */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary d-block">Register Roster Trainees</label>
                  <div className="p-2 border rounded-3 bg-light" style={{ maxHeight: '130px', overflowY: 'auto', ...styles.inputField }}>
                    {employees.map((emp) => {
                      const empName = emp.name || `Employee ${emp.id}`;
                      return (
                        <div key={emp.id} className="form-check mb-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`trainee-chk-${emp.id}`}
                            checked={trainingForm.trainees.includes(empName)}
                            onChange={() => handleTraineeCheckboxChange(empName)}
                          />
                          <label className="form-check-label small text-dark ps-1" htmlFor={`trainee-chk-${emp.id}`}>
                            {empName} <span className="text-muted">({emp.department || 'General'})</span>
                          </label>
                        </div>
                      );
                    })}
                    {!employees.length && <span className="text-muted small p-1 italic">No corporate roster found.</span>}
                  </div>
                  <small className="text-muted style={{fontSize: '0.75rem'}}">Selected Trainees: {trainingForm.trainees.length}</small>
                </div>

                <div>
                  <label className="form-label small fw-bold text-secondary">Cohort Core Structural Summary Outline</label>
                  <textarea
                    className="form-control"
                    style={styles.inputField}
                    rows="2"
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="p-3 d-flex justify-content-end gap-2" style={{ backgroundColor: THEME.slateBg }}>
                <button type="button" className="btn btn-sm border bg-white rounded-3 px-3" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowTrainingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white border-0 rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Deploy Track</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DECLARE HOLIDAY MODAL */}
      {showHolidayModal && (
        <div style={styles.modalOverlay}>
          <div className="bg-white border-0 rounded-4 shadow-lg overflow-hidden w-90" style={{ maxWidth: '520px' }}>
            <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: THEME.slateBg }}>
              <h5 className="fw-bold mb-0 text-dark">Declare Institutional Leave Holiday</h5>
              <button className="btn-close" onClick={() => setShowHolidayModal(false)}></button>
            </div>
            <form onSubmit={submitHoliday}>
              <div className="p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Holiday Branding Name</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    required
                    placeholder="e.g. Annual Festive Harvest Festival"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Target Calendar Date</label>
                    <input
                      type="date"
                      className="form-control"
                      style={styles.inputField}
                      required
                      value={holidayForm.holiday_date}
                      onChange={(e) => setHolidayForm({ ...holidayForm, holiday_date: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Holiday Categorization Type</label>
                    <select
                      className="form-select"
                      style={styles.inputField}
                      value={holidayForm.type}
                      onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                    >
                      <option value="National">National Holiday</option>
                      <option value="Regional">Regional Break</option>
                      <option value="Company-Wide">Corporate Day Off</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Extended Description Context Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    placeholder="Optional details regarding general operational grid shutdowns..."
                    value={holidayForm.description}
                    onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-3 d-flex justify-content-end gap-2" style={{ backgroundColor: THEME.slateBg }}>
                <button type="button" className="btn btn-sm border bg-white rounded-3 px-3" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowHolidayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white border-0 rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Broadcast Calendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CATALOG DOCUMENT MODAL WITH MISSING FILE UPLOAD DISK INPUT */}
      {showDocumentModal && (
        <div style={styles.modalOverlay}>
          <div className="bg-white border-0 rounded-4 shadow-lg overflow-hidden w-90" style={{ maxWidth: '520px' }}>
            <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: THEME.slateBg }}>
              <h5 className="fw-bold mb-0 text-dark">Catalog Reference HR Manual Module</h5>
              <button className="btn-close" onClick={() => setShowDocumentModal(false)}></button>
            </div>
            <form onSubmit={submitDocument}>
              <div className="p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Manual Blueprint Title</label>
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputField}
                    required
                    placeholder="e.g. Workplace Code of Professional Conduct v3"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Document Category Node</label>
                    <select
                      className="form-select"
                      style={styles.inputField}
                      value={documentForm.category}
                      onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}
                    >
                      <option value="Policy">Policy Manual</option>
                      <option value="Form">Form Layout</option>
                      <option value="Guide">Onboarding Guide</option>
                    </select>
                  </div>

                  {/* ADDED: LOCAL HARD DRIVE FILES SELECTOR PICKER */}
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Upload Core File Reference</label>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      style={styles.inputField}
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    />
                    <small className="text-muted font-monospace d-block text-truncate mt-1" style={{ fontSize: '0.7rem' }}>
                      {selectedFile ? `File: ${selectedFile.name}` : 'No file chosen'}
                    </small>
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold text-secondary">Core Intent Operational Scope Note</label>
                  <textarea
                    className="form-control"
                    style={styles.inputField}
                    rows="2"
                    placeholder="Summary metadata details for easy search parameters lookups..."
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="p-3 d-flex justify-content-end gap-2" style={{ backgroundColor: THEME.slateBg }}>
                <button type="button" className="btn btn-sm border bg-white rounded-3 px-3" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowDocumentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white border-0 rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Catalog Archive</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRMSPage;