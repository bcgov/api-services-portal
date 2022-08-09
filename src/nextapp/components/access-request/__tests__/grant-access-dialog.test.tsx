jest.mock('@/shared/config');
import * as React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import GrantAccessDialog from '../grant-access-dialog';
import { harleyAccessRequest } from '../../../../mocks/resolvers/consumers';
import { keystone } from '../../../../mocks/handlers';
import { server } from '../../../../mocks/server';
import { renderWithPortal, toastManager } from '../../../test/utils';

describe('access-request/access-request-dialog', () => {
  beforeEach(toastManager);

  it('switches tabs', () => {
    renderWithPortal(
      <GrantAccessDialog
        isOpen
        consumer={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
      />
    );
    expect(screen.getByTestId('ar-controls-tab')).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getByRole('tab', { name: 'Authorization' }));
    expect(screen.getByTestId('ar-controls-tab')).toHaveAttribute('hidden');
    expect(screen.getByTestId('ar-authorization-tab')).not.toHaveAttribute(
      'hidden'
    );
  });

  it('resets on close', () => {
    const spy = jest.fn();
    const { rerender } = renderWithPortal(
      <GrantAccessDialog
        isOpen
        consumer={harleyAccessRequest}
        onClose={spy}
        queryKey="accessRequest"
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Authorization' }));
    fireEvent.click(screen.getByTestId('ar-cancel-btn'));
    expect(spy).toHaveBeenCalled();
    rerender(
      <GrantAccessDialog
        isOpen={false}
        consumer={harleyAccessRequest}
        onClose={spy}
        queryKey="accessRequest"
      />
    );
    rerender(
      <GrantAccessDialog
        isOpen
        consumer={harleyAccessRequest}
        onClose={spy}
        queryKey="accessRequest"
      />
    );
    expect(screen.getByTestId('ar-controls-tab')).not.toHaveAttribute('hidden');
    expect(screen.getByTestId('ar-authorization-tab')).toHaveAttribute(
      'hidden'
    );
  });

  it('loads products and environments', async () => {
    jest.setTimeout(100000);
    renderWithPortal(
      <GrantAccessDialog
        isOpen
        consumer={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
      />
    );
    const environmentSelect = screen.getByTestId('ar-environment-select');
    expect(environmentSelect).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByTestId('ar-product-select')).not.toBeDisabled();
    });
    fireEvent.change(screen.getByTestId('ar-product-select'), {
      target: {
        value: 'p1',
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('ar-environment-select')).not.toBeDisabled();
    });
    fireEvent.change(environmentSelect, {
      target: {
        value: 'e1',
      },
    });
  });

  it('should throw an error if no prod/environment are selected', async () => {
    jest.setTimeout(10000);
    renderWithPortal(
      <GrantAccessDialog
        isOpen
        consumer={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
      />
    );
    fireEvent.click(screen.getByTestId('ar-grant-btn'));
    await waitFor(() => {
      expect(screen.getByText('Access grant failed')).toBeInTheDocument();
      expect(
        screen.getByText('Missing values product and/or environment')
      ).toBeInTheDocument();
    });
  });
});
