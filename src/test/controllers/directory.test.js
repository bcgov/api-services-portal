import 'reflect-metadata';

import { DirectoryController as DirectoryControllerV1 } from '../../controllers/v1/DirectoryController';
import { DirectoryController as DirectoryControllerV2 } from '../../controllers/v2/DirectoryController';
import { DirectoryController as DirectoryControllerV3 } from '../../controllers/v3/DirectoryController';

// The directory item endpoints are unauthenticated. They read services and
// their plugin config only to work out whether an environment allows
// anonymous access, and must never return the services themselves.

const SECRET = 'FAKE-REDIS-PASSWORD';

function plugin(name, config) {
  return { name, config: JSON.stringify(config), tags: '["ns.dir-test"]' };
}

function rateLimiting() {
  return plugin('rate-limiting', {
    minute: 100,
    policy: 'redis',
    redis: { host: 'redis.internal', password: SECRET },
  });
}

// One product with three environments:
// - dev: anonymous key-auth on the service
// - test: anonymous jwt-keycloak on a route
// - prod: key-auth without anonymous access
function discoverableProducts() {
  return [
    {
      id: 'product-1',
      name: 'Directory Test Product',
      environments: [
        {
          name: 'dev',
          active: true,
          flow: 'public',
          services: [
            {
              name: 'dir-test-dev',
              host: 'dev.upstream.internal',
              plugins: [
                rateLimiting(),
                plugin('key-auth', { anonymous: 'anon-consumer-id' }),
              ],
              routes: [],
            },
          ],
        },
        {
          name: 'test',
          active: true,
          flow: 'kong-api-key-acl',
          services: [
            {
              name: 'dir-test-test',
              host: 'test.upstream.internal',
              plugins: [rateLimiting()],
              routes: [
                {
                  plugins: [
                    plugin('jwt-keycloak', {
                      anonymous: 'anon-consumer-id',
                    }),
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'prod',
          active: true,
          flow: 'kong-api-key-acl',
          services: [
            {
              name: 'dir-test-prod',
              host: 'prod.upstream.internal',
              plugins: [
                rateLimiting(),
                plugin('key-auth', { anonymous: null }),
              ],
              routes: [],
            },
          ],
        },
      ],
      dataset: {
        id: 'dataset-1',
        name: 'dir-test-dataset',
        title: 'Directory Test Dataset',
        tags: '["test"]',
        organization: { title: 'Org' },
        organizationUnit: { title: 'Org Unit' },
      },
    },
  ];
}

function keystoneReturning(products) {
  return {
    sudo: () => ({}),
    executeGraphQL: jest.fn(async () => ({
      data: { allDiscoverableProducts: products },
    })),
  };
}

describe.each([
  ['v1', DirectoryControllerV1],
  ['v2', DirectoryControllerV2],
  ['v3', DirectoryControllerV3],
])('%s DirectoryController.get', (_version, DirectoryController) => {
  async function getItem() {
    const controller = new DirectoryController(
      keystoneReturning(discoverableProducts())
    );
    return controller.get('dataset-1');
  }

  it('sets anonymous from key-auth and jwt-keycloak plugins', async () => {
    const result = await getItem();
    const environments = result.products[0].environments;

    expect(environments.map((env) => env.name)).toEqual([
      'dev',
      'test',
      'prod',
    ]);
    expect(environments[0].anonymous).toBe(true);
    expect(environments[1].anonymous).toBe(true);
    expect(environments[2].anonymous).toBeUndefined();
  });

  it('does not return services or their plugin config', async () => {
    const result = await getItem();

    result.products[0].environments.forEach((env) => {
      expect(env).not.toHaveProperty('services');
    });
    const body = JSON.stringify(result);
    expect(body).not.toContain(SECRET);
    expect(body).not.toContain('upstream.internal');
    expect(body).not.toContain('rate-limiting');
  });
});
