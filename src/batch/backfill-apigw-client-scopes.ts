/*

Backfill service_account and basic default client scopes on every client
in the apigw realm. Safe to rerun: clients that already have both are skipped,
and nothing is removed. Run once per apigw issuer after deploy. Not hooked
to server startup.

To run:

npm run ts-build
ISSUER=https://.../auth/realms/apigw CID=... CSC=... node dist/batch/backfill-apigw-client-scopes.js

*/

import { KeycloakClientRegistrationService } from '../services/keycloak';

async function main(): Promise<void> {
  const issuer = process.env.ISSUER;
  const clientId = process.env.CID;
  const clientSecret = process.env.CSC;
  if (!issuer || !clientId || !clientSecret) {
    throw Error('ISSUER, CID, and CSC are required');
  }

  const kc = new KeycloakClientRegistrationService(
    issuer,
    issuer + '/clients-registrations/openid-connect'
  );
  await kc.login(clientId, clientSecret);
  const summary = await kc.backfillRequiredDefaultScopes();
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
