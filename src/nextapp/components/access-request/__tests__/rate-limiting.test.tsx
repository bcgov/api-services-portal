import { Accordion } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import wrapper from '../../../test/wrapper';
import { serviceOptions, routeOptions } from './shared';
import RateLimiting from '../rate-limiting';

const emptyState = [[], jest.fn()];

describe('Rate Limiting', () => {
  it('should render empty message and show initial services', () => {
    render(
      <Accordion>
        <RateLimiting
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
    expect(screen.getByTestId('ratelimit-service-dropdown')).toHaveTextContent(
      'Service 1Service 2'
    );
  });

  it('should submit if no rate limits are entered', () => {
    const spy = jest.fn();
    render(
      <Accordion>
        <RateLimiting
          getControlName={jest.fn()}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[[], spy]}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('ratelimit-submit-btn'));
    expect(spy).toHaveBeenCalledWith([
      {
        name: 'rate-limiting',
        config: JSON.stringify({
          second: '',
          minute: '',
          hour: '',
          day: '',
          policy: 'local',
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

  it('should clear a form', () => {
    render(
      <Accordion>
        <RateLimiting
          getControlName={jest.fn()}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={emptyState}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('ratelimit-route-radio'));
    fireEvent.input(screen.getByTestId('ratelimit-hour-input'), {
      target: {
        value: '15',
      },
    });
    fireEvent.input(screen.getByTestId('ratelimit-day-input'), {
      target: {
        value: '5',
      },
    });
    fireEvent.change(screen.getByTestId('ratelimit-policy-dropdown'), {
      target: {
        value: 'redis',
      },
    });
    fireEvent.click(screen.getByTestId('ratelimit-clear-btn'));
    expect(screen.queryByTestId('ratelimit-route-radio')).not.toBeChecked();
    expect(screen.getByTestId('ratelimit-hour-input')).toHaveValue(null);
    expect(screen.getByTestId('ratelimit-day-input')).toHaveValue(null);
    expect(screen.getByTestId('ratelimit-policy-dropdown')).toHaveValue(
      'local'
    );
  });

  it('should add a new rate limit with a route selected', () => {
    const spy = jest.fn();
    const data = {
      name: 'rate-limiting',
      config: JSON.stringify({
        second: '',
        minute: '',
        hour: '',
        day: '',
        policy: 'local',
      }),
      tags: '["consumer"]',
      service: {
        id: 's1',
        name: 'Service 1',
      },
    };
    render(
      <Accordion>
        <RateLimiting
          getControlName={() => 'Service 1'}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[[data], spy]}
        />
      </Accordion>,
      { wrapper }
    );
    expect(screen.getByTestId('ratelimit-item-title-0')).toHaveTextContent(
      'Service 1'
    );
    fireEvent.input(screen.getByTestId('ratelimit-second-input'), {
      target: {
        value: '2',
      },
    });
    fireEvent.input(screen.getByTestId('ratelimit-minute-input'), {
      target: {
        value: '2',
      },
    });
    fireEvent.input(screen.getByTestId('ratelimit-hour-input'), {
      target: {
        value: '2',
      },
    });
    fireEvent.input(screen.getByTestId('ratelimit-day-input'), {
      target: {
        value: '2',
      },
    });
    fireEvent.change(screen.getByTestId('ratelimit-policy-dropdown'), {
      target: {
        value: 'redis',
      },
    });
    fireEvent.click(screen.getByTestId('ratelimit-submit-btn'));
    expect(spy).toHaveBeenCalledWith([
      data,
      {
        name: 'rate-limiting',
        config: JSON.stringify({
          second: '2',
          minute: '2',
          hour: '2',
          day: '2',
          policy: 'redis',
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

  it('should delete an item', () => {
    const spy = jest.fn();
    const data = {
      name: 'rate-limiting',
      config: JSON.stringify({
        scope: 'service',
        second: '',
        minute: '',
        hour: '',
        day: '',
        policy: 'local',
      }),
      tags: '["consumer"]',
      service: {
        id: 's1',
        name: 'Service 1',
      },
    };
    render(
      <Accordion>
        <RateLimiting
          getControlName={() => 'Service 1'}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[[data], spy]}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.click(screen.getByTestId('ratelimit-item-delete-btn-0'));
    expect(spy).toHaveBeenCalledWith([]);
  });

  it('should update an item', () => {
    const spy = jest.fn();
    const data = {
      name: 'rate-limiting',
      config: JSON.stringify({
        scope: 'service',
        second: '1',
        minute: '1',
        hour: '1',
        day: '1',
        policy: 'local',
      }),
      tags: '["consumer"]',
      service: {
        id: 's1',
        name: 'Service 1',
      },
    };
    render(
      <Accordion>
        <RateLimiting
          getControlName={() => 'Service 1'}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={[[data], spy]}
        />
      </Accordion>,
      { wrapper }
    );
    fireEvent.input(screen.getByTestId('ratelimit-item-form-second-input-0'), {
      target: {
        value: '5',
      },
    });
    fireEvent.input(screen.getByTestId('ratelimit-item-form-minute-input-0'), {
      target: {
        value: '5',
      },
    });
    fireEvent.input(screen.getByTestId('ratelimit-item-form-hour-input-0'), {
      target: {
        value: '5',
      },
    });
    fireEvent.input(screen.getByTestId('ratelimit-item-form-day-input-0'), {
      target: {
        value: '5',
      },
    });
    fireEvent.input(
      screen.getByTestId('ratelimit-item-form-policy-dropdown-0'),
      {
        target: {
          value: 'redis',
        },
      }
    );
    fireEvent.click(screen.getByTestId('ratelimit-item-save-btn-0'));
    expect(spy).toHaveBeenCalledWith([
      {
        name: 'rate-limiting',
        config: JSON.stringify({
          second: '5',
          minute: '5',
          hour: '5',
          day: '5',
          policy: 'redis',
        }),
        tags: '["consumer"]',
        service: {
          id: 's1',
          name: 'Service 1',
        },
      },
    ]);
  });
});
