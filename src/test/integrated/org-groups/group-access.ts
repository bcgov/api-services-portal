/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/org-groups/group-access.js

*/

import fetch from 'node-fetch';
import { GroupAccessService } from '../../../services/org-groups';
import {
  KeycloakGroupService,
  Uma2WellKnown,
} from '../../../services/keycloak';

(async () => {
  const uma2: Uma2WellKnown = await (
    await fetch(process.env.ISSUER + '/.well-known/uma2-configuration')
  ).json();

  const kc = new GroupAccessService(uma2);

  await kc.login(process.env.CID, process.env.CSC);

  if (false) {
    const access = await kc.getGroupAccess('databc');
    console.log(JSON.stringify(access, null, 4));
  }

  if (true) {
    const access = {
      name: 'databc',
      parent: '/ministry-citizens-services',
      roles: [
        {
          name: 'data-custodian',
          members: [
            {
              username: 'acope@idir',
            },
          ],
          permissions: [
            {
              resource: 'orgcontrol',
              scopes: ['Namespace.View'],
            },
            {
              resource: 'simple',
              scopes: ['Access.Manage', 'Namespace.View'],
            },
            {
              resource: 'erx-demo',
              scopes: ['Access.Manage', 'Namespace.View'],
            },
            {
              resource: 'org/databc',
              scopes: ['Namespace.Assign'],
            },
          ],
        },
      ],
    };

    await kc.createOrUpdateGroupAccess(access);
  }

  if (false) {
    const access = {
      name: 'ministry-of-citizens-services',
      roles: [
        {
          name: 'data-custodian',
          members: [
            {
              id: '15a3cbbe-95b5-49f0-84ee-434a9b92d04a',
              username: 'acope@idir',
              email: 'acope@nowhere.com',
            },
          ],
          permissions: [
            {
              resource: 'org/ministry-of-citizens-services',
              scopes: ['Namespace.Assign'],
            },
          ],
        },
      ],
    };

    await kc.createOrUpdateGroupAccess(access);
  }

  if (false) {
    const access = {
      roles: [
        {
          name: 'data-custodian',
          members: [
            {
              id: '15a3cbbe-95b5-49f0-84ee-434a9b92d04a',
              username: 'acope@idir',
              email: 'acope@nowhere.com',
            },
          ],
          permissions: [
            {
              resource: 'org/ministry-of-citizens-services',
              scopes: ['Namespace.Assign'],
            },
          ],
        },
      ],
    };

    await kc.createOrUpdateGroupAccess(access);
  }
})();
