import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Database, Plus, Globe, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';

const Sources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [allowedDomain, setAllowedDomain] = useState('');
  const [description, setDescription] = useState('');

  const fetchSources = async () => {
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch('http://localhost:3000/api/fetchiq/ingestion/sources', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch sources');
      const data = await res.json();
      setSources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('fetchIqToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchSources();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch('http://localhost:3000/api/fetchiq/ingestion/sources', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, url, allowedDomain, description })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to add source');
      }
      setName(''); setUrl(''); setAllowedDomain(''); setDescription('');
      fetchSources();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <AdminLayout title="Source Configuration" subtitle="Configure official resources monitored by FetchIQ.">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: 'var(--text-muted)' }}>
        <Loader2 size={32} style={{ marginBottom: '16px', color: 'var(--indigo-500)', animation: 'spin 1s linear infinite' }} />
        <p>Loading configured sources...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Source Configuration" subtitle="Configure official resources monitored by FetchIQ.">
      {error && (
        <div style={{ backgroundColor: 'var(--rose-bg)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose-400)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      <div className="review-layout">
        {/* ADD SOURCE FORM */}
        <div>
          <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <Plus size={20} color="var(--indigo-400)" /> Add Source
            </h2>
            <form onSubmit={handleAdd} style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label className="form-label">Source Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input" placeholder="e.g. UPSC Official PYQ Page" />
              </div>
              <div className="form-group">
                <label className="form-label">URL to Monitor</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} required className="form-input" placeholder="https://upsc.gov.in/..." />
              </div>
              <div className="form-group">
                <label className="form-label">Allowed Domain (SSRF Whitelist)</label>
                <input type="text" value={allowedDomain} onChange={e => setAllowedDomain(e.target.value)} required className="form-input" placeholder="upsc.gov.in" />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} className="form-textarea" placeholder="Context or notes about this source..." />
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><Plus size={18} /> Create Source</>}
              </button>
            </form>
          </div>
        </div>

        {/* SOURCES LIST */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Configured Sources ({sources.length})</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {sources.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                <Database size={48} style={{ opacity: 0.2, margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Sources Configured</h3>
                <p style={{ fontSize: '0.9rem' }}>Use the form to add a monitored endpoint.</p>
              </div>
            ) : (
              sources.map(s => (
                <div key={s.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Database size={16} color="var(--indigo-400)" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{s.name}</h3>
                        <span className="badge" style={s.isEnabled ? { backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-400)' } : { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          {s.isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.description}</p>
                    </div>
                  </div>
                  
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                        <Globe size={12} /> Target URL
                      </div>
                      <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--indigo-400)', wordBreak: 'break-all', textDecoration: 'none' }}>
                        {s.url}
                      </a>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                        <ShieldCheck size={12} /> Allowed Domain
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.allowedDomain}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>Last Checked:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{s.lastCheckedAt ? new Date(s.lastCheckedAt).toLocaleString() : 'Never'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {s.lastError ? <XCircle size={14} color="var(--rose-400)" /> : <CheckCircle2 size={14} color="var(--emerald-400)" />}
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                      {s.lastError ? <span style={{ color: 'var(--rose-400)' }} title={s.lastError}>Error details...</span> : <span style={{ color: 'var(--emerald-400)' }}>Healthy</span>}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>Edit</button>
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>{s.isEnabled ? 'Disable' : 'Enable'}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Sources;
