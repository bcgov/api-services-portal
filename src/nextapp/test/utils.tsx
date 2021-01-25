import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@chakra-ui/react';

import theme from '../shared/theme';

const Wrapper = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: Wrapper, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
