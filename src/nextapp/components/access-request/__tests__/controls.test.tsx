jest.mock('../../../shared/config', () => ({
  apiHost: 'http://localhost:4000',
  grafanaUrl: 'http://grafana.url',
  apiInternalHost: 'http://localhost:3000',
}));
jest.mock(
  '../ip-restriction',
  () => ({ getControlName, routeOptions, serviceOptions, state }) => (
    <div>
      <div data-testid="ip-routes">{routeOptions.map((d) => d.name)}</div>
      <div data-testid="ip-services">{serviceOptions.map((d) => d.name)}</div>
      <div data-testid="service-new">
        {getControlName({
          service: {
            connect: {
              id: '1231',
            },
          },
        })}
      </div>
      <div data-testid="route-new">
        {getControlName({
          route: {
            connect: {
              id: '12',
            },
          },
        })}
      </div>
      <div data-testid="service-existing">
        {getControlName({
          service: {
            name: 'existing-service',
          },
        })}
      </div>
      <div data-testid="route-existing">
        {getControlName({
          route: {
            name: 'existing-route',
          },
        })}
      </div>
      <div data-testid="unknown">{getControlName({})}</div>
    </div>
  )
);
jest.mock(
  '../rate-limiting',
  () => ({ getControlName, routeOptions, serviceOptions, state }) => (
    <div>
      <div data-testid="rl-routes">{routeOptions.map((d) => d.name)}</div>
      <div data-testid="rl-services">{serviceOptions.map((d) => d.name)}</div>
    </div>
  )
);
import * as React from 'react';
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import Controls from '../controls';
import wrapper from '../../../test/wrapper';

describe('access-request/controls', () => {
  it('should render controls content', async () => {
    render(
      <Controls rateLimits={[[], jest.fn()]} restrictions={[[], jest.fn()]} />,
      {
        wrapper,
      }
    );
    await waitFor(() =>
      expect(screen.queryByTestId('controls-loading')).not.toBeInTheDocument()
    );
    expect(screen.getByTestId('ip-routes')).toHaveTextContent(
      'route-aps-portal-dev-apiroute-aps-portal-prod-api'
    );
    expect(screen.getByTestId('rl-routes')).toHaveTextContent(
      'route-aps-portal-dev-apiroute-aps-portal-prod-api'
    );
    expect(screen.getByTestId('ip-services')).toHaveTextContent(
      'service-aps-portal-dev-apiservice-aps-portal-prod-api'
    );
    expect(screen.getByTestId('rl-services')).toHaveTextContent(
      'service-aps-portal-dev-apiservice-aps-portal-prod-api'
    );
  });

  it('should fetch a service name', async () => {
    render(
      <Controls rateLimits={[[], jest.fn()]} restrictions={[[], jest.fn()]} />,
      {
        wrapper,
      }
    );
    await waitFor(() =>
      expect(screen.queryByTestId('controls-loading')).not.toBeInTheDocument()
    );
    expect(screen.getByTestId('service-new')).toHaveTextContent(
      'service-aps-portal-dev-api'
    );
    expect(screen.getByTestId('service-existing')).toHaveTextContent(
      'existing-service'
    );
    expect(screen.getByTestId('route-new')).toHaveTextContent(
      'route-aps-portal-dev-api'
    );
    expect(screen.getByTestId('route-existing')).toHaveTextContent(
      'existing-route'
    );
    expect(screen.getByTestId('unknown')).toHaveTextContent('N/A');
  });
});
