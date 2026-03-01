// client/src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../utils/i18n';

const navItems = [
  { key: 'dashboard',     path: '/',         icon: '◈', label: 'Dashboard' },
  { key: 'cycleTracking', path: '/cycle',    icon: '◐', label: 'Cycle Tracking' },
  { key: 'pregnancy',     path: '/pregnancy', icon: '◎', label: 'Pregnancy' },
  { key: 'diet',          path: '/diet',     icon: '◇', label: 'Diet & Exercise' },
  { key: 'reminders',     path: '/reminders', icon: '◷', label: 'Reminders' },
  { key: 'profile',       path: '/profile',   icon: '◉', label: 'Profile' },
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <aside className="sidebar-scroll" style={{
        width: 220, height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0,
        background: 'var(--forest)', display: 'flex', flexDirection: 'column', zIndex: 100,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
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

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '0 4px', marginBottom: 8 }}>Navigation</p>
          {navItems.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}
                className={`nav-link ${active ? 'active' : ''}`}>
                <span style={{ fontSize: 15, opacity: 0.7, width: 20, textAlign: 'center' }}>{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}
            >
              <span style={{ fontSize: 15, opacity: 0.7, width: 20, textAlign: 'center' }}>⚿</span>
              <span style={{ color: 'var(--gold-light)' }}>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Language */}
        <div style={{ padding: '0 12px 16px' }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '0 4px', marginBottom: 8 }}>Language</p>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 3, padding: 3 }}>
            {languages.map(lang => (
              <button key={lang.code} onClick={() => changeLanguage(lang.code)} style={{
                flex: 1, padding: '6px 0', borderRadius: 2, border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: 'Jost, sans-serif', transition: 'all 0.15s',
                background: language === lang.code ? 'var(--gold)' : 'transparent',
                color: language === lang.code ? 'var(--forest)' : 'rgba(255,255,255,0.3)',
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
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
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
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            width: '100%', padding: '9px', borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600,
            fontFamily: 'Jost, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-light)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            Sign Out →
          </button>
        </div>
      </aside>
    </>
  );
}