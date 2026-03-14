// app/rates/loading.tsx
export default function RatesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />

      <div className="mt-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
