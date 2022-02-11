/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/policy.js

*/

import {
  DecisionStrategy,
  Logic,
} from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import { AllFieldsOptions } from '@keystonejs/keystone';
import { AnyElement } from 'soap/lib/wsdl/elements';
import { KeycloakTokenService } from '../../../services/keycloak';
import { KeycloakClientPolicyService } from '../../../services/keycloak';
import { Policy, UMAPolicyService } from '../../../services/uma2';

(async () => {
  const kc = new KeycloakClientPolicyService(process.env.ISSUER);
  await kc.login(process.env.CID, process.env.CSC);

  const cid = 'e96342a6-7615-4158-b3de-983a8b893d07';

  // Get the Group Leaf policy
  const group =
    'group-data-custodians-ministry-citizens-services-databc-policy';
  const policies = await kc.listPolicies(cid, { name: group, type: 'group' });
  console.log(policies);

  const perm =
    'orgcontrol permission for /data-custodians/ministry-citizens-services/databc';
  const permissions = await kc.listPermissionsByResource(
    cid,
    'b444a5a1-8e14-4f92-9005-8b476b977e25'
  );
  console.log(JSON.stringify(permissions, null, 3));

  const pol = await kc.findPermissionByName(
    cid,
    '/data-custodians/ministry-citizens-services/databc'
  );
  console.log(JSON.stringify(pol, null, 3));

  if (false) {
    const pol: any = {
      decisionStrategy: DecisionStrategy.UNANIMOUS,
      groups: [
        {
          id: 'd23d118c-d895-4c48-aaa8-842b20fe917e',
          extendChildren: false,
          path: '/data-custodians',
        },
      ],
      logic: Logic.POSITIVE,
      type: 'group',
      name: 'min-cit-services-databc-group-policy',
      description: 'min-cit-services-databc-group-policy Desc',
    };

    const up = await kc.createOrUpdatePolicy(cid, pol);
    console.log(JSON.stringify(up, null, 4));
  }

  if (false) {
    const pol: any = {
      decisionStrategy: DecisionStrategy.UNANIMOUS,
      groups: [
        {
          id: 'd23d118c-d895-4c48-aaa8-842b20fe917e',
          extendChildren: false,
          path: '/data-custodians',
        },
      ],
      logic: Logic.POSITIVE,
      type: 'scope',
      name: 'min-cit-services-databc-group-policy',
      description: 'min-cit-services-databc-group-policy Desc',
    };

    const up = await kc.createOrUpdatePolicy(cid, pol);
    console.log(JSON.stringify(up, null, 4));
  }
})();
