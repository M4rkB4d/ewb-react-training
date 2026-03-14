// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/accounts', () => {
    return HttpResponse.json([
      {
        id: 'acc-1',
        name: 'Personal Savings',
        number: '1234567890',
        type: 'savings',
        balance: 15_000_000, // centavos — ₱150,000.00
        currency: 'PHP',
        isActive: true,
      },
    ]);
  }),

  http.get('/api/accounts/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Personal Savings',
      number: '1234567890',
      type: 'savings',
      balance: 15_000_000, // centavos — ₱150,000.00
      currency: 'PHP',
      isActive: true,
    });
  }),

  http.get('/api/accounts/:id/transactions', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');

    return HttpResponse.json({
      data: [
        {
          id: 'txn-1',
          date: '2026-03-10T08:30:00Z',
          description: 'POS Purchase — SM Megamall',
          amount: -250_000, // centavos — ₱2,500.00
          type: 'debit',
          balance: 14_750_000, // centavos — ₱147,500.00
          reference: 'REF-001',
          channel: 'POS',
        },
      ],
      meta: { page, pageSize: 20, totalPages: 5, totalItems: 98 },
    });
  }),

  http.post('/api/transfers', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'txn-001',
      status: 'completed',
      referenceNumber: 'EWB-2026-0001',
      timestamp: new Date().toISOString(),
      ...body,
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      user: { id: '1', name: 'Juan Santos', email: 'juan@ewb.com', role: 'customer' },
      accessToken: 'new-token-123',
    });
  }),
];
