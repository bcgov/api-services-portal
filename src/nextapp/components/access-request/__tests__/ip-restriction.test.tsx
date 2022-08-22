import { Accordion } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import wrapper from '../../../test/wrapper';
import { serviceOptions, routeOptions } from './shared';
import IpRestriction from '../ip-restriction';

const emptyState = [[], jest.fn()];

describe('IP Restrictions', () => {
  it('should render empty message and show initial services', () => {
    render(
      <Accordion>
        <IpRestriction
          getControlName={jest.fn()}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={emptyState}
        />
      </Accordion>,
      { wrapper }
    );
    expect(
      screen.getByText('There are no controls applied yet')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('ip-restriction-service-dropdown')
    ).toHaveTextContent('Service 1Service 2');
  });

  it('should validate empty form submits', () => {
    render(
      <Accordion>
        <IpRestriction
          getControlName={jest.fn()}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={emptyState}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('ip-restriction-submit-btn'));
    expect(screen.getByText('IP addresses are required')).toBeInTheDocument();
  });

  it('should clear a form', () => {
    render(
      <Accordion>
        <IpRestriction
          getControlName={jest.fn()}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={emptyState}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('ip-restriction-route-radio'));
    fireEvent.input(screen.getByTestId('allow-ip-restriction-input-input'), {
      target: {
        value: '1.1.1.1',
      },
    });
    fireEvent.click(screen.getByTestId('ip-restriction-clear-btn'));
    expect(
      screen.queryByTestId('ip-restriction-route-radio')
    ).not.toBeChecked();
    expect(screen.getByTestId('allow-ip-restriction-input-input')).toHaveValue(
      ''
    );
  });

  it('should submit a service', () => {
    const spy = jest.fn();
    render(
      <Accordion>
        <IpRestriction
          getControlName={jest.fn()}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[[], spy]}
        />
      </Accordion>,
      { wrapper }
    );
    const input = screen.getByTestId('allow-ip-restriction-input-input');
    fireEvent.input(input, {
      target: {
        value: '1.1.1.1',
      },
    });
    fireEvent.blur(input);
    fireEvent.click(screen.getByTestId('ip-restriction-submit-btn'));
    expect(spy).toHaveBeenCalledWith([
      {
        name: 'ip-restriction',
        config: JSON.stringify({
          allow: JSON.stringify(['1.1.1.1']),
        }),
        tags: '["consumer"]',
        service: {
          connect: {
            id: 's1',
          },
        },
      },
    ]);
  });

  it('should render pre-existing restrictions', () => {
    const spy = jest.fn();
    const nameSpy = jest.fn(() => 'Service 1');
    const data = [
      {
        name: 'ip-restriction',
        service: {
          id: 's1',
          name: 'Service 1',
        },
        config: JSON.stringify({
          allow: JSON.stringify(['1.1.1.1']),
        }),
        tags: '["consumer"]',
      },
      {
        name: 'ip-restriction',
        service: {
          id: 's2',
          name: 'Service 2',
        },
        config: JSON.stringify({
          allow: JSON.stringify(['3.3.3.3']),
        }),
        tags: '["consumer"]',
      },
    ];
    render(
      <Accordion defaultIndex={0}>
        <IpRestriction
          getControlName={nameSpy}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[data, spy]}
        />
      </Accordion>,
      { wrapper }
    );
    expect(nameSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('ip-restriction-item-title-0')).toHaveTextContent(
      'Service 1'
    );
    fireEvent.click(screen.getByTestId('ip-restriction-item-btn-0'));
    const input = screen.getByTestId('allow-ip-restriction-input-0-input');
    fireEvent.input(input, {
      target: {
        value: '2.2.2.2',
      },
    });
    fireEvent.blur(input);
    fireEvent.click(screen.getByTestId('ip-restriction-item-save-btn-0'));
    expect(spy).toHaveBeenCalledWith([
      {
        name: 'ip-restriction',
        config: JSON.stringify({
          allow: JSON.stringify(['1.1.1.1', '2.2.2.2']),
        }),
        tags: '["consumer"]',
        service: {
          id: 's1',
          name: 'Service 1',
        },
      },
      {
        name: 'ip-restriction',
        service: {
          id: 's2',
          name: 'Service 2',
        },
        config: JSON.stringify({
          allow: JSON.stringify(['3.3.3.3']),
        }),
        tags: '["consumer"]',
      },
    ]);
  });

  it('should add a route', () => {
    const spy = jest.fn();
    const nameSpy = jest.fn(() => 'Service 1');
    const data = {
      name: 'ip-restriction',
      service: {
        id: 's1',
        name: 'Service 1',
      },
      config: JSON.stringify({
        allow: JSON.stringify(['1.1.1.1']),
      }),
      tags: '["consumer"]',
    };
    const { rerender } = render(
      <Accordion defaultIndex={0}>
        <IpRestriction
          getControlName={nameSpy}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[[data], spy]}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('ip-restriction-route-radio'));
    const input = screen.getByTestId('allow-ip-restriction-input-input');
    fireEvent.input(input, {
      target: {
        value: '9.9.9.9',
      },
    });
    fireEvent.blur(input);
    fireEvent.click(screen.getByTestId('ip-restriction-submit-btn'));
    expect(spy).toHaveBeenCalledWith([
      data,
      {
        name: 'ip-restriction',
        config: JSON.stringify({
          allow: JSON.stringify(['9.9.9.9']),
        }),
        tags: '["consumer"]',
        route: {
          connect: {
            id: 'r1',
          },
        },
      },
    ]);
  });

  it('should delete an existing item', () => {
    const spy = jest.fn();
    const nameSpy = jest.fn(() => 'Service 1');
    const data = {
      name: 'ip-restriction',
      service: {
        id: 's1',
        name: 'Service 1',
      },
      config: JSON.stringify({
        allow: JSON.stringify(['1.1.1.1']),
      }),
      tags: '["consumer"]',
    };
    const { rerender } = render(
      <Accordion defaultIndex={0}>
        <IpRestriction
          getControlName={nameSpy}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[[data], spy]}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('ip-restriction-item-delete-btn-0'));
    expect(spy).toHaveBeenCalledWith([]);
  });
});
