import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  FileText, 
  Terminal, 
  CheckSquare, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', name: 'Audit Reports', icon: FileText },
    { id: 'simulator', name: 'Risk Simulator', icon: Terminal },
    { id: 'compliance', name: 'Compliance Center', icon: CheckSquare },
  ];

  return (
    <aside className="sidebar" id="sidebar-nav">
      <div style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--card-border)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-cyan), var(--color-blue))',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
        }}>
          <ShieldAlert size={22} color="#05050f" strokeWidth={2.5} />
        </div>
        <div>
          <span style={{ 
            fontWeight: 800, 
            fontSize: '1.2rem', 
            background: 'linear-gradient(to right, #ffffff, var(--color-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>
            ChainAegis
          </span>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '0.1em', marginTop: '-2px' }}>
            SECURITY PROTOCOL
          </div>
        </div>
      </div>

      <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid transparent',
                color: isActive ? 'var(--color-cyan)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                transition: 'var(--transition-smooth)',
              }}
              className={isActive ? 'glowing-btn' : 'hoverable-nav'}
            >
              <Icon size={18} style={{ 
                color: isActive ? 'var(--color-cyan)' : 'var(--text-muted)',
                transition: 'var(--transition-smooth)'
              }} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ 
        padding: '24px 20px', 
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Layers size={12} />
            <span>NODE CONNECTION</span>
          </div>
          <div style={{ color: 'var(--color-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-emerald)', display: 'inline-block' }}></span>
            SECURE CLOUD NODE
          </div>
        </div>

        <a 
          href="https://github.com/AnmolM-777/ChainAegis" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid var(--card-border)',
            background: 'var(--bg-secondary)',
            fontWeight: 500
          }}
        >
          <span>View GitHub</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <style>{`
        .hoverable-nav:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          color: var(--text-primary) !important;
        }
        .hoverable-nav:hover svg {
          color: var(--text-secondary) !important;
        }
        .glowing-btn {
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.05);
        }
      `}</style>
    </aside>
  );
};
