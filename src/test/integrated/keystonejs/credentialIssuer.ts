/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/credentialIssuer.js
*/

import InitKeystone from './init';
import { o } from '../util';
import {
  lookupCredentialIssuerById,
  lookupSharedIssuers,
} from '../../../services/keystone';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'refactortime';
  const skipAccessControl = false;

  const identity = {
    id: null,
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

  if (false) {
    const out = await ctx.executeGraphQL({
      query: `
   query abc {
    allCredentialIssuersByNamespace {
      id
      name
      flow
      mode
      owner {
        name
        username
        email
      }
      environmentDetails
      inheritFrom {
        name
      }
      availableScopes
      clientAuthenticator
      clientRoles
      clientMappers
      apiKeyName
      resourceType
      resourceScopes
      resourceAccessScope
    }
   }
   
  `,
    });

    o(out);
  }

  if (true) {
    const res = await lookupSharedIssuers(ctx);
    o(res);
  }
  await keystone.disconnect();
})();
