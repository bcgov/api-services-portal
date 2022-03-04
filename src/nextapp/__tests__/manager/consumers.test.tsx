jest.mock('../../shared/config', () => ({
  apiHost: 'http://localhost:4000',
  grafanaUrl: 'http://grafana.url',
  apiInternalHost: 'http://localhost:3000',
}));
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import ConsumersPage from '@/pages/manager/consumers';

import { keystone } from '../../../mocks/handlers';
import { server } from '../../../mocks/server';
import wrapper from '../../test/wrapper';

describe('managers/consumers', () => {
  it('should render with no consumers', () => {
    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
    expect(screen.getByText('0 Consumers')).toBeInTheDocument();
  });

  it('should load consumer data and render it as a table', async () => {
    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
    expect(screen.getByText('0 Consumers')).toBeInTheDocument();
    await waitFor(() => screen.getByText('2 Consumers'));
    expect(screen.getByText('2 Consumers')).toBeInTheDocument();
    expect(
      screen.getByText('sa-moh-proto-ca853245-9d9af1b3c417')
    ).toBeInTheDocument();
  });

  it('should search for consumers by name', async () => {
    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
    await waitFor(() => screen.getByText('2 Consumers'));
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
    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
    await waitFor(() => screen.getByText('2 Consumers'));
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
    expect(screen.getByText('Test Consumer for Shoppers')).toBeInTheDocument();
    expect(
      screen.queryByText('sa-moh-proto-ca853245-9d9af1b3c417')
    ).toBeFalsy();
  });

  it('should search for consumers by tag', async () => {
    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
    await waitFor(() => screen.getByText('2 Consumers'));
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

  it('should delete a consumer access', async () => {
    render(<ConsumersPage queryKey={['allConsumers']} />, { wrapper });
    await waitFor(() => screen.getByText('2 Consumers'));
    fireEvent.click(screen.getByTestId('consumer-120912301-menu'));
    await waitFor(() => screen.getAllByTestId('consumer-delete-menuitem'));
    fireEvent.click(screen.getAllByTestId('consumer-delete-menuitem')[0]);
    await waitForElementToBeRemoved(
      screen.getByText('sa-moh-proto-ca853245-9d9af1b3c417'),
      { timeout: 2000 }
    );
    expect(
      screen.queryByText('sa-moh-proto-ca853245-9d9af1b3c417')
    ).toBeFalsy();
  });
});
