// src/features/accounts/components/transaction-chart.tsx
import { lazy, Suspense } from 'react';

const Chart = lazy(() => import('./chart-component'));

interface ChartData {
  date: string;
  amount: number;
}

export function TransactionChart({ data }: { data: ChartData[] }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100" />}>
      <Chart data={data} />
    </Suspense>
  );
}
