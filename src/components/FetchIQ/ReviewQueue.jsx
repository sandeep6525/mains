import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Search, Plus, Clock, CheckCircle2, XCircle, Loader2, FileText, Database, CheckSquare, Trash2, AlertTriangle } from 'lucide-react';
import './FetchIQ.css';

const ReviewQueue = () => {
  const [stats, setStats] = useState({ total: 0, processing: 0, failed: 0, completed: 0, recentDocuments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(null);
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);
  const [documentToUnpublish, setDocumentToUnpublish] = useState(null);
  const [unpublishLoading, setUnpublishLoading] = useState(false);
  const [unpublishError, setUnpublishError] = useState(null);
  const [unpublishSuccessMessage, setUnpublishSuccessMessage] = useState(null);

  const fetchReviewQueue = async () => {
      try {
        const token = localStorage.getItem('fetchIqToken');
        const res = await fetch('http://localhost:3000/api/fetchiq/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setStats(data);
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

    
    fetchReviewQueue();
  }, []);

  const openDeleteModal = (doc) => {
    setDocumentToDelete(doc);
    setDeleteError(null);
    setDeleteSuccessMessage(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
    setDeleteError(null);
  };

  const openUnpublishModal = (doc) => {
    setDocumentToUnpublish(doc);
    setUnpublishError(null);
    setUnpublishSuccessMessage(null);
    setUnpublishModalOpen(true);
  };

  const closeUnpublishModal = () => {
    setUnpublishModalOpen(false);
    setDocumentToUnpublish(null);
    setUnpublishError(null);
  };

  const confirmUnpublish = async () => {
    if (!documentToUnpublish) return;
    setUnpublishLoading(true);
    setUnpublishError(null);
    
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/pyqs/${documentToUnpublish.id}/unpublish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let data;
      try { data = await res.json(); } catch(e) { data = { error: 'Invalid response from server' }; }
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unpublish document');
      }
      
      setUnpublishSuccessMessage(data.message || 'Document successfully removed from Mains 360.');
      
      setTimeout(() => {
        setUnpublishSuccessMessage(null);
        closeUnpublishModal();
        fetchDashboard();
      }, 2000);
      
    } catch (err) {
      setUnpublishError(err.message);
    } finally {
      setUnpublishLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    
    console.log(`[FETCHIQ DELETE] documentId=${documentToDelete.id}`);
    
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/document/${documentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let data;
      try {
        data = await res.json();
      } catch(e) {
        data = { error: 'Invalid response from server' };
      }
      
      console.log(`[FETCHIQ DELETE] response=${JSON.stringify(data)}`);
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
           throw new Error('Authentication failed (401/403). Please log in again.');
        } else if (res.status === 404) {
           throw new Error('Document not found (404). It may have already been deleted.');
        } else if (res.status === 409) {
           throw new Error(data.reason || data.error || 'Document cannot be deleted due to a conflict (409).');
        }
        throw new Error(data.error || 'Failed to delete document');
      }
      
      setDeleteSuccessMessage(data.message || `${documentToDelete.originalFileName} deleted successfully.`);
      
      // Refresh dashboard after short delay to let user see success message
      setTimeout(() => {
        setDeleteSuccessMessage(null);
        closeDeleteModal();
        fetchReviewQueue();
      }, 2000);
      
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'UPLOADED':
      case 'DETECTED':
      case 'DOWNLOAD_PENDING':
        return <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{status}</span>;
      case 'PROCESSING':
      case 'DOWNLOADED':
      case 'RUNNING':
        return <span className="badge" style={{ backgroundColor: 'var(--indigo-bg)', color: 'var(--indigo-400)' }}>{status}</span>;
      case 'COMPLETED':
      case 'PUBLISHED':
      case 'SUCCESS':
        return <span className="badge" style={{ backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-400)' }}>{status}</span>;
      case 'READY_FOR_REVIEW':
        return <span className="badge" style={{ backgroundColor: 'var(--gold-glow)', color: 'var(--gold-400)' }}>REVIEW</span>;
      case 'FAILED':
        return <span className="badge" style={{ backgroundColor: 'var(--rose-bg)', color: 'var(--rose-400)' }}>FAILED</span>;
      default:
        return <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{status || 'UNKNOWN'}</span>;
    }
  };

  if (loading) return (
    <AdminLayout title="Review Queue" subtitle="Monitor your UPSC document intelligence pipeline.">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: 'var(--text-muted)' }}>
        <Loader2 size={32} style={{ marginBottom: '16px', color: 'var(--indigo-500)', animation: 'spin 1s linear infinite' }} />
        <p>Loading dashboard metrics...</p>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout title="Review Queue" subtitle="Monitor your UPSC document intelligence pipeline.">
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', borderColor: 'var(--rose-500)' }}>
        <XCircle size={32} color="var(--rose-400)" style={{ marginBottom: '16px' }} />
        <p style={{ fontWeight: 500, marginBottom: '16px', color: 'var(--rose-400)' }}>Unable to load dashboard.</p>
        <button onClick={() => window.location.reload()} className="btn btn-secondary">Retry Connection</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Review Queue" subtitle="Manage documents requiring intelligence review.">
      {/* Document Queue Table */}
      <div className="admin-table-container">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Documents</h2>
        </div>
        
        <div>
          {stats.recentDocuments && stats.recentDocuments.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDocuments.map((doc) => {
                  const job = doc.IngestionJob?.[0];
                  const displayStatus = job?.status === 'READY_FOR_REVIEW' ? 'READY_FOR_REVIEW' : (job?.status || doc.status);
                  
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.originalFileName}>
                          {doc.originalFileName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.id}>{doc.id}</div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                          <Database size={14} />
                          {doc.source}
                        </span>
                      </td>
                      <td>
                        {getStatusBadge(displayStatus)}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(doc.updatedAt).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <a href={`/fetchiq/review/${doc.id}`} className="badge" style={{ backgroundColor: 'var(--indigo-bg)', color: 'var(--indigo-400)', textDecoration: 'none', padding: '6px 12px', marginRight: '8px' }}>
                          <Search size={14} style={{ marginRight: '4px' }} /> Open Review
                        </a>
                        {displayStatus === 'FAILED' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--rose-400)', cursor: 'help', marginRight: '8px' }} title={job?.errorMessage || 'Unknown Error'}>View Error</span>
                        )}
                        {displayStatus === 'PUBLISHED' && (
                          <button onClick={() => openUnpublishModal(doc)} className="badge" style={{ backgroundColor: 'var(--rose-bg)', color: 'var(--rose-400)', border: 'none', cursor: 'pointer', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', marginRight: '8px' }}>
                            <XCircle size={14} style={{ marginRight: '4px' }} /> Remove from Mains 360
                          </button>
                        )}
                        {(() => {
                          const canDelete = displayStatus === 'READY_FOR_REVIEW' || displayStatus === 'REVIEW' || displayStatus === 'FAILED' || displayStatus === 'UPLOADED' || displayStatus === 'UNPUBLISHED';
                          const isProcessing = displayStatus === 'PROCESSING' || displayStatus === 'RUNNING';
                          const isPublished = displayStatus === 'PUBLISHED';
                          
                          if (canDelete) {
                            return (
                              <button onClick={() => openDeleteModal(doc)} className="badge" style={{ backgroundColor: 'var(--rose-bg)', color: 'var(--rose-400)', border: 'none', cursor: 'pointer', padding: '6px 12px', display: 'inline-flex', alignItems: 'center' }}>
                                <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
                              </button>
                            );
                          } else if (isProcessing) {
                            return (
                              <button disabled className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: 'none', cursor: 'not-allowed', padding: '6px 12px', display: 'inline-flex', alignItems: 'center' }} title="Document is currently processing">
                                <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
                              </button>
                            );
                          } else if (isPublished) {
                            return null;
                          }
                          return null;
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 12px auto' }} />
              <p>No recent documents found.</p>
            </div>
          )}
        </div>
      </div>

      {deleteModalOpen && documentToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '450px', padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-400)' }}>
              <AlertTriangle size={20} />
              Delete Document?
            </h3>
            
            <div style={{ margin: '20px 0', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Document:</strong> {documentToDelete.originalFileName}</p>
              <p style={{ margin: 0 }}><strong>Status:</strong> {documentToDelete.status}</p>
            </div>
            
            {documentToDelete.status === 'PUBLISHED' ? (
              <p style={{ color: 'var(--rose-400)', fontWeight: 500, fontSize: '0.9rem' }}>
                This document has been published. Deleting it may affect published content. Confirm explicitly.
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                This action will remove the document and its ingestion records.
              </p>
            )}

            {deleteError && (
              <div style={{ padding: '12px', backgroundColor: 'var(--rose-bg)', color: 'var(--rose-400)', borderRadius: '6px', margin: '16px 0', fontSize: '0.9rem' }}>
                Unable to delete document: {deleteError}
              </div>
            )}

            {deleteSuccessMessage && (
              <div style={{ padding: '12px', backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-400)', borderRadius: '6px', margin: '16px 0', fontSize: '0.9rem' }}>
                {deleteSuccessMessage}
              </div>
            )}

            {!deleteSuccessMessage && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={closeDeleteModal} 
                  disabled={deleteLoading}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: deleteLoading ? 'not-allowed' : 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  disabled={deleteLoading}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--rose-500)', color: 'white', border: 'none', borderRadius: '6px', cursor: deleteLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {unpublishModalOpen && documentToUnpublish && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '450px', padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-400)' }}>
              <AlertTriangle size={20} />
              Remove from Mains 360?
            </h3>
            
            <div style={{ margin: '20px 0', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Document:</strong> {documentToUnpublish.originalFileName}</p>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              This will remove the document from the student-facing Mains 360 application. The original evidence, topic mapping, blueprint, and database record will be retained. Admin can delete the document later if required.
            </p>

            {unpublishError && (
              <div style={{ padding: '12px', backgroundColor: 'var(--rose-bg)', color: 'var(--rose-400)', borderRadius: '6px', margin: '16px 0', fontSize: '0.9rem' }}>
                Unable to unpublish: {unpublishError}
              </div>
            )}

            {unpublishSuccessMessage && (
              <div style={{ padding: '12px', backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-400)', borderRadius: '6px', margin: '16px 0', fontSize: '0.9rem' }}>
                {unpublishSuccessMessage}
              </div>
            )}

            {!unpublishSuccessMessage && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={closeUnpublishModal} 
                  disabled={unpublishLoading}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: unpublishLoading ? 'not-allowed' : 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmUnpublish} 
                  disabled={unpublishLoading}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--rose-500)', color: 'white', border: 'none', borderRadius: '6px', cursor: unpublishLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {unpublishLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  Remove from Mains 360
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default ReviewQueue;
