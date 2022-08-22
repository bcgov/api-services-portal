jest.mock('../../../shared/config', () => ({
  apiHost: 'http://localhost:4000',
  grafanaUrl: 'http://grafana.url',
  apiInternalHost: 'http://localhost:3000',
}));
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import Authorization from '../authorization';
import { keystone } from '../../../../mocks/handlers';
import { server } from '../../../../mocks/server';
import wrapper from '../../../test/wrapper';

describe('access-request/authorization', () => {
  it('should render scopes and roles', async () => {
    render(<Authorization id="123" />, { wrapper });
    await waitFor(() => screen.findAllByRole('checkbox'));
    expect(screen.queryAllByRole('checkbox')).toHaveLength(6);
  });

  it('should render nothing when an error is returned', async () => {
    render(<Authorization id="d1" />, { wrapper });
    await waitFor(() => screen.findByRole('alert'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should handle empty or invalid JSON', async () => {
    server.use(
      keystone.query('GetAccessRequestAuth', (req, res, ctx) => {
        return res.once(
          ctx.data({
            AccessRequest: {
              controls: '',
              productEnvironment: {
                credentialIssuer: {
                  availableScopes: null,
                  clientRoles: null,
                },
              },
            },
          })
        );
      })
    );
    render(<Authorization id="d1" />, { wrapper });
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('form')).toHaveTextContent('');
  });
});
