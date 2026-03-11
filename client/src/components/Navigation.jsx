// client/src/components/Navigation.jsx
// REDESIGNED: Mobile-first with hamburger menu, bottom nav bar, and modern UI
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../utils/i18n';

const navItems = [
  { key: 'dashboard',     path: '/',          icon: '◈', emoji: '🏠', label: 'Dashboard' },
  { key: 'cycleTracking', path: '/cycle',     icon: '◐', emoji: '🌙', label: 'Cycle' },
  { key: 'pregnancy',     path: '/pregnancy', icon: '◎', emoji: '🤱', label: 'Pregnancy' },
  { key: 'diet',          path: '/diet',      icon: '◇', emoji: '🥗', label: 'Diet' },
  { key: 'reminders',     path: '/reminders', icon: '◷', emoji: '🔔', label: 'Reminders' },
  { key: 'profile',       path: '/profile',   icon: '◉', emoji: '👤', label: 'Profile' },
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        /* ── Sidebar scrollbar hide ─────────────────────── */
        .sidebar-scroll::-webkit-scrollbar { display: none; }

        /* ── Sidebar (desktop) ─────────────────────────── */
        .app-sidebar {
          width: 220px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: var(--forest);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* ── Top hamburger bar (mobile only) ────────────── */
        .mobile-topbar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: var(--forest);
          z-index: 200;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          box-shadow: 0 2px 12px rgba(26,46,31,0.3);
        }

        /* ── Mobile drawer overlay ──────────────────────── */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 150;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }

        /* ── Bottom nav bar (mobile only) ──────────────── */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--warm-white);
          border-top: 1px solid var(--border);
          z-index: 100;
          box-shadow: 0 -4px 20px rgba(26,46,31,0.08);
        }

        .bottom-nav-inner {
          display: flex;
          align-items: stretch;
          height: 100%;
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          border: none;
          background: none;
          cursor: pointer;
          padding: 6px 4px;
          position: relative;
          min-width: 44px;
          min-height: 44px;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }

        .bottom-nav-item:active {
          background: var(--sage-pale);
        }

        .bottom-nav-item .bnav-emoji {
          font-size: 18px;
          line-height: 1;
        }

        .bottom-nav-item .bnav-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-family: 'Jost', sans-serif;
        }

        .bottom-nav-item.active .bnav-label {
          color: var(--forest);
        }

        .bottom-nav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--forest);
          border-radius: 0 0 2px 2px;
        }

        /* ── Hamburger button ───────────────────────────── */
        .hamburger-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s;
        }

        .hamburger-btn:active { background: rgba(255,255,255,0.2); }

        .hamburger-line {
          width: 18px;
          height: 2px;
          background: rgba(255,255,255,0.85);
          border-radius: 2px;
          transition: all 0.25s ease;
          transform-origin: center;
        }

        .hamburger-btn.open .hamburger-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .hamburger-btn.open .hamburger-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger-btn.open .hamburger-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ── Responsive breakpoints ─────────────────────── */
        @media (max-width: 768px) {
          .app-sidebar {
            transform: translateX(-100%);
            z-index: 160;
            width: 260px;
          }

          .app-sidebar.mobile-open {
            transform: translateX(0);
            box-shadow: 4px 0 32px rgba(0,0,0,0.3);
          }

          .mobile-topbar {
            display: flex;
          }

          .mobile-overlay.visible {
            display: block;
          }

          .bottom-nav {
            display: block;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── Nav link styles ────────────────────────────── */
        .nav-link-custom {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: rgba(255,255,255,0.55);
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s;
          letter-spacing: 0.01em;
          -webkit-tap-highlight-color: transparent;
          min-height: 44px;
        }

        .nav-link-custom:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
        }

        .nav-link-custom.active {
          background: rgba(201,168,76,0.15);
          color: var(--cream);
        }

        .nav-link-custom.active .nav-icon {
          color: var(--gold);
        }

        .nav-icon {
          font-size: 15px;
          opacity: 0.7;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
          transition: color 0.15s;
        }

        .nav-active-bar {
          width: 3px;
          height: 100%;
          position: absolute;
          left: 0;
          background: var(--gold);
          border-radius: 0 2px 2px 0;
        }
      `}</style>

      {/* ── Mobile top bar ────────────────────────────────────────────────── */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), var(--sage))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
          }}>🌿</div>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600,
            color: 'var(--cream)',
          }}>HerCare</span>
        </div>
        <button
          className={`hamburger-btn ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <div className="hamburger-line" />
          <div className="hamburger-line" />
          <div className="hamburger-line" />
        </button>
      </div>

      {/* ── Overlay (mobile) ──────────────────────────────────────────────── */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`app-sidebar sidebar-scroll ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '36px 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold), var(--sage))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, flexShrink: 0,
            }}>🌿</div>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600,
              color: 'var(--cream)', letterSpacing: '0.02em',
            }}>HerCare</span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', paddingLeft: 38 }}>
            Women's Health
          </p>
        </div>

        {/* Navigation links */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '0 4px', marginBottom: 8 }}>Navigation</p>
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link-custom ${active ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                {active && <div className="nav-active-bar" />}
                <span className="nav-icon">{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`nav-link-custom ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, position: 'relative' }}
            >
              {location.pathname.startsWith('/admin') && <div className="nav-active-bar" />}
              <span className="nav-icon" style={{ color: 'var(--gold-light)' }}>⚿</span>
              <span style={{ color: 'var(--gold-light)' }}>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Language switcher */}
        <div style={{ padding: '0 12px 16px' }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '0 4px', marginBottom: 8 }}>Language</p>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 3, padding: 3 }}>
            {languages.map(lang => (
              <button key={lang.code} onClick={() => changeLanguage(lang.code)} style={{
                flex: 1, padding: '8px 0', borderRadius: 2, border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: 'Jost, sans-serif', transition: 'all 0.15s',
                background: language === lang.code ? 'var(--gold)' : 'transparent',
                color: language === lang.code ? 'var(--forest)' : 'rgba(255,255,255,0.3)',
                minHeight: 36,
              }}>
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* User + Sign out */}
        <div style={{ padding: '14px 12px 32px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--gold), var(--sage-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700, color: 'var(--forest)',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              width: '100%', padding: '10px', borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600,
              fontFamily: 'Jost, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.15s', minHeight: 44,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-light)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            Sign Out →
          </button>
        </div>
      </aside>

      {/* ── Bottom navigation bar (mobile only) ───────────────────────────── */}
      <nav className="bottom-nav" aria-label="Bottom navigation">
        <div className="bottom-nav-inner">
          {navItems.slice(0, 5).map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item ${active ? 'active' : ''}`}
              >
                <span className="bnav-emoji">{item.emoji}</span>
                <span className="bnav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}