// src/pages/OCRScannerPage.js
import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { jsPDF } from 'jspdf';

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
  scan: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path vectorEffect="non-scaling-stroke" d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path vectorEffect="non-scaling-stroke" d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path vectorEffect="non-scaling-stroke" d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line vectorEffect="non-scaling-stroke" x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path vectorEffect="non-scaling-stroke" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline vectorEffect="non-scaling-stroke" points="17 8 12 3 7 8" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect vectorEffect="non-scaling-stroke" x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path vectorEffect="non-scaling-stroke" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  download: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path vectorEffect="non-scaling-stroke" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline vectorEffect="non-scaling-stroke" points="7 10 12 15 17 10" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  filePdf: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
      <line vectorEffect="non-scaling-stroke" x1="9" y1="15" x2="9.01" y2="15" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="15" x2="12" y2="18" />
      <line vectorEffect="non-scaling-stroke" x1="15" y1="15" x2="15" y2="18" />
      <path vectorEffect="non-scaling-stroke" d="M15 16.5h1.5" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline vectorEffect="non-scaling-stroke" points="20 6 9 17 4 12" />
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline vectorEffect="non-scaling-stroke" points="23 4 23 10 17 10" />
      <path vectorEffect="non-scaling-stroke" d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  fileText: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="13" x2="8" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
};

// ── LAYOUT-PRESERVING TEXT RECONSTRUCTION ──────────────────────────────────
// Tesseract's plain `data.text` just joins recognized words with single spaces,
// which throws away the original tabular/column spacing (e.g. item name vs
// price on a receipt). Tesseract also returns per-word pixel bounding boxes
// (bbox.x0 / bbox.x1). We use those horizontal positions to re-insert the
// correct number of spaces between words, so columns line up visually when
// rendered in a monospace font (the textarea below already uses monospace).

const computeAvgCharWidth = (words, fallback = 7) => {
  let totalWidth = 0;
  let totalChars = 0;
  (words || []).forEach((w) => {
    if (!w.bbox || !w.text) return;
    const width = w.bbox.x1 - w.bbox.x0;
    const len = w.text.length;
    if (len > 0 && width > 0) {
      totalWidth += width;
      totalChars += len;
    }
  });
  return totalChars > 0 ? totalWidth / totalChars : fallback;
};

const renderAlignedLine = (line, avgCharWidth) => {
  if (!line.words || !line.words.length) {
    return (line.text || '').replace(/\n+$/, '');
  }
  let result = '';
  let cursorX = null;
  line.words.forEach((w) => {
    if (!w.text) return;
    const x0 = w.bbox ? w.bbox.x0 : null;
    if (cursorX === null || x0 === null) {
      result += w.text;
    } else {
      const gap = x0 - cursorX;
      const spaces = Math.max(1, Math.round(gap / avgCharWidth));
      result += ' '.repeat(spaces) + w.text;
    }
    cursorX = w.bbox ? w.bbox.x1 : cursorX;
  });
  return result;
};

const buildAlignedText = (data) => {
  if (!data) return '';

  // Prefer paragraph grouping so distinct blocks of the source document get
  // separated by a blank line, matching the visual structure of the original.
  if (data.paragraphs && data.paragraphs.length) {
    const blocks = data.paragraphs.map((p) => {
      const allWords = (p.lines || []).flatMap((l) => l.words || []);
      const avgCharWidth = computeAvgCharWidth(allWords);
      const lines = (p.lines || []).map((l) => renderAlignedLine(l, avgCharWidth));
      return lines.join('\n');
    });
    const joined = blocks.join('\n\n').trim();
    if (joined) return joined;
  }

  if (data.lines && data.lines.length) {
    const allWords = data.lines.flatMap((l) => l.words || []);
    const avgCharWidth = computeAvgCharWidth(allWords);
    const joined = data.lines.map((l) => renderAlignedLine(l, avgCharWidth)).join('\n').trim();
    if (joined) return joined;
  }

  return (data.text || '').trim();
};

const OCRScannerPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [ocrData, setOcrData] = useState(null);
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const fileInputRef = useRef(null);

  const MAX_SIZE_MB = 5;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid file format. Please upload a JPG, PNG, JPEG, or WEBP image.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File size exceeds limit (${MAX_SIZE_MB}MB). Please choose a smaller image.`);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedText('');
    setOcrData(null);
    setErrorMessage('');
    setPdfError('');
    setCopied(false);
  };

  const handleScanImage = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setProgress(0);
    setStatusMessage('Initializing OCR Engine...');
    setErrorMessage('');

    try {
      const result = await Tesseract.recognize(selectedFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatusMessage(`Recognizing Text... (${Math.round(m.progress * 100)}%)`);
          } else {
            setStatusMessage(m.status.charAt(0).toUpperCase() + m.status.slice(1));
          }
        },
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1'
      });

      const rawText = result.data.text ? result.data.text.trim() : '';
      const alignedText = buildAlignedText(result.data);

      if (!rawText && !alignedText) {
        setErrorMessage('No readable text could be identified in the uploaded image.');
        setOcrData(null);
      } else {
        setOcrData(result.data);
        setExtractedText(preserveLayout ? (alignedText || rawText) : rawText);
      }
    } catch (err) {
      console.error('Tesseract OCR Error:', err);
      setErrorMessage('Failed to process image OCR scanning. Please try a clearer image file.');
    } finally {
      setIsScanning(false);
      setStatusMessage('');
    }
  };

  const handleTogglePreserveLayout = () => {
    setPreserveLayout((prev) => {
      const next = !prev;
      if (ocrData) {
        const rawText = ocrData.text ? ocrData.text.trim() : '';
        const alignedText = buildAlignedText(ocrData);
        setExtractedText(next ? (alignedText || rawText) : rawText);
      }
      return next;
    });
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OCR_Extracted_Text_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── DOWNLOAD AS PDF ────────────────────────────────────────────────────
  // Uses Courier (a monospace PDF font) at a fixed size so the same column
  // alignment logic that drives the on-screen textarea also holds up in the
  // exported PDF. Handles pagination and per-line wrapping so nothing gets
  // cut off if a line is wider than the page or the text runs long.
  const handleDownloadPdf = () => {
    if (!extractedText) return;
    setPdfError('');

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 40;
      const marginTop = 56;
      const marginBottom = 40;
      const fontSize = 9.5;
      const lineHeight = fontSize * 1.45;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableWidth = pageWidth - marginX * 2;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('OCR Extracted Text', marginX, 36);
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, 44, pageWidth - marginX, 44);

      doc.setFont('courier', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(51, 65, 85);

      let y = marginTop;
      const sourceLines = extractedText.split('\n');

      sourceLines.forEach((line) => {
        // splitTextToSize wraps long lines to the page width without
        // dropping any characters — it just breaks onto extra PDF lines.
        const wrapped = doc.splitTextToSize(line.length ? line : ' ', usableWidth);
        wrapped.forEach((wLine) => {
          if (y > pageHeight - marginBottom) {
            doc.addPage();
            y = marginTop;
            doc.setFont('courier', 'normal');
            doc.setFontSize(fontSize);
            doc.setTextColor(51, 65, 85);
          }
          doc.text(wLine, marginX, y);
          y += lineHeight;
        });
      });

      doc.save(`OCR_Extracted_Text_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfError('Failed to generate PDF. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setOcrData(null);
    setErrorMessage('');
    setPdfError('');
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        .ocr-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          background-color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(31,41,55,0.06) !important;
          border-radius: 22px !important;
          border: none !important;
          overflow: hidden;
        }
        .ocr-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(31,41,55,0.09) !important;
        }
        .ocr-btn-lux { transition: all 0.2s ease !important; }
        .ocr-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;
        }
        .layout-toggle-lux .form-check-input {
          width: 2.4em;
          height: 1.3em;
          cursor: pointer;
        }
        .layout-toggle-lux .form-check-input:checked {
          background-color: ${COLORS.primary};
          border-color: ${COLORS.primary};
        }
        .layout-toggle-lux .form-check-input:focus {
          box-shadow: 0 0 0 3px rgba(255, 122, 69, 0.15);
        }
        .layout-toggle-lux .form-check-label {
          cursor: pointer;
        }
        .btn-outline-pdf {
          border: 1.5px solid ${COLORS.rose} !important;
          color: ${COLORS.rose} !important;
          background: #ffffff !important;
        }
        .btn-outline-pdf:hover {
          background: ${COLORS.rose} !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #5B8DEF 0%, #4FC3F7 100%)' }}>
            {THIN_ICONS.scan}
          </div>
          <div>
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Document / Image OCR Scanner
              <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>AI TOOL</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Extract printed or handwritten typography text from local documents and images.</p>
          </div>
        </div>

        {selectedFile && (
          <button
            type="button"
            className="btn btn-light px-3 py-2 rounded-3 fw-semibold border shadow-sm d-flex align-items-center gap-2"
            onClick={handleReset}
            disabled={isScanning}
            style={{ fontSize: '0.85rem', color: '#64748b' }}
          >
            {THIN_ICONS.refresh}
            <span>Reset Workspace</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="alert alert-danger rounded-4 border-0 shadow-sm p-3 mb-4 d-flex align-items-center justify-content-between" style={{ fontSize: '0.86rem' }}>
          <div className="d-flex align-items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
        </div>
      )}

      {pdfError && (
        <div className="alert alert-danger rounded-4 border-0 shadow-sm p-3 mb-4 d-flex align-items-center justify-content-between" style={{ fontSize: '0.86rem' }}>
          <div className="d-flex align-items-center gap-2">
            <span>⚠️</span>
            <span>{pdfError}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setPdfError('')}></button>
        </div>
      )}

      {/* SPLIT WORKSPACE PANELS */}
      <div className="row g-4">

        {/* LEFT PANEL: UPLOAD & PREVIEW */}
        <div className="col-12 col-lg-6">
          <div className="section-eyebrow">Source Document View</div>
          <div className="card ocr-card h-100 p-4 d-flex flex-column">

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="ocr-file-input"
            />

            {!previewUrl ? (
              <label
                htmlFor="ocr-file-input"
                className="flex-grow-1 d-flex flex-column align-items-center justify-content-center border border-2 border-dashed rounded-4 p-5 text-center cursor-pointer"
                style={{ background: '#FAF8FF', borderColor: '#CBD5E1', minHeight: '380px', cursor: 'pointer' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center text-primary mb-3 shadow-sm"
                  style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EFF6FF' }}
                >
                  {THIN_ICONS.upload}
                </div>
                <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Click or Drop Image Here</h6>
                <p className="text-muted small mb-2">Supports PNG, JPG, JPEG, and WEBP (Max 5MB)</p>
                <span className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm mt-2">
                  Select Image File
                </span>
              </label>
            ) : (
              <div className="d-flex flex-column h-100">
                <div className="position-relative flex-grow-1 d-flex align-items-center justify-content-center p-3 rounded-4"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', minHeight: '340px' }}>
                  <img
                    src={previewUrl}
                    alt="Source Preview"
                    style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', borderRadius: '12px' }}
                  />
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3 mt-3">
                  <div className="text-truncate">
                    <span className="fw-bold d-block text-truncate" style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedFile?.name}</span>
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>{(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB</small>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor="ocr-file-input" className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-muted mb-0" style={{ cursor: 'pointer' }}>
                      Change
                    </label>
                    <button
                      type="button"
                      className="btn text-white rounded-pill px-4 py-2 fw-bold shadow-sm ocr-btn-lux d-flex align-items-center gap-2"
                      onClick={handleScanImage}
                      disabled={isScanning}
                      style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
                    >
                      {THIN_ICONS.scan}
                      <span>{isScanning ? 'Scanning...' : 'Scan Image'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="fw-bold text-primary">{statusMessage}</small>
                  <small className="fw-bold text-primary">{progress}%</small>
                </div>
                <div className="progress rounded-pill" style={{ height: '8px', background: '#E2E8F0' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: EXTRACTED TEXT OUTPUT */}
        <div className="col-12 col-lg-6">
          <div className="section-eyebrow">Digitized Text Result</div>
          <div className="card ocr-card h-100 p-4 d-flex flex-column">

            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: COLORS.indigo }}>{THIN_ICONS.fileText}</span>
                <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Extracted Output</h6>
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                {ocrData && (
                  <div className="form-check form-switch mb-0 d-flex align-items-center gap-2 layout-toggle-lux">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="preserve-layout-switch"
                      checked={preserveLayout}
                      onChange={handleTogglePreserveLayout}
                      disabled={isScanning}
                    />
                    <label className="form-check-label small fw-semibold text-muted mb-0" htmlFor="preserve-layout-switch">
                      Preserve Layout
                    </label>
                  </div>
                )}

                {extractedText && (
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-dark d-flex align-items-center gap-1.5 shadow-sm"
                      onClick={handleCopyText}
                    >
                      {copied ? THIN_ICONS.check : THIN_ICONS.copy}
                      <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
                      onClick={handleDownloadTxt}
                    >
                      {THIN_ICONS.download}
                      <span>Download .txt</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-pdf rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
                      onClick={handleDownloadPdf}
                    >
                      {THIN_ICONS.filePdf}
                      <span>Download PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: '340px' }}>
              <textarea
                className="form-control flex-grow-1 p-3 rounded-4 shadow-none"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text from the image will appear here. You can edit the text before downloading..."
                disabled={isScanning}
                spellCheck={false}
                wrap="off"
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  fontFamily: '"Fira Code", "Cascadia Mono", Consolas, monospace',
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                  resize: 'none',
                  minHeight: '320px'
                }}
              />
            </div>

            <div className="mt-3 d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
              <span>
                {ocrData && preserveLayout ? 'Layout preserved from source positions' : ''}
              </span>
              <span>
                {extractedText ? `${extractedText.length} characters | ${extractedText.split(/\s+/).filter(Boolean).length} words` : 'Awaiting image scan execution...'}
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default OCRScannerPage;