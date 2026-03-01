// client/src/App.jsx
// CHANGES from Step 3 version:
//   1. Import SOSButton
//   2. Mount <SOSButton /> in Shell alongside <ChatBot />
//   Both float globally over all authenticated pages.
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navigation from './components/Navigation';
import ChatBot from './components/ChatBot';         // Step 3
import SOSButton from './components/SOSButton';     // Step 6 ← NEW
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

// ── Shell: wraps all authenticated pages ──────────────────────────────────────
// Both ChatBot and SOSButton are mounted here once — they persist across
// navigation without re-mounting (chat history and SOS state are preserved).
//
// Layout of floating elements:
//   Bottom-left  → SOS Button  (z-index: 999)
//   Bottom-right → Chat Button (z-index: 1000)
//   They never overlap.
const Shell = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Navigation />
    <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Top bar */}
      <header style={{
        height: 56, background: 'var(--warm-white)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 0 var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }} />
          <span className="topbar-label">Secure &amp; Private Health Platform</span>
        </div>
        <div style={{ fontSize: 15, color: 'var(--gold)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
          ⚕ Not a substitute for medical advice
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '44px 48px', maxWidth: 1160, width: '100%', margin: '0 auto' }} className="page-enter">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'var(--ink-faint)' }}>HerCare</span>
        <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>© 2025 · All health data is private and encrypted</span>
      </footer>
    </div>

    {/* ── Floating global elements ─────────────────────────────────────── */}
    {/* SOS: bottom-left  (z-index 999) */}
    <SOSButton />

    {/* Chat: bottom-right (z-index 1000, defined inside ChatBot) */}
    <ChatBot />
  </div>
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