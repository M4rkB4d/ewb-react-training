// app/api/rates/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSecret } from '@/lib/keyvault';

const RateSchema = z.object({
  currency: z.string(),
  currencyName: z.string(),
  buyRate: z.number(),
  sellRate: z.number(),
  updatedAt: z.string(),
});

export async function GET() {
  try {
    const apiKey = await getSecret('forex-provider-api-key');

    const res = await fetch('https://api.forexprovider.com/v2/rates/PHP', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Upstream rate service unavailable' },
        { status: 502 },
      );
    }

    const data = await res.json();
    const rates = z.array(RateSchema).parse(data.rates);

    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
