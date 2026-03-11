// client/src/components/SOSButton.jsx
// UPDATED: SOS FAB repositioned to bottom-right, floating above chatbot button.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency',       number: '112',           icon: '🚨', desc: 'Police / Ambulance / Fire — India' },
  { name: 'Women Helpline',           number: '1091',          icon: '👩', desc: 'National Women Helpline — India' },
  { name: 'Domestic Violence',        number: '181',           icon: '🏠', desc: 'Women in Distress Helpline' },
  { name: 'Ambulance',                number: '108',           icon: '🚑', desc: 'Emergency Medical Services' },
  { name: 'iCall Mental Health',      number: '9152987821',    icon: '💚', desc: 'Psychosocial helpline (free)' },
  { name: 'Vandrevala Foundation',    number: '1860-2662-345', icon: '🧠', desc: '24/7 mental health crisis line' },
];

export default function SOSButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!user) return null;

  return (
    <>
      <style>{`
        /* ── SOS floating button ─────────────────────────── */
        /*
         * Stacking order (bottom-right corner):
         *   bottom: 20px  → chatbot button   (z-index: 1000)
         *   bottom: 100px → SOS button       (z-index: 1001)
         *
         * 100px = 20px (chatbot bottom) + ~46px (chatbot height) + 34px (gap)
         * Adjust bottom value if your chatbot button height differs.
         */
        .sos-fab {
          position: fixed;
          bottom: 100px;   /* sits ~80px above the chatbot button at bottom: 20px */
          right: 20px;     /* aligned with chatbot button on the right */
          left: auto;      /* override any inherited left positioning */
          z-index: 1001;   /* one level above chatbot (z-index: 1000) */
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 18px;
          height: 46px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 23px;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow: 0 4px 20px rgba(220,38,38,0.4);
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          -webkit-tap-highlight-color: transparent;
        }

        .sos-fab:hover {
          background: #b91c1c;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(220,38,38,0.5);
        }

        .sos-fab:active {
          transform: translateY(0);
        }

        /* Hide SOS button when modal is open (prevents overlap) */
        .sos-fab.modal-open {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.8);
        }

        /*
         * Mobile: push both buttons above the bottom nav bar (64px tall).
         *   chatbot button expected at: bottom: 76px  (64px nav + 12px gap)
         *   SOS button sits above that: bottom: 76px + 46px (chatbot) + 20px (gap) = 142px
         */
        @media (max-width: 768px) {
          .sos-fab {
            bottom: 142px;
            right: 12px;
            height: 42px;
            padding: 0 14px;
            font-size: 11px;
          }
        }

        /* ── SOS pulse ring ─────────────────────────────── */
        .sos-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
          position: relative;
          flex-shrink: 0;
        }

        .sos-pulse::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.5);
          animation: sosPulse 1.8s ease-in-out infinite;
        }

        @keyframes sosPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.5); opacity: 0; }
        }

        /* ── SOS modal backdrop ─────────────────────────── */
        .sos-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          backdrop-filter: blur(4px);
        }

        /* ── SOS modal panel ────────────────────────────── */
        .sos-panel {
          background: var(--warm-white);
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          z-index: 10001;
          box-shadow: 0 24px 80px rgba(0,0,0,0.4);
          position: relative;
        }

        /* ── SOS panel header ───────────────────────────── */
        .sos-header {
          padding: 24px 24px 20px;
          background: #7f1d1d;
          border-radius: 16px 16px 0 0;
          position: relative;
        }

        /* ── Close button ───────────────────────────────── */
        .sos-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          z-index: 10002;
          -webkit-tap-highlight-color: transparent;
        }

        .sos-close-btn:hover {
          background: rgba(255,255,255,0.25);
          border-color: rgba(255,255,255,0.6);
        }

        .sos-close-btn:active {
          transform: scale(0.92);
        }

        /* ── Contact cards ──────────────────────────────── */
        .sos-contacts {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sos-contact-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
          min-height: 64px;
        }

        .sos-contact-card:hover,
        .sos-contact-card:focus {
          border-color: #dc2626;
          background: #fff5f5;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(220,38,38,0.1);
        }

        .sos-contact-card:active {
          transform: translateY(0);
        }

        .sos-contact-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .sos-contact-info {
          flex: 1;
          min-width: 0;
        }

        .sos-contact-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
          font-family: 'Jost', sans-serif;
          margin-bottom: 2px;
        }

        .sos-contact-desc {
          font-size: 11px;
          color: var(--ink-soft);
          font-family: 'Jost', sans-serif;
        }

        .sos-contact-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          color: #dc2626;
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* ── SOS disclaimer ─────────────────────────────── */
        .sos-disclaimer {
          padding: 16px 24px 20px;
          text-align: center;
          font-size: 11.5px;
          color: var(--ink-faint);
          font-family: 'Jost', sans-serif;
          line-height: 1.6;
          border-top: 1px solid var(--border);
        }
      `}</style>

      {/* ── Floating SOS Button ─────────────────────────────────────────── */}
      <button
        className={`sos-fab ${isOpen ? 'modal-open' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open emergency SOS"
      >
        <div className="sos-pulse" />
        SOS
      </button>

      {/* ── SOS Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sos-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              className="sos-panel"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="sos-header">
                <button
                  className="sos-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close SOS panel"
                >
                  ×
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 48 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>🆘</div>
                  <div>
                    <h2 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 24, fontWeight: 600,
                      color: 'white', margin: 0, lineHeight: 1.2,
                    }}>Emergency Contacts</h2>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', fontFamily: 'Jost, sans-serif' }}>
                      Tap any number to call immediately
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact list */}
              <div className="sos-contacts">
                {EMERGENCY_CONTACTS.map((contact, i) => (
                  <a
                    key={i}
                    href={`tel:${contact.number}`}
                    className="sos-contact-card"
                  >
                    <div className="sos-contact-icon">{contact.icon}</div>
                    <div className="sos-contact-info">
                      <div className="sos-contact-name">{contact.name}</div>
                      <div className="sos-contact-desc">{contact.desc}</div>
                    </div>
                    <div className="sos-contact-number">{contact.number}</div>
                  </a>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="sos-disclaimer">
                <p>⚕ This feature provides quick access to emergency services. In a life-threatening emergency, always call <strong>112</strong> immediately.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
