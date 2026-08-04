// src/pages/HolidayCalendarPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday } from '../services/hrService';
import { getCurrentUser } from '../utils/authHelpers';

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

const THIN_ICONS = {
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  flag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line vectorEffect="non-scaling-stroke" x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
  )
};

const HolidayCalendarPage = () => {
  const user = getCurrentUser();
  const canManage = ['Admin', 'HR'].includes(user?.role);

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    id: null, name: '', holiday_date: new Date().toISOString().split('T')[0], day: 'Thursday', type: 'National', status: 'Upcoming'
  });

  const defaultHolidays = [
    { id: 1, name: "New Year's Day", holiday_date: '01 Jan 2026', day: 'Thursday', type: 'National', status: 'Past' },
    { id: 2, name: 'Republic Day', holiday_date: '26 Jan 2026', day: 'Monday', type: 'National', status: 'Past' },
    { id: 3, name: 'Holi Festival', holiday_date: '14 Mar 2026', day: 'Saturday', type: 'Festival', status: 'Past' },
    { id: 4, name: 'Independence Day', holiday_date: '15 Aug 2026', day: 'Saturday', type: 'National', status: 'Upcoming' },
    { id: 5, name: 'Janmashtami', holiday_date: '20 Aug 2026', day: 'Thursday', type: 'Festival', status: 'Upcoming' },
    { id: 6, name: 'Gandhi Jayanti', holiday_date: '02 Oct 2026', day: 'Friday', type: 'National', status: 'Upcoming' },
    { id: 7, name: 'Diwali Deepavali', holiday_date: '08 Nov 2026', day: 'Sunday', type: 'Festival', status: 'Upcoming' },
    { id: 8, name: 'Christmas Day', holiday_date: '25 Dec 2026', day: 'Friday', type: 'Festival', status: 'Upcoming' }
  ];

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const data = await fetchHolidays().catch(() => []);
      setHolidays(data.length ? data : defaultHolidays);
    } catch (err) {
      console.error('Error loading holidays:', err);
      setHolidays(defaultHolidays);
    } finally {
      setLoading(false);
    }
  };

  const formatToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const metrics = useMemo(() => {
    const list = holidays.length ? holidays : defaultHolidays;
    const total = list.length;
    const national = list.filter(h => h.type === 'National').length;
    const festivals = list.filter(h => h.type === 'Festival').length;
    const upcoming = list.filter(h => h.status === 'Upcoming').length;
    return { total, national, festivals, upcoming };
  }, [holidays]);

  const filteredHolidays = useMemo(() => {
    const list = holidays.length ? holidays : defaultHolidays;
    return list.filter(h => {
      const q = searchTerm.toLowerCase();
      const nameMatch = (h.name || '').toLowerCase().includes(q);
      const typeMatch = selectedType === 'All' || h.type === selectedType;
      return nameMatch && typeMatch;
    });
  }, [holidays, searchTerm, selectedType]);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateHoliday(form.id, form);
        alert('Holiday updated!');
      } else {
        await createHoliday(form);
        alert('Holiday added!');
      }
      setShowModal(false);
      loadHolidays();
    } catch (err) {
      alert('Failed to save holiday.');
    }
  };

  const handleEdit = (holiday) => {
    setForm(holiday);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await deleteHoliday(id);
      alert('Holiday deleted!');
      loadHolidays();
    } catch (err) {
      alert('Failed to delete holiday.');
    }
  };

  const openAddModal = () => {
    setForm({ id: null, name: '', holiday_date: new Date().toISOString().split('T')[0], day: 'Thursday', type: 'National', status: 'Upcoming' });
    setShowModal(true);
  };

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
    <div className="theme-holidays container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
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

        /* FLOATING ROW HOLIDAY TABLE */
        .theme-holidays table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-holidays th {
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
        .theme-holidays td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-holidays tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-holidays tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-holidays tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-holidays tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        /* ── ACTION ICON BUTTONS ── */
        .btn-action-icon {
          width: 32px !important;
          height: 32px !important;
          border-radius: 10px !important;
          border: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }
        .edit-icon-btn {
          background-color: #EFF6FF !important;
          color: #3B82F6 !important;
        }
        .edit-icon-btn:hover {
          background-color: #3B82F6 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
          transform: translateY(-1px);
        }
        .del-icon-btn {
          background-color: #FFF1F2 !important;
          color: #F43F5E !important;
        }
        .del-icon-btn:hover {
          background-color: #F43F5E !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25) !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {THIN_ICONS.calendar}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Holiday Calendar 2026</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Official company holidays and optional leaves for the year.</p>
          </div>
        </div>
        {canManage && (
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={openAddModal}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span> Add Holiday</span>
          </button>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Holidays', value: metrics.total, sub: 'Full year 2026', icon: THIN_ICONS.calendar, color: COLORS.indigo },
          { label: 'National Holidays', value: metrics.national, sub: 'Government declared', icon: THIN_ICONS.flag, color: COLORS.emerald },
          { label: 'Festivals', value: metrics.festivals, sub: 'Cultural celebrations', icon: THIN_ICONS.star, color: COLORS.violet },
          { label: 'Upcoming', value: metrics.upcoming, sub: 'Remaining this year', icon: THIN_ICONS.checkCircle, color: COLORS.amber }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SEARCH AND TYPES FILTER */}
      <div className="card border-0 shadow-sm p-4 overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative" style={{ minWidth: '260px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search holidays by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            {['All', 'National', 'Festival', 'Regional', 'Optional'].map(type => (
              <button
                key={type}
                className={`btn btn-sm rounded-pill px-3 fw-bold text-nowrap ${selectedType === type ? 'text-white' : 'bg-light text-dark'}`}
                onClick={() => setSelectedType(type)}
                style={{
                  background: selectedType === type ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined,
                  border: selectedType === type ? '1px solid transparent' : '1px solid #cbd5e1'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Holiday</th>
                <th>Date</th>
                <th>Day</th>
                <th>Type</th>
                <th>Status</th>
                {canManage && <th className="text-end">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredHolidays.map((h, idx) => (
                <tr key={h.id || idx}>
                  <td className="fw-bold text-muted">{idx + 1}</td>
                  <td className="fw-bold" style={{ color: '#1e293b' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ color: COLORS.amber, display: 'flex' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon vectorEffect="non-scaling-stroke" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </span>
                      {h.name}
                    </div>
                  </td>
                  <td className="fw-semibold">{formatToDDMMYYYY(h.holiday_date)}</td>
                  <td>{!isNaN(new Date(h.holiday_date)) ? new Date(h.holiday_date).toLocaleDateString('en-US', { weekday: 'long' }) : h.day}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${h.type === 'National' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
                      {h.type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${h.status === 'Upcoming' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                      • {h.status || 'Upcoming'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <button
                          className="btn-action-icon edit-icon-btn"
                          onClick={() => handleEdit(h)}
                          title="Edit Holiday"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn-action-icon del-icon-btn"
                          onClick={() => handleDelete(h.id)}
                          title="Delete Holiday"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title">{form.id ? 'Edit Holiday' : 'Add Official Holiday'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddHoliday}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Holiday Name</label>
                    <input type="text" className="form-control rounded-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Date</label>
                    <input type="date" className="form-control rounded-3" value={form.holiday_date} onChange={(e) => setForm({ ...form, holiday_date: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Holiday Type</label>
                    <select className="form-select rounded-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                      <option value="National">National</option>
                      <option value="Festival">Festival</option>
                      <option value="Regional">Regional</option>
                      <option value="Optional">Optional</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Save Holiday
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

export default HolidayCalendarPage;
