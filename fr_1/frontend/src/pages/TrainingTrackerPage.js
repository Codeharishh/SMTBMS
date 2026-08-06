// src/pages/TrainingTrackerPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchTrainings, createTraining, updateTrainingStatus, updateTraining, deleteTraining } from '../services/hrService';
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
  layers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="12 2 2 7 12 12 22 7 12 2" />
      <polyline vectorEffect="non-scaling-stroke" points="2 17 12 22 22 17" />
      <polyline vectorEffect="non-scaling-stroke" points="2 12 12 17 22 12" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  award: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="8" r="7" />
      <polyline vectorEffect="non-scaling-stroke" points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
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
  ),
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
};

const TrainingTrackerPage = () => {
  const user = getCurrentUser();
  const canManage = ['Admin', 'HR'].includes(user?.role);

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '', category: 'Technical', trainer: '', duration_hours: 8, mode: 'Online', max_capacity: 15, current_enrollment: 0, status: 'Upcoming'
  });

  const defaultPrograms = [
    { id: 1, title: 'React Advanced Patterns', category: 'Technical', status: 'Ongoing', trainer: 'Arjun Mehta', duration_hours: 16, mode: 'Online', current_enrollment: 8, max_capacity: 12 },
    { id: 2, title: 'Leadership & Team Building', category: 'Soft Skills', status: 'Upcoming', trainer: 'Priya Sharma', duration_hours: 8, mode: 'Offline', current_enrollment: 12, max_capacity: 15 },
    { id: 3, title: 'Data Security & Compliance', category: 'IT', status: 'Ongoing', trainer: 'Meera Iyer', duration_hours: 4, mode: 'Online', current_enrollment: 20, max_capacity: 25 },
    { id: 4, title: 'Financial Risk Management', category: 'Finance', status: 'Completed', trainer: 'Vikram Rao', duration_hours: 12, mode: 'Online', current_enrollment: 15, max_capacity: 15 }
  ];

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    setLoading(true);
    try {
      const data = await fetchTrainings().catch(() => []);
      setTrainings(data.length ? data : defaultPrograms);
    } catch (err) {
      console.error('Error loading training programs:', err);
      setTrainings(defaultPrograms);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const list = trainings.length ? trainings : defaultPrograms;
    const total = list.length;
    const ongoing = list.filter(t => t.status === 'Ongoing').length;
    const completed = list.filter(t => t.status === 'Completed').length;
    return { total, ongoing, completed, certs: 3 };
  }, [trainings]);

  const filteredPrograms = useMemo(() => {
    const list = trainings.length ? trainings : defaultPrograms;
    return list.filter(p => {
      const q = searchTerm.toLowerCase();
      const nameMatch = (p.title || '').toLowerCase().includes(q) || (p.trainer || '').toLowerCase().includes(q);
      const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
      return nameMatch && catMatch;
    });
  }, [trainings, searchTerm, selectedCategory]);

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: `${form.category} training program by ${form.trainer}`,
        department: form.category === 'IT' ? 'IT' : form.category === 'Finance' ? 'Finance' : 'All',
        trainer: form.trainer,
        scheduled_date: form.scheduled_date || new Date().toISOString().split('T')[0],
        status: form.status,
        category: form.category,
        duration_hours: form.duration_hours,
        mode: form.mode,
        max_capacity: form.max_capacity,
        current_enrollment: form.current_enrollment
      };
      
      if (editingId) {
        await updateTraining(editingId, payload);
        alert('Training program updated!');
      } else {
        await createTraining(payload);
        alert('Training program created!');
      }
      setShowModal(false);
      setEditingId(null);
      loadTrainings();
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'create'} training program: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (p) => {
    setForm({
      title: p.title, category: p.category || 'Technical', trainer: p.trainer || '', 
      duration_hours: p.duration_hours || 8, mode: p.mode || 'Online', 
      max_capacity: p.max_capacity || 15, current_enrollment: p.current_enrollment || 0, 
      status: p.status || 'Upcoming', scheduled_date: p.scheduled_date ? p.scheduled_date.split('T')[0] : ''
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) return;
    try {
      await deleteTraining(id);
      alert('Training program deleted.');
      loadTrainings();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
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
    <div className="theme-training container-fluid px-4 py-4" style={{
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
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {THIN_ICONS.layers}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Training & Development</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Schedule programs, track progress, and issue skill certificates.</p>
          </div>
        </div>
        {canManage && (
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', category: 'Technical', trainer: '', duration_hours: 8, mode: 'Online', max_capacity: 15, current_enrollment: 0, status: 'Upcoming' });
              setShowModal(true);
            }}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span> Add Program</span>
          </button>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Programs', value: metrics.total, sub: 'All time', icon: THIN_ICONS.layers, color: COLORS.indigo },
          { label: 'Ongoing', value: metrics.ongoing, sub: 'Currently running', icon: THIN_ICONS.clock, color: COLORS.amber },
          { label: 'Completed', value: metrics.completed, sub: 'This quarter', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'Certificates Issued', value: metrics.certs, sub: 'To employees', icon: THIN_ICONS.award, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
        <div className="position-relative me-2" style={{ minWidth: '260px' }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
          <input
            type="text"
            className="form-control rounded-pill ps-5 small"
            placeholder="Search programs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: '#ffffff', border: '1px solid #e5e0f5' }}
          />
        </div>

        {['All', 'Technical', 'Soft Skills', 'Finance', 'IT', 'Sales'].map(cat => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-3 fw-bold ${selectedCategory === cat ? 'text-white' : 'bg-white text-dark border'}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ background: selectedCategory === cat ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TRAINING CARDS GRID */}
      <div className="row g-4">
        {filteredPrograms.map(p => (
          <div key={p.id} className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.indigo}1A`, color: COLORS.indigo }}>
                  {p.category}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge rounded-pill px-3 py-1 fw-bold ${p.status === 'Ongoing' ? 'bg-warning-subtle text-warning' : p.status === 'Completed' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                    • {p.status}
                  </span>
                  {canManage && (
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light rounded-circle" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleEdit(p)}>
                        {THIN_ICONS.edit}
                      </button>
                      <button className="btn btn-sm btn-light rounded-circle text-danger" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(p.id)}>
                        {THIN_ICONS.trash}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: '#1e293b' }}>{p.title}</h5>
              <div className="small text-muted mb-3">
                <span>👤 Trainer: {p.trainer}</span> • <span>⏱️ {p.duration_hours} hrs</span> • <span>🌐 {p.mode}</span>
              </div>
              <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <span className="small text-muted fw-bold">Enrollment</span>
                <span className="fw-bold text-primary">{p.current_enrollment}/{p.max_capacity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title">{editingId ? 'Edit' : 'Create'} Training Program</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddProgram}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Program Title</label>
                    <input type="text" className="form-control rounded-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Category</label>
                      <select className="form-select rounded-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                        <option value="Technical">Technical</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Finance">Finance</option>
                        <option value="IT">IT</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Trainer Name</label>
                      <input type="text" className="form-control rounded-3" value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} placeholder="e.g. Arjun Mehta" required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Duration (Hours)</label>
                      <input type="number" className="form-control rounded-3" value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Mode</label>
                      <select className="form-select rounded-3" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Max Capacity</label>
                      <input type="number" className="form-control rounded-3" value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: Number(e.target.value) })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Current Enrollment</label>
                      <input type="number" className="form-control rounded-3" value={form.current_enrollment} onChange={(e) => setForm({ ...form, current_enrollment: Number(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Scheduled Date</label>
                    <input type="date" className="form-control rounded-3" value={form.scheduled_date || new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Save Program
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

export default TrainingTrackerPage;
