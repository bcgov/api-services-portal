import { fireEvent, render, screen } from '@testing-library/react';

import ScopeControl from '../scope-control';
import wrapper from '../../../test/wrapper';

const serviceOptions = [
  {
    id: 1,
    name: 'Service 1',
    extForeignKey: 's1',
  },
  {
    id: 2,
    name: 'Service 2',
    extForeignKey: 's2',
  },
];
const routeOptions = [
  {
    id: 1,
    name: 'Route 1',
    extForeignKey: 'r1',
  },
  {
    id: 2,
    name: 'Route 2',
    extForeignKey: 'r2',
  },
];

describe('Scope Control', () => {
  it('Render child elements', () => {
    render(
      <ScopeControl serviceOptions={serviceOptions} routeOptions={routeOptions}>
        <div role="alert">Content</div>
      </ScopeControl>,
      { wrapper }
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Content');
  });

  it('should render select options', () => {
    render(
      <ScopeControl
        serviceOptions={serviceOptions}
        routeOptions={routeOptions}
        testId="test"
      >
        <div role="alert">Content</div>
      </ScopeControl>,
      { wrapper }
    );
    const el = screen.getByTestId('test-service-dropdown');
    expect(el).toHaveValue('s1');
    expect(el).toHaveTextContent('Service 1Service 2');
  });

  it('should switch to routes', () => {
    render(
      <ScopeControl
        serviceOptions={serviceOptions}
        routeOptions={routeOptions}
        testId="test"
      >
        <div role="alert">Content</div>
      </ScopeControl>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('test-route-radio'));
    const el = screen.getByTestId('test-route-dropdown');
    expect(el).toHaveValue('r1');
    expect(el).toHaveTextContent('Route 1Route 2');
  });
});
