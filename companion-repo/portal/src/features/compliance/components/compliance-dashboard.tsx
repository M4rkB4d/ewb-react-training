// src/features/compliance/components/compliance-dashboard.tsx
import { bspControls } from '@/compliance/bsp-controls';

export function ComplianceDashboard() {
  const implemented = bspControls.filter((c) => c.status === 'implemented');
  const inProgress = bspControls.filter((c) => c.status === 'in-progress');
  const planned = bspControls.filter((c) => c.status === 'planned');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">BSP Compliance Status</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded bg-emerald-50 p-4">
          <p className="text-3xl font-bold text-emerald-700">{implemented.length}</p>
          <p className="text-sm text-emerald-600">Implemented</p>
        </div>
        <div className="rounded bg-amber-50 p-4">
          <p className="text-3xl font-bold text-amber-700">{inProgress.length}</p>
          <p className="text-sm text-amber-600">In Progress</p>
        </div>
        <div className="rounded bg-gray-50 p-4">
          <p className="text-3xl font-bold text-gray-700">{planned.length}</p>
          <p className="text-sm text-gray-600">Planned</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Circular</th>
            <th className="p-2">Requirement</th>
            <th className="p-2">Control</th>
            <th className="p-2">Status</th>
            <th className="p-2">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {bspControls.map((control) => (
            <tr key={`${control.circularNumber}-${control.requirement}`} className="border-b">
              <td className="p-2 font-mono">{control.circularNumber}</td>
              <td className="p-2">{control.requirement}</td>
              <td className="p-2">{control.controlDescription}</td>
              <td className="p-2">
                <span className={`inline-block rounded px-2 py-0.5 text-xs ${
                  control.status === 'implemented'
                    ? 'bg-emerald-100 text-emerald-700'
                    : control.status === 'in-progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {control.status}
                </span>
              </td>
              <td className="p-2 text-xs text-gray-500">{control.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
