export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  location: string;
  description: string;
  impact: string;
  recommendation: string;
  vulnerableCode: string;
  securedCode: string;
  status: 'open' | 'fixed' | 'acknowledged';
}

export interface AuditReport {
  id: string;
  projectName: string;
  platform: string;
  auditDate: string;
  score: number;
  commitHash: string;
  summary: string;
  findings: Finding[];
}

export interface ComplianceItem {
  id: string;
  category: string;
  name: string;
  description: string;
  checked: boolean;
  severity: 'high' | 'medium' | 'low';
}
