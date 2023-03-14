/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
export TOK=""
npm run ts-watch
node dist/test/integrated/keycloak/client.js

*/

import { o } from '../util';

import { KeycloakClientService } from '../../../services/keycloak';
import { UMAResourceRegistrationService } from '../../../services/uma2';

(async () => {
  if (false) {
    const kc = new KeycloakClientService(process.env.ISSUER);

    await kc.login(process.env.CID, process.env.CSC);

    await kc.regenerateSecret('6af832cb-6178-438f-a4fc-8c5e1d14d5d2');
    const res = await kc.list('42da4f15');
    o(res);
  }

  const resourceRegistrationEndpoint =
    process.env.ISSUER + '/authz/protection/resource_set';
  const accessToken = process.env.TOK;
  const clientUuid = '250398da-a174-404d-ae18-6a6ebc9de06d';

  const kcprotectApi = new UMAResourceRegistrationService(
    resourceRegistrationEndpoint,
    accessToken
  );
  const resOwnerResourceIds = await kcprotectApi.listResources({
    owner: clientUuid,
    type: 'namespace',
  });

  const namespaces = await kcprotectApi.listResourcesByIdList(
    resOwnerResourceIds
  );

  const matched = namespaces
    .filter((ns) => ns.name == 'testelson')
    .map((ns) => ({
      id: ns.id,
      name: ns.name,
      scopes: ns.resource_scopes,
    }));

  o(matched);
})();
