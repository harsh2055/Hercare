// client/src/pages/Pregnancy.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPregnancy, createPregnancy } from '../services/api';
import SymptomLogger from '../components/SymptomLogger';
import { formatDate, daysUntil } from '../utils/dateUtils';

const MILESTONES = [
  { week: 6,  label: 'Heartbeat detectable',          icon: '💓' },
  { week: 10, label: 'Embryo becomes a foetus',        icon: '🌱' },
  { week: 12, label: 'First trimester complete',       icon: '🎉' },
  { week: 16, label: 'Baby starts moving',             icon: '🌟' },
  { week: 20, label: 'Anatomy scan due',               icon: '🔬' },
  { week: 24, label: 'Viability milestone',            icon: '✨' },
  { week: 28, label: 'Third trimester begins',         icon: '🌸' },
  { week: 32, label: 'Baby practising breathing',      icon: '🫁' },
  { week: 36, label: 'Full-term in 4 weeks',           icon: '🍼' },
  { week: 40, label: 'Due date',                       icon: '👶' },
];

const tips = {
  1: ['Take folic acid 400mcg daily', 'Avoid alcohol, smoking, raw fish', 'Nausea is normal — eat small, frequent meals', 'Book your first prenatal appointment'],
  2: ['Schedule anatomy scan around week 20', 'Increase calcium and vitamin D intake', 'Begin tracking baby movements', 'Sleep on your side for comfort'],
  3: ['Weekly checkups from week 36', 'Prepare your birth plan and hospital bag', 'Practise breathing and relaxation techniques', 'Watch for signs of labour'],
};

export default function Pregnancy() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [activeSection, setActiveSection] = useState('journey'); // 'journey' | 'symptoms'
  const [form, setForm] = useState({ dueDate: '', lastMenstrualPeriod: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await getPregnancy();
      setData(data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const { data: r } = await createPregnancy(form);
      setData(r);
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const daysLeft  = data ? daysUntil(data.dueDate) : null;
  const pct       = data ? Math.min(100, Math.round((data.currentWeek / 40) * 100)) : 0;
  const trimColors = { 1: 'var(--sage)', 2: 'var(--forest-mid)', 3: 'var(--gold)' };
  const trimBg     = { 1: 'var(--sage-pale)', 2: '#e8f0e9', 3: 'var(--gold-pale)' };

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Maternal Health</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Pregnancy Journey
          </h1>
        </div>
        <button className={`btn ${data ? 'btn-outline' : 'btn-primary'}`} onClick={() => setShowForm(!showForm)}>
          {data ? 'Update Details' : '+ Add Pregnancy'}
        </button>
      </div>

      {/* ── Section Navigation ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
        {[
          { key: 'journey',  label: 'Journey & Milestones', icon: '◎' },
          { key: 'symptoms', label: 'Symptom Tracker',       icon: '◈' },
        ].map(s => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveSection(s.key)}
            style={{
              padding: '12px 24px', border: 'none', cursor: 'pointer',
              fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: 'transparent',
              color: activeSection === s.key ? 'var(--forest)' : 'var(--ink-soft)',
              borderBottom: activeSection === s.key ? '2px solid var(--forest)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* ── Add / Edit Pregnancy Form ────────────────────────────────────── */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ padding: 28, marginBottom: 24, borderTop: '3px solid var(--gold)' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>
            Pregnancy Details
          </h3>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 20 }}>
              <div className="field">
                <label className="label">Due Date *</label>
                <input className="input" type="date" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Last Menstrual Period</label>
                <input className="input" type="date" value={form.lastMenstrualPeriod}
                  onChange={e => setForm({ ...form, lastMenstrualPeriod: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── JOURNEY SECTION ─────────────────────────────────────────────── */}
      {activeSection === 'journey' && data && (
        <motion.div key="journey" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Hero week card */}
              <div className="card" style={{ padding: 36, borderTop: `4px solid ${trimColors[data.trimester] || 'var(--sage)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 10, color: trimColors[data.trimester] }}>Trimester {data.trimester}</p>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 68, fontWeight: 300, color: 'var(--ink)', lineHeight: 1, marginBottom: 4 }}>
                      Wk {data.currentWeek}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500 }}>of 40 weeks</p>
                  </div>
                  <div style={{ textAlign: 'right', padding: '16px 20px', background: trimBg[data.trimester] || 'var(--sage-pale)', borderRadius: 3 }}>
                    <p style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Due Date</p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--ink)', marginBottom: 4 }}>{formatDate(data.dueDate)}</p>
                    <p style={{ fontSize: 13, color: trimColors[data.trimester], fontWeight: 600 }}>
                      {daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? 'Due today!' : 'Past due date'}
                    </p>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>
                    <span>Week 1</span><span>Week 20</span><span>Week 40</span>
                  </div>
                  <div className="progress-track">
                    <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6 }}>{pct}% of pregnancy complete</p>
                </div>
              </div>

              {/* Baby + Mom */}
              {data.guidance && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="card" style={{ padding: 22 }}>
                    <p className="eyebrow" style={{ marginBottom: 10 }}>👶 Baby This Week</p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                      Size: <em>{data.guidance.size}</em>
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.7 }}>{data.guidance.baby}</p>
                  </div>
                  <div className="card" style={{ padding: 22 }}>
                    <p className="eyebrow" style={{ marginBottom: 10 }}>🤱 For You</p>
                    <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.7 }}>{data.guidance.mom}</p>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>
                  Trimester {data.trimester} Guidance
                </h3>
                {(tips[data.trimester] || []).map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < tips[data.trimester].length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--gold)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>✦</span>
                    <span style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Symptom prompt */}
              <div className="card" style={{ padding: 24, borderTop: '3px solid var(--sage)', cursor: 'pointer' }}
                onClick={() => setActiveSection('symptoms')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>◈</span>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)' }}>
                    Track Pregnancy Symptoms
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                  Log nausea, heartburn, back pain, fatigue, shortness of breath and 12 other pregnancy-specific symptoms.
                </p>
                <p style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 700, marginTop: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Open Symptom Tracker →
                </p>
              </div>
            </div>

            {/* Milestones timeline */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>Pregnancy Milestones</h3>
              </div>
              <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 600 }}>
                <div style={{ position: 'relative' }}>
                  <div className="timeline-line" />
                  {MILESTONES.map((m, i) => {
                    const done = data.currentWeek >= m.week;
                    const now  = data.currentWeek === m.week;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 22, position: 'relative' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                          background: done ? 'var(--forest)' : now ? 'var(--gold-pale)' : 'var(--warm-white)',
                          border: `2px solid ${done ? 'var(--forest)' : now ? 'var(--gold)' : 'var(--border)'}`,
                          color: done ? 'white' : now ? 'var(--gold)' : 'var(--ink-faint)',
                          transition: 'all 0.3s',
                        }}>
                          {done ? '✓' : m.icon}
                        </div>
                        <div style={{ paddingTop: 4 }}>
                          <p style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 3, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Week {m.week}</p>
                          <p style={{ fontSize: 14, fontWeight: done || now ? 600 : 400, color: done ? 'var(--ink)' : now ? 'var(--forest)' : 'var(--ink-soft)' }}>
                            {m.label}
                          </p>
                          {now && <span className="badge badge-gold" style={{ marginTop: 4 }}>You are here</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SYMPTOM TRACKER SECTION ──────────────────────────────────────── */}
      {activeSection === 'symptoms' && (
        <motion.div key="symptoms" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <SymptomLogger defaultTab="pregnancy" />
        </motion.div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!data && !loading && activeSection === 'journey' && (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 4, borderTop: '4px solid var(--gold)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, color: 'var(--sage)', marginBottom: 16, opacity: 0.4 }}>◎</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>Track Your Pregnancy</h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Enter your due date for week-by-week guidance, milestone tracking, and personalised tips.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ padding: '13px 36px' }}>
            + Add Pregnancy Details
          </button>
        </div>
      )}

      <div className="alert-gold" style={{ marginTop: 24 }}>
        ⚕ This information is for educational purposes only. Always follow your healthcare provider's guidance throughout your pregnancy.
      </div>
    </div>
  );
}