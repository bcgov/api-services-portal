/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/workflow/migrate-user.js
*/

import InitKeystone from '../keystonejs/init';
import {
  MigrateAuthzUser,
  MigratePortalUser,
} from '../../../services/workflow';

(async () => {
  const keystone = await InitKeystone();

  const ns = 'refactortime';
  const skipAccessControl = true;

  const identity = {
    id: null,
    name: 'Sample User',
    username: 'sample_username',
    //namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId: '60c9124f3518951bb519084d',
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (true) {
    //await MigrateAuthzUser(ctx, 'acope@idir', 'acope2@idir', false);
    await MigratePortalUser(ctx, 'acopex@idir', 'acope2@idir');
  }

  await keystone.disconnect();
})();
