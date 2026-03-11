// client/src/pages/Dashboard.jsx
// REDESIGNED: Mobile-first layout, responsive Daily Wellness card, proper spacing.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCycleLogs, getTodayLog, updateDailyLog } from '../services/api';
import CycleCalendar from '../components/CycleCalendar';
import ExportReportButton from '../components/ExportReportButton';
import { formatDate, daysUntil, getCurrentCycleDay, getCyclePhase, phaseNames } from '../utils/dateUtils';

const phaseDesc = {
  menstrual:  { label: 'Menstrual Phase',  note: 'Rest, warmth, and iron-rich foods. Be gentle with yourself.',    color: '#c4606a', bg: '#fef2f2' },
  follicular: { label: 'Follicular Phase', note: 'Energy rises. Great time for new goals and cardio workouts.',     color: '#2d6a4f', bg: '#f0fdf4' },
  ovulation:  { label: 'Ovulation Phase',  note: 'Peak energy and sociability. Your most fertile days.',             color: '#b45309', bg: '#fffbeb' },
  luteal:     { label: 'Luteal Phase',     note: 'Slow down, prioritise sleep and magnesium-rich foods.',           color: '#1e40af', bg: '#eff6ff' },
  unknown:    { label: 'Not Tracking',     note: 'Log your period to unlock personalised insights.',                color: 'var(--ink-soft)', bg: 'var(--cream)' },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const Stat = ({ label, value, sub, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card"
    style={{ padding: '20px 22px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>
      <span className="eyebrow" style={{ fontSize: 9 }}>{label}</span>
    </div>
    <div
      className="stat-value"
      style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 600, color: 'var(--ink)', lineHeight: 1, marginBottom: 6 }}
    >
      {value}
    </div>
    <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{sub}</p>
  </motion.div>
);

// ── Quick access card ─────────────────────────────────────────────────────────
const QuickCard = ({ to, icon, title, desc }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div
      className="card"
      style={{ padding: '20px 22px', cursor: 'pointer', transition: 'all 0.2s', borderTop: '3px solid transparent', height: '100%' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderTopColor = 'var(--gold)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,46,31,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderTopColor = 'transparent';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  </Link>
);

// ── Daily Wellness Card ───────────────────────────────────────────────────────
// TASK 1: Fully responsive — works from 320px to large desktop.
const DailyWellness = ({ dailyLog, onUpdate }) => {
  const waterCount = dailyLog?.waterGlasses || 0;
  const sleepHours = dailyLog?.sleepHours || 0;

  // Sleep quality colour
  const sleepColor =
    sleepHours >= 8 ? 'var(--success)' :
    sleepHours >= 6 ? 'var(--warning)' : 'var(--destructive)';

  return (
    <>
      <style>{`
        /* ── Daily Wellness Card ─────────────────────────── */
        .wellness-card-inner {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .wellness-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 4px;
        }

        .wellness-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: 'Jost', sans-serif;
        }

        .wellness-count-badge {
          background: var(--sage-pale);
          color: var(--forest);
          border-radius: 10px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Jost', sans-serif;
          margin-left: auto;
        }

        /* Water glasses row — flexbox with wrap */
        .water-glasses-row {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
          margin-top: 8px;
        }

        .glass-btn {
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
          /* Minimum 44x44px touch target */
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .glass-btn:hover {
          background: var(--sage-pale);
          transform: scale(1.12);
        }

        .glass-btn:active {
          transform: scale(0.9);
        }

        .glass-icon {
          font-size: 20px;
          line-height: 1;
          display: block;
          transition: all 0.15s;
        }

        .glass-btn.filled .glass-icon  { opacity: 1;   filter: none; }
        .glass-btn.empty  .glass-icon  { opacity: 0.2; filter: grayscale(100%); }

        /* Progress bar under water */
        .water-progress-bar {
          height: 4px;
          background: var(--sage-pale);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }

        .water-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Sleep slider */
        .sleep-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .sleep-display {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .sleep-hours-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          line-height: 1;
        }

        .sleep-hours-unit {
          font-size: 12px;
          color: var(--ink-soft);
          font-weight: 600;
        }

        .sleep-input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--sage-pale);
          outline: none;
          cursor: pointer;
          /* Larger touch target */
          padding: 10px 0;
          margin: -10px 0;
        }

        .sleep-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--forest);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(26,46,31,0.3);
          transition: transform 0.15s;
        }

        .sleep-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--forest);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(26,46,31,0.3);
        }

        .sleep-input:hover::-webkit-slider-thumb {
          transform: scale(1.15);
        }

        .sleep-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--ink-faint);
          font-weight: 600;
          font-family: 'Jost', sans-serif;
          margin-top: 2px;
        }

        /* ── Responsive: very small screens ──────────── */
        @media (max-width: 360px) {
          .glass-btn {
            width: 36px;
            height: 36px;
          }

          .glass-icon {
            font-size: 18px;
          }
        }
      `}</style>

      <div
        className="card"
        style={{ padding: '22px 22px 24px', borderTop: '4px solid var(--sage)' }}
      >
        {/* Card title */}
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 19, fontWeight: 600,
          color: 'var(--ink)', marginBottom: 20,
        }}>
          Daily Wellness
        </h3>

        <div className="wellness-card-inner">

          {/* ── Water intake section ──────────────────────────── */}
          <div>
            <div className="wellness-header">
              <span className="wellness-section-label">
                💧 Water Intake
              </span>
              <span className="wellness-count-badge">{waterCount}/8 glasses</span>
            </div>

            {/* 8 glass buttons */}
            <div className="water-glasses-row" role="group" aria-label="Water intake tracker">
              {[1,2,3,4,5,6,7,8].map(i => (
                <button
                  key={i}
                  className={`glass-btn ${i <= waterCount ? 'filled' : 'empty'}`}
                  onClick={() => onUpdate({ waterGlasses: i === waterCount ? 0 : i })}
                  aria-label={`${i} ${i === 1 ? 'glass' : 'glasses'}`}
                  title={`Log ${i} glass${i !== 1 ? 'es' : ''}`}
                >
                  <span className="glass-icon">💧</span>
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="water-progress-bar">
              <div
                className="water-progress-fill"
                style={{ width: `${(waterCount / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* ── Sleep section ─────────────────────────────────── */}
          <div>
            <div className="wellness-header">
              <span className="wellness-section-label">
                😴 Sleep
              </span>
            </div>

            <div className="sleep-row">
              {/* Hours display */}
              <div className="sleep-display">
                <span className="sleep-hours-num" style={{ color: sleepColor }}>
                  {sleepHours % 1 === 0 ? sleepHours : sleepHours.toFixed(1)}
                </span>
                <span className="sleep-hours-unit">hours</span>
                {sleepHours >= 8 && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, marginLeft: 4 }}>✓ Great!</span>}
                {sleepHours > 0 && sleepHours < 6 && <span style={{ fontSize: 11, color: 'var(--destructive)', fontWeight: 700, marginLeft: 4 }}>Rest more</span>}
              </div>

              {/* Slider */}
              <input
                className="sleep-input"
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={e => onUpdate({ sleepHours: parseFloat(e.target.value) })}
                aria-label="Sleep hours"
                aria-valuenow={sleepHours}
                aria-valuemin={0}
                aria-valuemax={12}
              />

              {/* Tick marks */}
              <div className="sleep-ticks">
                <span>0h</span>
                <span>3h</span>
                <span>6h</span>
                <span>9h</span>
                <span>12h</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [cycleData, setCycleData] = useState(null);
  const [dailyLog, setDailyLog] = useState({ waterGlasses: 0, sleepHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCycleLogs().catch(() => ({ data: { logs: [], avgCycleLength: 28 } })),
      getTodayLog().catch(() => ({ data: { waterGlasses: 0, sleepHours: 0 } })),
    ]).then(([cycleRes, logRes]) => {
      setCycleData(cycleRes.data);
      setDailyLog(logRes.data || { waterGlasses: 0, sleepHours: 0 });
      setLoading(false);
    });
  }, []);

  const handleDailyUpdate = async (update) => {
    const optimistic = { ...dailyLog, ...update };
    setDailyLog(optimistic); // optimistic update
    try {
      const { data } = await updateDailyLog(update);
      setDailyLog(data);
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };

  const latest   = cycleData?.logs?.[0];
  const cycleDay = latest ? getCurrentCycleDay(latest.lastPeriodDate) : null;
  const phase    = cycleDay ? getCyclePhase(cycleDay, cycleData?.avgCycleLength) : 'unknown';
  const nextDays = latest ? daysUntil(latest.predictedNextDate) : null;
  const ovulDays = latest ? daysUntil(latest.ovulationDate) : null;
  const pd       = phaseDesc[phase];
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <style>{`
        /* ── Dashboard responsive styles ─────────────────── */

        .dash-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dash-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
        }

        .dash-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .dash-main {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 24px;
          margin-bottom: 36px;
        }

        .dash-sidebar-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dash-quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        /* Tablet */
        @media (max-width: 768px) {
          .dash-header {
            margin-bottom: 24px;
          }

          .dash-header h1 {
            font-size: 32px;
          }

          .dash-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .dash-main {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .dash-quick-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .dash-header h1 {
            font-size: 26px;
          }

          .dash-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .dash-quick-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>{greeting}</p>
          <h1>{user?.name?.split(' ')[0]}'s Dashboard</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ExportReportButton triggerLabel="Export Report" variant="outline" />
          {latest && (
            <div style={{
              padding: '12px 18px',
              background: pd.bg,
              border: `1px solid ${pd.color}22`,
              borderRadius: 6,
              borderLeft: `3px solid ${pd.color}`,
            }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: pd.color, marginBottom: 2 }}>
                Current Phase
              </p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                {pd.label}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 240, lineHeight: 1.4 }}>{pd.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="dash-stats">
          <Stat icon="◐" label="Next Period"     delay={0.05} value={nextDays !== null ? `${Math.max(0, nextDays)}d` : '—'} sub={latest ? formatDate(latest.predictedNextDate) : 'Log your cycle to predict'} />
          <Stat icon="◎" label="Ovulation Window" delay={0.1}  value={ovulDays !== null ? (ovulDays <= 0 ? 'Today' : `${ovulDays}d`) : '—'} sub={latest ? formatDate(latest.ovulationDate) : 'Start tracking to see'} />
          <Stat icon="◈" label="Cycle Day"        delay={0.15} value={cycleDay ? `Day ${cycleDay}` : '—'} sub={latest ? `of avg ${cycleData?.avgCycleLength || 28}-day cycle` : 'Not currently tracking'} />
          <Stat icon="◷" label="Avg Cycle Length" delay={0.2}  value={`${cycleData?.avgCycleLength || 28}d`} sub="Based on logged history" />
        </div>
      )}

      {/* ── Main two-column layout ────────────────────────────────────────── */}
      <div className="dash-main">
        {/* Left: Cycle calendar */}
        {latest && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 21, fontWeight: 600, color: 'var(--ink)' }}>
                Cycle Calendar
              </h2>
              <Link to="/cycle" style={{ fontSize: 11, color: 'var(--forest)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                View Details →
              </Link>
            </div>
            <CycleCalendar cycleData={cycleData} phase={phase} cycleDay={cycleDay} />
          </div>
        )}

        {/* Right: sidebar widgets */}
        <div className="dash-sidebar-col">

          {/* ── Daily Wellness Card (TASK 1 — fully responsive) ── */}
          <DailyWellness dailyLog={dailyLog} onUpdate={handleDailyUpdate} />

          {/* Upcoming dates */}
          {latest && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
                Upcoming Dates
              </h3>
              {[
                { label: 'Next Period', date: latest.predictedNextDate, days: nextDays, icon: '◐' },
                { label: 'Ovulation',  date: latest.ovulationDate,     days: ovulDays, icon: '◎' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 16, color: 'var(--sage)', width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 1 }}>{item.label}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{formatDate(item.date)}</p>
                  </div>
                  <span className="badge badge-forest">{Math.max(0, item.days)}d</span>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="card" style={{ padding: 20, borderTop: '3px solid var(--gold)' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
              ⚕ Medical Disclaimer
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
              HerCare provides health information for educational purposes only. Always consult your healthcare provider for medical decisions.
            </p>
          </div>
        </div>
      </div>

      {/* ── Holistic Wellness card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
        style={{ padding: 24, borderTop: '4px solid var(--gold)', marginBottom: 32 }}
      >
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
          Holistic Wellness
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🌱</span>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, margin: 0 }}>
              <strong>Bio-Individual Nutrition:</strong> Diet plans that shift with your hormones to reduce inflammation and stabilize energy.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🧘</span>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, margin: 0 }}>
              <strong>Cycle-Syncing Exercise:</strong> Poses designed to support your body's strength during ovulation and rest during menstruation.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Access ─────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>
            Quick Access
          </h2>
          <div className="divider" style={{ flex: 1 }} />
        </div>
        <div className="dash-quick-grid">
          <QuickCard to="/cycle"     icon="◐" title="Cycle Tracking"  desc="Log your period and monitor symptoms" />
          <QuickCard to="/pregnancy" icon="◎" title="Pregnancy"       desc="Week-by-week guidance and milestones" />
          <QuickCard to="/diet"      icon="◇" title="Diet & Exercise" desc="Phase-specific nutrition plans" />
          <QuickCard to="/reminders" icon="◷" title="Reminders"       desc="Health alerts and appointments" />
        </div>
      </div>
    </div>
  );
}
