// app/api/rate-alerts/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { serverEnv } from '@/lib/env';

const RateAlertSchema = z.object({
  email: z.string().email(),
  currency: z.string().length(3),
  targetRate: z.number().positive(),
  direction: z.enum(['above', 'below']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const alert = RateAlertSchema.parse(body);

    // Forward to internal API with service key
    const res = await fetch(`${serverEnv.INTERNAL_API_URL}/rate-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serverEnv.AUTH_SERVICE_KEY}`,
      },
      body: JSON.stringify(alert),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to create rate alert' },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Rate alert creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
