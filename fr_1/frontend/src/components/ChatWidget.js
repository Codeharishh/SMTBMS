// src/components/ChatWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { fetchChatHistory, sendChatMessage, clearChatHistory } from '../services/chatService';
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
  send: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="22" y1="2" x2="11" y2="13" />
      <polygon vectorEffect="non-scaling-stroke" points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  sparkles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
};

/**
 * Lightweight custom markdown parser for rendering formatted lists, bold text, and tables
 */
const renderSimpleMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let tableRows = [];
  let inTable = false;

  const parseInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} style={{ color: '#0f172a' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) return;
      const cells = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
      tableRows.push(cells);
      inTable = true;
      return;
    } else if (inTable) {
      elements.push(
        <div key={`table-${index}`} className="table-responsive my-2">
          <table className="table table-sm table-bordered align-middle mb-0" style={{ fontSize: '0.78rem' }}>
            {tableRows.length > 0 && (
              <thead>
                <tr className="table-light">
                  {tableRows[0].map((cell, cIdx) => <th key={cIdx} className="fw-bold">{parseInline(cell)}</th>)}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.slice(1).map((r, rIdx) => (
                <tr key={rIdx}>
                  {r.map((cell, cIdx) => <td key={cIdx}>{parseInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(<h6 key={index} className="fw-bold mt-2 mb-1" style={{ color: '#1e293b', fontSize: '0.92rem' }}>{parseInline(trimmed.replace('### ', ''))}</h6>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={index} className="d-flex align-items-start gap-2 ms-2 my-1" style={{ fontSize: '0.84rem' }}>
          <span style={{ color: COLORS.primary }}>•</span>
          <div>{parseInline(trimmed.substring(2))}</div>
        </div>
      );
    } else if (trimmed.length > 0) {
      elements.push(<p key={index} className="mb-1" style={{ fontSize: '0.84rem', lineHeight: 1.45 }}>{parseInline(line)}</p>);
    } else {
      elements.push(<div key={index} style={{ height: '4px' }} />);
    }
  });

  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="table-flush" className="table-responsive my-2">
        <table className="table table-sm table-bordered align-middle mb-0" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr className="table-light">
              {tableRows[0].map((cell, cIdx) => <th key={cIdx} className="fw-bold">{parseInline(cell)}</th>)}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((r, rIdx) => (
              <tr key={rIdx}>
                {r.map((cell, cIdx) => <td key={cIdx}>{parseInline(cell)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return elements;
};

const ChatWidget = ({ isOpen, onClose, onNewMessage }) => {
  const currentUser = getCurrentUser() || { name: 'User', role: 'EMPLOYEE' };
  const currentRole = (currentUser.role || 'EMPLOYEE').toUpperCase();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const chatEndRef = useRef(null);

  // ── PER-ROLE & PER-USER CONVERSATION ISOLATION FETCHING ──
  // Re-fetches database thread whenever current user/role changes or drawer opens.
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setHistoryLoading(true);

    fetchChatHistory()
      .then((data) => {
        if (!isMounted) return;
        if (data.history && data.history.length > 0) {
          setMessages(data.history);
        } else {
          setMessages([
            {
              id: 1,
              sender: 'bot',
              text: `Hello ${currentUser.name}! I am your AI assistant grounded in live SMTBMS database records.\n\n🔒 **Role Thread Scoped**: You are currently chatting under your authenticated role (**${currentUser.role}**).`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching role chat history:', err);
        setMessages([
          {
            id: 1,
            sender: 'bot',
            text: `Hello ${currentUser.name}! Ask me anything grounded in your live ${currentUser.role} dataset.`,
            timestamp: new Date().toISOString()
          }
        ]);
      })
      .finally(() => {
        if (isMounted) setHistoryLoading(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, currentRole, currentUser.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await sendChatMessage(query);

      const botMsg = {
        id: response.messageId || Date.now() + 1,
        sender: 'bot',
        text: response.reply || 'No response generated.',
        timestamp: response.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
      if (!isOpen && onNewMessage) onNewMessage();
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg(err.response?.data?.message || 'Unable to connect to AI grounding assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearChatHistory();
      setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          text: `Conversation thread reset for **${currentUser.role}** role. Ask me any live database questions!`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to clear thread:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 end-0 h-100 shadow-lg d-flex flex-column animate__animated animate__slideInRight"
      style={{
        width: '100%',
        maxWidth: '410px',
        zIndex: 1060,
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        fontFamily: '"Inter", sans-serif'
      }}
    >
      <style>{`
        .chat-scroll-area::-webkit-scrollbar { width: 4px; }
        .chat-scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .chat-input-focus:focus {
          border-color: #FF7A45 !important;
          box-shadow: 0 0 0 3px rgba(255, 122, 69, 0.15) !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="p-3 d-flex align-items-center justify-content-between border-bottom" style={{ background: '#FAF8FF' }}>
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{
              width: '40px', height: '40px', borderRadius: '14px',
              background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`
            }}
          >
            {THIN_ICONS.sparkles}
          </div>
          <div>
            <h6 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '0.98rem' }}>AI Assistant</h6>
            <div className="d-flex align-items-center gap-1 mt-0.5">
              <span className="badge bg-primary-subtle text-primary border rounded-pill px-2 py-0.5 fw-bold" style={{ fontSize: '0.65rem' }}>
                Chatting as: {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-1.5"
            onClick={handleClear}
            title="Clear Role Chat History"
            style={{ color: '#64748b' }}
          >
            {THIN_ICONS.trash}
          </button>
          <button
            type="button"
            className="btn-close rounded-circle p-2 ms-1"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>

      {/* CHAT MESSAGES BODY */}
      <div className="flex-grow-1 p-3 overflow-auto chat-scroll-area d-flex flex-column gap-3" style={{ background: '#F8FAFC' }}>
        {historyLoading ? (
          <div className="text-center py-5 text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
            <div>Loading isolated {currentUser.role} chat thread...</div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`d-flex flex-column ${isUser ? 'align-items-end' : 'align-items-start'}`}>
                <div
                  className="p-3 shadow-sm"
                  style={{
                    maxWidth: '86%',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isUser ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : '#ffffff',
                    color: isUser ? '#ffffff' : '#334155',
                    border: isUser ? 'none' : '1px solid #E2E8F0',
                    boxShadow: '0 4px 14px rgba(31,41,55,0.04)'
                  }}
                >
                  {isUser ? (
                    <p className="mb-0 fw-medium" style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>{m.text}</p>
                  ) : (
                    <div>{renderSimpleMarkdown(m.text)}</div>
                  )}
                </div>
                <small className="text-muted mt-1 px-1" style={{ fontSize: '0.65rem' }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            );
          })
        )}

        {loading && (
          <div className="d-flex align-items-center gap-2 p-3 bg-white rounded-4 border shadow-sm align-self-start" style={{ maxWidth: '75%' }}>
            <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '10px', height: '10px' }}></div>
            <div className="spinner-grow spinner-grow-sm text-info" role="status" style={{ width: '10px', height: '10px', animationDelay: '0.2s' }}></div>
            <div className="spinner-grow spinner-grow-sm text-warning" role="status" style={{ width: '10px', height: '10px', animationDelay: '0.4s' }}></div>
            <small className="fw-semibold text-muted ms-1" style={{ fontSize: '0.78rem' }}>Querying live database context...</small>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger p-2.5 small rounded-3 border-0 d-flex align-items-center justify-content-between mb-0" style={{ fontSize: '0.78rem' }}>
            <span>⚠️ {errorMsg}</span>
            <button className="btn btn-sm text-danger p-0 fw-bold border-0" onClick={handleSend}>
              {THIN_ICONS.refresh} Retry
            </button>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT FORM FOOTER */}
      <form onSubmit={handleSend} className="p-3 bg-white border-top">
        <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            className="form-control rounded-pill px-3 py-2 chat-input-focus"
            placeholder={`Ask as ${currentUser.role}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || historyLoading}
            style={{ fontSize: '0.86rem', background: '#F1F5F9', border: '1px solid #E2E8F0' }}
          />
          <button
            type="submit"
            className="btn text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
            disabled={loading || historyLoading || !input.trim()}
            style={{
              width: '40px', height: '40px',
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`,
              opacity: (loading || historyLoading || !input.trim()) ? 0.6 : 1
            }}
          >
            {THIN_ICONS.send}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWidget;
