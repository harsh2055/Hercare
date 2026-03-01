// client/src/pages/Diet.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getDietPlan, getPosesByPhase, getPosesByTrimester, getPregnancy, getCycleLogs } from '../services/api';
import PoseCard from '../components/PoseCard';
import { getCyclePhase, getCurrentCycleDay } from '../utils/dateUtils';

// ── Phase display config ──────────────────────────────────────────────────────
const PHASE_META = {
  menstrual:  { label: 'Menstrual Phase',  icon: '◐', color: '#be123c', bg: '#fff1f2', tagline: 'Rest, warmth & iron-rich foods' },
  follicular: { label: 'Follicular Phase', icon: '◑', color: '#166534', bg: '#f0fdf4', tagline: 'Fresh foods & building energy' },
  ovulation:  { label: 'Ovulation Phase',  icon: '◉', color: '#b45309', bg: '#fffbeb', tagline: 'Light meals & peak nutrition' },
  luteal:     { label: 'Luteal Phase',     icon: '◐', color: '#1e40af', bg: '#eff6ff', tagline: 'Magnesium & complex carbs' },
};

const TRIMESTER_META = {
  1: { label: 'First Trimester',  color: '#166534', bg: '#f0fdf4', tagline: 'Folate, ginger & small frequent meals' },
  2: { label: 'Second Trimester', color: '#b45309', bg: '#fffbeb', tagline: 'Calcium, iron & sustained energy' },
  3: { label: 'Third Trimester',  color: '#1e40af', bg: '#eff6ff', tagline: 'Omega-3, fibre & birth preparation' },
};

// ── Helper to handle both Database and AI data structures ──
const normalizePlan = (rawData) => {
  if (!rawData) return null;
  let p = rawData;
  if (p.data) p = p.data;
  if (Array.isArray(p)) p = p.length > 0 ? p[0] : null;
  if (!p) return null;

  // Format 1: AI Generated format -> { diet: { meals: [ {time, items} ] } }
  if (p.diet) {
    let mealsObj = {};
    if (Array.isArray(p.diet.meals)) {
      p.diet.meals.forEach(m => {
        mealsObj[m.time || m.meal || 'Meal'] = m.items || m.foods || [];
      });
    } else {
      mealsObj = p.diet.meals || {};
    }
    return {
      title: p.diet.title || "Personalised Plan",
      meals: mealsObj,
      nutrients: p.diet.nutrients || p.diet.keyNutrients || null,
      tips: p.diet.tips || null
    };
  }

  // Format 2: MongoDB format -> { meals: { breakfast: [], lunch: [] } }
  if (p.meals) return p;

  return null;
};

// ── Pose grid sub-component ───────────────────────────────────────────────────
function PoseGrid({ phase, trimester }) {
  const [poses,   setPoses]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [activePhaseTab, setActivePhaseTab] = useState(phase || 'menstrual');

  const PHASES = ['menstrual', 'follicular', 'ovulation', 'luteal'];

  const fetchPoses = async (p, t) => {
    setLoading(true); setError('');
    try {
      const { data } = t
        ? await getPosesByTrimester(t)
        : await getPosesByPhase(p);
      setPoses(data);
    } catch {
      setError('Could not load poses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trimester) {
      fetchPoses(null, trimester);
    } else {
      fetchPoses(activePhaseTab, null);
    }
  }, [activePhaseTab, trimester]);

  useEffect(() => {
    if (phase && PHASES.includes(phase)) setActivePhaseTab(phase);
  }, [phase]);

  const meta = trimester
    ? TRIMESTER_META[trimester]
    : PHASE_META[activePhaseTab] || PHASE_META.menstrual;

  return (
    <div>
      {/* Phase tab switcher — only in cycle mode */}
      {!trimester && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', width: 'fit-content' }}>
          {PHASES.map(p => {
            const m = PHASE_META[p];
            const isActive = activePhaseTab === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setActivePhaseTab(p)}
                style={{
                  padding: '10px 20px', border: 'none', cursor: 'pointer',
                  borderRight: p !== 'luteal' ? '1px solid var(--border)' : 'none',
                  fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: isActive ? m.color : 'transparent',
                  color: isActive ? 'white' : 'var(--ink-soft)',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                {p === phase && !isActive && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: m.color, display: 'inline-block',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Phase context strip */}
      <div style={{
        padding: '14px 18px', borderRadius: 3, marginBottom: 24,
        background: meta.bg,
        border: `1px solid ${meta.color}22`,
        borderLeft: `3px solid ${meta.color}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>
            {meta.label} — Recommended Poses
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-mid)', margin: 0, fontWeight: 500 }}>
            {meta.tagline}
            {phase && activePhaseTab === phase && !trimester && (
              <span style={{ marginLeft: 8, fontSize: 11, color: meta.color, fontWeight: 700 }}>
                ← Your current phase
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: 360, borderRadius: 6,
              background: 'linear-gradient(90deg, var(--sage-pale) 25%, var(--cream) 50%, var(--sage-pale) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
            }} />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert-red">{error}</div>
      )}

      {/* Pose grid */}
      {!loading && !error && poses.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={trimester ? `t${trimester}` : activePhaseTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}
          >
            {poses.map((pose, i) => (
              <PoseCard key={pose._id} pose={pose} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && !error && poses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--cream)', borderRadius: 4, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>◈</div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--ink)', marginBottom: 6 }}>No poses found</p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Poses will appear once the database has been seeded.</p>
        </div>
      )}

      <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 16, fontWeight: 500 }}>
        ↺ Tap any card to flip and see full details, benefits, and safety notes.
      </p>
    </div>
  );
}

// ── Main Diet page ────────────────────────────────────────────────────────────
export default function Diet() {
  const { user }     = useAuth();
  const [dietData,   setDietData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('diet');  // 'diet' | 'poses'
  const [cyclePhase, setCyclePhase] = useState(null);
  const [pregnancy,  setPregnancy]  = useState(null);
  const [params, setParams] = useState({
    preference: user?.dietaryPreference || 'vegetarian',
    phase: 'menstrual',
    trimester: null,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      let phase = 'menstrual';
      let trimesterNum = null;

      try {
        const { data: cycleData } = await getCycleLogs();
        const latest = cycleData?.logs?.[0];
        if (latest) {
          const day = getCurrentCycleDay(latest.lastPeriodDate);
          phase = getCyclePhase(day, cycleData.avgCycleLength);
          setCyclePhase(phase);
        }
      } catch { }

      try {
        const { data: pg } = await getPregnancy();
        if (pg) {
          setPregnancy(pg);
          trimesterNum = pg.trimester;
        }
      } catch { }

      const pref = user?.dietaryPreference || 'vegetarian';
      const newParams = { preference: pref, dietaryPreference: pref, phase, trimester: trimesterNum };
      setParams(newParams);

      const { data } = await getDietPlan(newParams);
      setDietData(normalizePlan(data));
    } catch { setDietData(null); }
    finally { setLoading(false); }
  };

  const fetchDiet = async (p) => {
    setLoading(true);
    try {
      const queryParams = { ...p, dietaryPreference: p.preference };
      const { data } = await getDietPlan(queryParams);
      setDietData(normalizePlan(data));
    } catch { setDietData(null); }
    finally { setLoading(false); }
  };

  const DIET_TABS = ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian'];
  const phaseMeta = PHASE_META[params.phase] || PHASE_META.menstrual;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Nutrition & Fitness</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          Diet & Exercise
        </h1>
      </div>

      {/* ── Main section tabs ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        {[
          { key: 'diet',  label: 'Nutrition Plan', icon: '◇' },
          { key: 'poses', label: 'Exercise & Poses', icon: '◈' },
        ].map(t => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)} style={{
            padding: '13px 28px', border: 'none', cursor: 'pointer',
            fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'transparent',
            color: activeTab === t.key ? 'var(--forest)' : 'var(--ink-soft)',
            borderBottom: activeTab === t.key ? '2px solid var(--forest)' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── DIET TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'diet' && (
        <motion.div key="diet" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Phase context */}
          {(cyclePhase || pregnancy) && (
            <div style={{
              padding: '14px 20px', borderRadius: 3, marginBottom: 24,
              background: pregnancy ? TRIMESTER_META[pregnancy.trimester]?.bg : phaseMeta.bg,
              borderLeft: `3px solid ${pregnancy ? TRIMESTER_META[pregnancy.trimester]?.color : phaseMeta.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            }}>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px', color: pregnancy ? TRIMESTER_META[pregnancy.trimester]?.color : phaseMeta.color }}>
                  {pregnancy ? `Pregnancy · Trimester ${pregnancy.trimester}` : `${phaseMeta.label} — Personalised Plan`}
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink-mid)', margin: 0, fontWeight: 500 }}>
                  {pregnancy ? TRIMESTER_META[pregnancy.trimester]?.tagline : phaseMeta.tagline}
                </p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600 }}>Auto-detected from your data</span>
            </div>
          )}

          {/* Dietary preference selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {DIET_TABS.map(pref => (
              <button key={pref} type="button"
                onClick={() => { const p = { ...params, preference: pref }; setParams(p); fetchDiet(p); }}
                style={{
                  padding: '8px 20px', borderRadius: 3, cursor: 'pointer',
                  fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.04em', textTransform: 'capitalize',
                  border: `1.5px solid ${params.preference === pref ? 'var(--forest)' : 'var(--border)'}`,
                  background: params.preference === pref ? 'var(--forest)' : 'transparent',
                  color: params.preference === pref ? 'var(--cream)' : 'var(--ink-soft)',
                  transition: 'all 0.15s',
                }}>
                {pref}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--sage-pale)', borderTopColor: 'var(--forest)', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : dietData && dietData.meals ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Meals */}
              {dietData.meals && (
                <div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>
                    Today's Meal Plan
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {Object.entries(dietData.meals).map(([meal, items]) => (
                      <div key={meal} className="card" style={{ padding: 22, borderTop: '3px solid var(--gold)' }}>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                          {meal}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(Array.isArray(items) ? items : [items]).map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: 'var(--gold)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>✦</span>
                              <span style={{ fontSize: 13.5, color: 'var(--ink-mid)', lineHeight: 1.5 }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrients / tips */}
              {(dietData.nutrients || dietData.tips) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {dietData.nutrients && (
                    <div className="card" style={{ padding: 24 }}>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
                        Key Nutrients
                      </h3>
                      {Object.entries(dietData.nutrients).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                          <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{k}</span>
                          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {dietData.tips && (
                    <div className="card" style={{ padding: 24 }}>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
                        Nutrition Tips
                      </h3>
                      {(Array.isArray(dietData.tips) ? dietData.tips : [dietData.tips]).map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < dietData.tips.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span style={{ color: 'var(--sage)', flexShrink: 0, fontWeight: 700 }}>✦</span>
                          <span style={{ fontSize: 13.5, color: 'var(--ink-mid)', lineHeight: 1.6 }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="alert-gold">No diet plan available for this phase and dietary preference.</div>
          )}

          {/* Prompt to see poses */}
          <div className="card" style={{ padding: 24, marginTop: 28, borderTop: '3px solid var(--sage)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
            onClick={() => setActiveTab('poses')}>
            <span style={{ fontSize: 28 }}>◈</span>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>
                View Recommended Exercise Poses
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
                {pregnancy
                  ? `Trimester ${pregnancy.trimester} safe poses with detailed instructions`
                  : `${(PHASE_META[cyclePhase || 'menstrual']?.label)} poses tailored to your current phase`
                }
              </p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              View →
            </span>
          </div>
        </motion.div>
      )}

      {/* ── POSES TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'poses' && (
        <motion.div key="poses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              Exercise & Yoga Poses
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
              {pregnancy
                ? `Safe, pregnancy-adapted poses for trimester ${pregnancy.trimester}. Tap any card to flip for full details, benefits, and safety notes.`
                : 'Phase-specific poses matched to your hormonal cycle. Tap any card to flip for full details, benefits, and safety notes.'
              }
            </p>
          </div>

          <PoseGrid
            phase={cyclePhase || 'menstrual'}
            trimester={pregnancy?.trimester || null}
          />

          <div className="alert-gold" style={{ marginTop: 28 }}>
            ⚕ Always consult your healthcare provider before starting a new exercise routine, especially during pregnancy. Stop any exercise that causes pain, dizziness, or discomfort.
          </div>
        </motion.div>
      )}
    </div>
  );
}