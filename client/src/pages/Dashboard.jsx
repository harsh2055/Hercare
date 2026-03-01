// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCycleLogs, getTodayLog, updateDailyLog } from '../services/api';
import CycleCalendar from '../components/CycleCalendar';
import ExportReportButton from '../components/ExportReportButton';
import { formatDate, daysUntil, getCurrentCycleDay, getCyclePhase, phaseNames } from '../utils/dateUtils';

const phaseDesc = {
  menstrual:  { label: 'Menstrual Phase',  note: 'Rest, warmth, and iron-rich foods. Be gentle with yourself.',      color: '#c4606a', bg: '#fef2f2' },
  follicular: { label: 'Follicular Phase', note: 'Energy rises. Great time for new goals and cardio workouts.',       color: '#2d6a4f', bg: '#f0fdf4' },
  ovulation:  { label: 'Ovulation Phase',  note: 'Peak energy and sociability. Your most fertile days.',               color: '#b45309', bg: '#fffbeb' },
  luteal:     { label: 'Luteal Phase',     note: 'Slow down, prioritise sleep and magnesium-rich foods.',             color: '#1e40af', bg: '#eff6ff' },
  unknown:    { label: 'Not Tracking',     note: 'Log your period to unlock personalised insights.',                  color: 'var(--ink-soft)', bg: 'var(--cream)' },
};

const Stat = ({ label, value, sub, icon, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card" style={{ padding: '24px 26px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <span style={{ fontSize: 20, opacity: 0.6 }}>{icon}</span>
      <span className="eyebrow" style={{ fontSize: 10 }}>{label}</span>
    </div>
    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 600, color: 'var(--ink)', lineHeight: 1, marginBottom: 6 }}>
      {value}
    </div>
    <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{sub}</p>
  </motion.div>
);

const QuickCard = ({ to, icon, title, desc }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="card" style={{ padding: '22px 24px', cursor: 'pointer', transition: 'all 0.2s', borderTop: '3px solid transparent', height: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.borderTopColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,46,31,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderTopColor = 'transparent'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 5 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [cycleData, setCycleData] = useState(null);
  const [dailyLog, setDailyLog] = useState({ waterGlasses: 0, sleepHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCycleLogs().catch(() => ({ data: { logs: [], avgCycleLength: 28 } })),
      getTodayLog().catch(() => ({ data: { waterGlasses: 0, sleepHours: 0 } }))
    ]).then(([cycleRes, logRes]) => {
      setCycleData(cycleRes.data);
      setDailyLog(logRes.data || { waterGlasses: 0, sleepHours: 0 });
      setLoading(false);
    });
  }, []);

  const handleDailyUpdate = async (update) => {
    try {
      const { data } = await updateDailyLog(update);
      setDailyLog(data);
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  const latest = cycleData?.logs?.[0];
  const cycleDay = latest ? getCurrentCycleDay(latest.lastPeriodDate) : null;
  const phase = cycleDay ? getCyclePhase(cycleDay, cycleData?.avgCycleLength) : 'unknown';
  const nextDays = latest ? daysUntil(latest.predictedNextDate) : null;
  const ovulDays = latest ? daysUntil(latest.ovulationDate) : null;
  const pd = phaseDesc[phase];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>{greeting}</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {user?.name?.split(' ')[0]}'s Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ExportReportButton triggerLabel="Export Report" variant="outline" />

          {latest && (
            <div style={{ padding: '14px 22px', background: pd.bg, border: `1px solid ${pd.color}22`, borderRadius: 3, borderLeft: `3px solid ${pd.color}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: pd.color, marginBottom: 3 }}>
                Current Phase
              </p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>
                {pd.label}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 260, lineHeight: 1.5 }}>{pd.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="page-grid-4" style={{ marginBottom: 32 }}>
          <Stat icon="◐" label="Next Period" delay={0.05} value={nextDays !== null ? `${Math.max(0, nextDays)}d` : '—'} sub={latest ? formatDate(latest.predictedNextDate) : 'Log your cycle to predict'} />
          <Stat icon="◎" label="Ovulation Window" delay={0.1} value={ovulDays !== null ? (ovulDays <= 0 ? 'Today' : `${ovulDays}d`) : '—'} sub={latest ? formatDate(latest.ovulationDate) : 'Start tracking to see'} />
          <Stat icon="◈" label="Cycle Day" delay={0.15} value={cycleDay ? `Day ${cycleDay}` : '—'} sub={latest ? `of avg ${cycleData?.avgCycleLength || 28}-day cycle` : 'Not currently tracking'} />
          <Stat icon="◷" label="Avg Cycle Length" delay={0.2} value={`${cycleData?.avgCycleLength || 28}d`} sub="Based on logged history" />
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: latest ? '1.4fr 1fr' : '1fr', gap: 24, marginBottom: 36 }}>
        {latest && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>
                Cycle Calendar
              </h2>
              <Link to="/cycle" style={{ fontSize: 12, color: 'var(--forest)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                View Details →
              </Link>
            </div>
            <CycleCalendar cycleData={cycleData} phase={phase} cycleDay={cycleDay} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Daily Wellness Tracker */}
          <div className="card" style={{ padding: 24, borderTop: '4px solid var(--sage)' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>
              Daily Wellness
            </h3>
            
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>💧 Water Intake ({dailyLog.waterGlasses}/8 glasses)</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <button 
                    key={i}
                    onClick={() => handleDailyUpdate({ waterGlasses: i })}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 0,
                      opacity: i <= dailyLog.waterGlasses ? 1 : 0.2, filter: i <= dailyLog.waterGlasses ? 'none' : 'grayscale(100%)',
                      transition: 'all 0.2s'
                    }}
                  >💧</button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>😴 Sleep: {dailyLog.sleepHours} hours</p>
              <input 
                type="range" min="0" max="12" step="0.5" 
                value={dailyLog.sleepHours}
                onChange={(e) => handleDailyUpdate({ sleepHours: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--forest)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--ink-faint)', fontWeight: 600 }}>
                <span>0h</span><span>6h</span><span>12h</span>
              </div>
            </div>
          </div>

          {latest && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>
                Upcoming Dates
              </h3>
              {[
                { label: 'Next Period', date: latest.predictedNextDate, days: nextDays, icon: '◐' },
                { label: 'Ovulation',   date: latest.ovulationDate,     days: ovulDays, icon: '◎' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 18, color: 'var(--sage)', width: 22, textAlign: 'center' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{formatDate(item.date)}</p>
                  </div>
                  <span className="badge badge-forest">{Math.max(0, item.days)}d</span>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 24, borderTop: '3px solid var(--gold)' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
              ⚕ Medical Disclaimer
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
              HerCare provides health information for educational purposes only. Always consult your healthcare provider for medical decisions.
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick access ─────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)' }}>
            Quick Access
          </h2>
          <div className="divider" style={{ flex: 1 }} />
        </div>
        <div className="page-grid-4">
          <QuickCard to="/cycle"     icon="◐" title="Cycle Tracking"  desc="Log your period and monitor symptoms" />
          <QuickCard to="/pregnancy" icon="◎" title="Pregnancy"       desc="Week-by-week guidance and milestones" />
          <QuickCard to="/diet"      icon="◇" title="Diet & Exercise" desc="Phase-specific nutrition plans" />
          <QuickCard to="/reminders" icon="◷" title="Reminders"       desc="Health alerts and appointments" />
        </div>
      </div>
    </div>
  );
}
