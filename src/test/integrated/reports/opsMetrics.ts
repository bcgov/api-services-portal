/*
Wire up directly with Keycloak and use the Services
export TOK="<token from portal>"
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/reports/opsMetrics.js
*/

import InitKeystone from '../keystonejs/init';
import { o } from '../util';
import { Logger } from '../../../logger';
import { getNamespaceAccess } from '../../../services/report/data';
import {
  getGwaProductEnvironment,
  injectResSvrAccessTokenToContext,
} from '../../../services/workflow';
import { lookupProductEnvironmentServicesBySlug } from '../../../services/keystone';
import { OpsMetrics } from '../../../services/report/ops-metrics';

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

  const opsMetrics = new OpsMetrics(keystone);
  opsMetrics.initialize();
  //await opsMetrics.generateEmailList();
  await opsMetrics.generateActivityMetrics();
  //await opsMetrics.generateMetrics();
  //await opsMetrics.generateNamespaceMetrics();
  //await opsMetrics.generateProductMetrics();
  //await opsMetrics.generateConsumerMetrics();

  o(opsMetrics.gActivity.data());

  //await opsMetrics.store();

  await keystone.disconnect();
})();
