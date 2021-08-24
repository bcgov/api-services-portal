import * as React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../nextapp/shared/theme';

import '@bcgov/bc-sans/css/BCSans.css';

export const decorators = [
  (Story) => (
    <ChakraProvider theme={theme}>
      <div dir="ltr" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Story />
      </div>
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
