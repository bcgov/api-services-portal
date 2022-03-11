import { Logger } from '../../logger';
import YAML from 'js-yaml';
import fs from 'fs';
import { strict as assert } from 'assert';
import { Environment } from '@/services/keystone/types';

const logger = Logger('mocks.ks');

const nsDefault = YAML.load(
  fs.readFileSync('./mocks/handlers/data/ns-default.yaml', 'utf8')
);

const scenarios: { [key: string]: any } = {
  default: {
    GetCredentialIssuerById: {
      data: {
        CredentialIssuer: nsDefault.credentialIssuers[0],
      },
    },
    GetCredentialIssuerByEnvironmentId: {
      data: {
        Environment: nsDefault.products[0].environments[1],
      },
    },
    GetConsumerPlugins: {
      data: {
        allGatewayConsumers: nsDefault.consumers,
      },
    },
    GetProductEnvironmentServices: (variables: any) => ({
      data: {
        allEnvironments: nsDefault.products[0].environments.filter(
          (e: Environment) => e.id === variables.id
        ),
      },
    }),
    GetSpecificAccessRequest: {
      data: {
        AccessRequest: nsDefault.accessRequests[0],
      },
    },
    FindConsumerByUsername: {
      data: {
        allGatewayConsumers: [{ extForeignKey: 'CONSUMER-001' }],
      },
    },
    CreateNewConsumer: {
      data: {
        createGatewayConsumer: { id: 'CONSUMER-001' },
      },
    },
    CreateServiceAccess: {
      data: {
        createServiceAccess: { id: 'SVC-ACCESS-002' },
      },
    },
    UpdateConsumerInServiceAccess: {
      data: {
        updateServiceAccess: { id: 'SVC-ACCESS-001' },
      },
    },
    GetServiceMetrics: {
      data: {
        allMetrics: nsDefault.serviceMetrics,
      },
    },
    GetServiceAccessByNamespace: {
      data: {
        allServiceAccesses: nsDefault.serviceAccesses,
      },
    },
    GetUsersWithUsernames: {
      data: {
        allUsers: [
          {
            id: '60a2ec5185ff5040b3cf3636',
            name: 'Platform F Platform L',
            username: 'platform',
            email: 'platform@nowhere',
          },
        ],
      },
    },
  },
};

export default (scenario: string) => ({
  executeGraphQL: ({ query, variables }: any) => {
    const queries = scenarios[scenario];
    const match = Object.keys(queries)
      .filter((q) => query.indexOf(q) >= 0)
      .pop();
    assert.strictEqual(
      typeof match === 'undefined',
      false,
      `Not able to find in ${scenario} the query ${query}`
    );
    logger.debug('Returning ' + match);
    return typeof queries[match] === 'function'
      ? queries[match](variables)
      : queries[match];
  },
});
