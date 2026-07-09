import React from 'react';
import { mockReports } from '../data/mockData';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  Activity, 
  ArrowUpRight, 
  Cpu, 
  FileText 
} from 'lucide-react';

interface DashboardViewProps {
  onSelectReport: (reportId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectReport }) => {
  // Aggregate stats
  const totalReports = mockReports.length;
  
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  mockReports.forEach(report => {
    report.findings.forEach(finding => {
      if (finding.severity === 'critical') criticalCount++;
      else if (finding.severity === 'high') highCount++;
      else if (finding.severity === 'medium') mediumCount++;
      else if (finding.severity === 'low') lowCount++;
    });
  });

  const totalFindings = criticalCount + highCount + mediumCount + lowCount;
  const averageScore = Math.round(
    mockReports.reduce((acc, report) => acc + report.score, 0) / totalReports
  );

  return (
    <div className="view-container">
      {/* Grid of Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Card 1: Security Score */}
        <div className="glass-card hoverable" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'var(--color-cyan-glow)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            color: 'var(--color-cyan)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              SECURITY SCORE
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: '4px' }}>
              {averageScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', fontWeight: 600, marginTop: '2px' }}>
              SECURE PROTOCOL ACTIVE
            </div>
          </div>
        </div>

        {/* Card 2: Audited Contracts */}
        <div className="glass-card hoverable" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'rgba(0, 122, 255, 0.1)',
            border: '1px solid rgba(0, 122, 255, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            color: 'var(--color-blue)'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              AUDITED CONTRACTS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: '4px' }}>
              {totalReports}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              100% COVERAGE RATE
            </div>
          </div>
        </div>

        {/* Card 3: Active Threats */}
        <div className="glass-card hoverable" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'var(--color-rose-glow)',
            border: '1px solid rgba(255, 85, 85, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            color: 'var(--color-rose)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              OPEN FINDINGS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: '4px' }}>
              {totalFindings}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-rose)', fontWeight: 600, marginTop: '2px' }}>
              {criticalCount} CRITICAL · {highCount} HIGH
            </div>
          </div>
        </div>

        {/* Card 4: Compliance Status */}
        <div className="glass-card hoverable" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'var(--color-emerald-glow)',
            border: '1px solid rgba(0, 200, 100, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            color: 'var(--color-emerald)'
          }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              MITIGATION RATE
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: '4px' }}>
              85%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', fontWeight: 600, marginTop: '2px' }}>
              6/7 VULNERABILITIES RESOLVED
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Audited Contracts List & Code Scan Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Recent Audits Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Audited Blockchain Deployments</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Select a project below to open its security report
                </p>
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--color-cyan)',
                background: 'var(--color-cyan-glow)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                border: '1px solid rgba(0, 242, 254, 0.2)'
              }}>
                SYNCD
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>PROJECT</th>
                    <th style={{ padding: '12px 16px' }}>BLOCKCHAIN/PLATFORM</th>
                    <th style={{ padding: '12px 16px' }}>AUDIT DATE</th>
                    <th style={{ padding: '12px 16px' }}>VULNERABILITIES</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReports.map((report) => (
                    <tr 
                      key={report.id} 
                      onClick={() => onSelectReport(report.id)}
                      className="audit-row"
                      style={{ 
                        borderBottom: '1px solid var(--card-border)', 
                        fontSize: '0.85rem', 
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <td style={{ padding: '16px', fontWeight: 600, color: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Cpu size={14} color="var(--color-cyan)" />
                          <span>{report.projectName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{report.platform}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{report.auditDate}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {report.findings.filter(f => f.severity === 'critical').length > 0 && (
                            <span style={{ color: 'var(--color-rose)', fontWeight: 700, background: 'var(--color-rose-glow)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                              {report.findings.filter(f => f.severity === 'critical').length}C
                            </span>
                          )}
                          {report.findings.filter(f => f.severity === 'high').length > 0 && (
                            <span style={{ color: 'var(--color-amber)', fontWeight: 700, background: 'var(--color-amber-glow)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                              {report.findings.filter(f => f.severity === 'high').length}H
                            </span>
                          )}
                          {report.findings.filter(f => f.severity === 'medium' || f.severity === 'low').length > 0 && (
                            <span style={{ color: 'var(--color-blue)', fontWeight: 700, background: 'rgba(0, 122, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                              {report.findings.filter(f => f.severity === 'medium' || f.severity === 'low').length}M
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>
                        <span style={{
                          color: report.score >= 90 ? 'var(--color-emerald)' : report.score >= 80 ? 'var(--color-cyan)' : 'var(--color-amber)',
                          background: report.score >= 90 ? 'var(--color-emerald-glow)' : report.score >= 80 ? 'var(--color-cyan-glow)' : 'var(--color-amber-glow)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {report.score}
                          <ArrowUpRight size={10} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom SVG Line Chart - Scanned Code Metrics */}
          <div className="glass-card">
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', color: '#ffffff' }}>Lines of Code Scanned & Secured</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weekly compilation and auditing analysis volumes</p>
            </div>
            
            <div style={{ width: '100%', height: '140px', position: 'relative' }}>
              <svg viewBox="0 0 500 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="cyan-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Gridlines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="var(--card-border)" strokeWidth="0.5" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="var(--card-border)" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="var(--card-border)" strokeWidth="0.5" />
                
                {/* Area under line */}
                <path 
                  d="M0,120 L0,90 Q80,40 160,70 T320,30 T480,15 L500,15 L500,120 Z" 
                  fill="url(#cyan-gradient)" 
                />
                
                {/* Flowing Line */}
                <path 
                  d="M0,90 Q80,40 160,70 T320,30 T480,15 L500,15" 
                  fill="none" 
                  stroke="var(--color-cyan)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="160" cy="70" r="4" fill="var(--bg-primary)" stroke="var(--color-cyan)" strokeWidth="2" />
                <circle cx="320" cy="30" r="4" fill="var(--bg-primary)" stroke="var(--color-cyan)" strokeWidth="2" />
                <circle cx="480" cy="15" r="4" fill="var(--bg-primary)" stroke="var(--color-cyan)" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
              <span>WEEK 1 (12K LOC)</span>
              <span>WEEK 2 (28K LOC)</span>
              <span>WEEK 3 (45K LOC)</span>
              <span>WEEK 4 (78K LOC)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Risk Allocation & Security Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Custom SVG Radial Gauge */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', width: '100%', textAlign: 'left', marginBottom: '16px' }}>Threat Breakdown</h3>
            
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              {/* Radial donut chart with SVG */}
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                {/* Background Ring */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                
                {/* Critical - Rose (1/7 = 14%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-rose)" strokeWidth="3.2" 
                  strokeDasharray="14 86" strokeDashoffset="25" />
                
                {/* High - Amber (3/7 = 43%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-amber)" strokeWidth="3.2" 
                  strokeDasharray="43 57" strokeDashoffset="11" />
                  
                {/* Medium - Blue (2/7 = 29%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-blue)" strokeWidth="3.2" 
                  strokeDasharray="29 71" strokeDashoffset="-32" />

                {/* Low - Emerald (1/7 = 14%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-emerald)" strokeWidth="3.2" 
                  strokeDasharray="14 86" strokeDashoffset="-61" />
              </svg>
              
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>{totalFindings}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginTop: '2px' }}>TOTAL FINDINGS</span>
              </div>
            </div>

            <div style={{ width: '100%', marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-rose)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Critical ({criticalCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-amber)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>High ({highCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-blue)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Medium ({mediumCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-emerald)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Low ({lowCount})</span>
              </div>
            </div>
          </div>

          {/* Real-time Threat Stream */}
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--color-cyan)" />
              Security Intel Feed
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.75rem', paddingLeft: '12px', borderLeft: '2px solid var(--color-emerald)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Nexora NFT Marketplace Audited</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>2 hours ago · Compliance Score: 94%</div>
              </div>
              
              <div style={{ fontSize: '0.75rem', paddingLeft: '12px', borderLeft: '2px solid var(--color-cyan)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>MiniDEX: LP reentrancy patched</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>Yesterday · Commit Hash a8b1c2d3</div>
              </div>

              <div style={{ fontSize: '0.75rem', paddingLeft: '12px', borderLeft: '2px solid var(--color-amber)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>LendingVault division bug fixed</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>3 days ago · Severity: High</div>
              </div>

              <div style={{ fontSize: '0.75rem', paddingLeft: '12px', borderLeft: '2px solid var(--color-rose)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Oracle Manipulation reported</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>5 days ago · Protocol: LendingVault</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .audit-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
};
