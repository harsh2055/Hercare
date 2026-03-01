// client/src/components/ExportReportButton.jsx
//
// A self-contained "Export Doctor's Report" button + modal.
// Drop <ExportReportButton /> anywhere — Dashboard or Profile.
//
// Props:
//   triggerLabel  string   Button label text (default: "Export Doctor's Report")
//   variant       string   'primary' | 'outline' | 'gold'  (default: 'outline')
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCycleLogs, getPregnancy, getSymptomLogs } from '../services/api';
import { generateReport } from '../utils/generateReport';

// ── Date helpers ──────────────────────────────────────────────────────────────
function toInputDate(d) {
  return d.toISOString().split('T')[0];
}
function fromInputDate(s) {
  return new Date(s + 'T00:00:00');
}
function fmtDisplay(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Quick range presets ───────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Last 7 days',   days: 7  },
  { label: 'Last 30 days',  days: 30 },
  { label: 'Last 60 days',  days: 60 },
  { label: 'Last 90 days',  days: 90 },
];

// ── Preview row ───────────────────────────────────────────────────────────────
function PreviewRow({ icon, label, value, note }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 3, flexShrink: 0,
        background: 'var(--sage-pale)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{label}</p>
        {note && <p style={{ fontSize: 11, color: 'var(--ink-faint)', margin: 0, marginTop: 1 }}>{note}</p>}
      </div>
      <span style={{
        fontSize: 13, fontWeight: 700, color: 'var(--forest)',
        background: 'var(--sage-pale)', padding: '3px 10px',
        borderRadius: 2,
      }}>{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExportReportButton({ triggerLabel = "Export Doctor's Report", variant = 'outline' }) {
  const { user } = useAuth();

  const [isOpen,    setIsOpen]    = useState(false);
  const [step,      setStep]      = useState('configure'); // 'configure' | 'preview' | 'generating' | 'done'
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [previewData, setPreviewData] = useState(null);

  // Date range state
  const now     = new Date();
  const default30 = new Date(now.getTime() - 30 * 86400000);
  const [fromDate, setFromDate] = useState(toInputDate(default30));
  const [toDate,   setToDate]   = useState(toInputDate(now));

  // Sections to include
  const [sections, setSections] = useState({
    cycle:    true,
    symptoms: true,
    pregnancy: false,
  });

  // Active preset (for highlight)
  const [activePreset, setActivePreset] = useState(1); // 30 days

  const applyPreset = (days, idx) => {
    const t = new Date();
    const f = new Date(t.getTime() - days * 86400000);
    setFromDate(toInputDate(f));
    setToDate(toInputDate(t));
    setActivePreset(idx);
  };

  // ── Load & preview ──────────────────────────────────────────────────────────
  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const from = fromInputDate(fromDate);
      const to   = fromInputDate(toDate);
      to.setHours(23, 59, 59);

      const days = Math.ceil((to - from) / 86400000);

      const [cycleRes, symptomRes] = await Promise.all([
        sections.cycle    ? getCycleLogs()         : Promise.resolve({ data: { logs: [], avgCycleLength: 28 } }),
        sections.symptoms ? getSymptomLogs(days)   : Promise.resolve({ data: [] }),
      ]);

      let pregnancyData = null;
      if (sections.pregnancy) {
        try { const r = await getPregnancy(); pregnancyData = r.data; }
        catch { /* no active pregnancy */ }
      }

      // Filter to range
      const cycleInRange = (cycleRes.data?.logs || []).filter(l =>
        new Date(l.lastPeriodDate) >= from && new Date(l.lastPeriodDate) <= to
      );
      const symInRange = (Array.isArray(symptomRes.data) ? symptomRes.data : []).filter(s =>
        new Date(s.date) >= from && new Date(s.date) <= to
      );

      // Flatten all symptoms for count
      const totalSymptomEntries = symInRange.reduce((acc, log) => acc + (log.symptoms?.length || 0), 0);

      setPreviewData({
        cycleData:   cycleRes.data,
        symptomLogs: Array.isArray(symptomRes.data) ? symptomRes.data : [],
        pregnancy:   pregnancyData,
        cycleCount:  cycleInRange.length,
        symptomDays: symInRange.length,
        totalSymptomEntries,
        from, to,
      });

      setStep('preview');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load health data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, sections]);

  // ── Generate & download ─────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!previewData) return;
    setStep('generating');
    try {
      await generateReport({
        user,
        cycleData:   previewData.cycleData,
        symptomLogs: previewData.symptomLogs,
        pregnancy:   previewData.pregnancy,
        dateRange:   { from: previewData.from, to: previewData.to },
        download:    true,
      });
      setStep('done');
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      setStep('preview');
    }
  }, [previewData, user]);

  const reset = () => {
    setStep('configure');
    setPreviewData(null);
    setError('');
    setActivePreset(1);
    const t = new Date();
    const f = new Date(t.getTime() - 30 * 86400000);
    setFromDate(toInputDate(f));
    setToDate(toInputDate(t));
    setSections({ cycle: true, symptoms: true, pregnancy: false });
  };

  const btnClass = variant === 'primary' ? 'btn btn-primary' :
                   variant === 'gold'    ? 'btn btn-gold'    : 'btn btn-outline';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <button className={btnClass} onClick={() => { setIsOpen(true); reset(); }}>
        <span style={{ fontSize: 15 }}>📋</span>
        {triggerLabel}
      </button>

      {/* ── Modal overlay ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(26,46,31,0.55)',
                backdropFilter: 'blur(3px)',
              }}
            />

            {/* Modal panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              style={{
                position: 'fixed', zIndex: 2001,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%', maxWidth: 540,
                maxHeight: '90vh',
                background: 'var(--warm-white)',
                borderRadius: 6,
                boxShadow: '0 32px 100px rgba(26,46,31,0.25), 0 4px 20px rgba(26,46,31,0.12)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* ── Modal header ─────────────────────────────────────────── */}
              <div style={{
                background: 'var(--forest)',
                padding: '20px 28px',
                display: 'flex', alignItems: 'center', gap: 14,
                flexShrink: 0,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', right: -40, top: -40,
                  width: 160, height: 160, borderRadius: '50%',
                  border: '1px solid rgba(201,168,76,0.15)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  width: 44, height: 44, borderRadius: 4, flexShrink: 0,
                  background: 'rgba(201,168,76,0.2)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>📋</div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 22, fontWeight: 600,
                    color: 'var(--cream)', margin: 0,
                  }}>
                    {step === 'done' ? 'Report Downloaded!' : 'Export Doctor\'s Report'}
                  </h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: 3 }}>
                    {step === 'configure'  && 'Choose your date range and sections'}
                    {step === 'preview'    && 'Review what will be included'}
                    {step === 'generating' && 'Generating your PDF…'}
                    {step === 'done'       && 'Your report is ready to share with your doctor'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 4, width: 32, height: 32, cursor: 'pointer',
                    color: 'rgba(255,255,255,0.7)', fontSize: 18, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >×</button>
              </div>

              {/* ── Step indicator ───────────────────────────────────────── */}
              {step !== 'done' && (
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                  {[
                    { key: 'configure',  label: '1. Configure' },
                    { key: 'preview',    label: '2. Preview' },
                    { key: 'generating', label: '3. Export' },
                  ].map((s, i) => {
                    const steps = ['configure', 'preview', 'generating'];
                    const activeIdx = steps.indexOf(step);
                    const isActive  = s.key === step;
                    const isDone    = steps.indexOf(s.key) < activeIdx;
                    return (
                      <div key={s.key} style={{
                        flex: 1, padding: '10px 0', textAlign: 'center',
                        fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: isActive ? 'var(--forest)' : isDone ? 'var(--sage)' : 'var(--ink-faint)',
                        borderBottom: isActive ? '2px solid var(--forest)' : '2px solid transparent',
                        transition: 'all 0.2s',
                      }}>
                        {isDone ? '✓ ' : ''}{s.label}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Scrollable body ──────────────────────────────────────── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

                {/* Error */}
                {error && (
                  <div className="alert-red" style={{ marginBottom: 16 }}>{error}</div>
                )}

                {/* ── CONFIGURE STEP ─────────────────────────────────────── */}
                {step === 'configure' && (
                  <div>
                    {/* Quick presets */}
                    <p className="label" style={{ marginBottom: 10 }}>Quick Range</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                      {PRESETS.map((p, i) => (
                        <button key={i} type="button" onClick={() => applyPreset(p.days, i)} style={{
                          padding: '7px 16px', borderRadius: 3, cursor: 'pointer',
                          fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 600,
                          letterSpacing: '0.04em',
                          border: `1.5px solid ${activePreset === i ? 'var(--forest)' : 'var(--border)'}`,
                          background: activePreset === i ? 'var(--forest)' : 'transparent',
                          color: activePreset === i ? 'var(--cream)' : 'var(--ink-soft)',
                          transition: 'all 0.15s',
                        }}>{p.label}</button>
                      ))}
                    </div>

                    {/* Custom date range */}
                    <p className="label" style={{ marginBottom: 10 }}>Custom Range</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 24 }}>
                      <div className="field">
                        <label className="label">From</label>
                        <input className="input" type="date" value={fromDate}
                          max={toDate}
                          onChange={e => { setFromDate(e.target.value); setActivePreset(null); }} />
                      </div>
                      <div className="field">
                        <label className="label">To</label>
                        <input className="input" type="date" value={toDate}
                          min={fromDate} max={toInputDate(new Date())}
                          onChange={e => { setToDate(e.target.value); setActivePreset(null); }} />
                      </div>
                    </div>

                    {/* Sections */}
                    <p className="label" style={{ marginBottom: 12 }}>Sections to Include</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                      {[
                        { key: 'cycle',     icon: '◐', label: 'Menstrual Cycle History', note: 'Period dates, cycle lengths, flow, predicted dates' },
                        { key: 'symptoms',  icon: '◈', label: 'Symptom Log',              note: 'All logged symptoms with severity ratings' },
                        { key: 'pregnancy', icon: '◎', label: 'Pregnancy Information',    note: 'Current week, trimester, due date (if active)' },
                      ].map(s => (
                        <label key={s.key} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '12px 14px', borderRadius: 3, cursor: 'pointer',
                          border: `1.5px solid ${sections[s.key] ? 'var(--forest)' : 'var(--border)'}`,
                          background: sections[s.key] ? 'var(--sage-pale)' : 'transparent',
                          transition: 'all 0.15s',
                        }}>
                          <input
                            type="checkbox"
                            checked={sections[s.key]}
                            onChange={e => setSections(prev => ({ ...prev, [s.key]: e.target.checked }))}
                            style={{ marginTop: 2, accentColor: 'var(--forest)', width: 15, height: 15, flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{s.icon}</span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{s.label}</p>
                            <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: 0, marginTop: 2 }}>{s.note}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="alert-gold" style={{ marginTop: 16, fontSize: 12 }}>
                      📋 The report will include a blank "Doctor's Notes" section for your physician to annotate.
                    </div>
                  </div>
                )}

                {/* ── PREVIEW STEP ───────────────────────────────────────── */}
                {step === 'preview' && previewData && (
                  <div>
                    <div style={{
                      background: 'var(--sage-pale)', borderRadius: 3,
                      padding: '14px 18px', marginBottom: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                          Report Period
                        </p>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                          {fmtDisplay(previewData.from)} — {fmtDisplay(previewData.to)}
                        </p>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 14px' }}
                        onClick={() => setStep('configure')}>
                        ← Edit
                      </button>
                    </div>

                    <p className="label" style={{ marginBottom: 12 }}>What's Included</p>

                    <PreviewRow icon="👤" label="Patient Profile"
                      value="✓" note={`${user?.name} · ${user?.email}`} />

                    {sections.cycle && (
                      <PreviewRow icon="◐" label="Cycle History"
                        value={`${previewData.cycleCount} entries`}
                        note="Period dates, cycle lengths, predicted dates" />
                    )}

                    {sections.symptoms && (
                      <PreviewRow icon="◈" label="Symptom Log"
                        value={`${previewData.totalSymptomEntries} entries`}
                        note={`Across ${previewData.symptomDays} days · with severity ratings`} />
                    )}

                    {sections.pregnancy && previewData.pregnancy && (
                      <PreviewRow icon="◎" label="Pregnancy"
                        value={`Wk ${previewData.pregnancy.currentWeek}`}
                        note={`Trimester ${previewData.pregnancy.trimester} · Due ${fmtDisplay(previewData.pregnancy.dueDate)}`} />
                    )}

                    {sections.pregnancy && !previewData.pregnancy && (
                      <PreviewRow icon="◎" label="Pregnancy"
                        value="None" note="No active pregnancy found — section will be omitted" />
                    )}

                    <PreviewRow icon="📝" label="Doctor's Notes"
                      value="Included" note="Blank ruled section for your physician to annotate" />

                    <PreviewRow icon="⚕" label="Medical Disclaimer"
                      value="Included" note="Standard disclaimer on every page" />

                    <div className="alert-gold" style={{ marginTop: 16, fontSize: 12 }}>
                      The PDF will download automatically. Filename: <strong>HerCare_Report_{user?.name?.replace(/\s+/g, '_')}_{new Date().toISOString().split('T')[0]}.pdf</strong>
                    </div>
                  </div>
                )}

                {/* ── GENERATING STEP ────────────────────────────────────── */}
                {step === 'generating' && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px',
                      border: '3px solid var(--sage-pale)', borderTopColor: 'var(--forest)',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                      Generating your report…
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                      Building your professional PDF. This takes just a moment.
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {/* ── DONE STEP ──────────────────────────────────────────── */}
                {step === 'done' && (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'var(--sage-pale)',
                        border: '3px solid var(--forest)',
                        margin: '0 auto 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32,
                      }}
                    >✓</motion.div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                      Report Downloaded!
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 24px' }}>
                      Your health report has been saved to your device. Take it to your next appointment for your doctor to review.
                    </p>
                    <div className="alert-gold" style={{ textAlign: 'left', marginBottom: 20 }}>
                      ⚕ Remind your doctor that this is an informational report generated by a health-tracking app, not a clinical document.
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button className="btn btn-outline" onClick={reset}>
                        Generate Another
                      </button>
                      <button className="btn btn-primary" onClick={() => setIsOpen(false)}>
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Modal footer actions ──────────────────────────────────── */}
              {(step === 'configure' || step === 'preview') && (
                <div style={{
                  padding: '16px 28px',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--cream)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>
                    Cancel
                  </button>
                  {step === 'configure' && (
                    <button className="btn btn-primary" onClick={loadPreview} disabled={loading}>
                      {loading ? (
                        <>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                          Loading…
                        </>
                      ) : 'Preview Report →'}
                    </button>
                  )}
                  {step === 'preview' && (
                    <button className="btn btn-gold" onClick={handleExport}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>⬇</span> Download PDF
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}