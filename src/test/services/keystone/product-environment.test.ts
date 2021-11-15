// Lookup product environments with appId (for ACL), cred issuer and services information
import { CredentialIssuer, GatewayService } from '@/services/keystone/types';
import {
  lookupProductEnvironmentServices,
  lookupEnvironmentAndIssuerById,
} from '../../../services/keystone';

const queries = [
  {
    name: 'GetProductEnvironmentServices',
    query: { id: '61204beaa988d4127e1d4892' },
    data: {
      data: {
        allEnvironments: [
          {
            appId: 'DBA44A4F',
            id: '61204beaa988d4127e1d4892',
            name: 'dev',
            flow: 'kong-api-key-acl',
            approval: true,
            product: { namespace: 'platform' },
            credentialIssuer: null as CredentialIssuer,
            services: [] as GatewayService[],
          },
        ],
      },
    },
  },
  {
    name: 'GetProductEnvironmentServices',
    query: { id: '61204beaa988d4127e1d4892' },
    data: {
      data: {
        allEnvironments: [
          {
            appId: 'DBA44A4F',
            id: '61204beaa988d4127e1d4892',
            name: 'dev',
            flow: 'kong-api-key-acl',
            approval: true,
            product: { namespace: 'platform' },
            credentialIssuer: null as CredentialIssuer,
            services: [] as GatewayService[],
          },
        ],
      },
    },
  },
  {
    name: 'GetCredentialIssuerByEnvironmentId',
    query: { id: '609c5bf79b8ceca36d31ce94' },
    data: {
      data: {
        Environment: {
          id: '609c5bf79b8ceca36d31ce94',
          name: 'dev',
          approval: false,
          legal: { reference: 'terms-of-use-for-api-gateway-1' },
          credentialIssuer: {
            name: 'GWA API Resource Server',
            flow: 'client-credentials',
            mode: 'auto',
            environmentDetails:
              '[{"environment":"dev","issuerUrl":"https://authz-dev.apps.silver.devops.gov.bc.ca/auth/realms/aps-v2","clientId":"gwa-api","clientRegistration":"managed","clientSecret":"66919256-e415-47a8-b468-40b0d8161f85"}]',
            resourceType: 'namespace',
            resourceAccessScope: 'Namespace.Manage',
          },
        },
      },
    },
  },
];

describe('KeystoneJS', function () {
  const context = {
    executeGraphQL: (q: any) => {
      const queryDef = queries
        .filter((queryDef) => q.query.indexOf(queryDef.name) != -1)
        .pop();
      return queryDef.data;
    },
  };

  describe('test lookupProductEnvironmentServices', function () {
    it('it should be successful', async function () {
      const environment = await lookupProductEnvironmentServices(
        context,
        '61204beaa988d4127e1d4892'
      );
      expect(environment.appId).toBe('DBA44A4F');
    });
  });

  describe('test lookupEnvironmentAndIssuerById', function () {
    it('it should be successful', async function () {
      const environment = await lookupEnvironmentAndIssuerById(
        context,
        '609c5bf79b8ceca36d31ce94'
      );
      expect(environment.name).toBe('dev');
    });
  });
});
