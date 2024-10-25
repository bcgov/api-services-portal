/*
Wire up directly with Keycloak and use the Services
export TOK="<token from portal>"
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/reports/gatewayMetrics.js
*/
import { createWriteStream } from 'fs';
import InitKeystone from '../keystonejs/init';
import { o } from '../util';
import { Logger } from '../../../logger';
import {
  getGatewayMetrics,
  getNamespaceAccess,
} from '../../../services/report/data';
import {
  getGwaProductEnvironment,
  injectResSvrAccessTokenToContext,
} from '../../../services/workflow';
import { lookupProductEnvironmentServicesBySlug } from '../../../services/keystone';
import { getNamespaces } from '../../../services/report/ops-metrics';
import { generateExcelWorkbook } from '../../../services/report/output/xls-generator';

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

  // const envCtx = await getGwaProductEnvironment(ctx, true);

  //await injectResSvrAccessTokenToContext(envCtx);

  const nslist = await getNamespaces(ctx);
  nslist.sort((a, b) => a.name.localeCompare(b.name));
  o(nslist);

  const gatewayMetrics = await getGatewayMetrics(
    ctx,
    nslist
      // .filter((ns) => ['dss-loc-gold', 'dss-loc'].indexOf(ns.name) >= 0)
      .map((ns) => ({
        resource_id: ns.id,
        name: ns.name,
        displayName: ns.displayName,
        permDataPlane: ns.permDataPlane,
      }))
  );
  o(gatewayMetrics);

  const workbook = generateExcelWorkbook({
    namespaces: nslist,
    gateway_metrics: gatewayMetrics,
  });
  const buffer = await workbook.xlsx.writeBuffer();

  var stream = createWriteStream('gatewaymetrics.xlsx');
  stream.once('open', function (fd) {
    stream.write(buffer);
    stream.end();
  });

  await keystone.disconnect();
})();
