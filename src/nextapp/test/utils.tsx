import React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { ThemeProvider } from '@chakra-ui/react';
import { PortalManager } from '@chakra-ui/portal';
import wrapper from './wrapper';
import ConsumersPage from '@/pages/manager/consumers';
import { toast } from '@chakra-ui/react';

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

export const renderWithPortal = (ui: React.ReactElement) =>
  render(<PortalManager>{ui}</PortalManager>, { wrapper });

export const toastManager = async () => {
  toast.closeAll();
  const toasts = screen.queryAllByRole('listitem');
  await Promise.all(toasts.map((toasts) => waitForElementToBeRemoved(toasts)));
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
