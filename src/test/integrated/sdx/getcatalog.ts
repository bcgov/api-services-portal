/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/sdx/getcatalog.js
*/

import { o } from '../util';
import InitKeystone from '../keystonejs/init';
import { GetCatalog } from '../../../services/sdx/sdx-catalog';
import { GetConfigUsingPattern } from '../../../services/sdx/gateway-patterns';

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

  // o(await getOrganizations(ctx));

  o(await GetCatalog(ctx));

  // o(
  //   await GetConfigUsingPattern(ctx, {
  //     pattern: 'sdx-keys-r1',
  //     locator: 'DEV.MIN.CITZ.SINGLE-DIGITAL-GW',
  //     parameters: {
  //       public_key_pem: 'sample-public-key-pem',
  //     },
  //   })
  // );

  o(
    await GetConfigUsingPattern(ctx, {
      pattern: 'sdx-p2p-consumer-pub-r1',
      parameters: {
        req_id: '12345',
        consumer: 'DEV.MIN.CITZ.SINGLE-DIGITAL-GW',
        provider: 'DEV.MIN.PUKI.TOYS',
      },
    })
  );

  o(
    await GetConfigUsingPattern(ctx, {
      pattern: 'sdx-p2p-provider-pub-r1',
      parameters: {
        req_id: '12345',
        consumer: 'DEV.MIN.CITZ.SINGLE-DIGITAL-GW',
        provider: 'DEV.MIN.PUKI.TOYS',
        upstream_uri: 'https://httpbun.com',
      },
    })
  );

  await keystone.disconnect();
})();
