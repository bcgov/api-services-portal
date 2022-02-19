/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keystonejs/service-access.js
*/

import { v4 as uuid } from 'uuid';
import querystring from 'querystring';
import crypto from 'crypto';
import { registerUserConsumer } from '../../../services/workflow';
import InitKeystone from '../keystonejs/init';
import {
  createBrokeredIdentity,
  lookupCredentialIssuerById,
  lookupServiceAccessByConsumerAndEnvironment,
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

  const prodEnvId = '620bfe448eb14a86cab4ab73';
  const consumerId = '620d779a85b71310b7ca6789';
  await lookupServiceAccessByConsumerAndEnvironment(
    keystone,
    prodEnvId,
    consumerId
  );

  await keystone.disconnect();
})();
