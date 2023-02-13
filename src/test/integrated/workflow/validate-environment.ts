/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/workflow/validate-environment.js
*/

import InitKeystone from '../keystonejs/init';
import { o } from '../util';
import { ValidateActiveEnvironment } from '../../../services/workflow';
import { getFuncForMissingJwtKeycloakPlugin } from '../../../services/workflow/validate-active-environment';
import { strict as assert } from 'assert';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'simple';
  const skipAccessControl = false;

  const identity = {
    id: null,
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId: null,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (false) {
    const operation = 'update';
    const existingItem = {
      id: '6180d1078a98e36cae8d061f',
    };
    const originalInput = {
      active: true,
    };
    const resolvedData = {};
    const addValidationError = (err: any) => {
      console.error('Validation error');
      o(err);
    };

    o(
      await ValidateActiveEnvironment(
        ctx,
        operation,
        existingItem,
        originalInput,
        resolvedData,
        addValidationError
      )
    );
    // await new Promise((r) => setTimeout(r, 10000));
  }

  if (false) {
    const operation = 'create';
    const existingItem = null as any;
    const originalInput = {
      active: true,
    };
    const resolvedData = {
      active: true,
      product: '62311e97519e570efbe35905',
    };
    const addValidationError = (err: any) => {
      console.error('Validation error');
      o(err);
    };

    o(
      await ValidateActiveEnvironment(
        ctx,
        operation,
        existingItem,
        originalInput,
        resolvedData,
        addValidationError
      )
    );
    // await new Promise((r) => setTimeout(r, 10000));
  }

  if (true) {
    const issuerUrl = 'https://auth.local/realms/myrealm';
    const test = getFuncForMissingJwtKeycloakPlugin(issuerUrl)({
      plugins: [
        {
          name: 'jwt-keycloak',
          config: {
            well_known_template: null,
            allowed_iss: ['https://auth.local/realms/myrealm'],
          },
        },
      ],
      routes: [],
    } as any);
    assert.strictEqual(test, false);
  }

  await keystone.disconnect();
})();
