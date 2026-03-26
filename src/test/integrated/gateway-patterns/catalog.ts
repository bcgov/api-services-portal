// node dist/test/integrated/gateway-patterns/catalog.js

import { logger } from '../../../logger';
import YAML from 'js-yaml';
import { GetCatalog } from '../../../services/gateway-patterns/catalog';
import InitKeystone from '../keystonejs/init';
import { o } from '../util';

(async () => {
  logger.info('Running integrated test for Catalog');

  const keystone = await InitKeystone();

  const ns = 'gw-0dcd7';
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

  const result = await GetCatalog(ctx);
  o(result);

  keystone.disconnect();
})();
