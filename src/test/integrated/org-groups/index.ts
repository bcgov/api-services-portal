/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/org-groups/index.js

*/

import { OrgGroupService } from '../../../services/org-groups';
import { KeycloakGroupService } from '../../../services/keycloak';
import { o } from '../util';

(async () => {
  const kc = new OrgGroupService(process.env.ISSUER);

  await kc.login(process.env.CID, process.env.CSC);

  await kc.backfillGroups();

  const org = {
    name: 'databc',
    parent: '/data-custodian/ministry-citizens-services',
  };

  const org2 = {
    name: 'databc2',
    parent: '/data-custodian/ministry-citizens-services',
  };

  // console.log(JSON.stringify(await kc.listMembers(org), null, 4));

  // console.log(await kc.getValidRoles());
  // console.log(await kc.getGroupPathsByGroupName('ministry-citizens-services'));
  // console.log(await kc.getGroupPathsByGroupName('databc'));

  if (false) {
    await kc.createGroupIfMissing(org);

    await kc.createOrUpdateGroupPolicy(org);

    await kc.createOrUpdateGroupPermission(org, 'feature-myacc', [
      'Namespace.View',
      'Namepsace.Manage',
    ]);

    await kc.createGroupIfMissing({
      name: 'data-innovation',
      parent: '/data-custodian/ministry-citizens-services',
    });

    await kc.createGroupIfMissing({
      name: 'test1',
      parent: '/data-custodian/ministry-citizens-services',
    });

    await kc.backfillGroups();
    await kc.deleteGroup({
      name: 'test1',
      parent: '/data-custodian/ministry-citizens-services',
    });

    await kc.createOrUpdateGroupPermission(org2, 'feature-myacc', [
      'Namespace.View',
      'Namepsace.Manage',
    ]);
  }

  if (false) {
    console.log(
      JSON.stringify(
        kc.listGroups({
          name: 'ministry-citizens-services',
          parent: '/data-custodian',
        }),
        null,
        3
      )
    );

    console.log(
      JSON.stringify(
        kc.listGroups({
          name: 'databc',
          parent: '/data-custodian/ministry-citizens-services',
        }),
        null,
        3
      )
    );

    console.log(
      JSON.stringify(
        await kc.getGroupPermissions(org, ['feature-myacc']),
        null,
        3
      )
    );
  }

  if (false) {
    const result = await kc.getPermissionsForGroupPolicy(
      org,
      'org/ministry-of-health'
    );
    o(result);
  }

  if (true) {
    const resourceId = '8fb82265-8e8d-4cc5-b967-f231d4cab7ce';
    const res = await kc.getGroupPermissionsByResource(resourceId);
    o(res);
  }
  if (false) {
    await kc.createOrUpdateOrgPermission(org, [
      'Namespace.View',
      'Namepsace.Manage',
    ]);
  }
  // await kc.createOrUpdateGroupPermission(
  //   {
  //     name: 'databc',
  //     parent: '/data-custodians/ministry-citizens-services',
  //   },
  //   'feature-myacc',
  //   ['read-private'],
  //   false
  // );
})();
