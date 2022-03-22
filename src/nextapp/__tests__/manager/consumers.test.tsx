jest.mock('@/shared/config');
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import ConsumersPage from '@/pages/manager/consumers';
import { toast } from '@chakra-ui/react';

import { keystone } from '../../../mocks/handlers';
import { server } from '../../../mocks/server';
import wrapper from '../../test/wrapper';
import { renderWithPortal } from '../../test/utils';

describe('managers/consumers', () => {
  beforeEach(async () => {
    toast.closeAll();
    const toasts = screen.queryAllByRole('listitem');
    await Promise.all(
      toasts.map((toasts) => waitForElementToBeRemoved(toasts))
    );
  });

  describe('table behaviors', () => {
    it('should render with no consumers', () => {
      render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
      expect(screen.getByText('0 Consumers')).toBeInTheDocument();
    });

    it('should render an empty message', async () => {
      server.use(
        keystone.query('GetConsumers', (req, res, ctx) => {
          return res.once(
            ctx.data({
              allServiceAccessesByNamespace: [],
              allAccessRequestsByNamespace: [],
            })
          );
        })
      );
      render(<ConsumersPage queryKey="allConsumersNone" />, { wrapper });
      await waitFor(() => screen.getByText('Create your first consumer'));

      expect(
        screen.getByText('Create your first consumer')
      ).toBeInTheDocument();
    });

    it('should load consumer data and render it as a table', async () => {
      render(<ConsumersPage queryKey="allConsumers" />, { wrapper });
      expect(screen.getByText('0 Consumers')).toBeInTheDocument();
      await waitFor(() => screen.getByText('3 Consumers'));
      expect(screen.getByText('3 Consumers')).toBeInTheDocument();
      expect(
        screen.getByText('sa-moh-proto-ca853245-9d9af1b3c417')
      ).toBeInTheDocument();
    });

    it('should search for consumers by name', async () => {
      render(<ConsumersPage queryKey="allConsumers" />, { wrapper });
      await waitFor(() => screen.getByText('3 Consumers'));
      fireEvent.change(screen.getByTestId('consumer-search-input'), {
        target: {
          value: 'sa-',
        },
      });
      expect(screen.getByText('1 Consumer')).toBeInTheDocument();
      expect(
        screen.getByText('sa-moh-proto-ca853245-9d9af1b3c417')
      ).toBeInTheDocument();
      expect(screen.queryByText('Test Consumer for Shoppers')).toBeFalsy();
    });

    it('should search for consumers by id', async () => {
      render(<ConsumersPage queryKey="allConsumers" />, { wrapper });
      await waitFor(() => screen.getByText('3 Consumers'));
      // Should still have 2 results
      fireEvent.change(screen.getByTestId('consumer-search-input'), {
        target: {
          value: '9',
        },
      });
      expect(screen.getByText('2 Consumers')).toBeInTheDocument();
      fireEvent.change(screen.getByTestId('consumer-search-input'), {
        target: {
          value: '94901',
        },
      });
      expect(screen.getByText('1 Consumer')).toBeInTheDocument();
      expect(
        screen.getByText('Test Consumer for Shoppers')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('sa-moh-proto-ca853245-9d9af1b3c417')
      ).toBeFalsy();
    });

    it('should search for consumers by tag', async () => {
      render(<ConsumersPage queryKey="allConsumers" />, { wrapper });
      await waitFor(() => screen.getByText('3 Consumers'));
      fireEvent.change(screen.getByTestId('consumer-search-input'), {
        target: {
          value: '555-55',
        },
      });
      expect(screen.getByText('1 Consumer')).toBeInTheDocument();
      expect(
        screen.getByText('sa-moh-proto-ca853245-9d9af1b3c417')
      ).toBeInTheDocument();
      expect(screen.queryByText('Test Consumer for Shoppers')).toBeFalsy();
    });
  });

  //describe('granting accesss to consumers', () => {
  //  it('should grant access to a consumer', async () => {
  //    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
  //    await waitFor(() => screen.getByText('3 Consumers'));
  //    fireEvent.click(screen.getByTestId('consumer-120912301-menu'));
  //    await waitFor(() => screen.getAllByTestId('consumer-grant-menuitem'));
  //    fireEvent.click(screen.getAllByTestId('consumer-grant-menuitem')[0]);
  //    const alert = await screen.findByText('Consumer access granted');
  //    expect(alert).toBeTruthy();
  //  });

  //  it('should handle failed access grant to a consumer', async () => {
  //    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
  //    await waitFor(() => screen.getByText('3 Consumers'));
  //    fireEvent.click(screen.getByTestId('consumer-d1-menu'));
  //    await waitFor(() => screen.getAllByTestId('consumer-grant-menuitem'));
  //    fireEvent.click(screen.getAllByTestId('consumer-grant-menuitem')[2]);
  //    const alert = await screen.findByText('Consumer access grant failed');
  //    expect(alert).toBeTruthy();
  //  });
  //});

  describe('deleting consumers', () => {
    it('should delete a consumer access', async () => {
      render(<ConsumersPage queryKey="allConsumers" />, { wrapper });
      await waitFor(() => screen.getByText('3 Consumers'));
      fireEvent.click(screen.getByTestId('consumer-120912301-menu'));
      await waitFor(() => screen.getAllByTestId('consumer-delete-menuitem'));
      fireEvent.click(screen.getAllByTestId('consumer-delete-menuitem')[0]);
      await waitForElementToBeRemoved(
        screen.getByText('sa-moh-proto-ca853245-9d9af1b3c417'),
        { timeout: 3000 }
      );
      expect(
        screen.queryByText('sa-moh-proto-ca853245-9d9af1b3c417')
      ).toBeFalsy();
      await waitFor(() => screen.findAllByRole('alert'));
      expect(screen.queryAllByText('Consumer deleted')).toBeTruthy();
    });

    it('should handle delete consumer failure', async () => {
      const title = 'Consumer delete failed';
      render(<ConsumersPage queryKey="allConsumers" />, { wrapper });
      await waitFor(() => screen.getByText('3 Consumers'));
      fireEvent.click(screen.getByTestId('consumer-d1-menu'));
      await waitFor(() => screen.getAllByTestId('consumer-delete-menuitem'));
      fireEvent.click(screen.getAllByTestId('consumer-delete-menuitem')[2]);
      expect(
        screen.getByText('Test Consumer for Pharmasave')
      ).toBeInTheDocument();
      await waitFor(() => screen.findAllByText(title));
      expect(screen.queryAllByText(title)).toBeTruthy();
      expect(screen.queryAllByText('Permission denied')).toBeTruthy();
    });
  });

  describe('access requests', () => {
    // NOTE: there seems to be significan lag updating, so long timers are needed for now hopefully...
    const timeout = 9000;

    it('should reject a request', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(<ConsumersPage queryKey="rejectRequest" />);
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      fireEvent.click(page.getByTestId('ar-reject-btn'));
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('access-request-banner-123')
          ).not.toBeInTheDocument();
        },
        { timeout }
      );
    });

    it('should accept a request without entering controls', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(<ConsumersPage queryKey="acceptRequest" />);
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      fireEvent.click(page.getByTestId('ar-approve-btn'));
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('access-request-banner-123')
          ).not.toBeInTheDocument();
        },
        { timeout }
      );
      expect(screen.getByText('new-consumer')).toBeInTheDocument();
    });

    it('should alert the user if they have not entered ip restrictions', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(<ConsumersPage queryKey="acceptRequest" />);
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      const tabs = page.getByTestId('ar-tabs');
      fireEvent.click(tabs.querySelector('button:nth-child(1)'));
      await waitFor(() => page.findByTestId('ip-restrictions-card'));
      fireEvent.click(page.getByTestId('ip-restrictions-card'));
      fireEvent.click(page.getByTestId('ip-restriction-submit-btn'));
      await waitFor(() => {
        expect(
          screen.getByText('Missing allowed IP address entries')
        ).toBeInTheDocument();
      });
    });

    it('should add a service ip restrictions', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(
        <ConsumersPage queryKey="acceptServiceRequest" />
      );
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      const tabs = page.getByTestId('ar-tabs');
      fireEvent.click(tabs.querySelector('button:nth-child(1)'));
      await waitFor(() => page.findByTestId('ip-restrictions-card'));
      await waitFor(() =>
        expect(
          page.getByTestId('ip-restriction-service-dropdown')
        ).not.toBeDisabled()
      );
      fireEvent.click(page.getByTestId('ip-restrictions-card'));
      fireEvent.change(page.getByTestId('allow-ip-restriction-input-input'), {
        target: { value: '1.1.1.1' },
      });
      expect(
        page.getByTestId('ip-restriction-service-dropdown')
      ).toHaveAttribute('name', 'service');
      fireEvent.blur(page.getByTestId('allow-ip-restriction-input-input'));
      fireEvent.click(page.getByTestId('ip-restriction-submit-btn'));
      await waitFor(() => {
        expect(page.getByTestId('ip-restriction-results')).toHaveTextContent(
          'service-aps-portal-dev-api'
        );
      });
    });

    it('should add a route ip restrictions', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(
        <ConsumersPage queryKey="acceptRouteRequest" />
      );
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      const tabs = page.getByTestId('ar-tabs');
      fireEvent.click(tabs.querySelector('button:nth-child(1)'));
      await waitFor(() => page.findByTestId('ip-restrictions-card'));
      fireEvent.click(page.getByTestId('ip-restrictions-card'));
      fireEvent.click(page.getByTestId('ip-restriction-route-radio'));
      expect(
        page.getByTestId('ip-restriction-service-dropdown')
      ).toHaveAttribute('name', 'route');
      expect(page.getByTestId('ip-restriction-service-dropdown')).toHaveValue(
        '12'
      );
      fireEvent.change(page.getByTestId('allow-ip-restriction-input-input'), {
        target: { value: '1.1.1.1' },
      });
      fireEvent.blur(page.getByTestId('allow-ip-restriction-input-input'));
      fireEvent.click(page.getByTestId('ip-restriction-submit-btn'));
      await waitFor(() => {
        expect(page.getByTestId('ip-restriction-results')).toHaveTextContent(
          'route-aps-portal-dev-api'
        );
      });
    });

    it('should reset ip restrictions', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(
        <ConsumersPage queryKey="acceptRouteRequest" />
      );
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      const tabs = page.getByTestId('ar-tabs');
      fireEvent.click(tabs.querySelector('button:nth-child(1)'));
      await waitFor(() => page.findByTestId('ip-restrictions-card'));
      fireEvent.click(page.getByTestId('ip-restrictions-card'));
      fireEvent.click(page.getByTestId('ip-restriction-route-radio'));
      fireEvent.change(page.getByTestId('ip-restriction-service-dropdown'), {
        target: {
          value: '22',
        },
      });
      fireEvent.change(page.getByTestId('allow-ip-restriction-input-input'), {
        target: { value: '1.1.1.1' },
      });
      fireEvent.blur(page.getByTestId('allow-ip-restriction-input-input'));
      fireEvent.click(page.getByTestId('ip-restriction-clear-btn'));
      expect(page.getByTestId('ip-restriction-service-dropdown')).toHaveValue(
        '12'
      );
      expect(page.getByTestId('allow-ip-restriction-input-input')).toHaveValue(
        '[]'
      );
    });

    it('should add a services rate limit', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(
        <ConsumersPage queryKey="acceptRouteRequest" />
      );
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      const tabs = page.getByTestId('ar-tabs');
      fireEvent.click(tabs.querySelector('button:nth-child(1)'));
      await waitFor(() => page.findByTestId('ratelimit-card'));
      fireEvent.click(page.getByTestId('ratelimit-card'));
      fireEvent.change(page.getByTestId('ratelimit-second-input'), {
        target: { value: '20' },
      });
      fireEvent.change(page.getByTestId('ratelimit-minute-input'), {
        target: { value: '20' },
      });
      fireEvent.change(page.getByTestId('ratelimit-hour-input'), {
        target: { value: '2' },
      });
      fireEvent.change(page.getByTestId('ratelimit-day-input'), {
        target: { value: '1' },
      });
      fireEvent.click(page.getByTestId('ratelimit-submit-btn'));
      await waitFor(() => {
        expect(page.getByTestId('ratelimit-results')).toHaveTextContent(
          'service-aps-portal-dev-api'
        );
      });
    });

    it('should reset the rate limit form', async () => {
      jest.setTimeout(timeout);
      const page = renderWithPortal(
        <ConsumersPage queryKey="acceptRouteRequest" />
      );
      await waitFor(() => screen.findByTestId('access-request-banner-123'));
      fireEvent.click(page.getByTestId('ar-review-btn'));
      const tabs = page.getByTestId('ar-tabs');
      fireEvent.click(tabs.querySelector('button:nth-child(1)'));
      await waitFor(() => page.findByTestId('ratelimit-card'));
      fireEvent.click(page.getByTestId('ratelimit-card'));
      fireEvent.change(page.getByTestId('ratelimit-second-input'), {
        target: { value: '20' },
      });
      fireEvent.change(page.getByTestId('ratelimit-minute-input'), {
        target: { value: '20' },
      });
      fireEvent.change(page.getByTestId('ratelimit-hour-input'), {
        target: { value: '2' },
      });
      fireEvent.change(page.getByTestId('ratelimit-day-input'), {
        target: { value: '1' },
      });
      fireEvent.change(page.getByTestId('ratelimit-policy-dropdown'), {
        target: { value: 'redis' },
      });
      fireEvent.blur(page.getByTestId('allow-ip-restriction-input-input'));
      fireEvent.click(page.getByTestId('ratelimit-clear-btn'));
      expect(page.getByTestId('ratelimit-second-input')).toHaveValue('');
      expect(page.getByTestId('ratelimit-minute-input')).toHaveValue('');
      expect(page.getByTestId('ratelimit-hour-input')).toHaveValue('');
      expect(page.getByTestId('ratelimit-day-input')).toHaveValue('');
      expect(page.getByTestId('ratelimit-policy-dropdown')).toHaveValue(
        'local'
      );
    });
  });
});
