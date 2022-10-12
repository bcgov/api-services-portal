/*
Wire up directly with Keycloak and use the Services
export TOK="<token from portal>"
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/reports/consumerAccess.js
*/

import InitKeystone from '../keystonejs/init';
import { o } from '../util';
import { Logger } from '../../../logger';
import {
  getConsumerAccess,
  getNamespaceAccess,
} from '../../../services/report/data';
import {
  getGwaProductEnvironment,
  injectResSvrAccessTokenToContext,
} from '../../../services/workflow';
import { lookupProductEnvironmentServicesBySlug } from '../../../services/keystone';

const logger = Logger('test.reports');

(async () => {
  const keystone = await InitKeystone();

  const ns = 'refactortime';
  const skipAccessControl = true;

  const identity = {
    id: null,
    name: 'Sample User',
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['access-manager']),
    scopes: [],
    //userId: '60c9124f3518951bb519084d',
    userId: '60c9124f3518951bb519084d', // acope@idir
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });
  ctx.req = {
    headers: {
      'x-forwarded-access-token': process.env.TOK,
    },
  };

  ctx.req.user = { sub: '15a3cbbe-95b5-49f0-84ee-434a9b92d04a' };

  const envCtx = await getGwaProductEnvironment(ctx, true);

  await injectResSvrAccessTokenToContext(envCtx);

  const result = await getConsumerAccess(
    envCtx,
    ctx,
    [
      {
        resource_id: '49f95b75-6aa5-4bc0-a0bf-6a8037ca083d',
        name: 'refactortime',
      },
    ],
    new Map()
  );
  o(result);
  await keystone.disconnect();
})();
