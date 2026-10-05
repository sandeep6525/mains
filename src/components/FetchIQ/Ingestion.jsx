import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { UploadCloud, File, Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import './FetchIQ.css';

const Ingestion = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(''); // '', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    console.log('[FETCHIQ CLIENT] Start Processing clicked');
    console.log(`[FETCHIQ CLIENT] filename=${file.name}`);
    console.log('[FETCHIQ CLIENT] request URL=http://localhost:3000/api/fetchiq/ingestion/upload');
    console.log('[FETCHIQ CLIENT] method=POST');
    console.log('[FETCHIQ CLIENT] sending request');

    setStatus('UPLOADING');
    setError(null);
    setMessage('');

    const token = localStorage.getItem('fetchIqToken');
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch('http://localhost:3000/api/fetchiq/ingestion/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log(`[FETCHIQ CLIENT] response status=${res.status}`);

      let data;
      try {
        data = await res.json();
        console.log(`[FETCHIQ CLIENT] response body=${JSON.stringify(data)}`);
      } catch (parseError) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }

      setStatus('PROCESSING');
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
      setStatus('FAILED');
    }
  };

  return (
    <AdminLayout title="Document Ingestion" subtitle="Upload and parse new UPSC papers via FetchIQ pipeline.">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          
          <form onSubmit={handleUpload}>
            {/* Upload Area */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', width: '100%', height: '200px', padding: '16px', backgroundColor: 'var(--bg-primary)', border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--indigo-500)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', height: '100%' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <UploadCloud size={32} />
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {file ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--indigo-400)' }}>
                              <File size={16} /> {file.name}
                            </span>
                          ) : (
                            <span>Drag & drop your PDF here or <span style={{ color: 'var(--indigo-400)', textDecoration: 'underline' }}>Choose PDF</span></span>
                          )}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maximum supported file size: 50MB</span>
                  </div>
                  <input type="file" name="file_upload" style={{ display: 'none' }} accept="application/pdf" onChange={handleFileChange} />
              </label>
            </div>

            {/* Metadata Preview */}
            <div style={{ marginBottom: '32px', backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
                <FileText size={16} color="var(--indigo-400)" /> Pipeline Detection Settings
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ flex: '1 1 min-content' }}>
                  <label className="form-label">Exam</label>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>[ Auto Detect ]</div>
                </div>
                <div style={{ flex: '1 1 min-content' }}>
                  <label className="form-label">Year</label>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>[ Auto Detect ]</div>
                </div>
                <div style={{ flex: '1 1 min-content' }}>
                  <label className="form-label">Paper</label>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>[ Auto Detect ]</div>
                </div>
                <div style={{ flex: '1 1 min-content' }}>
                  <label className="form-label">Subject</label>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>[ Auto Detect ]</div>
                </div>
                <div style={{ flex: '1 1 min-content' }}>
                  <label className="form-label">Source</label>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>[ UPSC ]</div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!file || status === 'UPLOADING' || status === 'PROCESSING'}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: (!file || status === 'UPLOADING' || status === 'PROCESSING') ? 0.5 : 1 }}
            >
              {status === 'UPLOADING' ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Uploading...</> : 
               status === 'PROCESSING' ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Processing Background Job...</> : 
               'Start FetchIQ Processing'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--rose-bg)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose-400)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Error:</strong> {error}</div>
            </div>
          )}

          {status && !error && (
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', margin: '0 0 24px 0' }}>Pipeline Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid', ...(status !== '' ? { backgroundColor: 'var(--emerald-bg)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--emerald-400)' } : { backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }) }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0, color: (status !== '' ? 'var(--text-primary)' : 'var(--text-muted)') }}>File Uploaded</h4>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid', ...(status === 'PROCESSING' ? { backgroundColor: 'var(--indigo-bg)', borderColor: 'rgba(99, 102, 241, 0.3)', color: 'var(--indigo-400)' } : status === 'COMPLETED' ? { backgroundColor: 'var(--emerald-bg)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--emerald-400)' } : { backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }) }}>
                    {status === 'PROCESSING' ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0, color: (status === 'PROCESSING' ? 'var(--indigo-400)' : status === 'COMPLETED' ? 'var(--text-primary)' : 'var(--text-muted)') }}>Intelligence Extraction</h4>
                    {status === 'PROCESSING' && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>OCR, layout analysis, and parsing running in background.</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0, color: 'var(--text-muted)' }}>Ready for Review</h4>
                  </div>
                </div>
              </div>
              
              {message && (
                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>System Message:</strong> {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Ingestion;
