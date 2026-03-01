// client/src/pages/Reminders.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReminders, createReminder, deleteReminder, updateReminder } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const TYPES = { period:'◐',ovulation:'◎',medication:'⊕',appointment:'⊞',exercise:'◇',water:'○',prenatal_vitamin:'✦',custom:'◷' };
const TYPE_LABELS = { period:'Period',ovulation:'Ovulation',medication:'Medication',appointment:'Appointment',exercise:'Exercise',water:'Hydration',prenatal_vitamin:'Prenatal Vitamin',custom:'Custom' };

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const [form, setForm] = useState({ type:'period', title:'', message:'', date:new Date().toISOString().split('T')[0], time:'09:00', recurring:false, recurringInterval:'weekly' });

  useEffect(() => { load(); }, []);
  
  const load = async () => {
    try { const {data} = await getReminders(); setReminders(data); }
    catch { setReminders([]); }
    finally { setLoading(false); }
  };

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await createReminder(form); await load(); setShowForm(false);
      setForm({ type:'period', title:'', message:'', date:new Date().toISOString().split('T')[0], time:'09:00', recurring:false, recurringInterval:'weekly' });
    } catch (err) { alert(err.response?.data?.message||'Failed to save'); }
    finally { setSaving(false); }
  };

  const dismiss = id => { updateReminder(id,{status:'dismissed'}); setReminders(r => r.map(x => x._id===id ? {...x,status:'dismissed'} : x)); };
  const remove  = id => { deleteReminder(id); setReminders(r => r.filter(x => x._id!==id)); };
  const set = f => e => setForm({...form, [f]: e.target.value});

  // ── Push Notification Request ───────────────────────────────────────────
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support push notifications.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);
    
    if (perm === 'granted') {
      // Create a test notification instantly to prove it works!
      new Notification('HerCare Alerts Enabled 🌿', {
        body: 'You will now receive health reminders on this device.',
        icon: '/icons/icon-192x192.png'
      });
    }
  };

  const upcoming = reminders.filter(r => r.status!=='dismissed' && new Date(r.date) >= new Date());
  const past     = reminders.filter(r => r.status==='dismissed' || new Date(r.date) < new Date());

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom:8 }}>Health Alerts</p>
          <h1 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:44, fontWeight:600, color:'var(--ink)', letterSpacing:'-0.02em' }}>Reminders</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Reminder</button>
      </div>

      {/* ── Notification Banner ── */}
      {permission !== 'granted' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
          className="card" style={{ padding: '16px 24px', marginBottom: 24, background: 'var(--sage-pale)', border: '1px solid var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--forest)', marginBottom: 4 }}>🔔 Enable Device Notifications</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-mid)', margin: 0 }}>Get pinged for your pill, water tracking, and period predictions.</p>
          </div>
          <button onClick={enableNotifications} className="btn btn-primary" style={{ fontSize: 12, padding: '10px 20px' }}>
            Allow Alerts
          </button>
        </motion.div>
      )}

      {showForm && (
        <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} className="card" style={{ padding:28, marginBottom:24, borderTop:'3px solid var(--gold)' }}>
          <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:600, color:'var(--ink)', marginBottom:20 }}>Create Reminder</h3>
          <form onSubmit={submit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr 1fr', gap:'16px 20px', marginBottom:16 }}>
              <div className="field">
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={set('type')}>
                  {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{TYPES[k]} {v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Title *</label>
                <input className="input" placeholder="Reminder title…" value={form.title} onChange={set('title')} required />
              </div>
              <div className="field">
                <label className="label">Date *</label>
                <input className="input" type="date" value={form.date} onChange={set('date')} required />
              </div>
              <div className="field">
                <label className="label">Time</label>
                <input className="input" type="time" value={form.time} onChange={set('time')} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px 20px', marginBottom:20 }}>
              <div className="field">
                <label className="label">Message (optional)</label>
                <input className="input" placeholder="Additional details…" value={form.message} onChange={set('message')} />
              </div>
              <div className="field">
                <label className="label" style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="checkbox" checked={form.recurring} onChange={e => setForm({...form,recurring:e.target.checked})}
                    style={{ width:14, height:14, accentColor:'var(--forest)' }} />
                  Recurring
                </label>
                {form.recurring && (
                  <select className="input" style={{ marginTop:6 }} value={form.recurringInterval} onChange={set('recurringInterval')}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving?'Saving…':'Save Reminder'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── Upcoming Reminders ── */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:24, fontWeight:600, color:'var(--ink)' }}>Upcoming</h2>
            <span className="badge badge-forest">{upcoming.length}</span>
            <div className="divider" style={{ flex:1 }} />
          </div>
          <div className="card" style={{ overflow:'hidden', padding: 0 }}>
            <AnimatePresence>
              {upcoming.map((r, i) => (
                <motion.div key={r._id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:12 }}
                  style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px', borderBottom: i < upcoming.length-1 ? '1px solid var(--border)' : 'none',
                    transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--sage-pale)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--sage-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'var(--forest)', flexShrink:0 }}>
                    {TYPES[r.type]||'◷'}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:2 }}>{r.title}</p>
                    {r.message && <p style={{ fontSize:12, color:'var(--ink-soft)', marginBottom:2 }}>{r.message}</p>}
                    <p style={{ fontSize:12, color:'var(--ink-faint)', fontWeight: 500 }}>
                      {formatDate(r.date)}{r.time && ` · ${r.time}`}{r.recurring && ` · Repeats ${r.recurringInterval}`}
                    </p>
                  </div>
                  <span className="badge badge-sage">{TYPE_LABELS[r.type]||r.type}</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-ghost" onClick={() => dismiss(r._id)} style={{ padding:'6px 14px', fontSize:11 }}>Done</button>
                    <button className="btn btn-danger" onClick={() => remove(r._id)} style={{ padding:'6px 14px', fontSize:11 }}>Remove</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Past Reminders ── */}
      {past.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, color:'var(--ink-soft)', fontWeight:600 }}>Completed / Past</h2>
            <div className="divider" style={{ flex:1 }} />
          </div>
          <div className="card" style={{ overflow:'hidden', opacity:0.7, padding: 0 }}>
            {past.slice(0,5).map((r,i) => (
              <div key={r._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 24px', borderBottom: i<Math.min(past.length,5)-1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize:16, color:'var(--ink-faint)', width:24 }}>{TYPES[r.type]||'◷'}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, color:'var(--ink-soft)', textDecoration:'line-through', fontWeight: 500 }}>{r.title}</p>
                  <p style={{ fontSize:11, color:'var(--ink-faint)', fontWeight: 500 }}>{formatDate(r.date)}</p>
                </div>
                <button onClick={() => remove(r._id)} style={{ background:'none', border:'none', color:'var(--ink-faint)', cursor:'pointer', fontSize:16, padding:4 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {reminders.length === 0 && !loading && (
        <div style={{ textAlign:'center', padding:'80px 40px', background:'var(--warm-white)', border:'1px solid var(--border)', borderRadius:4, borderTop:'4px solid var(--gold)' }}>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:52, color:'var(--sage)', marginBottom:16, opacity:0.4 }}>◷</div>
          <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:30, color:'var(--ink)', marginBottom:10, fontWeight:600 }}>No Reminders Yet</h3>
          <p style={{ color:'var(--ink-soft)', fontSize:15, marginBottom:28, maxWidth:380, margin:'0 auto 28px', lineHeight:1.7 }}>
            Set up intelligent reminders for your period, medications, appointments, and daily wellness habits.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ padding:'13px 36px' }}>+ Create First Reminder</button>
        </div>
      )}
    </div>
  );
}