/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keystonejs/brokered-identity.js
*/

import { v4 as uuid } from 'uuid';
import querystring from 'querystring';
import crypto from 'crypto';
import { registerUserConsumer } from '../../../services/workflow';
import InitKeystone from '../keystonejs/init';
import {
  createBrokeredIdentity,
  lookupCredentialIssuerById,
} from '../../../services/keystone';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
} from '../../../services/workflow/types';

import { updateCallbackUrl } from '../../../services/keystone';
import { AccessRequest } from 'apis/shared/types/query.types';
import {
  BrokeredIdentity,
  BrokeredIdentityCreateInput,
} from '@/services/keystone/types';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  //const owner = '15a3cbbe-95b5-49f0-84ee-434a9b92d04a';

  const id: BrokeredIdentityCreateInput = {
    providerAlias: 'abc',
    userId: '111',
    username: 'acope@idir',
  };

  //  await createBrokeredIdentity(keystone, id);

  await keystone.disconnect();
})();
