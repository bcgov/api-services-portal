jest.mock('../../../shared/config', () => ({
  apiHost: 'http://localhost:4000',
  grafanaUrl: 'http://grafana.url',
  apiInternalHost: 'http://localhost:3000',
}));
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import RequestDetails from '../request-details';
import { keystone } from '../../../../mocks/handlers';
import { server } from '../../../../mocks/server';
import { harleyAccessRequest } from '../../../../mocks/resolvers/consumers';
import wrapper from '../../../test/wrapper';

const data = {
  ...harleyAccessRequest,
  createdAt: '2022-03-12T23:16:14.795Z',
};

describe('access-request/request-details', () => {
  it('should render happy path details', async () => {
    render(<RequestDetails data={data} />, {
      wrapper,
    });
    const address = await screen.findByTestId('ar-business-address');
    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('Easy Mart Store 122')).toBeInTheDocument();
    expect(screen.getByText('Mar 12th, 2022')).toBeInTheDocument();
    expect(
      screen.getByText('Phone Number 204-896-6325 & 204-896-7700.')
    ).toBeInTheDocument();
    expect(address).toHaveTextContent(
      'Easy Drug Mart - 51, W Broadway, Vancouver BC, V8T 1E7 Canada'
    );
  });

  it('should show a failed business address', async () => {
    server.use(
      keystone.query('RequestDetailsBusinessProfile', (req, res, ctx) => {
        return res.once(
          ctx.data({
            errors: [{ message: 'query error' }],
          })
        );
      })
    );
    render(<RequestDetails data={data} />, {
      wrapper,
    });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
