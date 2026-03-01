// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/firebase';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const { login, loginWithFirebase } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Invalid credentials.'); }
    finally { setLoading(false); }
  };

  const googleLogin = async () => {
    setGLoading(true); setError('');
    try { const r = await signInWithGoogle(); await loginWithFirebase(r.user); navigate('/'); }
    catch { setError('Google sign-in unavailable. Use email/password or configure Firebase.'); }
    finally { setGLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>
      {/* Left — large brand panel */}
      <div style={{
        flex: 1, background: 'var(--forest)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '64px 72px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-120, right:-120, width:400, height:400, borderRadius:'50%', border:'1px solid rgba(201,168,76,0.12)' }} />
        <div style={{ position:'absolute', bottom:60, left:-80, width:280, height:280, borderRadius:'50%', border:'1px solid rgba(201,168,76,0.08)' }} />
        <div style={{ position:'absolute', top:200, right:40, width:150, height:150, borderRadius:'50%', border:'1px solid rgba(201,168,76,0.06)' }} />

        <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:80 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--sage))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🌿</div>
            <span style={{ fontFamily:'Cormorant Garamond, serif', fontSize:26, color:'var(--cream)', fontWeight:600 }}>HerCare</span>
          </div>

          <h1 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:58, fontWeight:300, color:'var(--cream)', lineHeight:1.05, marginBottom:28, letterSpacing:'-0.02em' }}>
            Your health,<br />
            <em style={{ color:'var(--gold-light)', fontWeight:400 }}>beautifully</em><br />
            understood.
          </h1>

          <p style={{ fontSize:16, color:'rgba(255,255,255,0.48)', lineHeight:1.8, maxWidth:380, fontWeight:300 }}>
            A complete, personalised women's health platform — from cycle insights to pregnancy guidance and holistic wellness plans.
          </p>

          <div style={{ marginTop:56, display:'flex', flexDirection:'column', gap:20 }}>
            {[
              { icon:'◐', text:'Cycle tracking & intelligent predictions' },
              { icon:'◎', text:'Week-by-week pregnancy companion' },
              { icon:'◇', text:'Personalised nutrition & fitness plans' },
              { icon:'◷', text:'Smart health reminders & alerts' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2+i*0.08 }}
                style={{ display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:18, color:'var(--gold)', opacity:0.8, width:20, textAlign:'center' }}>{f.icon}</span>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.5)', fontWeight:300 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p style={{ fontSize:11, color:'rgba(255,255,255,0.18)', letterSpacing:'0.08em' }}>
          ⚕ For informational purposes only · Not a substitute for medical advice
        </p>
      </div>

      {/* Right — form panel */}
      <div style={{ width:480, background:'var(--warm-white)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'72px 60px', borderLeft:'1px solid var(--border)' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.15 }}>

          <div style={{ marginBottom:8 }}>
            <p className="eyebrow" style={{ marginBottom:8 }}>Welcome back</p>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:38, fontWeight:400, color:'var(--ink)', letterSpacing:'-0.01em' }}>Sign in</h2>
          </div>
          <hr className="divider-gold" style={{ margin:'20px 0 32px' }} />

          {error && <div className="alert-red" style={{ marginBottom:20 }}>{error}</div>}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="field">
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop:4, justifyContent:'center', fontSize:12, padding:'14px' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:16, margin:'24px 0' }}>
            <div className="divider" style={{ flex:1 }} />
            <span style={{ fontSize:12, color:'var(--ink-faint)', letterSpacing:'0.04em' }}>or continue with</span>
            <div className="divider" style={{ flex:1 }} />
          </div>

          <button className="btn btn-ghost" onClick={googleLogin} disabled={gLoading}
            style={{ width:'100%', justifyContent:'center', padding:'13px' }}>
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {gLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--ink-soft)', marginTop:28 }}>
            New to HerCare?{' '}
            <Link to="/register" style={{ color:'var(--forest)', fontWeight:600, textDecoration:'none' }}>
              Create an account →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
