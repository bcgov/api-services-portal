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
import ProtocolMapperRepresentation from '@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation';

(async () => {
  if (true) {
    // Cleanup of a Mapper for ClientId that has changed from "clientId"
    // to "client_id"

    const kc = new KeycloakClientService(process.env.ISSUER);

    await kc.login(process.env.CID, process.env.CSC);

    const cids: string[] = [];
    // await kc.regenerateSecret('6af832cb-6178-438f-a4fc-8c5e1d14d5d2');
    for (const cid of cids) {
      try {
        const res = await kc.findByClientId(cid);
        const mapper: ProtocolMapperRepresentation = res.protocolMappers
          .filter((m) => m.name == 'Client ID')
          .pop();
        if (mapper) {
          console.log(`${cid} : ${mapper.config['claim.name']}`);
          if (mapper.config['claim.name'] == 'clientId') {
            console.log('Updating!');
            mapper.config['claim.name'] = 'client_id';
            await kc.updateClient(res.id, mapper.id, mapper);
            console.log('Updated!');
          }
        } else {
          console.log(`${cid} : MISSING`);
        }
      } catch (e) {
        console.log(`${cid} : SKIPPED`);
      }
    }
  }

  // const resourceRegistrationEndpoint =
  //   process.env.ISSUER + '/authz/protection/resource_set';
  // const accessToken = process.env.TOK;
  // const clientUuid = '250398da-a174-404d-ae18-6a6ebc9de06d';

  // const kcprotectApi = new UMAResourceRegistrationService(
  //   resourceRegistrationEndpoint,
  //   accessToken
  // );
  // const resOwnerResourceIds = await kcprotectApi.listResources({
  //   owner: clientUuid,
  //   type: 'namespace',
  // });

  // const namespaces = await kcprotectApi.listResourcesByIdList(
  //   resOwnerResourceIds
  // );

  // const matched = namespaces
  //   .filter((ns) => ns.name == 'testelson')
  //   .map((ns) => ({
  //     id: ns.id,
  //     name: ns.name,
  //     scopes: ns.resource_scopes,
  //   }));

  // o(matched);
})();
