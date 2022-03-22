jest.mock('../../../shared/config', () => ({
  apiHost: 'http://localhost:4000',
  grafanaUrl: 'http://grafana.url',
  apiInternalHost: 'http://localhost:3000',
}));
import * as React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { toast } from '@chakra-ui/react';

import Controls from '../controls';
import wrapper from '../../../test/wrapper';

describe('access-request/controls', () => {
  beforeEach(async () => {
    toast.closeAll();
    const toasts = screen.queryAllByRole('listitem');
    await Promise.all(
      toasts.map((toasts) => waitForElementToBeRemoved(toasts))
    );
  });

  describe('IP Restrictions', () => {
    it('should notify the user if they did not enter an IP address', async () => {
      const spy = jest.fn();
      render(
        <Controls
          onUpdateRateLimits={jest.fn()}
          onUpdateRestrictions={spy}
          rateLimits={[]}
          restrictions={[]}
        />,
        {
          wrapper,
        }
      );
      fireEvent.click(screen.getByTestId('ip-restrictions-card'));
      fireEvent.click(screen.getByTestId('ip-restriction-submit-btn'));
      await waitFor(() => {
        expect(
          screen.queryByText('Missing allowed IP address entries')
        ).toBeInTheDocument();
      });
      expect(spy).not.toBeCalled();
    });

    it('should submit a service ip restricition', async () => {
      const spy = jest.fn();
      const result1 = {
        name: 'ip-restriction',
        config: {
          allow: [JSON.stringify(['1.1.1.1'])],
        },
        tags: ['consumer'],
        service: {
          id: '1231',
        },
      };
      const result2 = {
        name: 'ip-restriction',
        config: {
          allow: [JSON.stringify(['2.2.2.2', '3.3.3.3'])],
        },
        tags: ['consumer'],
        service: {
          id: '3123',
        },
      };
      const { rerender } = render(
        <Controls
          onUpdateRateLimits={jest.fn()}
          onUpdateRestrictions={spy}
          rateLimits={[]}
          restrictions={[]}
        />,
        {
          wrapper,
        }
      );
      await waitFor(() => screen.findByTestId('ip-restrictions-card'));
      await waitFor(() =>
        expect(
          screen.getByTestId('ip-restriction-service-dropdown')
        ).not.toBeDisabled()
      );
      fireEvent.click(screen.getByTestId('ip-restrictions-card'));
      fireEvent.change(screen.getByTestId('allow-ip-restriction-input-input'), {
        target: { value: '1.1.1.1' },
      });
      expect(
        screen.getByTestId('ip-restriction-service-dropdown')
      ).toHaveAttribute('name', 'service');
      fireEvent.blur(screen.getByTestId('allow-ip-restriction-input-input'));
      fireEvent.click(screen.getByTestId('ip-restriction-submit-btn'));
      rerender(
        <Controls
          onUpdateRateLimits={jest.fn()}
          onUpdateRestrictions={spy}
          rateLimits={[]}
          restrictions={[result1]}
        />
      );
      expect(screen.getByTestId('ip-restriction-results')).toHaveTextContent(
        'service-aps-portal-dev-api'
      );
      expect(spy).toHaveBeenCalledWith(result1);
      expect(
        screen.getByTestId('allow-ip-restriction-input-input')
      ).toHaveValue('');
      // Add another result so we can test the select reset
      fireEvent.change(screen.getByTestId('ip-restriction-service-dropdown'), {
        target: { value: '3123' },
      });
      fireEvent.change(screen.getByTestId('allow-ip-restriction-input-input'), {
        target: { value: '2.2.2.2' },
      });
      fireEvent.blur(screen.getByTestId('allow-ip-restriction-input-input'));
      fireEvent.change(screen.getByTestId('allow-ip-restriction-input-input'), {
        target: { value: '3.3.3.3' },
      });
      fireEvent.blur(screen.getByTestId('allow-ip-restriction-input-input'));
      fireEvent.click(screen.getByTestId('ip-restriction-submit-btn'));
      expect(spy).toHaveBeenCalledWith(result2);
      rerender(
        <Controls
          onUpdateRateLimits={jest.fn()}
          onUpdateRestrictions={spy}
          rateLimits={[]}
          restrictions={[result1, result2]}
        />
      );
      expect(screen.getByTestId('ip-restriction-service-dropdown')).toHaveValue(
        '1231'
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should set a rate limit', async () => {
      const result1 = {
        name: 'rate-limiting',
        protocols: ['http', 'https'],
        config: {
          second: '20',
          minute: '20',
          hour: '2',
          day: '1',
          policy: 'redis',
          service: '1231',
        },
        service: {
          id: '1231',
        },
        tags: [],
      };
      const result2 = {
        name: 'rate-limiting',
        protocols: ['http', 'https'],
        config: {
          second: '30',
          minute: '10',
          hour: '6',
          day: '14',
          policy: 'local',
          route: '12',
        },
        route: {
          id: '12',
        },
        tags: [],
      };
      const spy = jest.fn();
      const { rerender } = render(
        <Controls
          onUpdateRateLimits={spy}
          onUpdateRestrictions={jest.fn()}
          rateLimits={[]}
          restrictions={[]}
        />,
        {
          wrapper,
        }
      );
      fireEvent.click(screen.getByTestId('ratelimit-card'));
      await waitFor(() => screen.findByTestId('ratelimit-card'));
      await waitFor(() => {
        expect(
          screen.getByTestId('ratelimit-service-dropdown')
        ).not.toBeDisabled();
      });
      fireEvent.change(screen.getByTestId('ratelimit-second-input'), {
        target: { value: '20' },
      });
      fireEvent.change(screen.getByTestId('ratelimit-minute-input'), {
        target: { value: '20' },
      });
      fireEvent.change(screen.getByTestId('ratelimit-hour-input'), {
        target: { value: '2' },
      });
      fireEvent.change(screen.getByTestId('ratelimit-day-input'), {
        target: { value: '1' },
      });
      fireEvent.change(screen.getByTestId('ratelimit-policy-dropdown'), {
        target: { value: 'redis' },
      });
      fireEvent.click(screen.getByTestId('ratelimit-submit-btn'));
      rerender(
        <Controls
          onUpdateRateLimits={spy}
          onUpdateRestrictions={jest.fn()}
          rateLimits={[result1]}
          restrictions={[]}
        />
      );
      expect(spy).toHaveBeenCalledWith(result1);
      await waitFor(() => {
        expect(screen.getByTestId('ratelimit-results')).toHaveTextContent(
          'service-aps-portal-dev-api'
        );
      });
      expect(screen.getByTestId('ratelimit-second-input')).toHaveValue(null);
      expect(screen.getByTestId('ratelimit-minute-input')).toHaveValue(null);
      expect(screen.getByTestId('ratelimit-hour-input')).toHaveValue(null);
      expect(screen.getByTestId('ratelimit-day-input')).toHaveValue(null);
      expect(screen.getByTestId('ratelimit-policy-dropdown')).toHaveValue(
        'local'
      );
      // Form has been reset, add another
      fireEvent.click(screen.getByTestId('ratelimit-route-radio'));
      expect(screen.getByTestId('ratelimit-service-dropdown')).toHaveValue(
        '12'
      );
      fireEvent.change(screen.getByTestId('ratelimit-second-input'), {
        target: { value: '30' },
      });
      fireEvent.change(screen.getByTestId('ratelimit-minute-input'), {
        target: { value: '10' },
      });
      fireEvent.change(screen.getByTestId('ratelimit-hour-input'), {
        target: { value: '6' },
      });
      fireEvent.change(screen.getByTestId('ratelimit-day-input'), {
        target: { value: '14' },
      });
      fireEvent.click(screen.getByTestId('ratelimit-submit-btn'));
      rerender(
        <Controls
          onUpdateRateLimits={spy}
          onUpdateRestrictions={jest.fn()}
          rateLimits={[result1, result2]}
          restrictions={[]}
        />
      );
      expect(spy).toHaveBeenLastCalledWith(result2);
      await waitFor(() => {
        expect(screen.getByTestId('ratelimit-results')).toHaveTextContent(
          'service-aps-portal-dev-apiroute-aps-portal-dev-api'
        );
      });
    });
  });
});
