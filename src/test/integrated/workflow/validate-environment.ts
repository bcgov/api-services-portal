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

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'platform';
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

  if (true) {
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

  await keystone.disconnect();
})();
