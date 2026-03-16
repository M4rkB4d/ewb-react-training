// src/components/layout/breadcrumbs.tsx
import { Link, useMatches } from 'react-router';

interface BreadcrumbHandle {
  breadcrumb: string | ((params: Record<string, string>) => string);
}

function hasBreadcrumb(handle: unknown): handle is BreadcrumbHandle {
  return handle != null && typeof handle === 'object' && 'breadcrumb' in handle;
}

export function Breadcrumbs() {
  const matches = useMatches();
  const crumbs = matches
    .filter((match) => hasBreadcrumb(match.handle))
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle;
      const label =
        typeof handle.breadcrumb === 'function'
          ? handle.breadcrumb(match.params as Record<string, string>)
          : handle.breadcrumb;
      return { path: match.pathname, label };
    });

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-gray-500">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="hover:text-ewb-purple">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
