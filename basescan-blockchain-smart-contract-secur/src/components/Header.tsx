import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const [blockHeight, setBlockHeight] = useState(19485720);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Risk Overview Dashboard';
      case 'reports':
        return 'Smart Contract Security Reports';
      case 'simulator':
        return 'Live Contract Risk Simulator';
      case 'compliance':
        return 'Compliance Center';
      default:
        return 'ChainAegis Control';
    }
  };

  const getSub = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Analytics and threat intelligence across verified smart contracts';
      case 'reports':
        return 'Interactive analysis, findings, and formal verification results';
      case 'simulator':
        return 'Static analysis sandbox for draft smart contracts';
      case 'compliance':
        return 'Vulnerability mitigations and regulatory standards checklist';
      default:
        return '';
    }
  };

  return (
    <header className="header">
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
          {getTitle()}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {getSub()}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Block Height Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <Radio size={12} color="var(--color-cyan)" style={{ animation: 'pulseGlow 2s infinite' }} />
          <span>BASE HEIGHT: <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>#{blockHeight.toLocaleString()}</strong></span>
        </div>

        {/* Date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <Calendar size={12} />
          <span style={{ fontFamily: 'var(--font-mono)' }}>2026-07-03</span>
        </div>

        {/* Audit Profile Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(0, 242, 254, 0.04)',
          border: '1px solid rgba(0, 242, 254, 0.15)',
          borderRadius: '8px',
          padding: '6px 14px'
        }}>
          <div style={{
            background: 'var(--color-cyan)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bg-primary)'
          }}>
            <ShieldCheck size={14} strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Anmol
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-cyan)', fontWeight: 600, letterSpacing: '0.05em' }}>
              LEAD AUDITOR
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
