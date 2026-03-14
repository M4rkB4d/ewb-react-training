// src/components/rates-summary.tsx
import Link from 'next/link';
import { z } from 'zod';
import { clientEnv } from '@/lib/env';

const RateSchema = z.object({
  currency: z.string(),
  currencyName: z.string(),
  buyRate: z.number(),
  sellRate: z.number(),
  updatedAt: z.string(),
});

async function getTopRates() {
  try {
    const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/rates/forex`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return z.array(RateSchema).parse(data).slice(0, 4);
  } catch {
    return [];
  }
}

export async function RatesSummary() {
  const rates = await getTopRates();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-xl bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Exchange Rates</h2>
          <Link
            href="/rates"
            className="text-sm font-medium text-ewb-purple hover:underline"
          >
            View All Rates →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {rates.map((rate) => (
            <div key={rate.currency} className="text-center">
              <p className="text-sm font-medium text-gray-500">{rate.currency}</p>
              <p className="text-lg font-bold text-gray-900">
                ₱{rate.buyRate.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
