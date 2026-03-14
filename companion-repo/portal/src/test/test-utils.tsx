// src/test/test-utils.tsx
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface RenderOptions {
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
