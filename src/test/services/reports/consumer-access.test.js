jest.mock('../../../services/keystone/gateway-service', () => ({
  lookupServicesByNamespace: jest.fn(),
}));
jest.mock('../../../services/keystone/service-access', () => ({
  lookupDetailedServiceAccessesByNS: jest.fn(),
}));
jest.mock('../../../services/keystone/product-environment', () => ({
  lookupEnvironmentsByNS: jest.fn(),
}));

import { lookupServicesByNamespace } from '../../../services/keystone/gateway-service';
import { lookupDetailedServiceAccessesByNS } from '../../../services/keystone/service-access';
import { lookupEnvironmentsByNS } from '../../../services/keystone/product-environment';
import { getConsumerAccess } from '../../../services/report/data/consumer-access';

const env = {
  appId: 'ENV1',
  name: 'prod',
  flow: 'kong-api-key-only',
  product: { name: 'Geocoder' },
};

function access(username, aclGroups, email) {
  return {
    productEnvironment: env,
    application: {
      name: `${username} app`,
      appId: `${username}-APP`,
      owner: { username: `${username}@idir`, name: username, email },
    },
    consumer: { username, aclGroups, updatedAt: '2026-01-01T00:00:00Z' },
  };
}

describe('getConsumerAccess', () => {
  beforeEach(() => {
    lookupServicesByNamespace.mockResolvedValue([
      {
        plugins: [{ name: 'acl', config: { allow: ['ENV1'] } }],
        routes: [{ plugins: [{ name: 'acl', config: { allow: null } }] }],
      },
    ]);
    lookupEnvironmentsByNS.mockResolvedValue([env]);
  });

  it('uses the consumer aclGroups instead of Kong', async () => {
    lookupDetailedServiceAccessesByNS.mockResolvedValue([
      access('CONSUMER1', '["ENV1"]', 'one@gov.bc.ca'),
      access('CONSUMER2', '[]', 'two@gov.bc.ca'),
    ]);

    const result = await getConsumerAccess({}, [{ name: 'gw-1' }]);

    expect(result).toEqual([
      expect.objectContaining({
        consumer_username: 'CONSUMER1',
        perm_acl: 'allow',
        prod_env_app_id: 'ENV1',
        app_owner_email: 'one@gov.bc.ca',
      }),
      expect.objectContaining({
        consumer_username: 'CONSUMER2',
        perm_acl: '',
        app_owner_email: 'two@gov.bc.ca',
      }),
    ]);
  });

  it('does not grant access for groups the gateway does not allow', async () => {
    lookupServicesByNamespace.mockResolvedValue([
      { plugins: [{ name: 'acl', config: { allow: ['OTHER'] } }] },
    ]);
    lookupDetailedServiceAccessesByNS.mockResolvedValue([
      access('CONSUMER1', '["ENV1"]', 'one@gov.bc.ca'),
    ]);

    const result = await getConsumerAccess({}, [{ name: 'gw-1' }]);

    expect(result).toEqual([
      expect.objectContaining({
        consumer_username: 'CONSUMER1',
        perm_acl: '',
      }),
    ]);
  });
});
