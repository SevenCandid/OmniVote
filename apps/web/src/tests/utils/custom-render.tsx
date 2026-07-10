import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../providers/theme-provider';

interface CustomRenderProps {
  route?: string;
}

const customRender = (
  ui: React.ReactElement,
  {
    route = '/',
    ...renderOptions
  }: CustomRenderProps & Omit<RenderOptions, 'wrapper'> = {}
) => {
  // Define clean query client for testing isolation
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider defaultTheme="dark" storageKey="omnivote-theme">
            {children}
          </ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

// Re-export standard react testing library properties
export * from '@testing-library/react';
export { customRender as render };
