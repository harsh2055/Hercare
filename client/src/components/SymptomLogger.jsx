// client/src/components/SymptomLogger.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSymptomLog, getTodaySymptoms, getSymptomLogs } from '../services/api';

// ── Symptom definitions (mirrors server/models/SymptomLog.js SYMPTOM_META) ──
const SYMPTOM_META = {
  // General
  sleep_disruption:      { category: 'general',   label: 'Trouble Sleeping',           emoji: '😴', description: 'Difficulty falling or staying asleep' },
  acne_sensitivity:      { category: 'general',   label: 'Acne & Skin Sensitivity',    emoji: '🌡️', description: 'Hormonal breakouts or reactive skin' },
  mood_fluctuation:      { category: 'general',   label: 'Irritability',               emoji: '😤', description: 'Mood changes tied to hormone shifts' },
  fatigue:               { category: 'general',   label: 'Fatigue',                    emoji: '🪫',  description: 'Persistent low energy or tiredness' },
  food_craving:          { category: 'general',   label: 'Food Cravings',              emoji: '🍫', description: 'Increased hunger or specific urges' },
  cognitive_focus:       { category: 'general',   label: 'Difficulty Concentrating',   emoji: '🌫️', description: 'Brain fog or reduced mental clarity' },
  skin_changes:          { category: 'general',   label: 'Skin Changes',               emoji: '💧', description: 'Dryness, oiliness, or texture changes' },
  // Menstrual
  cramping:              { category: 'menstrual', label: 'Cramping',                   emoji: '😣', description: 'Lower abdominal period cramps' },
  diarrhea:              { category: 'menstrual', label: 'Diarrhea',                   emoji: '🌊', description: 'Digestive tract speedup during period' },
  headache:              { category: 'menstrual', label: 'Headache',                   emoji: '🤕', description: 'Hormonal headaches or migraines' },
  bloating:              { category: 'menstrual', label: 'Bloating',                   emoji: '🫃', description: 'Water retention and abdominal fullness' },
  breast_soreness:       { category: 'menstrual', label: 'Breast Soreness',            emoji: '💗', description: 'Tenderness in breast tissue' },
  low_back_pain:         { category: 'menstrual', label: 'Low Back Pain',              emoji: '🪵', description: 'Radiating ache in lumbar region' },
  // Pregnancy
  energy_depletion:      { category: 'pregnancy', label: 'Energy Depletion',           emoji: '⚡', description: 'Pregnancy-related exhaustion' },
  constipation:          { category: 'pregnancy', label: 'Constipation',               emoji: '🧱', description: 'Slowed digestion due to progesterone' },
  shortness_of_breath:   { category: 'pregnancy', label: 'Shortness of Breath',        emoji: '🫁', description: 'Increased oxygen demand from growing baby' },
  dizziness:             { category: 'pregnancy', label: 'Dizziness',                  emoji: '💫', description: 'Blood pressure or blood sugar fluctuations' },
  back_pain:             { category: 'pregnancy', label: 'Back Pain',                  emoji: '🔧', description: 'Postural strain from shifted centre of gravity' },
  weight_gain:           { category: 'pregnancy', label: 'Weight Gain',                emoji: '⚖️', description: 'Expected body growth during pregnancy' },
  heartburn:             { category: 'pregnancy', label: 'Heartburn',                  emoji: '🔥', description: 'Acid reflux caused by uterine pressure' },
  missed_period:         { category: 'pregnancy', label: 'Missed Period',              emoji: '📅', description: 'Early pregnancy sign' },
  breast_changes:        { category: 'pregnancy', label: 'Breast Changes',             emoji: '🌸', description: 'Fullness, darkening, or tenderness' },
  varicose_veins:        { category: 'pregnancy', label: 'Varicose Veins',             emoji: '🩸', description: 'Increased blood volume affecting veins' },
  implantation_bleeding: { category: 'pregnancy', label: 'Implantation Bleeding',      emoji: '🔴', description: 'Light spotting 6–12 days after conception' },
  darkening_of_areola:   { category: 'pregnancy', label: 'Darkening of Areola',        emoji: '🟤', description: 'Hormonal pigmentation change' },
  nausea:                { category: 'pregnancy', label: 'Nausea',                     emoji: '🤢', description: 'Morning sickness or general queasiness' },
};

const CATEGORIES = [
  { key: 'general',   label: 'General',          icon: '◈', color: 'var(--forest)',    bg: 'var(--sage-pale)' },
  { key: 'menstrual', label: 'Menstrual Cycle',  icon: '◐', color: '#be123c',          bg: '#fff1f2' },
  { key: 'pregnancy', label: 'Pregnancy',        icon: '◎', color: '#b45309',          bg: '#fffbeb' },
];

const SEVERITY_LABELS = { 1: 'Mild', 2: 'Moderate', 3: 'Noticeable', 4: 'Severe', 5: 'Extreme' };
const SEVERITY_COLORS = { 1: '#16a34a', 2: '#ca8a04', 3: '#ea580c', 4: '#dc2626', 5: '#7f1d1d' };

const byCategory = (cat) =>
  Object.entries(SYMPTOM_META)
    .filter(([, v]) => v.category === cat)
    .map(([key, v]) => ({ key, ...v }));

// ── Sub-component: Severity Dot Picker ───────────────────────────────────────
const SeverityPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        title={SEVERITY_LABELS[n]}
        style={{
          width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, fontFamily: 'Jost, sans-serif',
          transition: 'all 0.15s',
          background: n <= value ? SEVERITY_COLORS[value] : 'var(--sage-pale)',
          color: n <= value ? 'white' : 'var(--ink-faint)',
          transform: n === value ? 'scale(1.2)' : 'scale(1)',
          boxShadow: n === value ? `0 2px 8px ${SEVERITY_COLORS[value]}55` : 'none',
        }}
      >
        {n}
      </button>
    ))}
    <span style={{ fontSize: 12, fontWeight: 600, color: SEVERITY_COLORS[value] || 'var(--ink-soft)', marginLeft: 4 }}>
      {SEVERITY_LABELS[value] || '—'}
    </span>
  </div>
);

// ── Sub-component: Symptom Chip (selectable card) ────────────────────────────
const SymptomChip = ({ symptom, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 3, cursor: 'pointer',
      border: `1.5px solid ${isSelected ? 'var(--forest)' : 'var(--border)'}`,
      background: isSelected ? 'var(--sage-pale)' : 'var(--warm-white)',
      transition: 'all 0.15s',
      textAlign: 'left', width: '100%',
    }}
  >
    <span style={{ fontSize: 18, flexShrink: 0 }}>{symptom.emoji}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--forest)' : 'var(--ink)', margin: 0, lineHeight: 1.3 }}>
        {symptom.label}
      </p>
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: 0, marginTop: 2, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {symptom.description}
      </p>
    </div>
    {isSelected && (
      <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )}
  </button>
);

// ── Sub-component: History Row ───────────────────────────────────────────────
const HistoryRow = ({ log }) => {
  const date = new Date(log.date);
  const formatted = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const topSymptom = log.symptoms?.[0];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      {/* Date badge */}
      <div style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 3, background: 'var(--sage-pale)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 16, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'var(--forest)', lineHeight: 1 }}>
          {date.getDate()}
        </span>
        <span style={{ fontSize: 10, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {date.toLocaleString('en', { month: 'short' })}
        </span>
      </div>

      {/* Symptoms list */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
          {log.symptoms.slice(0, 5).map((s, i) => {
            const meta = SYMPTOM_META[s.type];
            return (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 600,
                background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--ink-mid)',
              }}>
                <span>{meta?.emoji}</span>
                <span>{meta?.label || s.type}</span>
                <span style={{ color: SEVERITY_COLORS[s.severity], fontWeight: 700 }}>·{s.severity}</span>
              </span>
            );
          })}
          {log.symptoms.length > 5 && (
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', padding: '2px 8px' }}>
              +{log.symptoms.length - 5} more
            </span>
          )}
        </div>
        {log.notes && (
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>{log.notes}</p>
        )}
      </div>

      {/* Mood / energy */}
      {(log.mood || log.energy) && (
        <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
          {log.mood && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Mood</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: SEVERITY_COLORS[log.mood] }}>{log.mood}/5</div>
            </div>
          )}
          {log.energy && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Energy</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: SEVERITY_COLORS[log.energy] }}>{log.energy}/5</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SymptomLogger({ compact = false, defaultTab = 'general' }) {
  const [activeTab,       setActiveTab]       = useState(defaultTab);
  const [view,            setView]            = useState('log');   // 'log' | 'history'
  const [selected,        setSelected]        = useState({});      // { type: severity }
  const [notes,           setNotes]           = useState('');
  const [mood,            setMood]            = useState(3);
  const [energy,          setEnergy]          = useState(3);
  const [logDate,         setLogDate]         = useState(new Date().toISOString().split('T')[0]);
  const [saving,          setSaving]          = useState(false);
  const [savedMsg,        setSavedMsg]        = useState('');
  const [history,         setHistory]         = useState([]);
  const [loadingHistory,  setLoadingHistory]  = useState(false);
  const [todayLoaded,     setTodayLoaded]     = useState(false);

  // Pre-fill with today's log if it exists
  useEffect(() => {
    getTodaySymptoms()
      .then(({ data }) => {
        if (data) {
          const pre = {};
          data.symptoms.forEach(s => { pre[s.type] = s.severity; });
          setSelected(pre);
          setNotes(data.notes || '');
          setMood(data.mood || 3);
          setEnergy(data.energy || 3);
          setTodayLoaded(true);
        }
      })
      .catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    setLoadingHistory(true);
    getSymptomLogs(60)
      .then(({ data }) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    if (view === 'history') loadHistory();
  }, [view, loadHistory]);

  const toggleSymptom = (type) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[type]) {
        delete next[type];
      } else {
        next[type] = 3; // default severity
      }
      return next;
    });
  };

  const setSeverity = (type, sev) => {
    setSelected(prev => ({ ...prev, [type]: sev }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const symptomEntries = Object.entries(selected).map(([type, severity]) => ({
      type,
      severity,
      category: SYMPTOM_META[type]?.category || 'general',
    }));

    if (symptomEntries.length === 0) {
      setSavedMsg('error:Please select at least one symptom.');
      return;
    }

    setSaving(true);
    try {
      await createSymptomLog({ date: logDate, symptoms: symptomEntries, mood, energy, notes });
      setSavedMsg('ok:Symptoms saved successfully.');
      setTodayLoaded(true);
      if (view === 'history') loadHistory();
    } catch (err) {
      setSavedMsg(`error:${err.response?.data?.message || 'Failed to save. Please try again.'}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(''), 4000);
    }
  };

  const selectedCount = Object.keys(selected).length;
  const currentCatSymptoms = byCategory(activeTab);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={compact ? '' : 'card'} style={{ overflow: 'hidden', ...(compact ? {} : { padding: 0 }) }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: compact ? '0 0 16px' : '22px 28px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--ink)', marginBottom: 2 }}>
            Symptom Logger
          </h3>
          {todayLoaded && (
            <p style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 600 }}>✓ Today's log loaded — editing existing entry</p>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          {[{ v: 'log', l: 'Log Symptoms' }, { v: 'history', l: 'History' }].map((t, i) => (
            <button key={t.v} type="button" onClick={() => setView(t.v)} style={{
              padding: '8px 18px', border: 'none', cursor: 'pointer',
              fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: view === t.v ? 'var(--forest)' : 'transparent',
              color: view === t.v ? 'var(--cream)' : 'var(--ink-soft)',
              borderRight: i === 0 ? '1px solid var(--border)' : 'none',
              transition: 'all 0.15s',
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* ── Log View ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === 'log' && (
          <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSubmit}>

              {/* Date + Overall Scores */}
              <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                <div className="field" style={{ gap: 5 }}>
                  <label className="label">Date</label>
                  <input
                    className="input"
                    type="date"
                    value={logDate}
                    onChange={e => setLogDate(e.target.value)}
                    style={{ width: 160 }}
                  />
                </div>
                <div className="field" style={{ gap: 5 }}>
                  <label className="label">Overall Mood</label>
                  <SeverityPicker value={mood} onChange={setMood} />
                </div>
                <div className="field" style={{ gap: 5 }}>
                  <label className="label">Energy Level</label>
                  <SeverityPicker value={energy} onChange={setEnergy} />
                </div>
                {selectedCount > 0 && (
                  <div style={{ marginLeft: 'auto' }}>
                    <span className="badge badge-forest">{selectedCount} symptom{selectedCount !== 1 ? 's' : ''} selected</span>
                  </div>
                )}
              </div>

              {/* Category Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveTab(cat.key)}
                    style={{
                      flex: 1, padding: '13px 8px',
                      border: 'none', cursor: 'pointer',
                      fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      transition: 'all 0.15s',
                      background: activeTab === cat.key ? cat.bg : 'transparent',
                      color: activeTab === cat.key ? cat.color : 'var(--ink-soft)',
                      borderBottom: activeTab === cat.key ? `2px solid ${cat.color}` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {/* Count badge for this category */}
                    {(() => {
                      const cnt = byCategory(cat.key).filter(s => selected[s.key]).length;
                      return cnt > 0 ? (
                        <span style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: cat.color, color: 'white',
                          fontSize: 10, fontWeight: 700, display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>{cnt}</span>
                      ) : null;
                    })()}
                  </button>
                ))}
              </div>

              {/* Symptom Grid */}
              <div style={{ padding: '20px 28px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
                      {currentCatSymptoms.map(sym => (
                        <div key={sym.key}>
                          <SymptomChip
                            symptom={sym}
                            isSelected={!!selected[sym.key]}
                            onClick={() => toggleSymptom(sym.key)}
                          />
                          {/* Severity picker appears inline when selected */}
                          <AnimatePresence>
                            {selected[sym.key] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{
                                  padding: '10px 14px',
                                  background: 'var(--sage-pale)',
                                  borderRadius: '0 0 3px 3px',
                                  borderTop: 'none',
                                  marginTop: -1,
                                }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                    Severity
                                  </p>
                                  <SeverityPicker value={selected[sym.key]} onChange={sev => setSeverity(sym.key, sev)} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Notes */}
                <div className="field" style={{ marginBottom: 20 }}>
                  <label className="label">Additional Notes (optional)</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Any additional details about how you're feeling today…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'Jost, sans-serif', lineHeight: 1.6 }}
                  />
                </div>

                {/* Feedback message */}
                {savedMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={savedMsg.startsWith('ok:') ? 'alert-green' : 'alert-red'}
                    style={{ marginBottom: 16 }}
                  >
                    {savedMsg.replace(/^(ok|error):/, '')}
                  </motion.div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : todayLoaded ? 'Update Today\'s Log' : 'Save Symptoms'}
                  </button>
                  {selectedCount > 0 && (
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => { setSelected({}); setNotes(''); setMood(3); setEnergy(3); }}
                    >
                      Clear All
                    </button>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--ink-faint)', marginLeft: 4 }}>
                    ⚕ This data helps track your health patterns over time.
                  </span>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── History View ─────────────────────────────────────────────── */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '20px 28px' }}>

            {loadingHistory ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--sage-pale)', borderTopColor: 'var(--forest)', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>◈</div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>No history yet</p>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Logged symptoms will appear here.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--ink)', fontWeight: 600 }}>
                    Last 60 Days
                  </h4>
                  <span className="badge badge-forest">{history.length} entries</span>
                </div>
                {history.map(log => <HistoryRow key={log._id} log={log} />)}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical disclaimer strip */}
      <div style={{
        padding: '12px 28px',
        background: 'var(--gold-pale)',
        borderTop: '1px solid var(--gold-light)',
        fontSize: 12, color: '#5a3e08', fontWeight: 500,
      }}>
        ⚕ Symptom logs are for personal tracking only and are not a substitute for medical advice.
      </div>
    </div>
  );
}