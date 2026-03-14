// src/features/accounts/components/chart-component.tsx

interface ChartComponentProps {
  data: { date: string; amount: number }[];
}

export default function ChartComponent({ data }: ChartComponentProps) {
  return (
    <div className="h-64">
      {/* Integrate with recharts or similar charting library */}
      <p className="text-sm text-gray-500">Chart: {data.length} data points</p>
    </div>
  );
}
