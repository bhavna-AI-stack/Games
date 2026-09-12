import React, { useState, useEffect } from 'react';
import { complianceChecklist } from '../data/mockData';
import type { ComplianceItem } from '../types';
import { 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Filter, 
  AlertCircle 
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const [items, setItems] = useState<ComplianceItem[]>(() => {
    const saved = localStorage.getItem('chainaegis_compliance_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse compliance items', e);
      }
    }
    return complianceChecklist;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    localStorage.setItem('chainaegis_compliance_items', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const resetChecklist = () => {
    setItems(complianceChecklist);
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesStatus = 
      activeFilter === 'all' ? true :
      activeFilter === 'completed' ? item.checked :
      !item.checked;
    
    const matchesCategory = 
      categoryFilter === 'all' ? true :
      item.category === categoryFilter;

    return matchesStatus && matchesCategory;
  });

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const percentComplete = Math.round((checkedCount / totalCount) * 100);

  return (
    <div className="view-container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2.2fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Progress Card & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Progress Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', width: '100%', textAlign: 'left', marginBottom: '16px' }}>Compliance Audit Level</h3>
            
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="16" 
                  fill="none" 
                  stroke="var(--color-cyan)" 
                  strokeWidth="3.2" 
                  strokeDasharray={`${percentComplete} ${100 - percentComplete}`} 
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{percentComplete}%</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '-2px' }}>MITIGATION</span>
              </div>
            </div>

            <div style={{ margin: '16px 0 24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>{checkedCount}</strong> of <strong>{totalCount}</strong> primary smart contract audit directives successfully passed.
            </div>

            <button 
              onClick={resetChecklist} 
              className="btn btn-secondary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={14} />
              <span>Reset Standards Checklist</span>
            </button>
          </div>

          {/* Guidelines info card */}
          <div className="glass-card" style={{ borderLeft: '3px solid var(--color-cyan)' }}>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color="var(--color-cyan)" />
              Verification Guidelines
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              These security rules are compiled from general smart contract weak points (SWC) and formal verification workflows. Always verify that checklist steps are addressed in tests or production code prior to deployment.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Checklist items */}
        <div className="glass-card">
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}>
            {/* Status filters */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'pending', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    background: activeFilter === filter ? 'rgba(0, 242, 254, 0.06)' : 'transparent',
                    color: activeFilter === filter ? 'var(--color-cyan)' : 'var(--text-secondary)',
                    border: activeFilter === filter ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid transparent',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontFamily: 'var(--font-sans)',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={12} color="var(--text-muted)" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checklist List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No compliance directives match the active filters.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: item.checked ? 'rgba(0, 200, 100, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                    border: `1px solid ${item.checked ? 'rgba(0, 200, 100, 0.15)' : 'var(--card-border)'}`,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="checklist-item-row"
                >
                  <div style={{ color: item.checked ? 'var(--color-emerald)' : 'var(--text-muted)', marginTop: '2px' }}>
                    {item.checked ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: '0.9rem', 
                        color: '#ffffff',
                        textDecoration: item.checked ? 'line-through' : 'none',
                        opacity: item.checked ? 0.6 : 1
                      }}>
                        {item.name}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-secondary)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--card-border)'
                      }}>
                        {item.category}
                      </span>
                    </div>

                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)', 
                      marginTop: '4px',
                      lineHeight: 1.4,
                      opacity: item.checked ? 0.6 : 1
                    }}>
                      {item.description}
                    </p>
                  </div>

                  <span className={`badge badge-${item.severity}`} style={{ fontSize: '0.55rem', padding: '3px 6px' }}>
                    {item.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .checklist-item-row:hover {
          border-color: rgba(255, 255, 255, 0.15) !important;
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
};
