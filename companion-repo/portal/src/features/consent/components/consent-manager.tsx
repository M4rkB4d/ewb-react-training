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
  purpose: z.string(),
  granted: z.boolean(),
  grantedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  version: z.string(),
  ipAddress: z.string(),
});

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
