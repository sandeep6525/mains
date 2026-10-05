import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';
import './FetchIQ.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect immediately
  if (!!localStorage.getItem('fetchIqToken')) {
     window.location.href = '/admin';
     return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/fetchiq/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('fetchIqToken', data.token);
      window.location.href = '/admin';
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('Unable to connect to the Admin server.');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '20px', fontFamily: 'var(--font-main)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--indigo-bg)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '16px' }}>
            <ShieldCheck size={32} color="var(--indigo-500)" />
          </div>
          <h1 style={{ fontSize: '2rem', margin: 0, lineHeight: 1.2, color: 'var(--text-primary)' }}>YUKTIPREP</h1>
          <h2 style={{ fontSize: '1rem', color: 'var(--indigo-400)', letterSpacing: '0.1em', marginTop: '4px' }}>FETCHIQ</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>Enterprise Intelligence<br/>Admin Portal</p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--rose-bg)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose-400)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="admin@yuktiprep.com"
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Secure Login'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Lock size={14} /> Authentication required
        </p>
      </div>
    </div>
  );
};

export default Login;
