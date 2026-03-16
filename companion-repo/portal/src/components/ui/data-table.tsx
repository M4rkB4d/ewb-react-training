// src/components/ui/data-table.tsx
// Level 3 Exercise 2 — Accessible Data Table

interface Column {
  key: string;
  header: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, string | number>[];
  caption?: string;
}

export function DataTable({ columns, data, caption }: DataTableProps) {
  return (
    <table role="table" className="w-full border-collapse text-sm">
      {caption && (
        <caption className="mb-2 text-left text-base font-semibold">{caption}</caption>
      )}
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              scope="col"
              className="border-b px-4 py-2 text-left font-medium text-gray-600"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.key} className="border-b px-4 py-2">
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
