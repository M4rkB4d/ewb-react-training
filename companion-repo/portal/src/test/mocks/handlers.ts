// src/test/mocks/handlers.ts
// MSW request handlers — shared between node (vitest) and browser (dev mode)
import { http, HttpResponse } from 'msw';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUser = {
  id: '1',
  name: 'Juan Santos',
  email: 'juan@ewb.com',
  role: 'customer' as const,
};

const mockAccounts = [
  {
    id: 'acc-1',
    name: 'Personal Savings',
    number: '1234567890',
    type: 'savings',
    balance: 15_000_000, // centavos — ₱150,000.00
    currency: 'PHP',
    isActive: true,
  },
  {
    id: 'acc-2',
    name: 'Payroll Account',
    number: '0987654321',
    type: 'checking',
    balance: 5_250_000, // centavos — ₱52,500.00
    currency: 'PHP',
    isActive: true,
  },
  {
    id: 'acc-3',
    name: 'Time Deposit',
    number: '5678901234',
    type: 'time-deposit',
    balance: 50_000_000, // centavos — ₱500,000.00
    currency: 'PHP',
    isActive: true,
  },
];

const mockTransactions = [
  {
    id: 'txn-1',
    date: '2026-03-10T08:30:00Z',
    description: 'POS Purchase — SM Megamall',
    amount: 250_000,
    type: 'debit',
    balance: 14_750_000,
    reference: 'REF-001',
    channel: 'POS',
  },
  {
    id: 'txn-2',
    date: '2026-03-09T14:00:00Z',
    description: 'Salary Credit — EastWest Corp',
    amount: 5_000_000,
    type: 'credit',
    balance: 15_000_000,
    reference: 'REF-002',
    channel: 'ACH',
  },
  {
    id: 'txn-3',
    date: '2026-03-08T10:15:00Z',
    description: 'Electric Bill — Meralco',
    amount: 350_000,
    type: 'debit',
    balance: 10_000_000,
    reference: 'REF-003',
    channel: 'BillsPay',
  },
  {
    id: 'txn-4',
    date: '2026-03-07T09:00:00Z',
    description: 'Fund Transfer — Maria Cruz',
    amount: 100_000,
    type: 'debit',
    balance: 10_350_000,
    reference: 'REF-004',
    channel: 'InstaPay',
  },
  {
    id: 'txn-5',
    date: '2026-03-06T16:45:00Z',
    description: 'GCash Top-up',
    amount: 50_000,
    type: 'debit',
    balance: 10_450_000,
    reference: 'REF-005',
    channel: 'eWallet',
  },
];

const mockBeneficiaries = [
  {
    id: 'ben-1',
    fullName: 'Maria Dela Cruz',
    accountNumber: '1111222233',
    bankName: 'EastWest Bank',
    mobileNumber: '+639171234567',
    relationship: 'family',
  },
  {
    id: 'ben-2',
    fullName: 'Carlos Reyes',
    accountNumber: '4444555566',
    bankName: 'BDO Unibank',
    mobileNumber: '+639189876543',
    relationship: 'business',
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // Auth
  http.post('/api/auth/login', async () => {
    return HttpResponse.json({
      mfaRequired: false as const,
      user: mockUser,
      accessToken: 'mock-jwt-token-123',
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      user: mockUser,
      accessToken: 'new-token-123',
    });
  }),

  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUser);
  }),

  // Accounts
  http.get('/api/accounts', () => {
    return HttpResponse.json(mockAccounts);
  }),

  http.get('/api/accounts/:id', ({ params }) => {
    const account = mockAccounts.find((a) => a.id === params.id) ?? {
      ...mockAccounts[0],
      id: params.id,
    };
    return HttpResponse.json(account);
  }),

  http.get('/api/accounts/:id/transactions', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');

    return HttpResponse.json({
      data: mockTransactions,
      meta: { page, pageSize: 20, totalPages: 5, totalItems: 98 },
    });
  }),

  // Transfers
  http.post('/api/transfers', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'txn-001',
      status: 'completed',
      referenceNumber: 'EWB-2026-0001',
      timestamp: new Date().toISOString(),
      ...body,
    });
  }),

  // Beneficiaries
  http.get('/api/beneficiaries', () => {
    return HttpResponse.json(mockBeneficiaries);
  }),

  http.post('/api/beneficiaries', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'ben-new',
      ...body,
    });
  }),

  // Bills / Payments
  http.get('/api/billers', () => {
    return HttpResponse.json([
      {
        id: 'biller-1', name: 'Meralco', category: 'utilities',
        logoUrl: '/img/billers/meralco.png',
        fields: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', required: true, placeholder: 'e.g. 1234-5678-9012' },
        ],
      },
      {
        id: 'biller-2', name: 'Manila Water', category: 'utilities',
        logoUrl: '/img/billers/manila-water.png',
        fields: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', required: true, placeholder: 'e.g. 1234567890' },
        ],
      },
      {
        id: 'biller-3', name: 'PLDT Home', category: 'telecommunications',
        logoUrl: '/img/billers/pldt.png',
        fields: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', required: true, placeholder: 'e.g. 02-1234-5678' },
        ],
      },
      {
        id: 'biller-4', name: 'Globe Telecom', category: 'telecommunications',
        logoUrl: '/img/billers/globe.png',
        fields: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', required: true, placeholder: 'e.g. 0917-123-4567' },
        ],
      },
      {
        id: 'biller-5', name: 'SSS', category: 'government',
        logoUrl: '/img/billers/sss.png',
        fields: [
          { name: 'sssNumber', label: 'SSS Number', type: 'text', required: true, placeholder: 'e.g. 01-2345678-9' },
        ],
      },
      {
        id: 'biller-6', name: 'PhilHealth', category: 'government',
        logoUrl: '/img/billers/philhealth.png',
        fields: [
          { name: 'philhealthId', label: 'PhilHealth ID', type: 'text', required: true, placeholder: 'e.g. 12-345678901-2' },
        ],
      },
    ]);
  }),

  http.post('/api/payments', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const amount = typeof body.amount === 'number' ? body.amount : 0;
    const fee = 1_500; // ₱15 processing fee in centavos
    return HttpResponse.json({
      id: 'pay-001',
      reference: 'EWB-PAY-2026-0001',
      billerId: body.billerId ?? '',
      billerName: 'Manila Water',
      accountId: body.accountId ?? '',
      amount,
      fee,
      total: amount + fee,
      status: 'completed',
      paidAt: new Date().toISOString(),
    });
  }),

  // WebAuthn / Passkeys
  http.get('/api/webauthn/credentials', () => {
    return HttpResponse.json([
      {
        id: 'pk-1',
        name: 'MacBook Pro Touch ID',
        createdAt: '2026-02-15T10:00:00Z',
        lastUsedAt: '2026-03-10T08:30:00Z',
        deviceType: 'platform',
      },
    ]);
  }),

  http.post('/api/webauthn/credentials', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'pk-new',
      name: body.name ?? 'New Device',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      deviceType: 'platform',
    });
  }),

  http.delete('/api/webauthn/credentials/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // User Consents (BSP 1122)
  http.get('/api/user/consents', () => {
    return HttpResponse.json([
      { id: 'c-1', userId: '1', purpose: 'essential', granted: true, grantedAt: '2026-01-01T00:00:00Z', revokedAt: null, version: '1.0', ipAddress: '192.168.1.1' },
      { id: 'c-2', userId: '1', purpose: 'analytics', granted: true, grantedAt: '2026-01-01T00:00:00Z', revokedAt: null, version: '1.0', ipAddress: '192.168.1.1' },
      { id: 'c-3', userId: '1', purpose: 'marketing', granted: false, grantedAt: null, revokedAt: null, version: '1.0', ipAddress: '192.168.1.1' },
      { id: 'c-4', userId: '1', purpose: 'biometric', granted: false, grantedAt: null, revokedAt: null, version: '1.0', ipAddress: '192.168.1.1' },
    ]);
  }),

  http.post('/api/user/consents', async () => {
    return HttpResponse.json({ success: true });
  }),

  // Data Access Requests (BSP privacy)
  http.post('/api/user/data-requests', async () => {
    return HttpResponse.json({
      id: 'dar-001',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    });
  }),

  // Products / Rates (for public-site cross-references)
  http.get('/api/products', () => {
    return HttpResponse.json([
      {
        id: 'prod-1',
        name: 'EWB Savings Account',
        type: 'deposit',
        interestRate: 1.25,
        minBalance: 500_000, // centavos — ₱5,000.00
        description: 'Earn competitive interest on your savings.',
      },
      {
        id: 'prod-2',
        name: 'EWB Time Deposit',
        type: 'deposit',
        interestRate: 4.5,
        minBalance: 10_000_000, // centavos — ₱100,000.00
        description: 'Lock in higher rates with a time deposit.',
      },
    ]);
  }),

  http.get('/api/rates', () => {
    return HttpResponse.json({
      forex: [
        { currency: 'USD', buy: 55.75, sell: 56.25 },
        { currency: 'EUR', buy: 60.5, sell: 61.0 },
        { currency: 'JPY', buy: 0.38, sell: 0.4 },
        { currency: 'CNY', buy: 7.65, sell: 7.85 },
      ],
      updatedAt: new Date().toISOString(),
    });
  }),
];
