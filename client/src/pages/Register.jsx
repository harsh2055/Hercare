// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', dietaryPreference:'vegetarian', language:'en' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true); setError('');
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };
  const set = f => e => setForm({...form, [f]: e.target.value});

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', padding:40 }}>
      <div style={{ display:'flex', width:'100%', maxWidth:980, background:'var(--warm-white)', border:'1px solid var(--border)', borderRadius:4, overflow:'hidden', boxShadow:'0 12px 60px rgba(26,46,31,0.09)' }}>
        {/* Left accent */}
        <div style={{ width:320, background:'var(--forest)', padding:'56px 48px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:48 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--sage))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🌿</div>
              <span style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, color:'var(--cream)', fontWeight:600 }}>HerCare</span>
            </div>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:34, fontWeight:300, color:'var(--cream)', lineHeight:1.2, marginBottom:20 }}>
              Begin your<br /><em style={{ color:'var(--gold-light)' }}>wellness</em><br />journey
            </h2>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.8, fontWeight:300 }}>
              Track your cycle, monitor your pregnancy, and receive personalised health guidance — all in one private, secure space.
            </p>
          </div>
          <div style={{ background:'rgba(201,168,76,0.1)', borderLeft:'2px solid var(--gold)', borderRadius:'0 3px 3px 0', padding:'16px 18px' }}>
            <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:15, color:'rgba(255,255,255,0.6)', fontStyle:'italic', lineHeight:1.7 }}>
              "Understanding your cycle is the foundation of women's health."
            </p>
          </div>
        </div>

        {/* Right form */}
        <div style={{ flex:1, padding:'56px 60px' }}>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <p className="eyebrow" style={{ marginBottom:8 }}>New Account</p>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:36, fontWeight:400, color:'var(--ink)', marginBottom:4 }}>Create your profile</h2>
            <hr className="divider-gold" style={{ margin:'16px 0 28px' }} />

            {error && <div className="alert-red" style={{ marginBottom:20 }}>{error}</div>}

            <form onSubmit={submit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px 24px', marginBottom:18 }}>
                <div className="field">
                  <label className="label">Full Name</label>
                  <input className="input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
                </div>
                <div className="field">
                  <label className="label">Email Address</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </div>
                <div className="field">
                  <label className="label">Password</label>
                  <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
                </div>
                <div className="field">
                  <label className="label">Confirm Password</label>
                  <input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>
                <div className="field">
                  <label className="label">Dietary Preference</label>
                  <select className="input" value={form.dietaryPreference} onChange={set('dietaryPreference')}>
                    <option value="vegetarian">🥬 Vegetarian</option>
                    <option value="vegan">🌱 Vegan</option>
                    <option value="non-vegetarian">🍗 Non-Vegetarian</option>
                    <option value="eggetarian">🥚 Eggetarian</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Preferred Language</label>
                  <select className="input" value={form.language} onChange={set('language')}>
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 हिंदी</option>
                    <option value="mr">🇮🇳 मराठी</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ width:'100%', justifyContent:'center', padding:'14px', marginTop:4, fontSize:12 }}>
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>

            <p style={{ textAlign:'center', fontSize:13, color:'var(--ink-soft)', marginTop:24 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'var(--forest)', fontWeight:600, textDecoration:'none' }}>Sign in →</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
