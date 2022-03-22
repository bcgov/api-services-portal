jest.mock('@/shared/config');
import * as React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import AccessRequestDialog from '../access-request-dialog';
import { harleyAccessRequest } from '../../../../mocks/resolvers/consumers';
import { keystone } from '../../../../mocks/handlers';
import { server } from '../../../../mocks/server';
import { renderWithPortal, toastManager } from '../../../test/utils';

describe('access-request/access-request-dialog', () => {
  beforeEach(toastManager);

  it('render correctly', () => {
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
        title="Easy Mart Store 123"
      />
    );
    expect(screen.getByTestId('ar-modal-header')).toHaveTextContent(
      'Easy Mart Store 123Request DetailsControlsAuthorization'
    );
  });

  // NOTE: #toBeVisible doesn't seem to work in modals
  it('should change tabs', () => {
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
        title="Easy Mart Store 123"
      />
    );
    expect(screen.getByTestId('ar-request-details-tab')).not.toHaveAttribute(
      'hidden'
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Controls' }));
    expect(screen.getByTestId('ar-controls-tab')).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getByRole('tab', { name: 'Authorization' }));
    expect(screen.getByTestId('ar-authorization-tab')).not.toHaveAttribute(
      'hidden'
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Request Details' }));
    expect(screen.getByTestId('ar-request-details-tab')).not.toHaveAttribute(
      'hidden'
    );
  });

  it('should reset tabs after a rejection', async () => {
    jest.setTimeout(15000);
    const spy = jest.fn();
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={spy}
        queryKey="accessRequest"
        title="Easy Mart Store 123"
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Authorization' }));
    expect(screen.getByTestId('ar-authorization-tab')).not.toHaveAttribute(
      'hidden'
    );
    fireEvent.click(screen.getByTestId('ar-reject-btn'));
    expect(spy).toHaveBeenCalled();
    expect(screen.getByTestId('ar-request-details-tab')).not.toHaveAttribute(
      'hidden'
    );
    expect(screen.getByTestId('ar-authorization-tab')).toHaveAttribute(
      'hidden'
    );
    await waitFor(() => {
      expect(screen.getByText('Access Request Rejected')).toBeInTheDocument();
    });
  });

  it('should alert a failed rejection', async () => {
    server.use(
      keystone.mutation('RejectAccessRequest', (_, res, ctx) => {
        return res.once(
          ctx.data({
            errors: [{ message: 'Permission Denied' }],
          })
        );
      })
    );
    jest.setTimeout(15000);
    const spy = jest.fn();
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={spy}
        queryKey="accessRequest"
        title="Easy Mart Store 123"
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Authorization' }));
    fireEvent.click(screen.getByTestId('ar-reject-btn'));
    await waitFor(() => {
      expect(screen.getByText('Access Rejection Failed')).toBeInTheDocument();
    });
  });

  // TODO
  //it('should handle access grant action', () => {

  //})
});
