/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/idp.js

/{auth-server-root}{kc_realms_path}/{realm}/broker/{provider}/link?client_id={id}&redirect_uri={uri}&nonce={nonce}&hash={hash}

IdP: create a Client 'idp-dev-link' - nothing special - Standard Flow Enabled w/ proper Redirects and Credentials (Signed JWT)
Authz: create a corresponding IdP (Account Link Only, Hide on Login) - using Signed JWT
Make sure the Portal Client has "account/manage-account" scope

*/

import { v4 as uuid } from 'uuid';
import querystring from 'querystring';
import crypto from 'crypto';
import { KeycloakIdPService } from '../../../services/keycloak/identity-providers';

(async () => {
  const kc = new KeycloakIdPService(process.env.ISSUER);

  await kc.login(process.env.CID, process.env.CSC);
  console.log(await kc.listRealmProviders());
  //  console.log(await kc.findMappers('keycloak-oidc'));

  // String nonce = UUID.randomUUID().toString();
  // MessageDigest md = null;
  // try {
  //    md = MessageDigest.getInstance("SHA-256");
  // } catch (NoSuchAlgorithmException e) {
  //    throw new RuntimeException(e);
  // }
  // String input = nonce + token.getSessionState() + clientId + provider;
  // byte[] check = md.digest(input.getBytes(StandardCharsets.UTF_8));
  // String hash = Base64Url.encode(check);
  // request.getSession().setAttribute("hash", hash);

  const root = kc.buildAccountLinkUrl(
    'https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth/realms/aps-v2',
    'b1234',
    { azp: 'aps-portal', sessionState: '1233' },
    'https://gwa-api-gov-bc-ca.dev.api.gov.bc.ca/callback/account/linked'
  );
  console.log(root);

  console.log(
    await kc.listFederatedIdentitiesForUser(
      '15a3cbbe-95b5-49f0-84ee-434a9b92d04a'
    )
  );

  if (false) {
    await kc.createProvider('', {
      brokerAlias: 'b1234',
      brokerDisplayName: 'B 1234',
      providerClientId: 'c1234',
      providerOpenidConfig: {
        issuer: 'https://issuer',
        token_endpoint: 'https://token',
        registration_endpoint: 'https://client_registration',
        jwks_uri: 'https://jwks',
        authorization_endpoint: 'https://auth',
      },
    });
  }
})();
