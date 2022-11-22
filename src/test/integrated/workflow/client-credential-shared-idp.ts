/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/workflow/client-credential-shared-idp.js
*/

import InitKeystone from '../keystonejs/init';
import { o } from '../util';
import {
  addClientsToSharedIdP,
  syncSharedIdp,
} from '../../../services/workflow/client-shared-idp';
import { RequestControls } from '../../../services/workflow/types';
import { ClientAuthenticator } from '../../../services/keycloak';
import { dynamicallySetEnvironmentDetails } from '../../../services/keystone/credential-issuer';
import { CredentialIssuer } from '../../../services/keystone/types';

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

  if (false) {
    const issuer: CredentialIssuer = {
      id: '002',
      inheritFrom: {
        id: '001',
        environmentDetails: JSON.stringify([
          { environment: 'dev', issuerUrl: 'https://somewhere' },
        ]),
        environments: [],
      } as CredentialIssuer,
      environments: [],
      environmentDetails: '[]',
      clientId: 'base-client',
    };
    const res = dynamicallySetEnvironmentDetails(issuer);
    o(JSON.parse(res));
  }
  if (false) {
    const controls: RequestControls = {};

    const credentialIssuerPK = '63602720512b5db8e79bc039';

    const res = await addClientsToSharedIdP(
      ctx,
      ns,
      'special1',
      credentialIssuerPK
    );
    o(res);
  }
  if (true) {
    const credentialIssuerPK = '63602720512b5db8e79bc039';

    const res = await syncSharedIdp(ctx, credentialIssuerPK);
    o(res);
  }
  await keystone.disconnect();
})();
