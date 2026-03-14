// src/compliance/bsp-controls.ts

export interface ComplianceControl {
  circularNumber: string;
  circularName: string;
  requirement: string;
  controlDescription: string;
  implementationGuide: string;
  status: 'implemented' | 'in-progress' | 'planned';
  evidence: string;
}

export const bspControls: ComplianceControl[] = [
  {
    circularNumber: '982',
    circularName: 'Information Security',
    requirement: 'Session Management',
    controlDescription: 'Sessions timeout after 15 minutes of inactivity with a 2-minute warning',
    implementationGuide: 'B04',
    status: 'implemented',
    evidence: 'useSessionTimeout hook, SessionWarningDialog component, E2E test: session-timeout.spec.ts',
  },
  {
    circularNumber: '982',
    circularName: 'Information Security',
    requirement: 'Token Storage',
    controlDescription: 'Access tokens stored in JavaScript memory only, never in localStorage or sessionStorage',
    implementationGuide: 'A11, B04',
    status: 'implemented',
    evidence: 'useAuthStore — no persist middleware, security review document',
  },
  {
    circularNumber: '1213',
    circularName: 'AFASA',
    requirement: 'Phishing-Resistant Authentication',
    controlDescription: 'WebAuthn/passkey implementation with origin-bound credentials',
    implementationGuide: 'A12',
    status: 'implemented',
    evidence: 'PasskeyEnrollment component, usePasskeyLogin hook, E2E test: passkeys.spec.ts',
  },
  // ... all other controls
];
