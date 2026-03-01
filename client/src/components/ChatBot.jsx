// client/src/components/ChatBot.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { sendChatMessage } from '../services/api';

// ── UI copy per language ──────────────────────────────────────────────────────
const UI_COPY = {
  en: {
    title:       'HerCare Assistant',
    subtitle:    'Women\'s health guidance',
    placeholder: 'Ask about your cycle, symptoms, diet…',
    send:        'Send',
    thinking:    'Thinking…',
    disclaimer:  'For informational purposes only. Not medical advice.',
    clearChat:   'Clear chat',
    close:       'Close',
    welcome:     'Hello! I\'m your HerCare Assistant. I can help you with questions about your menstrual cycle, pregnancy, symptoms, nutrition, and exercise.\n\nWhat would you like to know today?',
    suggestions: [
      'What foods help with period cramps?',
      'What are early signs of pregnancy?',
      'Best exercises during the luteal phase?',
      'How do I track my ovulation window?',
    ],
  },
  hi: {
    title:       'HerCare सहायक',
    subtitle:    'महिला स्वास्थ्य मार्गदर्शन',
    placeholder: 'अपने चक्र, लक्षण, आहार के बारे में पूछें…',
    send:        'भेजें',
    thinking:    'सोच रही हूँ…',
    disclaimer:  'केवल जानकारी के लिए। चिकित्सा सलाह नहीं।',
    clearChat:   'चैट साफ़ करें',
    close:       'बंद करें',
    welcome:     'नमस्ते! मैं आपकी HerCare सहायक हूँ। मैं आपके मासिक धर्म, गर्भावस्था, लक्षण, पोषण और व्यायाम से जुड़े सवालों में मदद कर सकती हूँ।\n\nआज आप क्या जानना चाहती हैं?',
    suggestions: [
      'मासिक दर्द के लिए कौन से खाद्य पदार्थ अच्छे हैं?',
      'गर्भावस्था के शुरुआती संकेत क्या हैं?',
      'पीरियड के दौरान कौन सी एक्सरसाइज करें?',
      'ओव्यूलेशन कैसे ट्रैक करें?',
    ],
  },
  mr: {
    title:       'HerCare सहाय्यक',
    subtitle:    'महिला आरोग्य मार्गदर्शन',
    placeholder: 'तुमच्या चक्र, लक्षणे, आहाराबद्दल विचारा…',
    send:        'पाठवा',
    thinking:    'विचार करत आहे…',
    disclaimer:  'केवळ माहितीसाठी. वैद्यकीय सल्ला नाही.',
    clearChat:   'चॅट साफ करा',
    close:       'बंद करा',
    welcome:     'नमस्कार! मी तुमची HerCare सहाय्यक आहे. मासिक पाळी, गर्भधारणा, लक्षणे, पोषण आणि व्यायाम याबद्दलच्या प्रश्नांमध्ये मी मदत करू शकते.\n\nआज तुम्हाला काय जाणून घ्यायचे आहे?',
    suggestions: [
      'मासिक वेदनेसाठी कोणते अन्न उपयुक्त आहे?',
      'गर्भधारणेची प्रारंभिक चिन्हे कोणती?',
      'ल्यूटियल टप्प्यात कोणते व्यायाम करावेत?',
      'ओव्ह्युलेशन कसे ट्रॅक करावे?',
    ],
  },
};

// ── Markdown-lite renderer ────────────────────────────────────────────────────
// Renders **bold** and newlines — no heavy library needed
function renderMessage(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={i}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--sage)',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      {/* Avatar — assistant only */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--forest), var(--sage))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, marginRight: 8, marginTop: 2,
        }}>
          🌿
        </div>
      )}

      <div style={{
        maxWidth: '78%',
        padding: isUser ? '10px 14px' : '12px 16px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
        background: isUser
          ? 'var(--forest)'
          : 'var(--warm-white)',
        border: isUser ? 'none' : '1px solid var(--border)',
        boxShadow: isUser
          ? '0 2px 12px rgba(26,46,31,0.25)'
          : '0 1px 6px rgba(26,46,31,0.06)',
        color: isUser ? 'var(--cream)' : 'var(--ink)',
        fontSize: 13.5,
        lineHeight: 1.65,
        fontFamily: 'Jost, sans-serif',
        fontWeight: 400,
        wordBreak: 'break-word',
      }}>
        {renderMessage(message.content)}

        <div style={{
          fontSize: 10,
          marginTop: 6,
          opacity: 0.55,
          textAlign: 'right',
          fontWeight: 500,
          letterSpacing: '0.03em',
          color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--ink-faint)',
        }}>
          {message.time}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ChatBot Component ────────────────────────────────────────────────────
export default function ChatBot() {
  const { language } = useLanguage();
  const copy = UI_COPY[language] || UI_COPY.en;

  const [isOpen,    setIsOpen]    = useState(false);
  const [input,     setInput]     = useState('');
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showSugg,  setShowSugg]  = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const initialized    = useRef(false);

  // Init welcome message when language changes or first open
  useEffect(() => {
    const welcome = {
      role: 'assistant',
      content: copy.welcome,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
    setShowSugg(true);
    initialized.current = true;
  }, [language]); // re-init on language switch

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput('');
    setShowSugg(false);

    const userMsg = {
      role: 'user',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history for API (only role + content, no UI metadata)
    const history = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const { data } = await sendChatMessage(history, language);
      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      const errContent = err.response?.data?.reply ||
        (language === 'hi' ? 'माफ़ करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।' :
         language === 'mr' ? 'माफ करा, काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.' :
         'Sorry, something went wrong. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, messages, loading, language, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const welcome = {
      role: 'assistant',
      content: copy.welcome,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
    setShowSugg(true);
    setInput('');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating trigger button ──────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open HerCare Assistant"
            style={{
              position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
              width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)',
              boxShadow: '0 4px 24px rgba(26,46,31,0.35), 0 1px 4px rgba(26,46,31,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Pulse ring */}
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              border: '2px solid rgba(201,168,76,0.4)',
              animation: 'chatPulse 2.5s ease-in-out infinite',
            }} />

            <span style={{ fontSize: 24, position: 'relative', zIndex: 1 }}>🌿</span>

            {/* Unread dot */}
            {hasUnread && (
              <div style={{
                position: 'absolute', top: 2, right: 2,
                width: 14, height: 14, borderRadius: '50%',
                background: '#ef4444', border: '2px solid white',
                animation: 'unreadBounce 0.4s ease',
              }} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
              width: 380, height: 600,
              display: 'flex', flexDirection: 'column',
              borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(26,46,31,0.22), 0 4px 16px rgba(26,46,31,0.12)',
              border: '1px solid var(--border)',
              background: 'var(--warm-white)',
            }}
          >
            {/* ── Panel header ───────────────────────────────────────────── */}
            <div style={{
              background: 'var(--forest)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Subtle decorative circle */}
              <div style={{
                position: 'absolute', right: -30, top: -30,
                width: 100, height: 100, borderRadius: '50%',
                border: '1px solid rgba(201,168,76,0.18)',
                pointerEvents: 'none',
              }} />

              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--gold), var(--sage))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>
                🌿
              </div>

              {/* Title */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 17, fontWeight: 600,
                  color: 'var(--cream)', margin: 0, lineHeight: 1.2,
                }}>{copy.title}</p>
                <p style={{
                  fontSize: 11, fontWeight: 500,
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0, marginTop: 2,
                  letterSpacing: '0.04em',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#4ade80', display: 'inline-block',
                    boxShadow: '0 0 6px #4ade80',
                  }} />
                  {copy.subtitle}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={clearChat}
                  title={copy.clearChat}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4, width: 30, height: 30, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)', fontSize: 14,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  ↺
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title={copy.close}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4, width: 30, height: 30, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)', fontSize: 16,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  ×
                </button>
              </div>
            </div>

            {/* ── Language indicator strip ────────────────────────────────── */}
            <div style={{
              background: 'var(--gold-pale)',
              borderBottom: '1px solid var(--gold-light)',
              padding: '6px 20px',
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 11 }}>
                {language === 'hi' ? '🇮🇳' : language === 'mr' ? '🇮🇳' : '🇬🇧'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b4d0a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Responding in {
                  language === 'hi' ? 'Hindi' :
                  language === 'mr' ? 'Marathi' : 'English'
                }
              </span>
              <span style={{ fontSize: 11, color: '#8a6a1a', marginLeft: 'auto' }}>
                Change in sidebar →
              </span>
            </div>

            {/* ── Messages area ──────────────────────────────────────────── */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
              display: 'flex', flexDirection: 'column',
              background: 'var(--cream)',
            }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} isUser={msg.role === 'user'} />
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--forest), var(--sage))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, flexShrink: 0,
                  }}>🌿</div>
                  <div style={{
                    padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
                    background: 'var(--warm-white)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 6px rgba(26,46,31,0.06)',
                  }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Suggested prompts ─────────────────────────────────────── */}
            <AnimatePresence>
              {showSugg && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '8px 12px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--warm-white)',
                    flexShrink: 0,
                    overflowX: 'auto',
                    display: 'flex', gap: 6,
                    scrollbarWidth: 'none',
                  }}
                >
                  {copy.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      style={{
                        flexShrink: 0,
                        padding: '6px 12px',
                        borderRadius: 20,
                        border: '1.5px solid var(--border)',
                        background: 'var(--cream)',
                        color: 'var(--ink-mid)',
                        fontSize: 11.5, fontWeight: 600,
                        fontFamily: 'Jost, sans-serif',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        maxWidth: 180,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--forest)';
                        e.currentTarget.style.color = 'var(--forest)';
                        e.currentTarget.style.background = 'var(--sage-pale)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--ink-mid)';
                        e.currentTarget.style.background = 'var(--cream)';
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input area ─────────────────────────────────────────────── */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border)',
              background: 'var(--warm-white)',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 8,
                background: 'var(--cream)',
                border: '1.5px solid var(--border)',
                borderRadius: 6, padding: '8px 8px 8px 14px',
                transition: 'border-color 0.18s',
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--forest)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    // Auto-resize up to 4 rows
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={copy.placeholder}
                  disabled={loading}
                  style={{
                    flex: 1, resize: 'none', border: 'none', outline: 'none',
                    background: 'transparent',
                    fontFamily: 'Jost, sans-serif', fontSize: 13.5,
                    color: 'var(--ink)', lineHeight: 1.5,
                    minHeight: 22, maxHeight: 96,
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    flexShrink: 0, width: 34, height: 34, borderRadius: 5,
                    border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                    background: loading || !input.trim() ? 'var(--sage-pale)' : 'var(--forest)',
                    color: loading || !input.trim() ? 'var(--ink-faint)' : 'var(--cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, transition: 'all 0.15s',
                    transform: 'none',
                  }}
                  onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.background = 'var(--forest-mid)'; }}
                  onMouseLeave={e => { if (!loading && input.trim()) e.currentTarget.style.background = 'var(--forest)'; }}
                >
                  {loading ? (
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                  ) : '↑'}
                </button>
              </div>

              {/* Disclaimer */}
              <p style={{
                fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 500,
                textAlign: 'center', marginTop: 6, letterSpacing: '0.02em',
              }}>
                ⚕ {copy.disclaimer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Global keyframe styles ──────────────────────────────────────── */}
      <style>{`
        @keyframes chatPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 0.2; }
        }
        @keyframes unreadBounce {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}