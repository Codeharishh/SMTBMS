// src/pages/EmployeeAttendancePage.js
import React, { useEffect, useState, useMemo } from 'react';
import { fetchEmployeeProfile } from '../services/employeeService';
import { fetchTodayAttendance, fetchAttendanceHistory, punchIn, punchOut } from '../services/attendanceService';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX (matched to MaterialsPage THIN_ICONS) ─
const THIN_ICONS = {
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6"></line>
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6"></line>
      <line vectorEffect="non-scaling-stroke" x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10"></circle>
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  logIn: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
      <polyline vectorEffect="non-scaling-stroke" points="10 17 15 12 10 7"></polyline>
      <line vectorEffect="non-scaling-stroke" x1="15" y1="12" x2="3" y2="12"></line>
    </svg>
  ),
  logOut: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline vectorEffect="non-scaling-stroke" points="16 17 21 12 16 7"></polyline>
      <line vectorEffect="non-scaling-stroke" x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  activity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="20 6 9 17 4 12"></polyline>
    </svg>
  )
};

const EmployeeAttendancePage = () => {
  const user = JSON.parse(localStorage.getItem('smtbms_user') || '{}');
  const [profile, setProfile] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profData, todayData, histData] = await Promise.all([
        fetchEmployeeProfile().catch(() => null),
        fetchTodayAttendance().catch(() => null),
        fetchAttendanceHistory().catch(() => [])
      ]);
      setProfile(profData);
      setTodayRecord(todayData);
      setHistory(histData || []);
    } catch (err) {
      console.error('Failed to load attendance page data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    try {
      await punchIn();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to punch in');
    }
  };

  const handlePunchOut = async () => {
    try {
      await punchOut();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to punch out');
    }
  };

  // Helper to calculate duration
  const calculateDuration = (checkInStr, checkOutStr) => {
    if (!checkInStr) return '--';

    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      const today = new Date();
      const [hours, minutes] = timeStr.split(':');
      today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return today;
    };

    const inTime = parseTime(checkInStr);
    const outTime = checkOutStr ? parseTime(checkOutStr) : new Date();

    if (!inTime) return '--';

    const diffMs = outTime - inTime;
    if (diffMs < 0) return '--';

    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    const isToday = d.toDateString() === new Date().toDateString();
    const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    if (isToday) {
      return (
        <span className="d-flex align-items-center gap-2">
          {formatted}
          <span className="badge rounded-pill px-2" style={{ fontSize: '0.7rem', backgroundColor: `${COLORS.indigo}14`, color: COLORS.indigo }}>TODAY</span>
        </span>
      );
    }
    return formatted;
  };

  // Chart data calculations
  const chartData = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;

    const recent = history.slice(0, 7);
    recent.forEach(r => {
      const status = (r.status || '').toLowerCase();
      if (status.includes('late')) late++;
      else if (status.includes('absent')) absent++;
      else present++;
    });

    const total = present + late + absent;
    const rate = total === 0 ? 0 : Math.round(((present + late) / total) * 100);

    const chartDataValues = total === 0 ? [1] : [present, late, absent];
    const chartColors = total === 0 ? ['#E2E8F0'] : [COLORS.emerald, COLORS.amber, COLORS.alert];
    return {
      present, late, absent, rate,
      chart: {
        labels: total === 0 ? ['No Data'] : ['Present', 'Late', 'Absent'],
        datasets: [{
          data: chartDataValues,
          backgroundColor: chartColors,
          borderWidth: 0,
          cutout: '75%'
        }]
      }
    };
  }, [history]);

  const todayRecordActual = todayRecord?.attendance || {};
  const isPunchedIn = todayRecord?.punchedIn;
  const isPunchedOut = todayRecord?.punchedOut;
  const workedTimeStr = calculateDuration(todayRecordActual.check_in, todayRecordActual.check_out);

  const MetricCard = ({ label, value, sub, icon, color, action }) => (
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
        <div className="px-3 pb-2">
          <small className="fw-medium" style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block' }}>{sub}</small>
        </div>
      )}
      {action && <div className="px-3 pb-3">{action}</div>}
    </div>
  );

  // ── DEDICATED STATUS CARD — badge now sits right next to the icon,
  //     matching MetricCard's icon + value inline layout ──
  const StatusMetricCard = ({ status, sub, icon, color }) => {
    const statusKey = (status || '').toLowerCase();
    let badgeClass = 'status-present';
    if (statusKey.includes('late')) badgeClass = 'status-late';
    if (statusKey.includes('absent') || statusKey.includes('no session')) badgeClass = 'status-absent';

    return (
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
            <span className={`status-badge ${badgeClass}`} style={{ fontSize: '0.85rem' }}>
              {status}
            </span>
            <span className="d-block fw-semibold mt-1" style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.25 }}>Status</span>
          </div>
        </div>
        {sub && (
          <div className="px-3 pb-3">
            <small className="fw-medium" style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block' }}>{sub}</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="theme-materials container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        /* Premium Card Configurations */
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
        .hover-btn-lux {
          transition: all 0.2s ease !important;
        }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* PUNCH BUTTONS (matched to app's orange gradient system) */
        .punch-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          border: none;
        }
        .punch-btn-primary {
          background: linear-gradient(135deg, ${COLORS.emerald} 0%, #26bba8 100%);
          color: white;
        }
        .punch-btn-primary:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(46, 217, 195, 0.3);
        }
        .punch-btn-danger {
          background: linear-gradient(135deg, ${COLORS.alert} 0%, #f25555 100%);
          color: white;
        }
        .punch-btn-danger:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
        }

        /* TIMELINE */
        .timeline-item {
          position: relative;
          padding-left: 28px;
          margin-bottom: 24px;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: -30px;
          width: 2px;
          background: #f1f0f9;
        }
        .timeline-item:last-child::before {
          display: none;
        }
        .timeline-dot {
          position: absolute;
          left: -4px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid;
        }
        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.75rem;
          display: inline-block;
          line-height: 1.3;
        }
        .status-late {
          background: ${COLORS.amber}18;
          color: #b45309;
          border: 1px solid ${COLORS.amber}44;
        }
        .status-present {
          background: ${COLORS.emerald}14;
          color: #0f9488;
          border: 1px solid ${COLORS.emerald}44;
        }
        .status-absent {
          background: ${COLORS.alert}14;
          color: #d64a4a;
          border: 1px solid ${COLORS.alert}44;
        }

        /* ATTENDANCE REGISTER — FLOATING-ROW TABLE (matched to Materials table) */
        .theme-materials table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-materials th {
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
        .theme-materials td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-materials tr td:first-child {
          border-top-left-radius: 14px !important;
          border-bottom-left-radius: 14px !important;
        }
        .theme-materials tr td:last-child {
          border-top-right-radius: 14px !important;
          border-bottom-right-radius: 14px !important;
        }
        .theme-materials tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-materials tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
          background-color: #ffffff !important;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.calendar}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>My Attendance</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Track your daily check-ins, hours worked, and attendance history</p>
          </div>
        </div>
      </div>

      {/* PROFILE STRIP */}
      <div className="card border-0 h-100 metric-card-lux mb-4" style={{ borderRadius: '22px', background: '#ffffff' }}>
        <div className="p-4 d-flex align-items-center justify-content-between flex-wrap gap-4">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff', color: COLORS.indigo, border: `2px solid ${COLORS.indigo}40` }}>
              {THIN_ICONS.calendar}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{profile?.role || user?.role || 'Employee'}</div>
            </div>
          </div>

          <div className="d-none d-md-block" style={{ width: '1px', height: '40px', backgroundColor: '#f1f0f9' }}></div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{profile?.designation || 'Software Engineer'}</div>
          </div>

          <div className="d-none d-md-block" style={{ width: '1px', height: '40px', backgroundColor: '#f1f0f9' }}></div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Type</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Full Time</div>
          </div>

          <div className="d-none d-md-block" style={{ width: '1px', height: '40px', backgroundColor: '#f1f0f9' }}></div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Join Date</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
              {profile?.join_date ? new Date(profile.join_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '20 Nov 2023'}
            </div>
          </div>

          <div className="d-none d-md-block" style={{ width: '1px', height: '40px', backgroundColor: '#f1f0f9' }}></div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reports To</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Engineering Manager</div>
          </div>
        </div>
      </div>

      <div className="section-eyebrow">Today's Overview</div>

      {/* 4 METRIC CARDS GRID (matched to MaterialsPage cards) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            label="Check In"
            value={formatTime(todayRecordActual?.check_in)}
            sub="Logged in via Database"
            icon={THIN_ICONS.logIn}
            color={COLORS.emerald}
            action={!isPunchedIn && (
              <button className="punch-btn punch-btn-primary w-100" onClick={handlePunchIn}>
                Punch In Now
              </button>
            )}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            label="Check Out"
            value={formatTime(todayRecordActual?.check_out)}
            sub="Logged out via Database"
            icon={THIN_ICONS.logOut}
            color={COLORS.alert}
            action={isPunchedIn && !isPunchedOut && (
              <button className="punch-btn punch-btn-danger w-100" onClick={handlePunchOut}>
                Punch Out Now
              </button>
            )}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            label="Hours Worked"
            value={workedTimeStr}
            sub="Today"
            icon={THIN_ICONS.clock}
            color={COLORS.violet}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatusMetricCard
            status={todayRecordActual?.status || 'No Session'}
            sub="Based on login time"
            icon={THIN_ICONS.activity}
            color={COLORS.amber}
          />
        </div>
      </div>

      <div className="section-eyebrow">Activity & Summary</div>

      <div className="row g-3 mb-4">
        {/* Today's Activity */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm overflow-hidden hover-premium-card h-100" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
            <div className="p-4">
              <h5 className="fw-bold mb-4" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Today's Activity</h5>

              <div className="ms-2 mt-3">
                <div className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: COLORS.emerald }}></div>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>Check In</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>Office</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{formatTime(todayRecordActual?.check_in)}</div>
                      <div style={{ color: COLORS.emerald, fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>Completed</div>
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: COLORS.indigo }}></div>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>Working Time</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>{isPunchedOut ? 'Completed' : (isPunchedIn ? 'In Progress' : 'Pending')}</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{workedTimeStr}</div>
                      <div style={{ color: COLORS.indigo, fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>{isPunchedOut ? 'Closed' : (isPunchedIn ? 'Active' : '--')}</div>
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: COLORS.amber }}></div>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>Expected Checkout</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>Office</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                        {todayRecordActual?.check_out ? formatTime(todayRecordActual?.check_out) : '06:00 PM'}
                      </div>
                      <div style={{ color: COLORS.amber, fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>
                        {isPunchedOut ? 'Completed' : 'Upcoming'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm overflow-hidden hover-premium-card h-100" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
            <div className="p-4">
              <h5 className="fw-bold mb-4" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Attendance Summary (Last 7 Days)</h5>

              <div className="row align-items-center">
                <div className="col-12 col-md-5 text-center position-relative mb-4 mb-md-0">
                  <div style={{ width: '160px', height: '160px', margin: '0 auto', position: 'relative' }}>
                    <Doughnut data={chartData.chart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } } }} />
                    <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', lineHeight: '1' }}>{chartData.rate}%</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Attendance<br />Rate</div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-7">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ border: '1px solid #f1f0f9', backgroundColor: '#FAF8FF' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.emerald }}></div>
                        <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Present</span>
                      </div>
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>{chartData.present} Days</div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ border: '1px solid #f1f0f9', backgroundColor: '#FAF8FF' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.amber }}></div>
                        <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Late</span>
                      </div>
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>{chartData.late} Days</div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ border: '1px solid #f1f0f9', backgroundColor: '#FAF8FF' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.alert }}></div>
                        <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Absent</span>
                      </div>
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>{chartData.absent} Days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-eyebrow">Records</div>

      {/* ATTENDANCE RECORDS TABLE (matched to Materials floating-row table) */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Attendance Records</h5>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Live from DB · All Time</span>
        </div>

        <div className="table-responsive p-4 pt-2">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th className="px-4">Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours Worked</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((record) => {
                  let statusClass = 'status-present';
                  if ((record.status || '').toLowerCase().includes('late')) statusClass = 'status-late';
                  if ((record.status || '').toLowerCase().includes('absent')) statusClass = 'status-absent';

                  return (
                    <tr key={record.id}>
                      <td className="px-4 fw-bold" style={{ color: '#1e293b' }}>
                        {formatDate(record.attendance_date)}
                      </td>
                      <td>{formatTime(record.check_in)}</td>
                      <td>{formatTime(record.check_out)}</td>
                      <td>{calculateDuration(record.check_in, record.check_out)}</td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          {record.status || 'Present'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5" style={{ color: '#94a3b8' }}>
                    {loading ? (
                      <div><div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div> Loading records...</div>
                    ) : (
                      "No attendance records found."
                    )}
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

export default EmployeeAttendancePage;