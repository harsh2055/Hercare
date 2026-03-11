// client/src/App.jsx
// REDESIGNED: Mobile-first Shell layout with proper z-index hierarchy,
//             responsive main content area, and bottom nav padding on mobile.
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navigation from './components/Navigation';
import ChatBot from './components/ChatBot';
import SOSButton from './components/SOSButton';
import Dashboard from './pages/Dashboard';
import CycleTracking from './pages/CycleTracking';
import Pregnancy from './pages/Pregnancy';
import Diet from './pages/Diet';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

const Loader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, color: 'var(--forest)', marginBottom: 12, opacity: 0.7 }}>HerCare</div>
      <div style={{ width: 40, height: 2, background: 'var(--gold)', margin: '0 auto', animation: 'loading 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes loading{0%,100%{width:20px;opacity:0.4}50%{width:60px;opacity:1}}`}</style>
    </div>
  </div>
);

const Guard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Shell ─────────────────────────────────────────────────────────────────────
// Z-index hierarchy (highest wins):
//   SOS Modal backdrop    z: 10000
//   SOS Modal content     z: 10001
//   Mobile nav overlay    z: 150
//   Mobile sidebar        z: 160
//   Bottom nav            z: 100
//   Sidebar (desktop)     z: 100
//   Top bar (mobile)      z: 200
//   Sticky header         z: 50
//   ChatBot panel         z: 1000  (defined inside ChatBot.jsx)
//   ChatBot button        z: 1000
//   SOS button (closed)   z: 999
//
// Note: When SOS modal is open it renders at z: 10000+ so it covers everything.
const Shell = ({ children }) => (
  <>
    <style>{`
      /* ── Shell layout ───────────────────────────────── */
      .shell-wrapper {
        display: flex;
        min-height: 100vh;
      }

      .shell-content {
        margin-left: 220px;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: var(--cream);
        transition: margin-left 0.3s ease;
      }

      .shell-topbar {
        height: 56px;
        background: var(--warm-white);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 40px;
        position: sticky;
        top: 0;
        z-index: 50;
        box-shadow: 0 1px 0 var(--border);
      }

      .shell-main {
        flex: 1;
        padding: 44px 48px;
        max-width: 1160px;
        width: 100%;
        margin: 0 auto;
      }

      .shell-footer {
        border-top: 1px solid var(--border);
        padding: 20px 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      /* ── Tablet (481px – 768px) ─────────────────────── */
      @media (max-width: 768px) {
        .shell-content {
          margin-left: 0;
          padding-top: 56px; /* account for mobile top bar */
          padding-bottom: 64px; /* account for bottom nav */
        }

        .shell-topbar {
          display: none; /* hidden on mobile — mobile-topbar replaces it */
        }

        .shell-main {
          padding: 24px 16px;
        }

        .shell-footer {
          padding: 16px;
          flex-direction: column;
          gap: 6px;
          text-align: center;
        }
      }

      /* ── Mobile (320px – 480px) ─────────────────────── */
      @media (max-width: 480px) {
        .shell-main {
          padding: 20px 12px;
        }
      }
    `}</style>

    <div className="shell-wrapper">
      <Navigation />

      <div className="shell-content">
        {/* Top bar (desktop only) */}
        <header className="shell-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }} />
            <span className="topbar-label">Secure &amp; Private Health Platform</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--gold)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
            ⚕ Not a substitute for medical advice
          </div>
        </header>

        {/* Page content */}
        <main className="shell-main page-enter">
          {children}
        </main>

        {/* Footer */}
        <footer className="shell-footer">
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'var(--ink-faint)' }}>HerCare</span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>© 2025 · All health data is private and encrypted</span>
        </footer>
      </div>

      {/* ── Floating global elements ──────────────────────────────────────── */}
      {/* SOS: bottom-left (z-index 999 normally, z-index 10000+ when modal open) */}
      <SOSButton />

      {/* Chat: bottom-right (z-index 1000, defined inside ChatBot) */}
      <ChatBot />
    </div>
  </>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"     element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register"  element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/"          element={<Guard><Shell><Dashboard /></Shell></Guard>} />
      <Route path="/cycle"     element={<Guard><Shell><CycleTracking /></Shell></Guard>} />
      <Route path="/pregnancy" element={<Guard><Shell><Pregnancy /></Shell></Guard>} />
      <Route path="/diet"      element={<Guard><Shell><Diet /></Shell></Guard>} />
      <Route path="/reminders" element={<Guard><Shell><Reminders /></Shell></Guard>} />
      <Route path="/profile"   element={<Guard><Shell><Profile /></Shell></Guard>} />
      <Route path="/admin"     element={<Guard><Shell><AdminDashboard /></Shell></Guard>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}