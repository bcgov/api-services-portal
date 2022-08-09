import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/shared/services/auth/auth-context';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default wrapper;
