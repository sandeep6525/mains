import React, { useState } from 'react';
import { LayoutDashboard, Database, UploadCloud, CheckSquare, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import './FetchIQ.css'; // Import the newly created CSS

const AdminLayout = ({ children, title, subtitle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const path = window.location.pathname.replace(/\/$/, '');

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Sources', href: '/admin/sources', icon: Database },
    { name: 'Ingestion', href: '/fetchiq/ingestion', icon: UploadCloud },
    // A mock link for Review Queue, currently dashboard acts as the entry
    { name: 'Review Queue', href: '/fetchiq/review-queue', icon: CheckSquare }, 
  ];

  const handleLogout = () => {
    localStorage.removeItem('fetchIqToken');
    window.location.href = '/admin/login';
  };

  const SidebarContent = () => (
    <>
      <div className="admin-sidebar-header">
        <ShieldCheck size={32} color="var(--indigo-500)" />
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2 }}>YUKTIPREP</h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--indigo-400)', fontWeight: 600, letterSpacing: '0.1em' }}>FETCHIQ</div>
        </div>
      </div>
      
      <nav className="admin-nav">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, padding: '0 16px', marginTop: '16px', marginBottom: '8px' }}>Intelligence</div>
        {navItems.map((item) => {
          const isActive = path === item.href || (item.href !== '/admin' && path.startsWith(item.href));
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {item.name}
            </a>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo-400)', fontWeight: 'bold' }}>
            A
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Administrator</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Access</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', border: 'none', color: 'var(--rose-400)', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontWeight: 500 }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--rose-bg)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h1>
            {subtitle && <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{subtitle}</p>}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>FetchIQ Admin</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--emerald-400)' }}></span> Online
              </span>
            </div>
            <button className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
