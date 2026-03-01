// client/src/pages/Profile.jsx
// CHANGE: Import ExportReportButton and add it to the Account Settings header.
// Everything else is identical to the original.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { updateProfile, deleteAccount } from '../services/api';
import { languages } from '../utils/i18n';
import ExportReportButton from '../components/ExportReportButton'; // ← NEW

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [form, setForm] = useState({
    name:              user?.name || '',
    dietaryPreference: user?.dietaryPreference || 'vegetarian',
    language:          user?.language || 'en',
    allergies:         user?.allergies?.join(', ') || '',
  });

  const save = async e => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      const payload = { ...form, allergies: form.allergies ? form.allergies.split(',').map(a => a.trim()) : [] };
      const { data } = await updateProfile(payload);
      updateUser(data); changeLanguage(form.language); setEditing(false); setMsg('Profile updated successfully.');
    } catch { setMsg('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const del = async () => {
    if (!confirm('Delete your HerCare account? All health data will be permanently erased.')) return;
    try { await deleteAccount(); logout(); navigate('/login'); }
    catch { alert('Failed to delete account.'); }
  };

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Account</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          Profile & Settings
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Avatar card */}
          <div className="card" style={{ padding: 28, textAlign: 'center', borderTop: '4px solid var(--gold)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--forest), var(--sage))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 700, color: 'white',
              boxShadow: '0 8px 32px rgba(26,46,31,0.2)',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
              {user?.name}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-forest">{user?.dietaryPreference || 'vegetarian'}</span>
              <span className="badge badge-gold">{languages.find(l => l.code === (user?.language || 'en'))?.name || 'English'}</span>
            </div>
          </div>

          {/* Language selector */}
          <div className="card" style={{ padding: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 14 }}>Language</p>
            {languages.map(lang => (
              <button key={lang.code} onClick={() => { changeLanguage(lang.code); setForm({ ...form, language: lang.code }); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                borderRadius: 3, border: `1.5px solid ${language === lang.code ? 'var(--forest)' : 'var(--border)'}`,
                marginBottom: 6, cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 500, textAlign: 'left',
                background: language === lang.code ? 'var(--sage-pale)' : 'transparent',
                color: language === lang.code ? 'var(--forest)' : 'var(--ink-soft)',
                transition: 'all 0.15s',
              }}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--forest)', fontWeight: 700, letterSpacing: '0.06em' }}>ACTIVE</span>
                )}
              </button>
            ))}
          </div>

          {/* Privacy */}
          <div className="card" style={{ padding: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 14 }}>Privacy & Security</p>
            {['All data is encrypted at rest', 'Never sold or shared with third parties', 'Delete your account and data at any time', 'JWT-authenticated API access'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', fontSize: 13, color: 'var(--ink-mid)' }}>
                <span style={{ color: 'var(--sage)', flexShrink: 0, fontWeight: 700 }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Account Settings card */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>
                Account Settings
              </h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {/* ── Export Report Button ── */}
                <ExportReportButton variant="outline" />

                {!editing && (
                  <button className="btn btn-outline" onClick={() => setEditing(true)} style={{ fontSize: 11, padding: '8px 18px' }}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {msg && (
              <div className={msg.includes('successfully') ? 'alert-green' : 'alert-red'} style={{ marginBottom: 20 }}>
                {msg}
              </div>
            )}

            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', marginBottom: 18 }}>
                <div className="field">
                  <label className="label">Full Name</label>
                  <input className="input" value={form.name} onChange={set('name')} disabled={!editing} required />
                </div>
                <div className="field">
                  <label className="label">Email Address</label>
                  <input className="input" value={user?.email} disabled style={{ color: 'var(--ink-soft)', background: 'var(--cream)' }} />
                </div>
                <div className="field">
                  <label className="label">Dietary Preference</label>
                  <select className="input" value={form.dietaryPreference} onChange={set('dietaryPreference')} disabled={!editing}
                    style={{ background: editing ? 'white' : 'var(--cream)', color: editing ? 'var(--ink)' : 'var(--ink-soft)' }}>
                    <option value="vegetarian">🥬 Vegetarian</option>
                    <option value="vegan">🌱 Vegan</option>
                    <option value="non-vegetarian">🍗 Non-Vegetarian</option>
                    <option value="eggetarian">🥚 Eggetarian</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Allergies (comma separated)</label>
                  <input className="input" placeholder="e.g. gluten, dairy, nuts" value={form.allergies}
                    onChange={set('allergies')} disabled={!editing}
                    style={{ background: editing ? 'white' : 'var(--cream)', color: editing ? 'var(--ink)' : 'var(--ink-soft)' }} />
                </div>
              </div>
              {editing && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                  <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              )}
            </form>
          </div>

          {/* Medical disclaimer */}
          <div className="card" style={{ padding: 24, borderLeft: '3px solid var(--gold)' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
              ⚕ Medical Disclaimer
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.8 }}>
              HerCare is a women's health information platform designed for educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always seek the guidance of a qualified healthcare provider before making any health-related decisions.
            </p>
          </div>

          {/* Danger zone */}
          <div className="card" style={{ padding: 24, borderLeft: '3px solid #ef4444' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#b91c1c', marginBottom: 8 }}>
              Danger Zone
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 16 }}>
              Permanently delete your account and all associated health records. This action is irreversible.
            </p>
            <button className="btn btn-danger" onClick={del} style={{ fontSize: 11, padding: '9px 20px' }}>
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}