// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

// Import admin API calls — add these to your api.js:
// export const getAdminStats        = ()            => api.get('/admin/stats');
// export const getAdminUsers        = (p,s)         => api.get(`/admin/users?page=${p}&search=${s}`);
// export const toggleUserStatus     = (id)          => api.patch(`/admin/users/${id}/toggle-status`);
// export const deleteUser           = (id)          => api.delete(`/admin/users/${id}`);
// export const getAdminSymptomTrends= (days)        => api.get(`/admin/symptom-trends?days=${days}`);
// export const getAdminDietPlans    = ()            => api.get('/admin/diet-plans');
// export const createAdminDietPlan  = (data)        => api.post('/admin/diet-plans', data);
// export const updateAdminDietPlan  = (id,data)     => api.put(`/admin/diet-plans/${id}`, data);
// export const deleteAdminDietPlan  = (id)          => api.delete(`/admin/diet-plans/${id}`);
// export const getAdminPoses        = ()            => api.get('/admin/poses');
// export const updateAdminPose      = (id,data)     => api.put(`/admin/poses/${id}`, data);
// export const deleteAdminPose      = (id)          => api.delete(`/admin/poses/${id}`);
import {
  getAdminStats, getAdminUsers, toggleUserStatus, deleteUser,
  getAdminSymptomTrends, getAdminDietPlans, createAdminDietPlan,
  updateAdminDietPlan, deleteAdminDietPlan, getAdminPoses,
  updateAdminPose, deleteAdminPose,
} from '../services/api';

// ── Colour palette ────────────────────────────────────────────────────────────
const CHART_COLORS = {
  general:   '#3d6647',
  menstrual: '#be123c',
  pregnancy: '#b45309',
  other:     '#7a9e82',
};
const CATEGORY_COLORS = ['#1a2e1f', '#3d6647', '#7a9e82', '#c9a84c', '#be123c'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtNum(n) {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('en-IN');
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = 'var(--forest)', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ padding: '22px 24px', borderTop: `3px solid ${accent}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 22, opacity: 0.65 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 600, color: 'var(--ink)', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      {sub && <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: 0 }}>{sub}</p>}
    </motion.div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{title}</h2>
      {action}
    </div>
  );
}



// ── Inline edit modal ─────────────────────────────────────────────────────────
function EditModal({ title, fields, initialData, onSave, onClose, saving }) {
  // Ultra-safe state initialization
  const [form, setForm] = useState(() => {
    const initialState = { ...(initialData || {}) };
    
    // Check if fields exist and is an array to prevent crashes
    if (Array.isArray(fields)) {
      fields.forEach(f => {
        // Only set default if it's a select field, value is undefined, AND it has valid options
        if (
          f.type === 'select' && 
          initialState[f.key] === undefined && 
          Array.isArray(f.options) && 
          f.options.length > 0
        ) {
          initialState[f.key] = f.options[0].value;
        }
      });
    }
    return initialState;
  });

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <AnimatePresence>
      <motion.div key="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(26,46,31,0.55)', backdropFilter: 'blur(3px)' }}
      />
      <motion.div key="modal-panel"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        style={{
          position: 'fixed', zIndex: 2001,
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '100%', maxWidth: 520, maxHeight: '88vh',
          background: 'var(--warm-white)', borderRadius: 6,
          boxShadow: '0 24px 80px rgba(26,46,31,0.2)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-soft)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {fields && fields.map(f => (
              <div key={f.key} className="field">
                <label className="label">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="input" value={form[f.key] || ''} onChange={set(f.key)}>
                    {f.options && f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea className="input" rows={3} value={form[f.key] || ''} onChange={set(f.key)}
                    style={{ resize: 'vertical', fontFamily: 'Jost, sans-serif', lineHeight: 1.6 }} />
                ) : (
                  <input className="input" type={f.type || 'text'} value={form[f.key] || ''} onChange={set(f.key)} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: Overview
// ════════════════════════════════════════════════════════════════════════════
function OverviewTab({ stats, loading }) {
  if (loading) return <LoadingSpinner />;
  if (!stats)  return <div className="alert-gold">No stats available.</div>;

  return (
    <div>
      {/* Stat cards */}
      <div className="page-grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon="👥" label="Total Users"     value={fmtNum(stats.totalUsers)}      sub={`${fmtNum(stats.activeUsers)} active`}          accent="var(--forest)"  delay={0.04} />
        <StatCard icon="◐"  label="Cycle Logs"      value={fmtNum(stats.totalCycleLogs)}  sub="All time"                                        accent="var(--sage)"    delay={0.08} />
        <StatCard icon="◈"  label="Symptom Logs"    value={fmtNum(stats.totalSymptomLogs)}sub="All time"                                        accent="var(--gold)"    delay={0.12} />
        <StatCard icon="✦"  label="New This Month"  value={fmtNum(stats.newUsersThisMonth)}sub="Registered users"                               accent="#be123c"        delay={0.16} />
      </div>

      {/* Content inventory */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <StatCard icon="◇" label="Diet Plans"  value={fmtNum(stats.totalDietPlans)} sub="Active plans in database" accent="var(--gold)" />
        <StatCard icon="◈" label="Exercise Poses" value={fmtNum(stats.totalPoses)} sub="Seeded poses in database" accent="var(--forest-mid)" />
      </div>

      {/* User growth chart */}
      {stats.userGrowth?.length > 0 && (
        <div className="card" style={{ padding: 28 }}>
          <SectionHeading title="User Growth — Last 6 Months" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.userGrowth} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ink-soft)', fontFamily: 'Jost, sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--ink-soft)', fontFamily: 'Jost, sans-serif' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'Jost, sans-serif', fontSize: 12 }}
                labelStyle={{ fontWeight: 700, color: 'var(--ink)' }}
              />
              <Line type="monotone" dataKey="count" name="New Users" stroke="var(--forest)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--forest)' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: Users
// ════════════════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users,      setUsers]      = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [actionId,   setActionId]   = useState(null);

  const load = useCallback(async (p = 1, s = '') => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers(p, s);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, search); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const handleToggle = async (id) => {
    setActionId(id);
    try {
      await toggleUserStatus(id);
      load(page, search);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Permanently delete ${name} and ALL their health data? This is irreversible.`)) return;
    setActionId(id);
    try {
      await deleteUser(id);
      load(page, search);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setActionId(null); }
  };

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input className="input" placeholder="Search by name or email…" value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
        <button className="btn btn-outline" type="submit" style={{ fontSize: 11, padding: '9px 20px' }}>Search</button>
        {search && (
          <button className="btn btn-ghost" type="button" style={{ fontSize: 11, padding: '9px 16px' }}
            onClick={() => { setSearch(''); setPage(1); load(1, ''); }}>
            Clear
          </button>
        )}
      </form>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['User', 'Email', 'Preference', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-faint)', fontStyle: 'italic' }}>No users found.</td></tr>
                ) : users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--forest), var(--sage))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: 'white',
                        }}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink-soft)' }}>{user.email}</td>
                    <td>
                      <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                        {user.dietaryPreference || 'vegetarian'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-forest'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 9px', borderRadius: 2, fontSize: 11, fontWeight: 700,
                        background: user.isActive ? '#f0fdf4' : '#fef2f2',
                        color:      user.isActive ? '#14532d' : '#991b1b',
                        border:     `1px solid ${user.isActive ? '#86efac' : '#fca5a5'}`,
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: user.isActive ? '#16a34a' : '#dc2626' }} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{fmtDate(user.createdAt)}</td>
                    <td>
                      {user.role !== 'admin' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            disabled={actionId === user._id}
                            onClick={() => handleToggle(user._id)}
                            style={{
                              padding: '5px 10px', borderRadius: 2, border: '1px solid var(--border)',
                              background: 'transparent', cursor: 'pointer',
                              fontSize: 11, fontWeight: 700, fontFamily: 'Jost, sans-serif',
                              color: user.isActive ? '#b45309' : '#166534',
                              transition: 'all 0.15s',
                            }}
                          >
                            {actionId === user._id ? '…' : user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            disabled={actionId === user._id}
                            onClick={() => handleDelete(user._id, user.name)}
                            style={{
                              padding: '5px 10px', borderRadius: 2, border: '1px solid #fca5a5',
                              background: '#fef2f2', cursor: 'pointer',
                              fontSize: 11, fontWeight: 700, fontFamily: 'Jost, sans-serif',
                              color: '#991b1b', transition: 'all 0.15s',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontStyle: 'italic' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                style={{ fontSize: 11, padding: '7px 14px' }}>← Prev</button>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                Page {pagination.currentPage} of {pagination.totalPages}
                <span style={{ color: 'var(--ink-faint)', marginLeft: 8 }}>({fmtNum(pagination.totalUsers)} users)</span>
              </span>
              <button className="btn btn-ghost" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                style={{ fontSize: 11, padding: '7px 14px' }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: Symptom Trends
// ════════════════════════════════════════════════════════════════════════════
function SymptomTrendsTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [days,    setDays]    = useState(30);

  const load = useCallback(async (d) => {
    setLoading(true);
    try {
      const { data: res } = await getAdminSymptomTrends(d);
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(days); }, [days]);

  // Custom bar chart tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 3,
        padding: '10px 14px', fontFamily: 'Jost, sans-serif', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        <p style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{d.label}</p>
        <p style={{ color: 'var(--ink-soft)' }}>Reported: <strong style={{ color: 'var(--forest)' }}>{d.count}×</strong></p>
        <p style={{ color: 'var(--ink-soft)' }}>Avg severity: <strong style={{ color: CHART_COLORS[d.category] || 'var(--forest)' }}>{d.avgSeverity}/5</strong></p>
        <p style={{ color: 'var(--ink-soft)' }}>Unique users: <strong>{d.uniqueUsers}</strong></p>
        <p style={{ color: 'var(--ink-faint)', fontSize: 11, marginTop: 4, textTransform: 'capitalize' }}>Category: {d.category}</p>
      </div>
    );
  };

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[7, 14, 30, 60, 90].map(d => (
          <button key={d} type="button" onClick={() => setDays(d)} style={{
            padding: '7px 16px', borderRadius: 3, cursor: 'pointer',
            fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${days === d ? 'var(--forest)' : 'var(--border)'}`,
            background: days === d ? 'var(--forest)' : 'transparent',
            color: days === d ? 'var(--cream)' : 'var(--ink-soft)',
            transition: 'all 0.15s',
          }}>Last {d}d</button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--ink-faint)', alignSelf: 'center', marginLeft: 8 }}>
          {data ? `${fmtNum(data.totalEntries)} total entries across all users` : ''}
        </span>
      </div>

      {loading ? <LoadingSpinner /> : !data ? (
        <div className="alert-red">Could not load symptom trends.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Top 10 symptoms bar chart */}
          <div className="card" style={{ padding: 28 }}>
            <SectionHeading title={`Top Symptoms — Last ${days} Days`} />
            {data.trends.length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', fontSize: 13, fontStyle: 'italic' }}>No symptom data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.trends} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--ink-soft)', fontFamily: 'Jost, sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" width={160}
                    tick={{ fontSize: 11, fill: 'var(--ink-mid)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                    axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--sage-pale)' }} />
                  <Bar dataKey="count" name="Reports" radius={[0, 3, 3, 0]} maxBarSize={22}>
                    {data.trends.map((entry, i) => (
                      <Cell key={i} fill={CHART_COLORS[entry.category] || CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Two column: daily sparkline + category pie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

            {/* Daily log activity */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>
                Daily Logging Activity — Last 14 Days
              </h3>
              {data.daily.length === 0 ? (
                <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontStyle: 'italic' }}>No daily data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--ink-faint)', fontFamily: 'Jost, sans-serif' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--ink-faint)', fontFamily: 'Jost, sans-serif' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'Jost, sans-serif', fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" name="Entries" stroke="var(--sage)" strokeWidth={2} dot={{ r: 3, fill: 'var(--sage)' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category breakdown pie */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>
                By Category
              </h3>
              {data.categories.length === 0 ? (
                <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontStyle: 'italic' }}>No category data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={data.categories} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={70} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                      style={{ fontFamily: 'Jost, sans-serif', fontSize: 10 }}
                    >
                      {data.categories.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'Jost, sans-serif', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Summary table */}
          {data.trends.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                  Detailed Breakdown
                </h3>
              </div>
              <table className="data-table">
                <thead><tr>
                  {['Symptom', 'Category', 'Reports', 'Avg Severity', 'Unique Users'].map(h => <th key={h}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {data.trends.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{t.label}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 700,
                          textTransform: 'capitalize',
                          background: CHART_COLORS[t.category] + '18',
                          color: CHART_COLORS[t.category] || 'var(--ink-soft)',
                          border: `1px solid ${CHART_COLORS[t.category]}33`,
                        }}>{t.category}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--forest)' }}>{t.count}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, maxWidth: 80, height: 5, background: 'var(--sage-pale)', borderRadius: 3 }}>
                            <div style={{ width: `${(t.avgSeverity / 5) * 100}%`, height: '100%', background: 'var(--forest)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)' }}>{t.avgSeverity}/5</span>
                        </div>
                      </td>
                      <td>{t.uniqueUsers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: Content Management
// ════════════════════════════════════════════════════════════════════════════
function ContentTab() {
  const [contentTab, setContentTab] = useState('poses'); // 'poses' | 'diet'
  const [poses,      setPoses]      = useState([]);
  const [dietPlans,  setDietPlans]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editItem,   setEditItem]   = useState(null);  // { type, data }
  const [saving,     setSaving]     = useState(false);
  const [actionId,   setActionId]   = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const [poseRes, dietRes] = await Promise.all([
        getAdminPoses(),
        getAdminDietPlans(),
      ]);
      setPoses(poseRes.data);
      setDietPlans(dietRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  // ── Save pose edit ─────────────────────────────────────────────────────────
  const savePose = async (form) => {
    setSaving(true);
    try {
      await updateAdminPose(editItem.data._id, form);
      setEditItem(null);
      loadContent();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  // ── Delete pose ────────────────────────────────────────────────────────────
  const handleDeletePose = async (id, name) => {
    if (!confirm(`Delete pose "${name}"?`)) return;
    setActionId(id);
    try { await deleteAdminPose(id); loadContent(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setActionId(null); }
  };

  // ── Save diet plan ─────────────────────────────────────────────────────────
  const saveDietPlan = async (form) => {
    setSaving(true);
    try {
      if (editItem?.data?._id) {
        await updateAdminDietPlan(editItem.data._id, form);
      } else {
        await createAdminDietPlan(form);
      }
      setEditItem(null);
      setShowCreate(false);
      loadContent();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  // ── Delete diet plan ───────────────────────────────────────────────────────
  const handleDeleteDiet = async (id, title) => {
    if (!confirm(`Delete diet plan "${title}"?`)) return;
    setActionId(id);
    try { await deleteAdminDietPlan(id); loadContent(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setActionId(null); }
  };

  const POSE_FIELDS = [
    { key: 'name',          label: 'Pose Name',          type: 'text' },
    { key: 'sanskritName',  label: 'Sanskrit Name',      type: 'text' },
    { key: 'phase',         label: 'Phase',              type: 'select', options: [
      { value: 'menstrual', label: 'Menstrual' },
      { value: 'follicular',label: 'Follicular' },
      { value: 'ovulation', label: 'Ovulation' },
      { value: 'luteal',    label: 'Luteal' },
      { value: 'all',       label: 'All / Pregnancy' },
    ]},
    { key: 'trimester',     label: 'Trimester (1/2/3 or blank)', type: 'number' },
    { key: 'intensity',     label: 'Intensity',          type: 'select', options: [
      { value: 'gentle',   label: 'Gentle' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'active',   label: 'Active' },
    ]},
    { key: 'duration',      label: 'Duration',           type: 'text' },
    { key: 'description',   label: 'Description',        type: 'textarea' },
    { key: 'imageUrl',      label: 'Image URL',          type: 'text' },
    { key: 'safetyWarning', label: 'Safety Warning',     type: 'textarea' },
  ];

  const DIET_FIELDS = [
    { key: 'title',              label: 'Plan Title',         type: 'text' },
    { key: 'dietaryPreference',  label: 'Dietary Preference', type: 'select', options: [
      { value: 'vegetarian',     label: 'Vegetarian' },
      { value: 'vegan',          label: 'Vegan' },
      { value: 'non-vegetarian', label: 'Non-Vegetarian' },
      { value: 'eggetarian',     label: 'Eggetarian' },
    ]},
    { key: 'phase',              label: 'Cycle Phase',        type: 'select', options: [
      { value: '',          label: '— None —' },
      { value: 'menstrual', label: 'Menstrual' },
      { value: 'follicular',label: 'Follicular' },
      { value: 'ovulation', label: 'Ovulation' },
      { value: 'luteal',    label: 'Luteal' },
    ]},
    { key: 'trimester',          label: 'Trimester (1/2/3 or blank)', type: 'number' },
    { key: 'description',        label: 'Description',        type: 'textarea' },
  ];

  const PHASE_COLORS = { menstrual: '#be123c', follicular: '#166534', ovulation: '#b45309', luteal: '#1e40af', all: 'var(--sage)' };

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', width: 'fit-content' }}>
        {[{ key: 'poses', label: '◈  Exercise Poses' }, { key: 'diet', label: '◇  Diet Plans' }].map((t, i) => (
          <button key={t.key} type="button" onClick={() => setContentTab(t.key)} style={{
            padding: '10px 24px', border: 'none', cursor: 'pointer',
            borderRight: i === 0 ? '1px solid var(--border)' : 'none',
            fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: contentTab === t.key ? 'var(--forest)' : 'transparent',
            color: contentTab === t.key ? 'var(--cream)' : 'var(--ink-soft)',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (

        <>
          {/* ── POSES ─────────────────────────────────────────────────── */}
          {contentTab === 'poses' && (
            <div>
              <SectionHeading title={`Exercise Poses (${poses.length})`} />
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr>
                    {['Pose', 'Phase', 'Trimester', 'Intensity', 'Duration', 'Safety', 'Actions'].map(h => <th key={h}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {poses.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                        No poses yet. Use POST /api/poses/seed to seed initial data.
                      </td></tr>
                    ) : poses.map(pose => (
                      <tr key={pose._id}>
                        <td>
                          <div>
                            <p style={{ fontWeight: 600, margin: 0, color: 'var(--ink)' }}>{pose.name}</p>
                            {pose.sanskritName && <p style={{ fontSize: 11, color: 'var(--ink-faint)', margin: 0 }}>{pose.sanskritName}</p>}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 700,
                            textTransform: 'capitalize',
                            background: (PHASE_COLORS[pose.phase] || 'var(--sage)') + '18',
                            color: PHASE_COLORS[pose.phase] || 'var(--sage)',
                            border: `1px solid ${(PHASE_COLORS[pose.phase] || 'var(--sage)')}33`,
                          }}>{pose.phase}</span>
                        </td>
                        <td>{pose.trimester ? `T${pose.trimester}` : '—'}</td>
                        <td><span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>{pose.intensity}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{pose.duration}</td>
                        <td>
                          {pose.safetyWarning ? (
                            <span style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }} title={pose.safetyWarning}>⚠ Yes</span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setEditItem({ type: 'pose', data: pose })} style={{
                              padding: '5px 10px', borderRadius: 2, border: '1px solid var(--border)',
                              background: 'transparent', cursor: 'pointer',
                              fontSize: 11, fontWeight: 700, color: 'var(--forest)',
                              fontFamily: 'Jost, sans-serif',
                            }}>Edit</button>
                            <button disabled={actionId === pose._id} onClick={() => handleDeletePose(pose._id, pose.name)} style={{
                              padding: '5px 10px', borderRadius: 2, border: '1px solid #fca5a5',
                              background: '#fef2f2', cursor: 'pointer',
                              fontSize: 11, fontWeight: 700, color: '#991b1b',
                              fontFamily: 'Jost, sans-serif',
                            }}>{actionId === pose._id ? '…' : 'Delete'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DIET PLANS ─────────────────────────────────────────────── */}
          {contentTab === 'diet' && (
            <div>
              <SectionHeading
                title={`Diet Plans (${dietPlans.length})`}
                action={
                  <button className="btn btn-primary" onClick={() => { setShowCreate(true); setEditItem({ type: 'diet', data: {} }); }}
                    style={{ fontSize: 11, padding: '8px 18px' }}>
                    + Add Diet Plan
                  </button>
                }
              />
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr>
                    {['Title', 'Preference', 'Phase', 'Trimester', 'Meals', 'Actions'].map(h => <th key={h}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {dietPlans.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                        No diet plans yet. Add your first plan above.
                      </td></tr>
                    ) : dietPlans.map(plan => (
                      <tr key={plan._id}>
                        <td style={{ fontWeight: 500 }}>{plan.title}</td>
                        <td><span className="badge badge-forest" style={{ textTransform: 'capitalize' }}>{plan.dietaryPreference}</span></td>
                        <td>
                          {plan.phase ? (
                            <span style={{
                              padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 700,
                              textTransform: 'capitalize',
                              background: (PHASE_COLORS[plan.phase] || 'var(--sage)') + '18',
                              color: PHASE_COLORS[plan.phase] || 'var(--sage)',
                            }}>{plan.phase}</span>
                          ) : '—'}
                        </td>
                        <td>{plan.trimester ? `T${plan.trimester}` : '—'}</td>
                        <td style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                          {Object.values(plan.meals || {}).reduce((a, arr) => a + (arr?.length || 0), 0)} items
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditItem({ type: 'diet', data: plan }); setShowCreate(false); }} style={{
                              padding: '5px 10px', borderRadius: 2, border: '1px solid var(--border)',
                              background: 'transparent', cursor: 'pointer',
                              fontSize: 11, fontWeight: 700, color: 'var(--forest)',
                              fontFamily: 'Jost, sans-serif',
                            }}>Edit</button>
                            <button disabled={actionId === plan._id} onClick={() => handleDeleteDiet(plan._id, plan.title)} style={{
                              padding: '5px 10px', borderRadius: 2, border: '1px solid #fca5a5',
                              background: '#fef2f2', cursor: 'pointer',
                              fontSize: 11, fontWeight: 700, color: '#991b1b',
                              fontFamily: 'Jost, sans-serif',
                            }}>{actionId === plan._id ? '…' : 'Delete'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {editItem && (
        <EditModal
          title={
            editItem.type === 'pose'
              ? `Edit Pose: ${editItem.data.name || 'New Pose'}`
              : editItem.data._id
                ? `Edit Diet Plan: ${editItem.data.title}`
                : 'Create Diet Plan'
          }
          fields={editItem.type === 'pose' ? POSE_FIELDS : DIET_FIELDS}
          initialData={editItem.data}
          onSave={editItem.type === 'pose' ? savePose : saveDietPlan}
          onClose={() => { setEditItem(null); setShowCreate(false); }}
          saving={saving}
        />
      )}
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--sage-pale)', borderTopColor: 'var(--forest)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN AdminDashboard
// ════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats,     setStats]     = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Re-fetch stats whenever the user clicks the "overview" tab
  useEffect(() => {
    if (activeTab === 'overview') {
      getAdminStats()
        .then(({ data }) => setStats(data))
        .catch(() => setStats(null))
        .finally(() => setStatsLoading(false));
    }
  }, [activeTab]); // <-- Added activeTab dependency

  const TABS = [
    { key: 'overview',  label: 'Overview',         icon: '◈' },
    { key: 'users',     label: 'Users',             icon: '◉' },
    { key: 'symptoms',  label: 'Symptom Trends',    icon: '◐' },
    { key: 'content',   label: 'Content Management',icon: '◇' },
  ];

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Administration</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Admin Dashboard
          </h1>
          {stats && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-forest">{fmtNum(stats.totalUsers)} Users</span>
              <span className="badge badge-gold">{fmtNum(stats.newUsersThisMonth)} New this month</span>
              <span className="badge badge-sage">{fmtNum(stats.activeUsers)} Active</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab navigation ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)} style={{
            padding: '13px 24px', border: 'none', cursor: 'pointer', flexShrink: 0,
            fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'transparent',
            color: activeTab === t.key ? 'var(--forest)' : 'var(--ink-soft)',
            borderBottom: activeTab === t.key ? '2.5px solid var(--forest)' : '2.5px solid transparent',
            marginBottom: -1, transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'overview'  && <OverviewTab stats={stats} loading={statsLoading} />}
          {activeTab === 'users'     && <UsersTab />}
          {activeTab === 'symptoms'  && <SymptomTrendsTab />}
          {activeTab === 'content'   && <ContentTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
