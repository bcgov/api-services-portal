/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/workflow/update-credential.js
*/

import InitKeystone from '../keystonejs/init';
import { o } from '../util';
import { RequestControls } from '../../../services/workflow/types';
import { UpdateCredentials } from '../../../services/workflow';
import {
  IsCertificateValid,
  IsJWKSURLValid,
} from '../../../services/workflow/update-credential';

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

  const clientCertificate = `
  -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7YUiYt5uUxVY6yOzwZil
5JlFJlRLxXmG08w/uOMb18Tfwb+5UZ4zEAIgiAgq2Fq+GKyiXN/qId9mySAiANUE
HjjpnpOpAmKU6RsP+Emw54Fco/RMqkHGl2syNCWpgs+yqZ6ZXbw6wn5OfkaL0hB9
id7p8yX/mxqH96ycdA/e3sZQ53X41EXfZl29E654K+LeEtMa+Hy0hIRz+bDOyptM
yEllT/YWhWqhYA/JX+2VklnQ3k82dvvFGMGIS1yYkQuAIEg07TTEHcVAn31eov6T
+KHEVt70CdzgR9MK25U7u8V9Kp0JaKbmfPraCvo/BKzo/nNJa8RfIZvPvp/hKiSy
HwIDAQAB
-----END PUBLIC KEY-----
  `;

  const jwksUrl = 'https://ikethecoder.github.io/temp-place/certs.json';

  const serviceAccessId = '6464504208707179b20bdeb0';
  const controls = {
    clientCertificate,
    //jwksUrl,
  } as RequestControls;

  await UpdateCredentials(ctx, serviceAccessId, controls);

  await keystone.disconnect();
})();
