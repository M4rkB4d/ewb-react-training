// src/types/compliance.ts
// Level 1 Exercise 3 — Compliance Checklist Types

export type ComplianceArea =
  | 'data-masking'
  | 'authentication'
  | 'accessibility'
  | 'error-monitoring'
  | 'data-privacy'
  | 'audit-logging';

export type CheckStatus = 'passed' | 'failed' | 'in-progress' | 'not-started';

export interface ComplianceCheck {
  status: CheckStatus;
  area: ComplianceArea;
  verifiedBy?: string;
  verifiedAt?: string;
  reason?: string;
  regulation?: string;
  assignee?: string;
}

export interface ComplianceSummary {
  passed: number;
  failed: number;
  pending: number; // in-progress + not-started
}

const REGULATION_MAP: Record<string, string> = {
  'data-masking': 'RA 10173 (Data Privacy Act / DPA)',
  'authentication': 'BSP Circular 982 / 1213',
  'accessibility': 'WCAG 2.1 AA',
  'error-monitoring': 'BSP Circular 808',
  'data-privacy': 'RA 10173 (DPA)',
  'audit-logging': 'BSP Circular 982',
};

/**
 * Returns the applicable regulation for a compliance area.
 */
export function getRegulationForArea(area: string): string {
  return REGULATION_MAP[area] ?? 'No regulation mapped';
}

/**
 * Summarizes a checklist into pass/fail/pending counts.
 */
export function summarizeChecklist(checks: ComplianceCheck[]): ComplianceSummary {
  let passed = 0;
  let failed = 0;
  let pending = 0;

  for (const check of checks) {
    if (check.status === 'passed') passed++;
    else if (check.status === 'failed') failed++;
    else pending++; // in-progress or not-started
  }

  return { passed, failed, pending };
}
