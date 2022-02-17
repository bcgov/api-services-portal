/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/workflow/register-user-consumer.js
*/

import { v4 as uuid } from 'uuid';
import querystring from 'querystring';
import crypto from 'crypto';
import { registerUserConsumer } from '../../../services/workflow';
import InitKeystone from '../keystonejs/init';
import { lookupCredentialIssuerById } from '../../../services/keystone';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
} from '../../../services/workflow/types';

import { updateCallbackUrl } from '../../../services/keystone';
import { AccessRequest } from 'apis/shared/types/query.types';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ctx = await keystone.createContext({ skipAccessControl: true });
  ctx.req = {};
  ctx.req['user'] = {};
  ctx.req.user.sub = '123';
  ctx.req.headers = {
    'x-forwarded-access-token': process.env.TOK,
  };
  ctx.authedItem = {
    userId: '60c9124f3518951bb519084d',
  };

  // keystone.authedItem = {};
  // keystone.authedItem.userId = '15a3cbbe-95b5-49f0-84ee-434a9b92d04a';

  const accessRequest: AccessRequest = {
    id: '123',
    requestor: {
      id: '60c9124f3518951bb519084d',
    },
    productEnvironment: {
      id: '620bfe448eb14a86cab4ab73',
      flow: 'authorization-code',
      services: [],
    },
  };

  await registerUserConsumer(ctx, accessRequest);

  await keystone.disconnect();
})();
