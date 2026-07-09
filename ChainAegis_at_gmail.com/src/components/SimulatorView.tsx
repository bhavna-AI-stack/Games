import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Cpu, 
  FileCode, 
  Code 
} from 'lucide-react';

const SAMPLE_VULNERABLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // Vulnerable: Reentrancy hazard
    function withdrawAll() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Zero balance");

        // External transfer first
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // State updated after transfer!
        balances[msg.sender] = 0;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`;

const SAMPLE_SECURED_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecuredBank is ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Cannot deposit zero");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Secured: checks-effects-interactions & ReentrancyGuard
    function withdrawAll() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Zero balance");

        // 1. Effect: update balance state first
        balances[msg.sender] = 0;

        // 2. Interaction: external transfer last
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`;

export const SimulatorView: React.FC = () => {
  const [code, setCode] = useState(SAMPLE_VULNERABLE_CONTRACT);
  const [scanState, setScanState] = useState<'idle' | 'compiling' | 'scanning' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [detectedVulnerabilities, setDetectedVulnerabilities] = useState<{title: string, severity: 'critical'|'high'|'medium'|'low', line: string, fix: string}[]>([]);

  useEffect(() => {
    let timer: any;
    if (scanState === 'compiling') {
      setConsoleLogs(['[ChainAegis VM] Initializing solidity compiler v0.8.20...', '[ChainAegis VM] Parsing AST (Abstract Syntax Tree)...']);
      setProgress(15);
      
      timer = setTimeout(() => {
        setConsoleLogs(prev => [...prev, '[ChainAegis VM] AST generated successfully.', '[ChainAegis VM] Loading static analysis detectors...']);
        setProgress(35);
        setScanState('scanning');
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [scanState]);

  useEffect(() => {
    let interval: any;
    if (scanState === 'scanning') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState('done');
            evaluateCode();
            return 100;
          }
          const next = prev + 15;
          if (next >= 50 && prev < 50) {
            setConsoleLogs(l => [...l, '[Detector] Running Reentrancy checks...', '[Detector] Reentrancy vulnerability signature found on Line 17!']);
          } else if (next >= 80 && prev < 80) {
            setConsoleLogs(l => [...l, '[Detector] Running integer overflow tests...', '[Detector] Access control checks passed.']);
          }
          return Math.min(next, 100);
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  const evaluateCode = () => {
    // Basic heuristic check for demo purposes
    if (code.includes('balances[msg.sender] = 0;') && code.indexOf('balances[msg.sender] = 0;') > code.indexOf('msg.sender.call')) {
      // Reentrancy exists
      setScore(42);
      setDetectedVulnerabilities([
        {
          title: 'Reentrancy Vulnerability in withdrawAll()',
          severity: 'high',
          line: 'Line 17-18',
          fix: 'Update state balances[msg.sender] = 0 BEFORE calling msg.sender.call() or add nonReentrant modifier.'
        },
        {
          title: 'Missing Event Emission on Withdraw',
          severity: 'low',
          line: 'Line 15',
          fix: 'Emit an event on state changes to assist on-chain tracking and client synchronization.'
        }
      ]);
      setConsoleLogs(l => [...l, '[ChainAegis VM] Static analysis finished. 2 vulnerabilities detected.', '[ChainAegis VM] Security Score: 42/100. Audit Status: FAILED.']);
    } else {
      setScore(98);
      setDetectedVulnerabilities([]);
      setConsoleLogs(l => [...l, '[ChainAegis VM] Static analysis finished. 0 critical vulnerabilities found.', '[ChainAegis VM] Security Score: 98/100. Audit Status: PASSED.']);
    }
  };

  const startScan = () => {
    setProgress(0);
    setConsoleLogs([]);
    setScanState('compiling');
  };

  const applyAutoPatch = () => {
    setCode(SAMPLE_SECURED_CONTRACT);
    setScanState('idle');
    setProgress(0);
    setConsoleLogs([]);
  };

  const resetSimulator = () => {
    setCode(SAMPLE_VULNERABLE_CONTRACT);
    setScanState('idle');
    setProgress(0);
    setConsoleLogs([]);
  };

  return (
    <div className="view-container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Code Editor Sandbox */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--card-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCode size={18} color="var(--color-cyan)" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>DRAFT_CONTRACT.sol</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {scanState === 'idle' && (
                <button 
                  onClick={startScan} 
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Play size={12} fill="currentColor" />
                  <span>Start Audit Scan</span>
                </button>
              )}
              {scanState === 'done' && (
                <button 
                  onClick={resetSimulator} 
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset Code</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              value={code}
              onChange={(e) => {
                if (scanState === 'idle') setCode(e.target.value);
              }}
              readOnly={scanState !== 'idle'}
              style={{
                width: '100%',
                height: '420px',
                background: 'hsl(230, 25%, 3%)',
                color: 'rgba(255, 255, 255, 0.85)',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.825rem',
                lineHeight: '1.6',
                padding: '24px',
                outline: 'none',
                resize: 'none'
              }}
            />
            {/* Scan Beam Line */}
            {(scanState === 'compiling' || scanState === 'scanning') && (
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '2px',
                background: 'var(--color-cyan)',
                boxShadow: '0 0 10px var(--color-cyan)',
                animation: 'scanLine 3s infinite linear'
              }}></div>
            )}
          </div>
        </div>

        {/* Right Column: Console Output & Scorecard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Analysis Logs Console */}
          <div className="glass-card" style={{ background: 'hsl(230, 25%, 3%)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={14} />
              ANALYSIS SYSTEM LOGS
            </h3>

            <div style={{
              height: '140px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto'
            }}>
              {consoleLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Start Audit Scan" to initialize analysis pipeline...
                </div>
              ) : (
                consoleLogs.map((log, index) => {
                  let color = 'var(--text-secondary)';
                  if (log.includes('signature found') || log.includes('FAILED')) color = 'var(--color-rose)';
                  else if (log.includes('successfully') || log.includes('PASSED')) color = 'var(--color-emerald)';
                  else if (log.includes('Detector')) color = 'var(--color-cyan)';
                  return (
                    <div key={index} style={{ color }}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>

            {/* Progress Bar */}
            {scanState !== 'idle' && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>STATUS: {scanState === 'compiling' ? 'COMPILING CONTRACT' : scanState === 'scanning' ? 'DETECTING THREATS' : 'SCAN COMPLETED'}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-cyan)', transition: 'width 0.2s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Scorecard Results Card */}
          {scanState === 'done' && (
            <div className="glass-card" style={{
              borderLeft: `4px solid ${score >= 90 ? 'var(--color-emerald)' : 'var(--color-rose)'}`,
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Audit Scorecard</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Based on static code signature patterns</span>
                </div>
                
                <div style={{
                  background: score >= 90 ? 'var(--color-emerald-glow)' : 'var(--color-rose-glow)',
                  border: `1px solid ${score >= 90 ? 'rgba(0,200,100,0.2)' : 'rgba(255,85,85,0.2)'}`,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: score >= 90 ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                    {score}
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '-2px' }}>
                    SCORE
                  </div>
                </div>
              </div>

              {detectedVulnerabilities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {detectedVulnerabilities.map((vuln, i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff' }}>{vuln.title}</span>
                        <span className="badge badge-high" style={{ fontSize: '0.6rem', padding: '3px 8px' }}>{vuln.severity}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Location: {vuln.line}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                        <strong>Fix:</strong> {vuln.fix}
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={applyAutoPatch} 
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    <Code size={14} />
                    <span>Apply Auto-Patch Mitigation</span>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    background: 'var(--color-emerald-glow)',
                    color: 'var(--color-emerald)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <ShieldCheck size={24} />
                  </div>
                  <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600 }}>Protocol Secured</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', margin: '4px auto 0' }}>
                    Zero critical reentrancy vulnerabilities or state-ordering issues were detected.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
