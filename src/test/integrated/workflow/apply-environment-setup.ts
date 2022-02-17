/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/workflow/apply-environment-setup.js
*/

import { v4 as uuid } from 'uuid';
import querystring from 'querystring';
import crypto from 'crypto';
import {
  ApplyEnvironmentSetup,
  createOrUpdateIdentityProvider,
  createOrUpdateRemoteIdPClient,
  getAccountLinkUrl,
  getAllUserAccountLinks,
} from '../../../services/workflow/apply-environment-setup';
import InitKeystone from '../keystonejs/init';
import { lookupCredentialIssuerById } from '../../../services/keystone';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
} from '../../../services/workflow/types';

import { updateCallbackUrl } from '../../../services/keystone';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const remoteIssuer = await lookupCredentialIssuerById(
    keystone,
    '620bfdd88eb14a86cab4ab71'
  );

  const brokerAlias = 'aps-myns-0001';

  if (false) {
    const result = await createOrUpdateRemoteIdPClient(
      keystone,
      'idp-account-link',
      brokerAlias,
      {
        callbackUrl: 'https://backtoportal',
        jwksUrl:
          'https://authz-b8840c-dev.apps.gold.devops.gov.bc.ca/auth/realms/aps-v2/protocol/openid-connect/certs',
      },
      remoteIssuer,
      'dev'
    );
    console.log(JSON.stringify(result, null, 4));
  }

  if (false) {
    const result = await createOrUpdateRemoteIdPClient(
      keystone,
      'user-public',
      'app-test',
      {
        callbackUrl: 'https://myapp/auth/callback',
      },
      remoteIssuer,
      'dev'
    );
    console.log(JSON.stringify(result, null, 4));
  }

  if (false) {
    const envConfig = getIssuerEnvironmentConfig(remoteIssuer, 'dev');

    const result = await createOrUpdateIdentityProvider(
      keystone,
      '',
      envConfig,
      brokerAlias
    );
    console.log(JSON.stringify(result, null, 4));
  }

  if (false) {
    const result = await ApplyEnvironmentSetup(
      keystone,
      '620bfe448eb14a86cab4ab73',
      'https://callback'
    );
    console.log(JSON.stringify(result, null, 4));
  }

  if (true) {
    keystone.req = {};
    keystone.req['user'] = {};
    keystone.req.user.sub = '123';
    keystone.req.headers = {
      'x-forwarded-access-token': process.env.TOK,
    };
    const result = await getAccountLinkUrl(
      keystone,
      '620bfe448eb14a86cab4ab73',
      'https://back'
    );
    console.log(JSON.stringify(result, null, 4));
  }

  if (false) {
    keystone.req = {};
    keystone.req['user'] = {};
    keystone.req.user.sub = '123';
    keystone.req.headers = {
      'x-forwarded-access-token': process.env.TOK,
    };
    const result = await getAllUserAccountLinks(keystone, 'https://back');
    console.log(JSON.stringify(result, null, 4));
  }

  await keystone.disconnect();
})();
