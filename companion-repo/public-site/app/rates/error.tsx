// TODO: Exercise 2c — Rates Error | Target: public-site/app/rates/error.tsx
'use client';
export default function RatesError({ error, reset }: { error: Error; reset: () => void }) {
  return <div>Error: {error.message} <button onClick={reset}>Retry</button></div>;
}
