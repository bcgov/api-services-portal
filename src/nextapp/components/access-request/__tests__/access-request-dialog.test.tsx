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
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={jest.fn()}
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

  it('should handle access grant action', async () => {
    server.use(
      keystone.mutation('FulfillRequest', (req, res, ctx) => {
        const { id, controls } = req.variables;
        expect(controls).toEqual(
          JSON.stringify({
            plugins: [],
            defaultClientScopes: [],
            roles: [],
          })
        );
        return res.once(
          ctx.data({
            id,
          })
        );
      })
    );
    jest.setTimeout(15000);
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
        title="Easy Mart Store 123"
      />
    );
    fireEvent.click(screen.getByTestId('ar-approve-btn'));
    await waitFor(() => {
      expect(screen.getByText('Access Request Approved')).toBeInTheDocument();
    });
  });

  it('should handle a complex access grant action', async () => {
    server.use(
      keystone.mutation('FulfillRequest', (req, res, ctx) => {
        const { id, controls } = req.variables;
        expect(controls).toEqual(
          JSON.stringify({
            plugins: [
              {
                name: 'ip-restriction',
                config: { allow: ['["1.1.1.1"]'] },
                tags: ['consumer'],
                service: {},
              },
            ],
            defaultClientScopes: ['System/Patient'],
            roles: ['b.role'],
          })
        );
        return res.once(
          ctx.data({
            id,
          })
        );
      })
    );
    jest.setTimeout(15000);
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
        title="Easy Mart Store 123"
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Controls' }));

    // Set a control
    fireEvent.click(screen.getByTestId('ip-restrictions-card'));
    fireEvent.change(screen.getByTestId('allow-ip-restriction-input-input'), {
      target: { value: '1.1.1.1' },
    });
    expect(
      screen.getByTestId('ip-restriction-service-dropdown')
    ).toHaveAttribute('name', 'service');
    fireEvent.blur(screen.getByTestId('allow-ip-restriction-input-input'));
    fireEvent.click(screen.getByTestId('ip-restriction-submit-btn'));

    // Set 2 permissions
    fireEvent.click(screen.getByRole('tab', { name: 'Authorization' }));
    await screen.findAllByRole('checkbox');
    fireEvent.click(screen.getByRole('checkbox', { name: 'System/Patient' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'b.role' }));

    // Submit
    fireEvent.click(screen.getByTestId('ar-approve-btn'));
    await waitFor(() => {
      expect(screen.getByText('Access Request Approved')).toBeInTheDocument();
    });
  });

  it('should handle access grant failure', async () => {
    server.use(
      keystone.mutation('FulfillRequest', (_, res, ctx) => {
        return res.once(
          ctx.data({
            errors: [{ message: 'Permission Denied' }],
          })
        );
      })
    );
    jest.setTimeout(15000);
    renderWithPortal(
      <AccessRequestDialog
        isOpen
        data={harleyAccessRequest}
        onClose={jest.fn()}
        queryKey="accessRequest"
        title="Easy Mart Store 123"
      />
    );
    fireEvent.click(screen.getByTestId('ar-approve-btn'));
    await waitFor(() => {
      expect(screen.getByText('Access Rejection Failed')).toBeInTheDocument();
    });
  });
});
