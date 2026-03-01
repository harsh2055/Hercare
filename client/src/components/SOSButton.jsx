// client/src/components/SOSButton.jsx
//
// Self-contained SOS system — exports:
//   default export → SOSButton  (the fixed floating trigger)
//   named export   → SOSModal   (the full-screen emergency panel)
//
// Usage in App.jsx Shell (already updated in the App.jsx file below):
//   import SOSButton from './components/SOSButton';
//   <SOSButton />   ← drop inside Shell, renders both button + modal
//
// No backend changes. No dependencies beyond framer-motion (already installed).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Emergency contact data ────────────────────────────────────────────────────
const EMERGENCY_CONTACTS = [
  // ── Medical ──────────────────────────────────────────────────────────────
  {
    category: 'Medical Emergency',
    categoryColor: '#dc2626',
    categoryBg: '#fef2f2',
    icon: '🚑',
    contacts: [
      {
        name: 'Ambulance',
        number: '102',
        altNumber: '108',
        description: 'National ambulance helpline. Free 24/7.',
        altDescription: 'Emergency Medical Services (EMRI)',
        priority: true,
      },
      {
        name: 'Police',
        number: '100',
        description: 'National police emergency. Free 24/7.',
        priority: true,
      },
      {
        name: 'Women\'s Helpline',
        number: '1091',
        description: 'National women\'s emergency helpline. Free 24/7.',
        priority: true,
      },
      {
        name: 'National Emergency',
        number: '112',
        description: 'Single all-in-one emergency number. Police, fire & medical.',
        priority: false,
      },
    ],
  },

  // ── Mental Health ─────────────────────────────────────────────────────────
  {
    category: 'Mental Health Support',
    categoryColor: '#7c3aed',
    categoryBg: '#f5f3ff',
    icon: '💜',
    contacts: [
      {
        name: 'iCall',
        number: '9152987821',
        description: 'Psychosocial helpline by TISS. Mon–Sat 8am–10pm.',
        priority: true,
      },
      {
        name: 'Vandrevala Foundation',
        number: '1860-2662-345',
        description: '24/7 mental health support. Free & confidential.',
        priority: true,
      },
      {
        name: 'Snehi',
        number: '044-24640050',
        description: 'Emotional support and suicide prevention. Daily 8am–10pm.',
        priority: false,
      },
      {
        name: 'NIMHANS Helpline',
        number: '080-46110007',
        description: 'National Institute of Mental Health & Neurosciences.',
        priority: false,
      },
    ],
  },

  // ── Maternal / Pregnancy ──────────────────────────────────────────────────
  {
    category: 'Maternal & Pregnancy',
    categoryColor: '#0369a1',
    categoryBg: '#eff6ff',
    icon: '🤱',
    contacts: [
      {
        name: 'Janani Suraksha Yojana',
        number: '104',
        description: 'Government maternal health helpline. Free 24/7.',
        priority: true,
      },
      {
        name: 'MoHFW Health Helpline',
        number: '1800-180-1104',
        description: 'Ministry of Health & Family Welfare. Free helpline.',
        priority: false,
      },
      {
        name: 'National Health Mission',
        number: '104',
        description: 'State health helpline for maternal & child health.',
        priority: false,
      },
    ],
  },

  // ── Domestic Safety ───────────────────────────────────────────────────────
  {
    category: 'Safety & Domestic Violence',
    categoryColor: '#b45309',
    categoryBg: '#fffbeb',
    icon: '🛡️',
    contacts: [
      {
        name: 'NCW Helpline',
        number: '7827170170',
        description: 'National Commission for Women. WhatsApp & call.',
        priority: true,
      },
      {
        name: 'Domestic Violence Helpline',
        number: '181',
        description: 'Women in distress helpline. Free 24/7.',
        priority: true,
      },
    ],
  },
];

// ── Contact card sub-component ────────────────────────────────────────────────
function ContactCard({ contact, categoryColor, index }) {
  const [calling, setCalling] = useState(false);

  const handleCall = (num) => {
    setCalling(true);
    window.location.href = `tel:${num.replace(/[-\s]/g, '')}`;
    setTimeout(() => setCalling(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: contact.priority ? 'white' : 'var(--cream)',
        border: `1px solid ${contact.priority ? categoryColor + '33' : 'var(--border)'}`,
        borderLeft: `3px solid ${contact.priority ? categoryColor : 'var(--border)'}`,
        borderRadius: 4,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
      }}
    >
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: 14, fontWeight: 700,
            color: '#111110',
          }}>
            {contact.name}
          </span>
          {contact.priority && (
            <span style={{
              fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2,
              background: categoryColor + '18',
              color: categoryColor,
            }}>Priority</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
          {contact.description}
        </p>
        {contact.altNumber && contact.altDescription && (
          <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', margin: '4px 0 0', lineHeight: 1.4 }}>
            Also: <strong>{contact.altNumber}</strong> — {contact.altDescription}
          </p>
        )}
      </div>

      {/* Call button(s) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <motion.a
          href={`tel:${contact.number.replace(/[-\s]/g, '')}`}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setCalling(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 3,
            background: categoryColor,
            color: 'white',
            textDecoration: 'none',
            fontFamily: 'Jost, sans-serif',
            fontSize: 14, fontWeight: 800,
            letterSpacing: '0.02em',
            boxShadow: `0 2px 10px ${categoryColor}44`,
            transition: 'box-shadow 0.15s',
          }}
        >
          <span style={{ fontSize: 13 }}>📞</span>
          <span>{contact.number}</span>
        </motion.a>

        {contact.altNumber && (
          <motion.a
            href={`tel:${contact.altNumber.replace(/[-\s]/g, '')}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 3,
              background: 'transparent',
              color: categoryColor,
              textDecoration: 'none',
              fontFamily: 'Jost, sans-serif',
              fontSize: 13, fontWeight: 700,
              border: `1.5px solid ${categoryColor}55`,
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ fontSize: 12 }}>📞</span>
            <span>{contact.altNumber}</span>
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

// ── SOS Modal ─────────────────────────────────────────────────────────────────
export function SOSModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [confirming,     setConfirming]     = useState(false);
  const closeTimerRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const current = EMERGENCY_CONTACTS[activeCategory];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────── */}
          <motion.div
            key="sos-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 3000,
              background: 'rgba(17, 0, 0, 0.72)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* ── Panel ─────────────────────────────────────────────────── */}
          <motion.div
            key="sos-panel"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              zIndex: 3001,
              background: 'white',
              borderRadius: '16px 16px 0 0',
              maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -16px 64px rgba(220,38,38,0.18), 0 -2px 12px rgba(0,0,0,0.1)',
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{
              background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 60%, #b91c1c 100%)',
              padding: '20px 24px 18px',
              position: 'relative', overflow: 'hidden',
              flexShrink: 0,
            }}>
              {/* Decorative rings */}
              <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: -10, top: -10, width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                {/* Pulsing SOS badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    position: 'absolute', inset: -5, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    animation: 'sosPulse 1.4s ease-in-out infinite',
                  }} />
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    🚨
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 24, fontWeight: 700,
                    color: 'white', margin: 0, lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                  }}>
                    Emergency Contacts
                  </h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0', fontWeight: 500 }}>
                    India · All numbers are free to call 24/7
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  aria-label="Close emergency panel"
                  style={{
                    width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.8)', fontSize: 18, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                >
                  ×
                </button>
              </div>

              {/* Urgent callout */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 3, padding: '8px 12px',
                fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <span>If you are in immediate danger — call <strong>112</strong> (national emergency) or <strong>102</strong> (ambulance) right now.</span>
              </div>
            </div>

            {/* ── Category tabs ────────────────────────────────────────── */}
            <div style={{
              display: 'flex', overflowX: 'auto', flexShrink: 0,
              borderBottom: '1px solid var(--border)',
              scrollbarWidth: 'none',
              background: 'white',
            }}>
              {EMERGENCY_CONTACTS.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCategory(i)}
                  style={{
                    flexShrink: 0,
                    padding: '12px 18px',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    background: 'transparent',
                    color: activeCategory === i ? cat.categoryColor : 'var(--ink-soft)',
                    borderBottom: activeCategory === i ? `2.5px solid ${cat.categoryColor}` : '2.5px solid transparent',
                    marginBottom: -1, transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.category.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* ── Scrollable contacts ──────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>

              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 3, marginBottom: 16,
                background: current.categoryBg,
                border: `1px solid ${current.categoryColor}22`,
              }}>
                <span style={{ fontSize: 20 }}>{current.icon}</span>
                <div>
                  <p style={{
                    fontSize: 13, fontWeight: 700,
                    color: current.categoryColor, margin: 0,
                  }}>
                    {current.category}
                  </p>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', margin: 0 }}>
                    {current.contacts.length} helplines · Tap a number to call directly
                  </p>
                </div>
              </div>

              {/* Contact cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {current.contacts.map((contact, i) => (
                    <ContactCard
                      key={i}
                      contact={contact}
                      categoryColor={current.categoryColor}
                      index={i}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Disclaimer */}
              <div style={{
                marginTop: 20, padding: '12px 14px',
                background: 'var(--gold-pale)',
                border: '1px solid var(--gold-light)',
                borderRadius: 3,
                fontSize: 12, color: '#5a3e08', fontWeight: 500, lineHeight: 1.6,
              }}>
                ⚕ These numbers are informational. HerCare is not affiliated with any of these services. In a life-threatening emergency, always call <strong>112</strong> immediately.
              </div>
            </div>
          </motion.div>

          <style>{`
            @keyframes sosPulse {
              0%, 100% { transform: scale(1);    opacity: 0.6; }
              50%       { transform: scale(1.18); opacity: 0.15; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}

// ── SOS Button (floating trigger) ────────────────────────────────────────────
// ── SOS Button (floating trigger) ────────────────────────────────────────────
export default function SOSButton() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [pressed,   setPressed]   = useState(false);
  const [holdCount, setHoldCount] = useState(0);
  const holdTimer  = useRef(null);
  const holdFill   = useRef(null);

  // Long-press to open (400ms hold) — prevents accidental taps
  const startHold = useCallback(() => {
    setPressed(true);
    setHoldCount(0);

    // Tick up every 80ms → 5 ticks = 400ms total → open
    let count = 0;
    holdTimer.current = setInterval(() => {
      count += 1;
      setHoldCount(count);
      if (count >= 5) {
        clearInterval(holdTimer.current);
        setPressed(false);
        setHoldCount(0);
        setIsOpen(true);
      }
    }, 80);
  }, []);

  const cancelHold = useCallback(() => {
    clearInterval(holdTimer.current);
    setPressed(false);
    setHoldCount(0);
  }, []);

  useEffect(() => () => clearInterval(holdTimer.current), []);

  const fillPct = Math.min(100, (holdCount / 5) * 100);

  return (
    <>
      {/* ── Floating SOS button ──────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 400, damping: 28 }}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onClick={() => { if (!pressed) setIsOpen(true); }} // also allow single tap
        aria-label="Open emergency contacts"
        style={{
          position: 'fixed',
          // Positioned right side, bottom — stacked above ChatBot
          bottom: 110, right: 32,
          zIndex: 999,
          width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: pressed
            ? 'linear-gradient(135deg, #7f1d1d, #dc2626)'
            : 'linear-gradient(135deg, #991b1b, #dc2626)',
          boxShadow: pressed
            ? '0 0 0 6px rgba(220,38,38,0.2), 0 4px 20px rgba(220,38,38,0.45)'
            : '0 4px 20px rgba(220,38,38,0.35), 0 1px 6px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'box-shadow 0.15s, background 0.15s',
          outline: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Idle pulse ring */}
        {!pressed && (
          <div style={{
            position: 'absolute', inset: -5, borderRadius: '50%',
            border: '2px solid rgba(220,38,38,0.35)',
            animation: 'sosBtnPulse 2.4s ease-in-out infinite',
          }} />
        )}

        {/* Hold-progress arc overlay */}
        {pressed && (
          <svg
            width="60" height="60" viewBox="0 0 60 60"
            style={{ position: 'absolute', inset: -4, transform: 'rotate(-90deg)' }}
          >
            <circle cx="30" cy="30" r="27" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <circle
              cx="30" cy="30" r="27" fill="none"
              stroke="white" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 27}`}
              strokeDashoffset={`${2 * Math.PI * 27 * (1 - fillPct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.08s linear' }}
            />
          </svg>
        )}

        {/* Icon */}
        <span style={{
          fontSize: 20, position: 'relative', zIndex: 1,
          transform: pressed ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.1s',
          filter: pressed ? 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' : 'none',
        }}>
          🚨
        </span>
      </motion.button>

      {/* Hold tooltip */}
      <AnimatePresence>
        {pressed && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: 122, right: 92, zIndex: 999,
              background: '#1a0000', color: 'rgba(255,255,255,0.9)',
              padding: '6px 12px', borderRadius: 3,
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}
          >
            Opening emergency contacts…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label under button */}
      <div style={{
        position: 'fixed', bottom: 90, right: 32,
        zIndex: 999, width: 52, textAlign: 'center',
        fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'rgba(220,38,38,0.7)',
        pointerEvents: 'none',
      }}>
        SOS
      </div>

      {/* The modal */}
      <SOSModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <style>{`
        @keyframes sosBtnPulse {
          0%, 100% { transform: scale(1);    opacity: 0.5; }
          50%       { transform: scale(1.22); opacity: 0.12; }
        }
      `}</style>
    </>
  );
}
