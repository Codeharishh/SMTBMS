// src/pages/EmployeeTrainingPage.js
import React, { useState, useEffect } from 'react';
import { fetchTrainings, enrollInTraining } from '../services/hrService';

const COLORS = {
  indigo: '#5B8DEF',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  emerald: '#2ED9C3',
  slate: '#64748B',
  primary: '#FF7A45',
  amber: '#FFC542'
};

const THIN_ICONS = {
  graduationCap: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path vectorEffect="non-scaling-stroke" d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
    </svg>
  )
};

const DEFAULT_COURSES = [
  {
    id: 1,
    title: 'React Advanced Patterns',
    instructor: 'Arjun Mehta',
    category: 'Technical',
    status: 'Open',
    mode: 'Online',
    duration: '16 hrs',
    startDate: '01 Jun 2026',
    color: '#3b82f6',
    enrolled: false
  },
  {
    id: 2,
    title: 'Leadership & Team Building',
    instructor: 'Priya Sharma',
    category: 'Soft Skills',
    status: 'Open',
    mode: 'Offline',
    duration: '8 hrs',
    startDate: '25 Jun 2026',
    color: '#8b5cf6',
    enrolled: false
  },
  {
    id: 3,
    title: 'Data Security & Compliance',
    instructor: 'Meera Iyer',
    category: 'IT',
    status: 'Open',
    mode: 'Online',
    duration: '4 hrs',
    startDate: '10 Jun 2026',
    color: '#06b6d4',
    enrolled: false
  },
  {
    id: 4,
    title: 'Financial Modelling Basics',
    instructor: 'Pooja Gupta',
    category: 'Finance',
    status: 'Open',
    mode: 'Online',
    duration: '12 hrs',
    startDate: '01 May 2026',
    color: '#10b981',
    enrolled: false
  },
  {
    id: 5,
    title: 'Sales Negotiation Techniques',
    instructor: 'Ananya Rao',
    category: 'Sales',
    status: 'Full',
    mode: 'Offline',
    duration: '6 hrs',
    startDate: '30 Jun 2026',
    color: '#f59e0b',
    enrolled: false
  }
];

const EmployeeTrainingPage = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHRTrainings();
  }, []);

  const loadHRTrainings = async () => {
    setLoading(true);
    try {
      const data = await fetchTrainings();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((t, idx) => ({
          id: t.id || idx + 1,
          title: t.title || 'Corporate Training Program',
          instructor: t.trainer || 'HR Instructor',
          category: t.department || 'Technical',
          status: t.status === 'Completed' ? 'Full' : 'Open',
          mode: 'Online',
          duration: '12 hrs',
          startDate: t.scheduled_date ? t.scheduled_date.split('T')[0] : '15 Jun 2026',
          color: idx % 2 === 0 ? '#3b82f6' : '#10b981',
          enrolled: false
        }));
        setCourses(formatted);
      }
    } catch (err) {
      console.warn('Syncing live HR trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (id) => {
    try {
      await enrollInTraining(id);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, enrolled: true } : c));
      alert('🎉 Successfully registered for training program!');
    } catch (err) {
      alert('Failed to register: ' + (err.response?.data?.message || err.message));
    }
  };

  const myEnrolledCourses = courses.filter(c => c.enrolled);

  return (
    <div className="container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: '#1e293b'
    }}>

      {/* MATCHED MATERIALS PAGE STANDARD BLUE GRADIENT HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.graduationCap}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Training & Skills Portal</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Employee learning programs synced live with HRMS Training Tracker</p>
          </div>
        </div>
      </div>

      {/* FILTER TABS MATRIX */}
      <div className="d-flex align-items-center gap-2 mb-4 p-1 rounded-pill bg-white border d-inline-flex shadow-sm">
        <button
          className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold border-0 ${activeTab === 'my' ? 'btn-primary text-white' : 'text-muted'}`}
          style={activeTab === 'my' ? { background: '#2563eb' } : {}}
          onClick={() => setActiveTab('my')}
        >
          My Courses ({myEnrolledCourses.length})
        </button>
        <button
          className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold border-0 ${activeTab === 'browse' ? 'btn-primary text-white' : 'text-muted'}`}
          style={activeTab === 'browse' ? { background: '#2563eb' } : {}}
          onClick={() => setActiveTab('browse')}
        >
          Browse Programs ({courses.length})
        </button>
        <button
          className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold border-0 ${activeTab === 'completed' ? 'btn-primary text-white' : 'text-muted'}`}
          style={activeTab === 'completed' ? { background: '#2563eb' } : {}}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'my' && (
        myEnrolledCourses.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center my-4 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center text-primary" style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#eff6ff' }}>
              {THIN_ICONS.graduationCap}
            </div>
            <h5 className="fw-bold text-dark mb-1">No courses here</h5>
            <p className="text-muted small mb-0">Head to "Browse Programs" to register for a course.</p>
          </div>
        ) : (
          <div className="row g-4">
            {myEnrolledCourses.map(c => (
              <div key={c.id} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge px-3 py-1 rounded-pill small fw-semibold" style={{ background: '#eff6ff', color: '#2563eb' }}>{c.category}</span>
                    <span className="badge px-2.5 py-1 rounded-pill small fw-semibold bg-success text-white">Enrolled</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{c.title}</h5>
                  <p className="text-muted small mb-3">by {c.instructor}</p>
                  <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                    <span className="text-muted small d-flex align-items-center gap-1">{THIN_ICONS.clock} {c.duration}</span>
                    <span className="text-muted small d-flex align-items-center gap-1">{THIN_ICONS.calendar} {c.startDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'browse' && (
        <div className="row g-4">
          {courses.map(c => (
            <div key={c.id} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge px-3 py-1.5 rounded-pill small fw-semibold" style={{ background: `${c.color}15`, color: c.color }}>{c.category}</span>
                    <span className="badge px-2.5 py-1.5 rounded-pill small fw-semibold" style={c.status === 'Full' ? { background: '#fef2f2', color: '#ef4444' } : { background: '#fff7ed', color: '#ea580c' }}>● {c.status}</span>
                    <span className="badge px-2.5 py-1.5 rounded-pill small fw-semibold bg-light text-muted border">{c.mode}</span>
                  </div>
                  <span className="d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${c.color}15`, color: c.color }}>
                    {THIN_ICONS.graduationCap}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mb-1">{c.title}</h5>
                <p className="text-muted small mb-4">by {c.instructor}</p>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                  <div className="d-flex align-items-center gap-3 text-muted small">
                    <span className="d-flex align-items-center gap-1">{THIN_ICONS.clock} {c.duration}</span>
                    <span className="d-flex align-items-center gap-1">{THIN_ICONS.calendar} {c.startDate}</span>
                  </div>
                  {c.enrolled ? (
                    <span className="badge px-3 py-2 rounded-pill bg-success-subtle text-success border border-success-subtle fw-bold">Registered</span>
                  ) : (
                    <button
                      className="btn btn-sm px-4 py-1.5 rounded-pill fw-bold text-white shadow-sm"
                      style={{ background: c.status === 'Full' ? '#cbd5e1' : c.color, borderColor: c.color }}
                      disabled={c.status === 'Full'}
                      onClick={() => handleRegister(c.id)}
                    >
                      {c.status === 'Full' ? 'Full' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="card border-0 shadow-sm p-5 text-center my-4 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
          <h5 className="fw-bold text-dark mb-1">No completed courses yet</h5>
          <p className="text-muted small mb-0">Your completed certificates and courses will be archived here.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTrainingPage;
