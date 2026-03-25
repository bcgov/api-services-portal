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
import { remove } from 'lodash';
import { removeKeys } from '../../../batch/feed-worker';

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
      name: 'ministry-of-cats',
      parent: '/ca.bc.gov',
      members: [
        {
          member: { email: 'janis@testmail.com' },
          roles: ['organization-admin', 'system-owner'],
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
  if (false) {
    o(await kc.getGroupMembership('databc'));
    // await kc.assignNamespace(
    //   'ministry-of-citizens-services',
    //   'databc',
    //   'erx-demo'
    // );
  }

  if (false) {
    await kc.unassignNamespace('gw-5fd72', 'ministry-of-cats', undefined);
    await kc.assignNamespace(
      'gw-5fd72',
      'ministry-of-cats',
      'technology',
      false
    );
  }

  if (false) {
    const access = await kc.getGroupAccess('ministry-of-cats');
    console.log(JSON.stringify(access, null, 4));
  }

  if (true) {
    const org = 'ministry-of-cats';
    const out = await kc.getGroupMembership(org);
    o(removeKeys(out, ['id', 'username']));
  }
})();
