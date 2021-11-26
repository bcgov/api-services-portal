import * as React from 'react';
import { AuthProvider } from '@/shared/services/auth/auth-context';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../nextapp/shared/theme';
import { QueryClient, QueryClientProvider } from 'react-query';

import '@bcgov/bc-sans/css/BCSans.css';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const decorators = [
  (Story) => (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <div
            dir="ltr"
            style={{ minHeight: '100vh', backgroundColor: 'white' }}
          >
            <Story />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  ),
];
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
