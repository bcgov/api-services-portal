import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@chakra-ui/react';

import theme from '../shared/theme';
import { AuthProvider } from '../shared/services/auth';

const Wrapper = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: Wrapper, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
