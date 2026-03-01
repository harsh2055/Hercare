// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ── Mount React app ───────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── Service Worker Registration ───────────────────────────────────────────────
// Only register in production (Vite sets import.meta.env.PROD = true in builds).
// In development, the SW would interfere with HMR.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // always check for SW updates from network
      });

      console.log('[SW] Registered. Scope:', registration.scope);

      // Check for updates every time the page gains focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });

      // Notify user when a new version is available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // A new version is ready — show update banner
            showUpdateBanner(newWorker);
          }
        });
      });
    } catch (error) {
      console.warn('[SW] Registration failed:', error);
    }
  });
}

// ── Install prompt (Add to Home Screen) ──────────────────────────────────────
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show custom install banner after 30s on site (not intrusive)
  setTimeout(() => {
    if (deferredPrompt) showInstallBanner();
  }, 30000);
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  console.log('[PWA] App installed successfully');
  removeInstallBanner();
});

// ── Online / Offline status banner ───────────────────────────────────────────
let offlineBanner = null;

function showOfflineBanner() {
  if (offlineBanner) return;
  offlineBanner = createBanner({
    id: 'hercare-offline-banner',
    bg: '#1a0000',
    border: '#7f1d1d',
    icon: '📶',
    message: 'You\'re offline — showing cached data where available.',
    actionLabel: null,
  });
}

function removeOfflineBanner() {
  if (offlineBanner) {
    offlineBanner.style.transform = 'translateY(-100%)';
    offlineBanner.style.opacity = '0';
    setTimeout(() => offlineBanner?.remove(), 300);
    offlineBanner = null;
  }
}

window.addEventListener('online',  () => {
  removeOfflineBanner();
  // Brief "back online" toast
  const toast = createBanner({
    id: 'hercare-online-toast',
    bg: '#14532d',
    border: '#16a34a',
    icon: '✓',
    message: 'Back online — syncing your health data.',
    actionLabel: null,
    autoRemove: 3500,
  });
});

window.addEventListener('offline', showOfflineBanner);

// Show offline banner immediately if already offline on load
if (!navigator.onLine) showOfflineBanner();

// ── Update banner ─────────────────────────────────────────────────────────────
function showUpdateBanner(newWorker) {
  createBanner({
    id: 'hercare-update-banner',
    bg: '#1a2e1f',
    border: '#c9a84c',
    icon: '✦',
    message: 'A new version of HerCare is available.',
    actionLabel: 'Update Now',
    onAction: () => {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    },
  });
}

// ── Install banner ────────────────────────────────────────────────────────────
let installBannerEl = null;

function showInstallBanner() {
  if (installBannerEl) return;
  installBannerEl = createBanner({
    id: 'hercare-install-banner',
    bg: '#1a2e1f',
    border: '#3d6647',
    icon: '🌿',
    message: 'Add HerCare to your home screen for quick access.',
    actionLabel: 'Install App',
    dismissLabel: 'Not Now',
    onAction: async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Install prompt outcome:', outcome);
      deferredPrompt = null;
      removeInstallBanner();
    },
    onDismiss: removeInstallBanner,
    autoRemove: 15000,
  });
}

function removeInstallBanner() {
  if (installBannerEl) {
    installBannerEl.style.transform = 'translateY(-100%)';
    installBannerEl.style.opacity = '0';
    setTimeout(() => installBannerEl?.remove(), 300);
    installBannerEl = null;
  }
}

// ── Banner factory ────────────────────────────────────────────────────────────
function createBanner({ id, bg, border, icon, message, actionLabel, dismissLabel, onAction, onDismiss, autoRemove }) {
  // Remove existing banner with same id
  document.getElementById(id)?.remove();

  const banner = document.createElement('div');
  banner.id = id;
  Object.assign(banner.style, {
    position: 'fixed', top: '0', left: '0', right: '0',
    zIndex: '9999',
    background: bg,
    borderBottom: `2px solid ${border}`,
    padding: '10px 20px',
    display: 'flex', alignItems: 'center', gap: '12px',
    fontFamily: 'Jost, sans-serif', fontSize: '13px', fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
    transform: 'translateY(-100%)', opacity: '0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  });

  banner.innerHTML = `
    <span style="font-size:16px;flex-shrink:0">${icon}</span>
    <span style="flex:1;line-height:1.4">${message}</span>
    ${actionLabel ? `<button id="${id}-action" style="
      padding:6px 16px; border-radius:3px; border:none; cursor:pointer;
      background:${border}; color:white; font-family:Jost,sans-serif;
      font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
      flex-shrink:0; white-space:nowrap;
    ">${actionLabel}</button>` : ''}
    ${dismissLabel ? `<button id="${id}-dismiss" style="
      padding:6px 14px; border-radius:3px; cursor:pointer;
      background:transparent; border:1px solid rgba(255,255,255,0.2);
      color:rgba(255,255,255,0.7); font-family:Jost,sans-serif;
      font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase;
      flex-shrink:0; white-space:nowrap;
    ">${dismissLabel}</button>` : ''}
    <button id="${id}-close" style="
      width:28px; height:28px; border-radius:50%; border:none; cursor:pointer;
      background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6);
      font-size:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
    ">×</button>
  `;

  document.body.prepend(banner);

  // Animate in
  requestAnimationFrame(() => {
    banner.style.transform = 'translateY(0)';
    banner.style.opacity = '1';
  });

  // Wire up actions
  banner.querySelector(`#${id}-action`)?.addEventListener('click', () => {
    onAction?.();
    banner.remove();
  });
  banner.querySelector(`#${id}-dismiss`)?.addEventListener('click', () => {
    onDismiss?.();
    banner.remove();
  });
  banner.querySelector(`#${id}-close`)?.addEventListener('click', () => {
    onDismiss?.();
    banner.style.transform = 'translateY(-100%)';
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 300);
  });

  // Auto-remove if requested
  if (autoRemove) {
    setTimeout(() => {
      banner.style.transform = 'translateY(-100%)';
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 300);
    }, autoRemove);
  }

  return banner;
}