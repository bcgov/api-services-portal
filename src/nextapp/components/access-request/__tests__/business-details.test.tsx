jest.mock('../../../shared/config', () => ({
  apiHost: 'http://localhost:4000',
  grafanaUrl: 'http://grafana.url',
  apiInternalHost: 'http://localhost:3000',
}));
import * as React from 'react';
import { render, screen } from '@testing-library/react';

import BusinessDetails from '../business-details';
import { keystone } from '../../../../mocks/handlers';
import { server } from '../../../../mocks/server';
import wrapper from '../../../test/wrapper';

describe('access-request/business-details', () => {
  it('should render a standard address', async () => {
    render(
      <React.Suspense fallback="loading...">
        <BusinessDetails id="123" />
      </React.Suspense>,
      { wrapper }
    );
    const address = await screen.findByTestId('ar-business-address');
    expect(address).toHaveTextContent(
      'Easy Drug Mart - 51, W Broadway, Vancouver BC, V8T 1E7 Canada'
    );
  });

  it('should render an empty institution', async () => {
    server.use(
      keystone.query('RequestDetailsBusinessProfile', (req, res, ctx) => {
        return res.once(
          ctx.data({
            BusinessProfile: {
              institution: null,
            },
          })
        );
      })
    );
    render(
      <React.Suspense fallback="loading...">
        <BusinessDetails id="123" />
      </React.Suspense>,
      { wrapper }
    );
    const address = await screen.findByTestId('ar-business-address');
    expect(address).toHaveTextContent('N/A');
  });

  it('should render an empty address values', async () => {
    server.use(
      keystone.query('RequestDetailsBusinessProfile', (req, res, ctx) => {
        return res.once(
          ctx.data({
            BusinessProfile: {
              institution: {
                legalName: 'Easy Drug Mart',
                address: {
                  addressLine1: '',
                  addressLine2: '',
                  city: '',
                  postal: '',
                  province: '',
                  country: '',
                },
              },
            },
          })
        );
      })
    );
    render(
      <React.Suspense fallback="loading...">
        <BusinessDetails id="123" />
      </React.Suspense>,
      { wrapper }
    );
    const address = await screen.findByTestId('ar-business-address');
    expect(address).toHaveTextContent('Easy Drug Mart');
  });

  it('should render an empty legal name', async () => {
    server.use(
      keystone.query('RequestDetailsBusinessProfile', (req, res, ctx) => {
        return res.once(
          ctx.data({
            BusinessProfile: {
              institution: {
                legalName: null,
                address: {
                  addressLine1: '51, W Broadway',
                  addressLine2: '',
                  city: 'Vancouver',
                  postal: 'V8T 1E7',
                  province: 'BC',
                  country: 'Canada',
                },
              },
            },
          })
        );
      })
    );
    render(
      <React.Suspense fallback="loading...">
        <BusinessDetails id="123" />
      </React.Suspense>,
      { wrapper }
    );
    const address = await screen.findByTestId('ar-business-address');
    expect(address).toHaveTextContent(
      '51, W Broadway, Vancouver BC, V8T 1E7 Canada'
    );
  });
});
