// app/page.tsx (homepage)
import { Suspense } from 'react';
import { HeroSection } from '@/components/hero-section';
import { ProductHighlights } from '@/components/product-highlights';
import { RatesSummary } from '@/components/rates-summary';
import { LoanCalculator } from '@/components/loan-calculator';

export default function HomePage() {
  return (
    <main>
      {/* Static — renders immediately */}
      <HeroSection />

      {/* Server Component — fetches products (ISR 1hr) */}
      <Suspense fallback={<ProductHighlightsSkeleton />}>
        <ProductHighlights />
      </Suspense>

      {/* Server Component — fetches rates (ISR 60s) */}
      <Suspense fallback={<RatesSummarySkeleton />}>
        <RatesSummary />
      </Suspense>

      {/* Client Component — no server fetch needed */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <LoanCalculator />
      </section>
    </main>
  );
}

function ProductHighlightsSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </section>
  );
}

function RatesSummarySkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
    </section>
  );
}
