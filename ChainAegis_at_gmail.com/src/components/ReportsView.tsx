import React, { useState } from 'react';
import { mockReports } from '../data/mockData';
import type { Severity } from '../types';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Printer, 
  HelpCircle, 
  GitBranch, 
  Info,
  ShieldAlert
} from 'lucide-react';

interface ReportsViewProps {
  selectedReportId: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ selectedReportId }) => {
  const [activeReportId, setActiveReportId] = useState<string>(selectedReportId || mockReports[0].id);
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  
  // Find current report
  const currentReport = mockReports.find(r => r.id === activeReportId) || mockReports[0];

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return <span className="badge badge-critical">CRITICAL</span>;
      case 'high':
        return <span className="badge badge-high">HIGH</span>;
      case 'medium':
        return <span className="badge badge-medium">MEDIUM</span>;
      case 'low':
        return <span className="badge badge-low">LOW</span>;
      default:
        return <span className="badge badge-info">INFO</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter findings
  const filteredFindings = currentReport.findings.filter(finding => {
    if (filterSeverity === 'all') return true;
    return finding.severity === filterSeverity;
  });

  return (
    <div className="view-container printable-report">
      {/* Project Selector Bar */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '12px 20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {mockReports.map((report) => (
            <button
              key={report.id}
              onClick={() => {
                setActiveReportId(report.id);
                setExpandedFindingId(null);
              }}
              style={{
                background: activeReportId === report.id ? 'var(--bg-tertiary)' : 'transparent',
                color: activeReportId === report.id ? 'var(--color-cyan)' : 'var(--text-secondary)',
                border: activeReportId === report.id ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid transparent',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                transition: 'var(--transition-smooth)'
              }}
            >
              {report.projectName}
            </button>
          ))}
        </div>

        <button 
          onClick={handlePrint}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Printer size={14} />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Summary Section */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentReport.projectName} Audit Report
            </h2>
            <div style={{
              display: 'flex',
              gap: '16px',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              marginTop: '8px',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitBranch size={12} />
                COMMIT: {currentReport.commitHash.substring(0, 8)}
              </span>
              <span>·</span>
              <span>DATE: {currentReport.auditDate}</span>
              <span>·</span>
              <span>PLATFORM: {currentReport.platform}</span>
            </div>
            
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginTop: '16px'
            }}>
              {currentReport.summary}
            </p>
          </div>

          {/* Scoring Dial */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px solid var(--card-border)',
            paddingLeft: '32px'
          }}>
            <div style={{ position: 'relative', width: '110px', height: '110px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="3.2" />
                <circle 
                  cx="18" cy="18" r="16" 
                  fill="none" 
                  stroke={currentReport.score >= 90 ? 'var(--color-emerald)' : 'var(--color-cyan)'} 
                  strokeWidth="3.2" 
                  strokeDasharray={`${currentReport.score} ${100 - currentReport.score}`} 
                  strokeDashoffset="25"
                  strokeLinecap="round"
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
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{currentReport.score}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '-2px' }}>RISK INDEX</span>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
              {currentReport.score >= 90 ? 'Secure' : currentReport.score >= 80 ? 'Optimized' : 'Needs Remediation'}
            </div>
          </div>
        </div>
      </div>

      {/* Findings Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>Detailed Audit Findings ({filteredFindings.length})</h3>
        
        {/* Severity Filter */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Severity:</span>
          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Findings</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Findings Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredFindings.map((finding) => {
          const isExpanded = expandedFindingId === finding.id;
          return (
            <div 
              key={finding.id}
              className="glass-card" 
              style={{ 
                padding: '0', 
                overflow: 'hidden',
                borderColor: isExpanded ? 'rgba(0, 242, 254, 0.2)' : 'var(--card-border)' 
              }}
            >
              {/* Accordion Trigger */}
              <div 
                onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {getSeverityBadge(finding.severity)}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
                      {finding.id}: {finding.title}
                    </h4>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-muted)', 
                      fontFamily: 'var(--font-mono)',
                      marginTop: '4px',
                      display: 'inline-block'
                    }}>
                      {finding.location}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: finding.status === 'fixed' ? 'var(--color-emerald)' : finding.status === 'acknowledged' ? 'var(--color-blue)' : 'var(--color-amber)',
                    background: finding.status === 'fixed' ? 'var(--color-emerald-glow)' : 'rgba(0,122,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {finding.status.toUpperCase()}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div style={{ 
                  padding: '24px', 
                  borderTop: '1px solid var(--card-border)',
                  background: 'rgba(5, 5, 10, 0.2)' 
                }}>
                  
                  {/* Vulnerability Description & Impact */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                      <h5 style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Info size={12} />
                        DESCRIPTION
                      </h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                        {finding.description}
                      </p>
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.8rem', color: 'var(--color-rose)', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldAlert size={12} />
                        IMPACT & EXPLOITATION
                      </h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                        {finding.impact}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--card-border)', borderRadius: '10px' }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--color-emerald)', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HelpCircle size={12} />
                      REMEDIATION RECOMMENDATION
                    </h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '6px' }}>
                      {finding.recommendation}
                    </p>
                  </div>

                  {/* Code Diff Showcase */}
                  <div>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Terminal size={12} />
                      REMEDIATION CODE COMPARISON
                    </h5>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Vulnerable Code block */}
                      <div className="code-container" style={{ borderColor: 'rgba(255, 85, 85, 0.15)' }}>
                        <div className="code-header" style={{ background: 'rgba(255, 85, 85, 0.04)' }}>
                          <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>VULNERABLE CODE (ORIGINAL)</span>
                          <button 
                            onClick={() => handleCopyCode(finding.vulnerableCode, `${finding.id}-vuln`)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            {copiedCodeId === `${finding.id}-vuln` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <pre className="code-body" style={{ background: 'rgba(255, 85, 85, 0.01)', color: 'rgba(255, 200, 200, 0.95)' }}>
                          <code>{finding.vulnerableCode}</code>
                        </pre>
                      </div>

                      {/* Secured Code block */}
                      <div className="code-container" style={{ borderColor: 'rgba(0, 200, 100, 0.15)' }}>
                        <div className="code-header" style={{ background: 'rgba(0, 200, 100, 0.04)' }}>
                          <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>SECURED CODE (REMEDIATED)</span>
                          <button 
                            onClick={() => handleCopyCode(finding.securedCode, `${finding.id}-sec`)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            {copiedCodeId === `${finding.id}-sec` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <pre className="code-body" style={{ background: 'rgba(0, 200, 100, 0.01)', color: 'rgba(200, 255, 220, 0.95)' }}>
                          <code>{finding.securedCode}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .glass-card {
            border: 1px solid #cccccc !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .code-container {
            background: #f5f5f5 !important;
            border: 1px solid #dddddd !important;
            color: #000000 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};
