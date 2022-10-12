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
import {
  buildGroupAccess,
  GroupAccessService,
} from '../../../services/org-groups';
import {
  KeycloakGroupService,
  Uma2WellKnown,
} from '../../../services/keycloak';
import { o } from '../util';
import { GroupMembership } from '@/services/org-groups/types';

(async () => {
  const uma2: Uma2WellKnown = await (
    await fetch(process.env.ISSUER + '/.well-known/uma2-configuration')
  ).json();

  const kc = new GroupAccessService(uma2);

  await kc.login(process.env.CID, process.env.CSC);

  if (true) {
    const access = await kc.getGroupAccess('databc');
    console.log(JSON.stringify(access, null, 4));
  }

  if (true) {
    const access: GroupMembership = {
      name: 'databc',
      parent: '/ca.bc.gov/ministry-of-citizens-services',
      members: [
        {
          member: { email: 'aidan.cope@gmail.com' },
          roles: ['organization-admin'],
        },
        {
          member: { email: 'apsowner@nowhere' },
          roles: ['organization-admin'],
        },
      ],
    };

    await kc.createOrUpdateGroupAccess(access, ['idir']);
  }

  if (false) {
    const access = {
      name: 'ministry-of-citizens-services',
      roles: [
        {
          name: 'data-custodian',
          members: [
            {
              username: 'acope@idir',
            },
            {
              username: 'platform',
            },
          ],
          permissions: [
            {
              resource: 'org/ministry-of-citizens-services',
              scopes: ['Namespace.Assign', 'Dataset.Manage'],
            },
          ],
        },
      ],
    };

    await kc.createOrUpdateGroupAccess(access, ['idir']);
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

    //await kc.createOrUpdateGroupAccess(access);
  }

  if (false) {
    const access = buildGroupAccess(
      'databc',
      '/ca.bc.gov/ministry-of-citizens-services',
      'namespace',
      'erx-demo'
    );
    await kc.createOrUpdateGroupAccess(access, ['idir']);
  }
  if (true) {
    o(await kc.getGroupMembership('databc'));
    // await kc.assignNamespace(
    //   'ministry-of-citizens-services',
    //   'databc',
    //   'erx-demo'
    // );
  }

  if (false) {
    await kc.unassignNamespace(
      'ministry-of-citizens-services',
      'databc',
      'erx-demo'
    );
  }

  // if (true) {
  //   const access = await kc.getGroupAccess('databc');
  //   console.log(JSON.stringify(access, null, 4));
  // }
})();
