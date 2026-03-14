import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoSrc from '../assets/logo.png'

export default function AuthPage() {
  const [view, setView]       = useState('login')
  const [email, setEmail]     = useState('admin@salescrm.com')
  const [password, setPass]   = useState('Admin@123')
  const [showPass, setShow]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = login(email, password)
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
  }

  const handleRegister = e => {
    e.preventDefault()
    setView('login')
  }

  const handleForgot = e => {
    e.preventDefault()
    setView('login')
  }

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-left-panel">
        <div className="auth-logo-wrap">
          <img src={logoSrc} alt="Kavya Infoweb" />
          <div className="auth-headline">Empower Your Sales<br />Team to Achieve More</div>
          <div className="auth-tagline">Professional CRM built for modern sales teams</div>
        </div>
        <div className="auth-stats">
          {[['247','Active Leads'],['₹8.4L','Monthly Revenue'],['94%','Satisfaction']].map(([v,l]) => (
            <div key={l} className="auth-stat-chip">
              <div className="val">{v}</div>
              <div className="lbl">{l}</div>
            </div>
          ))}
        </div>
        <div className="auth-dots">
          <div className="auth-dot active" />
          <div className="auth-dot" />
          <div className="auth-dot" />
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right-panel">
        {view === 'login' && (
          <>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:38, marginBottom:8 }}>👋</div>
              <div className="auth-form-title">Welcome Back</div>
              <div className="auth-form-sub">Sign in to Kavya Infoweb CRM</div>
            </div>
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input className="form-input" type={showPass?'text':'password'} value={password} onChange={e=>setPass(e.target.value)} required style={{paddingRight:44}} />
                  <span className="input-icon-right" onClick={() => setShow(!showPass)}>{showPass ? '🙈' : '👁'}</span>
                </div>
              </div>
              {error && <div style={{ color:'var(--red)', fontSize:13, fontWeight:600, padding:'8px 12px', background:'var(--red-dim)', borderRadius:'var(--r-sm)', borderLeft:'3px solid var(--red)' }}>{error}</div>}
              <div style={{ textAlign:'right', marginTop:-4 }}>
                <span className="auth-link" onClick={() => setView('forgot')}>Forgot password?</span>
              </div>
              <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent:'center', padding:'11px', fontSize:15 }}>
                {loading ? '⏳ Signing in…' : 'Sign In →'}
              </button>
              <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', fontWeight:600 }}>
                No account? <span className="auth-link" onClick={() => setView('register')}>Register here</span>
              </p>
            </form>
            <div className="demo-creds">
              <p>🔐 Demo Credentials</p>
              <code>Email: admin@salescrm.com<br />Password: Admin@123</code>
            </div>
          </>
        )}

        {view === 'register' && (
          <>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div className="auth-form-title">Create Account</div>
              <div className="auth-form-sub">Join Kavya Infoweb CRM</div>
            </div>
            <form className="auth-form" onSubmit={handleRegister}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group"><label className="form-label">First Name</label><input className="form-input" placeholder="John" required /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" placeholder="Doe" required /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="john@company.com" required /></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min 8 characters" required /></div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select">
                  <option>SALES_AGENT</option><option>MANAGER</option>
                </select>
              </div>
              <button className="btn btn-primary w-full" type="submit" style={{ justifyContent:'center', padding:'11px' }}>Create Account</button>
              <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', fontWeight:600 }}>
                Already registered? <span className="auth-link" onClick={() => setView('login')}>Sign in</span>
              </p>
            </form>
          </>
        )}

        {view === 'forgot' && (
          <>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:38, marginBottom:8 }}>🔑</div>
              <div className="auth-form-title">Reset Password</div>
              <div className="auth-form-sub">Enter your email to receive a reset link</div>
            </div>
            <form className="auth-form" onSubmit={handleForgot}>
              <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="you@example.com" required /></div>
              <button className="btn btn-primary w-full" type="submit" style={{ justifyContent:'center', padding:'11px' }}>Send Reset Link</button>
              <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', fontWeight:600 }}>
                <span className="auth-link" onClick={() => setView('login')}>← Back to Login</span>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
