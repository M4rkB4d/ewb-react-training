// src/components/layout/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ewb-purple focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to main content
    </a>
  );
}
