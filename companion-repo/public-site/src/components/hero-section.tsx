// src/components/hero-section.tsx
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-ewb-purple to-ewb-navy px-4 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold md:text-5xl">
          Banking Made Easy
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">
          Open a savings account, apply for a loan, or explore our investment
          products — all from the comfort of your home.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-ewb-gold px-6 py-3 font-semibold text-gray-900 hover:bg-ewb-gold/90"
          >
            Explore Products
          </Link>
          <Link
            href="/apply"
            className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </section>
  );
}
