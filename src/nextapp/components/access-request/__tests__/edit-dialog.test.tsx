jest.mock('@/shared/config');
import * as React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import EditDialog from '../edit-dialog';
import { harleyAccessRequest } from '../../../../mocks/resolvers/consumers';
import { keystone } from '../../../../mocks/handlers';
import { server } from '../../../../mocks/server';
import { renderWithPortal, toastManager } from '../../../test/utils';

const queryKey = ['consumer', '123'];

const environment = {
  id: '64',
  name: 'prod',
  active: true,
  flow: 'client-credentials',
  services: [
    {
      name: 'service-aps-portal-dev-api',
    },
  ],
};
const plugins = [
  {
    name: 'ip-restriction',
    config: '{"allow":"[\\"1.1.1.1\\",\\"2.2.2.2\\"]"}',
    service: {
      id: '1231',
      name: 'service-aps-portal-dev-api',
    },
    route: null,
  },
  {
    name: 'rate-limiting',
    service: null,
    route: {
      id: '22',
      name: 'route-aps-portal-dev-api',
    },
    protocols: ['http', 'https'],
    config:
      '{"second":"20","minute":"20","hour":"20","day":"20","policy":"redis","service":"1231"}',
  },
];
const consumer = {
  id: '120912301',
  username: 'sa-moh-proto-ca853245-9d9af1b3c417',
  tags: '["Facility - London Drugs #5602", "Phone Number - 555-555-5555"]',
  updatedAt: '2022-05-10T18:38:41.220Z',
  aclGroups: '[]',
  plugins,
};
const product = {
  id: '112',
  name: 'Another App',
  environments: [environment],
};

describe('access-request/edit-dialog', () => {
  beforeEach(toastManager);

  it('open correctly', async () => {
    renderWithPortal(
      <EditDialog
        consumer={consumer}
        environment={environment}
        data={plugins}
        queryKey={queryKey}
        product={product}
      />
    );
    fireEvent.click(screen.getByTestId('120912301-edit-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('edit-consumer-dialog')).toBeVisible();
    });
    fireEvent.click(screen.getByTestId('ar-edit-cancel-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('edit-consumer-dialog')).not.toBeVisible();
    });
  });

  it('should change tabs', async () => {
    renderWithPortal(
      <EditDialog
        consumer={consumer}
        environment={environment}
        data={plugins}
        queryKey={queryKey}
        product={product}
      />
    );
    fireEvent.click(screen.getByTestId('120912301-edit-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('edit-consumer-dialog')).toBeVisible();
    });
    expect(screen.getByTestId('ar-controls-tab')).toBeVisible();
    fireEvent.click(screen.getByText('Authorization'));
    expect(screen.getByTestId('ar-controls-tab')).not.toBeVisible();
    expect(screen.getByTestId('ar-authorization-tab')).toBeVisible();
    fireEvent.click(screen.getByText('Request Details'));
    expect(screen.getByTestId('ar-authorization-tab')).not.toBeVisible();
    expect(screen.getByTestId('ar-request-details-tab')).toBeVisible();
  });
});
