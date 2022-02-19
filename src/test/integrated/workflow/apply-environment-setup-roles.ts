/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/workflow/apply-environment-setup-roles.js
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
  syncClientRoles,
} from '../../../services/workflow/apply-environment-setup';
import InitKeystone from '../keystonejs/init';
import { lookupCredentialIssuerById } from '../../../services/keystone';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
} from '../../../services/workflow/types';
import { CredentialIssuer } from '../../../services/keystone/types';

import { updateCallbackUrl } from '../../../services/keystone';

(async () => {
  if (true) {
    const issuer = {
      clientRoles: JSON.stringify(['role-1', 'role-2']),
    } as CredentialIssuer;
    const issuerEnvConfig = {
      exists: false,
      environment: 'dev',
      issuerUrl: process.env.ISSUER,
      clientId: process.env.CID,
      clientSecret: process.env.CSC,
    };
    const client = '96322825-4ea9-41b3-9ac1-ce11acff81e8';
    await syncClientRoles(issuer, issuerEnvConfig, client);
  }
  //await keystone.disconnect();
})();
