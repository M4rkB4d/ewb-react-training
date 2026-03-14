// app/rates/page.tsx
import { z } from 'zod';
import { clientEnv } from '@/lib/env';

const RateSchema = z.object({
  currency: z.string(),
  currencyName: z.string(),
  buyRate: z.number(),
  sellRate: z.number(),
  updatedAt: z.string().datetime(),
});

const RateListSchema = z.array(RateSchema);

async function getRates() {
  try {
    const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/rates/forex`, {
      next: { revalidate: 60 }, // Refresh every 60 seconds
    });

    if (!res.ok) {
      console.error(`Failed to fetch rates: ${res.status}`);
      return [];
    }

    return RateListSchema.parse(await res.json());
  } catch (error) {
    console.error('Rates API unavailable:', error);
    return [];
  }
}

export const metadata = {
  title: 'Exchange Rates | EastWest Bank',
  description: 'Current foreign exchange rates for USD, EUR, JPY, and more.',
};

export default async function RatesPage() {
  const rates = await getRates();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Exchange Rates</h1>
      <p className="mt-2 text-sm text-gray-500">
        Rates are indicative and updated every minute. Last update:{' '}
        {new Date(rates[0]?.updatedAt ?? '').toLocaleString('en-PH', {
          timeZone: 'Asia/Manila',
        })}
      </p>

      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
            <th className="pb-3 font-medium">Currency</th>
            <th className="pb-3 font-medium">Buy (₱)</th>
            <th className="pb-3 font-medium">Sell (₱)</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => (
            <tr key={rate.currency} className="border-b border-gray-100">
              <td className="py-3">
                <span className="font-medium text-gray-900">{rate.currency}</span>
                <span className="ml-2 text-sm text-gray-500">{rate.currencyName}</span>
              </td>
              <td className="py-3 text-gray-900">₱{rate.buyRate.toFixed(4)}</td>
              <td className="py-3 text-gray-900">₱{rate.sellRate.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
