// client/src/pages/CycleTracking.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCycleLogs, createCycleLog } from '../services/api';
import CycleCalendar from '../components/CycleCalendar';
import SymptomLogger from '../components/SymptomLogger';
import { formatDate, daysUntil, getCurrentCycleDay, getCyclePhase, phaseNames } from '../utils/dateUtils';

export default function CycleTracking() {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showLog,  setShowLog]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'symptoms'
  const [form, setForm] = useState({
    lastPeriodDate: new Date().toISOString().split('T')[0],
    cycleLength: 28,
    periodLength: 5,
    flow: 'medium',
    notes: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await getCycleLogs();
      setData(data);
    } catch {
      setData({ logs: [], avgCycleLength: 28 });
    } finally {
      setLoading(false);
    }
  };

  const logPeriod = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await createCycleLog(form);
      await load();
      setShowLog(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const latest   = data?.logs?.[0];
  const cycleDay = latest ? getCurrentCycleDay(latest.lastPeriodDate) : null;
  const phase    = cycleDay ? getCyclePhase(cycleDay, data?.avgCycleLength) : 'unknown';
  const set      = f => e => setForm({ ...form, [f]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value });

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Menstrual Health</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Cycle Tracking
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLog(!showLog)}>
          + Log Period
        </button>
      </div>

      {/* ── Section Navigation ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
        {[
          { key: 'overview',  label: 'Overview & Calendar', icon: '◐' },
          { key: 'symptoms',  label: 'Symptom Tracker',     icon: '◈' },
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

      {/* ── Log Period Form ──────────────────────────────────────────────── */}
      {showLog && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ padding: 28, marginBottom: 24, borderTop: '3px solid var(--forest)' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>
            Log Period
          </h3>
          <form onSubmit={logPeriod}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px 20px', marginBottom: 16 }}>
              {[
                { label: 'Period Start Date', type: 'date',   f: 'lastPeriodDate', val: form.lastPeriodDate },
                { label: 'Cycle Length (days)', type: 'number', f: 'cycleLength', val: form.cycleLength, min: 21, max: 45 },
                { label: 'Period Length (days)', type: 'number', f: 'periodLength', val: form.periodLength, min: 2, max: 10 },
              ].map(({ label, type, f, val, min, max }) => (
                <div key={f} className="field">
                  <label className="label">{label}</label>
                  <input className="input" type={type} value={val} min={min} max={max} onChange={set(f)} required />
                </div>
              ))}
              <div className="field">
                <label className="label">Flow Intensity</label>
                <select className="input" value={form.flow} onChange={set('flow')}>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label className="label">Notes (optional)</label>
              <input className="input" placeholder="Any notes for this cycle…" value={form.notes} onChange={set('notes')} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Period'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowLog(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── OVERVIEW SECTION ────────────────────────────────────────────── */}
      {activeSection === 'overview' && (
        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {latest && (
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>
                      Cycle Calendar
                    </h2>
                    <span className="badge badge-forest">{data?.avgCycleLength || 28}-day avg cycle</span>
                  </div>
                  <CycleCalendar cycleData={data} phase={phase} cycleDay={cycleDay} />
                </div>
              )}

              {data?.logs?.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>
                      Cycle History
                    </h3>
                  </div>
                  <table className="data-table">
                    <thead><tr>
                      {['Period Date', 'Cycle Length', 'Flow', 'Next Predicted', 'Days Left'].map(h => <th key={h}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {data.logs.slice(0, 7).map((log, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{formatDate(log.lastPeriodDate)}</td>
                          <td>{log.cycleLength} days</td>
                          <td><span className="badge badge-sage">{log.flow}</span></td>
                          <td>{formatDate(log.predictedNextDate)}</td>
                          <td><span className="badge badge-gold">{Math.max(0, daysUntil(log.predictedNextDate))}d</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {latest ? (
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>
                    Current Status
                  </h3>
                  {[
                    ['Phase',        phaseNames[phase] || '—'],
                    ['Cycle Day',    cycleDay ? `Day ${cycleDay}` : '—'],
                    ['Last Period',  formatDate(latest.lastPeriodDate)],
                    ['Next Period',  `${formatDate(latest.predictedNextDate)} · in ${Math.max(0, daysUntil(latest.predictedNextDate))}d`],
                    ['Ovulation',    `${formatDate(latest.ovulationDate)} · in ${Math.max(0, daysUntil(latest.ovulationDate))}d`],
                    ['Average Cycle',`${data?.avgCycleLength || 28} days`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                      <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{k}</span>
                      <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right', maxWidth: 180 }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="card" style={{ padding: 36, textAlign: 'center', borderTop: '3px solid var(--gold)' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, color: 'var(--sage)', marginBottom: 14, opacity: 0.5 }}>◐</div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>No Data Yet</h3>
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 20 }}>
                      Log your first period to begin tracking your cycle.
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowLog(true)}>+ Log Your First Period</button>
                  </div>
                )
              )}

              {/* Quick-access symptom prompt */}
              <div className="card" style={{ padding: 24, borderTop: '3px solid var(--sage)', cursor: 'pointer' }}
                onClick={() => setActiveSection('symptoms')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>◈</span>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)' }}>
                    Log Today's Symptoms
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                  Track cramping, bloating, mood changes, fatigue and more across general, menstrual, and pregnancy categories.
                </p>
                <p style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 700, marginTop: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Open Symptom Tracker →
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SYMPTOM TRACKER SECTION ──────────────────────────────────────── */}
      {activeSection === 'symptoms' && (
        <motion.div key="symptoms" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <SymptomLogger defaultTab="menstrual" />
        </motion.div>
      )}
    </div>
  );
}