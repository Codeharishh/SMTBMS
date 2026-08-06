// src/pages/HRDocumentsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { fetchDocuments, createDocument, recordDocumentDownload } from '../services/hrService';
import { getCurrentUser, hasRole } from '../utils/authHelpers';

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
  document: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  download: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline vectorEffect="non-scaling-stroke" points="7 10 12 15 17 10" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  folder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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

const HRDocumentsPage = () => {
  const user = getCurrentUser();
  const canManage = hasRole(['Admin', 'HR']);

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: '', category: 'Policy', access_level: 'All Employees', file_size: '1.2 MB', file_name: ''
  });

  const defaultDocs = [
    { id: 1, title: 'Salary Structure Template.xlsx', category: 'Payroll', file_size: '320 KB', uploaded_by: 'Pooja Gupta', date: '10 Jan 2026', access_level: 'HR & Finance', downloads: 25 },
    { id: 2, title: 'Code of Conduct.pdf', category: 'Policy', file_size: '1.1 MB', uploaded_by: 'Priya Sharma', date: '01 Jan 2026', access_level: 'All Employees', downloads: 63 },
    { id: 3, title: 'Employee Appraisal Form.docx', category: 'Performance', file_size: '450 KB', uploaded_by: 'Rohan Das', date: '15 Feb 2026', access_level: 'All Employees', downloads: 42 },
    { id: 4, title: 'Offer Letter Template.docx', category: 'Recruitment', file_size: '280 KB', uploaded_by: 'Pooja Gupta', date: '20 Feb 2026', access_level: 'HR Only', downloads: 19 }
  ];

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments().catch(() => []);
      setDocs(data.length ? data : defaultDocs);
    } catch (err) {
      console.error('Error loading HR documents:', err);
      setDocs(defaultDocs);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const list = docs.length ? docs : defaultDocs;
    const total = list.length;
    const policies = list.filter(d => d.category === 'Policy').length;
    const totalDownloads = list.reduce((acc, curr) => acc + (curr.downloads || 0), 0) || 364;
    return { total, policies, totalDownloads, categories: 6 };
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const list = docs.length ? docs : defaultDocs;
    return list.filter(d => {
      const q = searchTerm.toLowerCase();
      const nameMatch = (d.title || '').toLowerCase().includes(q) || (d.uploaded_by || '').toLowerCase().includes(q);
      const catMatch = selectedCategory === 'All' || d.category === selectedCategory;
      return nameMatch && catMatch;
    });
  }, [docs, searchTerm, selectedCategory]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await createDocument(form);
      alert('Document uploaded!');
      setShowModal(false);
      loadDocs();
    } catch (err) {
      alert('Failed to upload document.');
    }
  };

  const handleDownload = async (d) => {
    try {
      if (d.id && !defaultDocs.find(x => x.id === d.id)) {
        await recordDocumentDownload(d.id);
        setDocs(docs.map(doc => doc.id === d.id ? { ...doc, downloads: (doc.downloads || 0) + 1 } : doc));
      }

      // Ensure the file downloads as a .pdf (or original format)
      let fileName = d.file_name || d.title;

      let blob;
      if (d.file_base64 && d.mime_type) {
        // ACTUAL FILE DOWNLOAD: User uploaded a real file!
        const base64Data = d.file_base64.split(',')[1] || d.file_base64;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: d.mime_type });
      } else {
        // FALLBACK: Generate dynamic PDF for seeded data
        if (!fileName.includes('.')) fileName += '.pdf';

        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text(d.title, 14, 25);
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(`Category: ${d.category || 'General'}`, 14, 35);
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 42, 196, 42);
        doc.setFontSize(12);
        doc.setTextColor(51, 65, 85);
        const bodyText = d.description || 'No detailed content was provided for this document during upload.';
        const splitBody = doc.splitTextToSize(bodyText, 180);
        doc.text(splitBody, 14, 55);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`SMTBMS Document System • Downloaded on: ${new Date().toLocaleString()}`, 14, 280);
        blob = doc.output('blob');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Failed to download ${d.title}`);
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
    <div className="theme-documents container-fluid px-4 py-4" style={{
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

        /* FLOATING ROW DOCUMENTS TABLE */
        .theme-documents table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-documents th {
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
        .theme-documents td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-documents tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-documents tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-documents tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-documents tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {THIN_ICONS.document}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>HR Documents Repository</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Centralized repository for all company documents, policies, and templates.</p>
          </div>
        </div>
        {canManage && (
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span> Upload Document</span>
          </button>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Documents', value: metrics.total, sub: 'In repository', icon: THIN_ICONS.document, color: COLORS.indigo },
          { label: 'Policy Docs', value: metrics.policies, sub: 'Active policies', icon: THIN_ICONS.shield, color: COLORS.violet },
          { label: 'Total Downloads', value: metrics.totalDownloads, sub: 'By employees', icon: THIN_ICONS.download, color: COLORS.emerald },
          { label: 'Categories', value: metrics.categories, sub: 'Document types', icon: THIN_ICONS.folder, color: COLORS.amber }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SEARCH AND CATEGORIES FILTER */}
      <div className="card border-0 shadow-sm p-4 overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative" style={{ minWidth: '260px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search documents by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            {['All', 'Policy', 'Payroll', 'Performance', 'Recruitment'].map(cat => (
              <button
                key={cat}
                className={`btn btn-sm rounded-pill px-3 fw-bold text-nowrap ${selectedCategory === cat ? 'text-white' : 'bg-light text-dark'}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined,
                  border: selectedCategory === cat ? '1px solid transparent' : '1px solid #cbd5e1'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Access</th>
                <th>Downloads</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((d, idx) => (
                <tr key={d.id || idx}>
                  <td className="fw-bold" style={{ color: '#1e293b' }}>📄 {d.title}</td>
                  <td>
                    <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1 fw-bold">
                      {d.category}
                    </span>
                  </td>
                  <td>{d.file_size || '1.1 MB'}</td>
                  <td className="fw-semibold">{d.uploaded_by_name || (typeof d.uploaded_by === 'string' ? d.uploaded_by : 'Admin')}</td>
                  <td>{d.date || '01 Jan 2026'}</td>
                  <td>
                    <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-1 fw-bold">
                      {d.access_level || 'All Employees'}
                    </span>
                  </td>
                  <td className="fw-bold">⬇️ {d.downloads || 0}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => handleDownload(d)}>
                      Download
                    </button>
                  </td>
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
                <h5 className="fw-bold modal-title">Upload Company Document</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Select File from PC</label>
                    <input
                      type="file"
                      className="form-control rounded-3"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                          const formattedSize = sizeMB > 1 ? `${sizeMB} MB` : `${(file.size / 1024).toFixed(0)} KB`;

                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setForm({
                              ...form,
                              title: file.name.split('.')[0] || file.name,
                              file_name: file.name,
                              file_size: formattedSize,
                              file_base64: event.target.result,
                              mime_type: file.type || 'application/octet-stream'
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Document Title</label>
                    <input type="text" className="form-control rounded-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Category</label>
                      <select className="form-select rounded-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                        <option value="Policy">Policy</option>
                        <option value="Payroll">Payroll</option>
                        <option value="Performance">Performance</option>
                        <option value="Recruitment">Recruitment</option>
                        <option value="IT">IT</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Access Level</label>
                      <select className="form-select rounded-3" value={form.access_level} onChange={(e) => setForm({ ...form, access_level: e.target.value })}>
                        <option value="All Employees">All Employees</option>
                        <option value="HR & Finance">HR & Finance</option>
                        <option value="Managers Only">Managers Only</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Upload File
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

export default HRDocumentsPage;
