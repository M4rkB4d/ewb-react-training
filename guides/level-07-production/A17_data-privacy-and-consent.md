# A17 — Data Privacy and Consent

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 7 — Production · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Implement Philippine Data Privacy Act (RA 10173) requirements
- Build a consent management system
- Implement data masking for PII display
- Understand AMLA (RA 9160) and KYC requirements
- Handle data subject rights (access, correction, erasure)
- Build privacy-aware form patterns
- Design data retention policies for the frontend

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A03 — Thinking in Compliance | Level 1 |
| Completed A16 — BSP Compliance Framework | Level 7 |

---

## Phase 1 — Data Privacy Act (RA 10173)

### What the DPA requires for frontends

The Philippine Data Privacy Act applies to all processing of personal
information of Philippine citizens. For a banking frontend:

| Requirement | Frontend Implementation |
|------------|----------------------|
| **Consent** | Explicit opt-in before collecting any personal data |
| **Purpose limitation** | Only collect data needed for the specific function |
| **Data minimization** | Display minimum PII necessary (masking) |
| **Access rights** | Users can view all data held about them |
| **Correction rights** | Users can request corrections |
| **Erasure rights** | Users can request data deletion (with exceptions) |
| **Breach notification** | Frontend contributes to incident detection |

### Consent before collection

```tsx
// src/features/consent/types.ts
export const consentPurposes = [
  'essential',          // Required for banking services
  'analytics',          // Usage analytics
  'marketing',          // Marketing communications
  'data-sharing',       // BSP 1122 Open Finance
  'biometric',          // Passkey/biometric auth
  'location',           // Branch finder
] as const;

export type ConsentPurpose = (typeof consentPurposes)[number];
```

### Consent management component

```tsx
// src/features/consent/components/consent-manager.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import type { ConsentPurpose } from '../types';

// BSP 1122 — Validate all API responses with Zod
const consentRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  purpose: z.enum(['essential', 'analytics', 'marketing', 'data-sharing', 'biometric', 'location']),
  granted: z.boolean(),
  grantedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  version: z.string(),
  ipAddress: z.string(),
});

// Single source of truth — derived from the Zod schema
type ConsentRecord = z.infer<typeof consentRecordSchema>;

const purposes: { key: ConsentPurpose; label: string; description: string; required: boolean }[] = [
  {
    key: 'essential',
    label: 'Essential Banking Services',
    description: 'Required for account access, transfers, and core banking features.',
    required: true,
  },
  {
    key: 'analytics',
    label: 'Usage Analytics',
    description: 'Helps us improve the digital banking experience.',
    required: false,
  },
  {
    key: 'marketing',
    label: 'Marketing Communications',
    description: 'Receive personalized offers and product recommendations.',
    required: false,
  },
  {
    key: 'biometric',
    label: 'Biometric Authentication',
    description: 'Use fingerprint or face recognition for faster sign-in.',
    required: false,
  },
];

export function ConsentManager() {
  const queryClient = useQueryClient();

  const { data: consents } = useQuery({
    queryKey: ['consents'],
    queryFn: async () => {
      const response = await apiClient.get('/user/consents');
      return z.array(consentRecordSchema).parse(response.data);
    },
  });

  const updateConsent = useMutation({
    mutationFn: async ({ purpose, granted }: { purpose: ConsentPurpose; granted: boolean }) => {
      await apiClient.post('/user/consents', { purpose, granted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });

  const isGranted = (purpose: ConsentPurpose): boolean => {
    return consents?.some((c) => c.purpose === purpose && c.granted) ?? false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Privacy Preferences</h2>
        <p className="text-sm text-gray-600">
          Control how your data is used. Essential services cannot be disabled
          as they are required for banking operations.
        </p>
      </div>

      {purposes.map((purpose) => (
        <div key={purpose.key} className="flex items-start justify-between border-b pb-4">
          <div className="flex-1">
            <h3 className="font-medium">{purpose.label}</h3>
            <p className="text-sm text-gray-600">{purpose.description}</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={purpose.required || isGranted(purpose.key)}
              disabled={purpose.required || updateConsent.isPending}
              onChange={(e) => {
                updateConsent.mutate({
                  purpose: purpose.key,
                  granted: e.target.checked,
                });
              }}
              className="peer sr-only"
              aria-label={`${purpose.label} consent toggle`}
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-ewb-purple peer-disabled:opacity-50" />
          </label>
        </div>
      ))}
    </div>
  );
}
```

### Checkpoint 1

Under the DPA, a bank customer requests to delete all their personal data.
Can the bank comply fully? What data must be retained and for how long?

Answer: The bank cannot delete all data. AMLA requires retention of
transaction records for at least 5 years after the account is closed. The
bank must explain this to the customer and delete only the data not subject
to legal retention requirements.

---

## Phase 2 — Data Masking

### Masking utilities (expanded from A07)

```tsx
// src/lib/masking.ts

/**
 * Mask a value, showing only the last N characters.
 * DPA compliance — minimize PII display.
 */
export function maskValue(value: string, visibleChars: number): string {
  if (value.length <= visibleChars) return value;
  const masked = '•'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

export function maskAccountNumber(accountNumber: string): string {
  return maskValue(accountNumber, 4);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local == null || domain == null) return '••••@••••';
  const maskedLocal = local.charAt(0) + '•'.repeat(Math.max(local.length - 2, 1)) + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  // Show only last 4 digits: ••••••5678
  const digits = phone.replace(/\D/g, '');
  return maskValue(digits, 4);
}

export function maskName(name: string): string {
  const parts = name.split(' ');
  return parts.map((part) => part.charAt(0) + '•'.repeat(part.length - 1)).join(' ');
}
```

### Masked display component

```tsx
// src/components/ui/masked-value.tsx
import { useState } from 'react';

interface MaskedValueProps {
  value: string;
  maskedValue: string;
  label: string;
}

export function MaskedValue({ value, maskedValue, label }: MaskedValueProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span className="inline-flex items-center gap-1">
      <span aria-label={`${label} (${isRevealed ? 'visible' : 'hidden'})`}>
        {isRevealed ? value : maskedValue}
      </span>
      <button
        type="button"
        onClick={() => setIsRevealed((prev) => !prev)}
        className="text-xs text-ewb-purple underline"
        aria-label={isRevealed ? `Hide ${label}` : `Show ${label}`}
      >
        {isRevealed ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}
```

### Default masking policy

| Data Type | Default Display | Reveal Requires |
|-----------|----------------|----------------|
| Account number | ••••7890 | Click "Show" |
| Email | j••••s@ewb.com | Click "Show" |
| Phone | ••••5678 | Click "Show" |
| Balance | Shown by default | Toggle to hide |
| Full name | Shown by default | N/A |
| Card number | •••• •••• •••• 1234 | Never fully revealed |

---

## Phase 3 — AMLA and KYC

### KYC data collection

```tsx
// src/features/kyc/types.ts
export interface KYCData {
  // Tier 1 — Basic
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  idType: 'passport' | 'drivers-license' | 'national-id' | 'voters-id';
  idNumber: string;

  // Tier 2 — Enhanced
  sourceOfFunds: string;
  occupation: string;
  employer: string;
  annualIncome: string;

  // Tier 3 — High-Risk
  purposeOfAccount: string;
  expectedTransactionVolume: string;
  politicallyExposed: boolean;
}
```

### Document upload component

```tsx
// src/features/kyc/components/document-upload.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface DocumentUploadProps {
  label: string;
  accept: string;
  maxSizeMB: number;
  onUpload: (file: File) => void;
}

export function DocumentUpload({ label, accept, maxSizeMB, onUpload }: DocumentUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file == null) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map((t) => t.trim());
    if (!allowedTypes.some((type) => file.type === type || file.name.endsWith(type))) {
      setError('Invalid file type');
      return;
    }

    setError(null);
    onUpload(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="mt-1"
        aria-describedby={error != null ? 'upload-error' : undefined}
      />
      {error != null && (
        <p id="upload-error" className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Maximum file size: {maxSizeMB}MB. Accepted formats: {accept}
      </p>
    </div>
  );
}
```

> **AMLA (RA 9160):** Customer identification records must be maintained for
> at least 5 years after the account is closed. The frontend must ensure KYC
> data is collected completely before account activation.

### Checkpoint 2

Under AMLA, what must the frontend do when a customer attempts a transaction
that exceeds the reporting threshold (500,000 PHP)? What user interface
elements are required?

---

## Phase 4 — Data Subject Rights

### Right of access

```tsx
// src/features/privacy/components/data-access-request.tsx
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { emitAuditEvent } from '@/compliance/audit-service';

export function DataAccessRequest() {
  const requestData = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/user/data-request', {
        type: 'access',
      });
      return response.data;
    },
    onSuccess: () => {
      emitAuditEvent('DATA_EXPORT', { type: 'access_request' });
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Request Your Data</h3>
      <p className="text-sm text-gray-600">
        Under the Data Privacy Act, you have the right to request a copy of all
        personal data we hold about you. The report will be delivered to your
        registered email within 30 days.
      </p>
      <Button
        onClick={() => requestData.mutate()}
        disabled={requestData.isPending}
      >
        {requestData.isPending ? 'Submitting...' : 'Request Data Export'}
      </Button>
      {requestData.isSuccess && (
        <p className="text-sm text-green-600" role="status">
          Your request has been submitted. You will receive your data export
          within 30 days.
        </p>
      )}
    </div>
  );
}
```

---

## Key Takeaways

1. **Consent must be explicit and granular.** Users choose which data processing
   purposes they agree to. Essential banking is always required.

2. **Mask PII by default.** Account numbers, emails, and phone numbers are
   masked. Users must explicitly reveal them.

3. **AMLA requires 5-year data retention** — the frontend cannot offer full
   data erasure. Explain this clearly to users.

4. **KYC data collection** must be complete before account activation. Validate
   all required fields and document uploads.

5. **Data subject rights** (access, correction, erasure) must be accessible
   from the user's settings page. All requests are audited.

---

## Exercises

### Exercise 1 — Privacy Impact Assessment Form
Build a form that developers fill out before launching a new feature that
collects personal data. Include: data types, purpose, retention period,
third-party sharing, and legal basis.

### Exercise 2 — Data Breach Notification
Design the user-facing notification that would be shown if a data breach
is detected. Under NPC Circular 16-03, what information must be included?

### Exercise 3 — Cookie Consent Banner
Build a cookie consent banner that allows users to accept or reject
analytics cookies. Essential cookies are always accepted. The user's
choice must persist across sessions.

---

## What Comes Next

Level 7 is complete. You have deployment, security, compliance, and privacy.
Level 8 is the mastery level — architecture, internationalization, the
capstone project, and real-time patterns.

**Next guide:** [A18 — Architecture Patterns](../level-08-mastery/A18_architecture-patterns.md)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
