/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/workflow/create-service-account.js
*/

import InitKeystone from '../keystonejs/init';
import {
  getRecords,
  deleteRecord,
  parseJsonString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
  syncRecords,
} from '../../../batch/feed-worker';
import { o } from '../util';
import { CreateServiceAccount, DeleteAccess } from '../../../services/workflow';
import { deleteServiceAccess } from '../../../services/keystone';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'refactortime';
  const skipAccessControl = false;

  const identity = {
    id: null,
    name: 'Sample User',
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId: '60c9124f3518951bb519084d',
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (true) {
    const resId = '49f95b75-6aa5-4bc0-a0bf-6a8037ca083d';
    const svcacct = await CreateServiceAccount(
      ctx,
      process.env.GWA_PROD_ENV_SLUG,
      ns,
      resId,
      ['GatewayConfig.Publish']
    );
    o(svcacct);

    function sleep(ms: number) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    const a = await deleteServiceAccess(ctx, svcacct.serviceAccessId);
    o(a);
    await sleep(5000);
  }

  await keystone.disconnect();
})();
